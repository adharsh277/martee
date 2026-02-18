# 🔧 Troubleshooting: "Either API key or merchantWallet is required"

## What This Error Means

This error appears when you're trying to **create an invoice** without being authenticated as a merchant.

## Where Does This Happen?

This error occurs when:
- ✅ Creating invoices from the dashboard
- ✅ Using the invoice creation API
- ❌ NOT when using the faucet (faucet doesn't need merchant account)

---

## ✅ Solution: Create Your Merchant Account

### Step 1: Go to Dashboard
Open: http://localhost:3000/dashboard

### Step 2: Connect Your Wallet
1. Click "Connect Wallet" button
2. Make sure MetaMask is on **BNB Testnet (Chain ID 97)**
3. Approve the connection in MetaMask

### Step 3: Automatic Registration
The app will automatically:
- Create your merchant account
- Generate an API key for you
- Show your merchant details

### Step 4: Now You Can Create Invoices
Once connected, you can:
- Create payment invoices
- View your API key
- Manage orders
- Configure WooCommerce/Shopify integration

---

## 🧪 Testing Without Merchant Account

### Use the Faucet
The **faucet page does NOT require a merchant account**:

1. Go to: http://localhost:3000/faucet
2. Connect wallet (BNB Testnet)
3. Click "Mint Tokens"
4. Done!

**The faucet is just for getting test tokens - no authentication needed!**

---

## 📊 How Authentication Works

### For Faucet Page (`/faucet`):
- ✅ No merchant account needed
- ✅ Just connect wallet
- ✅ Directly interacts with smart contract

### For Dashboard (`/dashboard`):
- ⚠️ Requires merchant account
- ⚠️ Auto-created when you connect wallet
- ⚠️ Gives you an API key

### For Invoice Creation:
- ⚠️ Requires either:
  - API key in header (for external apps)
  - OR merchant wallet address (for dashboard)

---

## 🔍 Check If You Have a Merchant Account

### Method 1: Dashboard
1. Go to http://localhost:3000/dashboard
2. Connect wallet
3. If you see your API key → You're registered ✅
4. If you see registration form → Not registered yet ❌

### Method 2: Database Check
Run this in your terminal:
```bash
node check-merchant.js
```

This will show all merchants in the database.

---

## 🆘 Still Getting the Error?

### Check These:

1. **Are you on the dashboard?**
   - Connect wallet first
   - Wait for merchant registration
   - Then try creating invoice

2. **Using the API directly?**
   - You need to pass `merchantWallet` in the request body
   - OR pass `X-API-Key` in headers

3. **Are you on the faucet page?**
   - Faucet shouldn't show this error
   - If it does, there's a different issue

4. **Check your network:**
   - MetaMask must be on BNB Testnet (97)
   - Not on mainnet or other testnet

---

## ✅ Quick Test Flow

### Test 1: Faucet (No Auth Needed)
```
1. Visit http://localhost:3000/faucet
2. Connect wallet (BNB Testnet)
3. Mint tokens
4. Success! ✅
```

### Test 2: Dashboard (Auth Required)
```
1. Visit http://localhost:3000/dashboard
2. Connect wallet (BNB Testnet)
3. See merchant details appear
4. Create an invoice
5. Success! ✅
```

---

## 📝 What Gets Created When You Connect

When you connect your wallet to the dashboard:

```javascript
{
  walletAddress: "0xYourAddress...",
  name: "Merchant 0xYour...ss",
  apiKey: "16-character-hex-key",
  wooCommerceEnabled: false,
  shopifyAccessToken: null,
  createdAt: "2026-02-17T..."
}
```

This is stored in the PostgreSQL database and allows you to:
- Create invoices
- Manage payments
- Integrate with WooCommerce/Shopify

---

## 🎯 Summary

**Problem:** Trying to create invoice without merchant account

**Solution:** 
- For faucet → Just connect wallet
- For dashboard → Connect wallet, auto-registers you
- For API → Pass API key or merchantWallet

**Common Mistake:** 
Trying to create invoices before connecting wallet in dashboard

---

Need more help? Let me know which page you're on and what you're trying to do!
