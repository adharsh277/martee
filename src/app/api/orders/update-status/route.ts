import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import http from 'http';
import https from 'https';

// Helper: make HTTP request using Node's native http module (bypasses Next.js fetch restrictions)
function nodeHttpPost(urlStr: string, headers: Record<string, string>, body: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const port = url.port ? parseInt(url.port) : (isHttps ? 443 : 80);

    const options = {
      hostname: url.hostname,
      port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode || 0, text: data }));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(new Error('Request timed out')); });
    req.write(body);
    req.end();
  });
}

// Function to notify WooCommerce that payment is confirmed
async function notifyWooCommercePayment(orderKey: string, transactionId: string, apiKey: string, siteUrl?: string) {
  console.log('notifyWooCommercePayment called:', { orderKey, transactionId: transactionId.slice(0, 10) + '...', apiKey: apiKey ? `${apiKey.slice(0, 4)}...` : 'No API Key', siteUrl });

  // Use the site URL if provided, otherwise fall back to default
  const wooCommerceUrl = (siteUrl || 'http://store.local').replace(/\/$/, '');

  // --- Method 1: AJAX endpoint using Node http (bypasses Next.js fetch restrictions) ---
  try {
    const ajaxUrl = `${wooCommerceUrl}/wp-admin/admin-ajax.php?action=MNEE_payment_confirm`;
    console.log('Calling WooCommerce AJAX endpoint (via Node http):', ajaxUrl);

    const body = JSON.stringify({
      order_key: orderKey,
      transaction_id: transactionId,
      api_key: apiKey
    });

    const { status, text } = await nodeHttpPost(ajaxUrl, {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    }, body);

    console.log('WooCommerce AJAX response status:', status);
    console.log('WooCommerce AJAX response body:', text);

    try {
      const result = JSON.parse(text);
      if (result.success) {
        console.log('WooCommerce order updated via AJAX successfully');
        return true;
      }
      console.warn('WooCommerce AJAX returned failure:', result);
    } catch {
      console.warn('WooCommerce AJAX response was not JSON:', text);
    }
  } catch (error) {
    console.error('WooCommerce AJAX notification failed:', (error as Error).message);
  }

  // --- Method 2: WooCommerce REST API fallback ---
  try {
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

    if (!consumerKey || !consumerSecret || consumerKey === 'ck_your_consumer_key_here') {
      console.warn('WooCommerce REST API credentials not set, skipping REST fallback');
      return false;
    }

    const restUrl = `${wooCommerceUrl}/wp-json/wc/v3`;
    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // Search for the order by order key using Node http
    const searchUrl = `${restUrl}/orders?search=${encodeURIComponent(orderKey)}&per_page=5`;
    const { status: searchStatus, text: searchText } = await nodeHttpPost(searchUrl.replace('?', '?'), { 'Authorization': authHeader }, '');
    // Actually use GET for search - use fetch for GET since it's less problematic
    const searchRes = await fetch(searchUrl, { headers: { 'Authorization': authHeader } });

    if (!searchRes.ok) {
      console.warn('WooCommerce REST API order search failed:', searchRes.status);
      return false;
    }

    const orders = await searchRes.json();
    console.log('WooCommerce REST API order search results:', orders.length, 'orders found');

    const wcOrder = orders.find((o: { order_key: string }) => o.order_key === orderKey);

    if (!wcOrder) {
      console.warn('Order not found via REST API for key:', orderKey);
      return false;
    }

    const updateBody = JSON.stringify({
      status: 'processing',
      transaction_id: transactionId,
      meta_data: [{ key: '_mnee_transaction_id', value: transactionId }]
    });

    const { status: updateStatus, text: updateText } = await nodeHttpPost(
      `${restUrl}/orders/${wcOrder.id}`,
      { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      updateBody
    );

    if (updateStatus >= 200 && updateStatus < 300) {
      const updated = JSON.parse(updateText);
      console.log('WooCommerce order updated via REST API:', updated.id, 'status:', updated.status);
      return true;
    } else {
      console.error('WooCommerce REST API update failed:', updateStatus, updateText.slice(0, 200));
    }
  } catch (error) {
    console.error('WooCommerce REST API fallback failed:', (error as Error).message);
  }

  return false;
}



// Function to mark Shopify order as paid
async function markShopifyOrderAsPaid(adminGraphqlApiId: string, shopDomain?: string, merchantWallet?: string) {
  let shopifyAccessToken = process.env.SHOPIFY_API_ACCESS_TOKEN;
  let finalShopDomain = shopDomain || process.env.SHOPIFY_SHOP_DOMAIN;

  // If merchantWallet is provided, try to get merchant-specific credentials
  if (merchantWallet) {
    const merchant = await prisma.merchant.findUnique({
      where: { walletAddress: merchantWallet.toLowerCase() }
    });

    if (merchant?.shopifyAccessToken) {
      shopifyAccessToken = merchant.shopifyAccessToken;
      finalShopDomain = merchant.shopifyShopDomain || finalShopDomain;
    }
  }

  if (!shopifyAccessToken) {
    console.error('No Shopify access token found for this merchant');
    return false;
  }

  if (!finalShopDomain) {
    console.error('Shop domain not found for this merchant');
    return false;
  }

  const mutation = `
    mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
      orderMarkAsPaid(input: $input) {
        userErrors {
          field
          message
        }
        order {
          id
          name
          canMarkAsPaid
          displayFinancialStatus
          totalPrice
          totalOutstandingSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          transactions(first: 10) {
            id
            kind
            status
            amountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            gateway
            createdAt
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      id: adminGraphqlApiId
    }
  };

  try {
    const response = await fetch(`https://${finalShopDomain}/admin/api/2025-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopifyAccessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Shopify GraphQL errors:', result.errors);
      return false;
    }

    if (result.data?.orderMarkAsPaid?.userErrors?.length > 0) {
      console.error('Shopify order mark as paid errors:', result.data.orderMarkAsPaid.userErrors);
      return false;
    }

    console.log('Successfully marked Shopify order as paid:', result.data?.orderMarkAsPaid?.order?.name);
    return true;
  } catch (error) {
    console.error('Failed to mark Shopify order as paid:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, transferHash, customerWallet, apiKey } = body;

    // Check for API key in header or body (for WooCommerce)
    const headerApiKey = request.headers.get('X-API-Key');
    const authApiKey = headerApiKey || apiKey;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the order first to check its type
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If an API key is provided, validate it (for WooCommerce plugin updates)
    if (authApiKey) {
      // Validate the API key belongs to a merchant
      const merchant = await prisma.merchant.findUnique({
        where: { apiKey: authApiKey }
      });

      if (!merchant) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      // Verify the merchant owns this order by checking merchantWallet
      if (existingOrder.merchantWallet && existingOrder.merchantWallet !== merchant.walletAddress) {
        return NextResponse.json({ error: 'Unauthorized: Order does not belong to this merchant' }, { status: 403 });
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        transferHash: transferHash || null,
        customerWallet: customerWallet || null,
        paidAt: status === 'PAID' ? new Date() : undefined,
      }
    });

    // If this is a Shopify order being marked as paid, notify Shopify
    if (status === 'PAID' && order.type === 'SHOPIFY' && order.adminGraphqlApiId) {
      console.log('Marking Shopify order as paid:', order.adminGraphqlApiId);
      const shopifySuccess = await markShopifyOrderAsPaid(
        order.adminGraphqlApiId,
        order.shopDomain || undefined,
        order.merchantWallet || undefined
      );

      if (!shopifySuccess) {
        console.warn('Failed to mark Shopify order as paid, but continuing with local update');
      }
    }

    // If this is a WooCommerce order being marked as paid, notify WooCommerce
    if (status === 'PAID' && order.type === 'WOOCOMMERCE' && transferHash) {
      console.log('Notifying WooCommerce of payment confirmation:', order.id);

      // Always fetch the merchant's actual API key and site URL from database for WooCommerce notification
      let merchantApiKey: string | undefined;
      let siteUrl: string | undefined;

      if (order.merchantWallet) {
        console.log('Looking for merchant with wallet address:', order.merchantWallet);
        const merchant = await prisma.merchant.findUnique({
          where: { walletAddress: order.merchantWallet },
          select: { apiKey: true, wooCommerceSiteURL: true, walletAddress: true }
        });

        if (merchant) {
          merchantApiKey = merchant.apiKey;
          siteUrl = merchant.wooCommerceSiteURL || undefined;
          console.log('Found merchant:', {
            walletAddress: merchant.walletAddress,
            apiKey: merchantApiKey,
            siteUrl: siteUrl
          });
        } else {
          console.warn('No merchant found with wallet address:', order.merchantWallet);
        }
      } else {
        console.warn('No merchant wallet address on order');
      }

      if (merchantApiKey) {
        const wooCommerceSuccess = await notifyWooCommercePayment(order.id, transferHash, merchantApiKey, siteUrl);

        if (!wooCommerceSuccess) {
          console.warn('Failed to notify WooCommerce of payment, but continuing with local update');
        }
      } else {
        console.warn('No API key found for WooCommerce notification');
      }
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}