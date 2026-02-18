<?php
/**
 * MNEE Stablecoin Blocks Integration
 *
 * @package WooCommerce_MNEE_Gateway
 */

if (!defined('ABSPATH')) {
    exit;
}

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

/**
 * MNEE payment method integration for WooCommerce Blocks checkout.
 */
final class WC_MNEE_Blocks_Integration extends AbstractPaymentMethodType
{

    /**
     * Payment method name — must exactly match the gateway ID in PHP.
     */
    protected $name = 'mnee_gateway';

    /**
     * Initializes the payment method type.
     * Called by WooCommerce Blocks — must not throw.
     */
    public function initialize()
    {
        $this->settings = get_option('woocommerce_mnee_gateway_settings', []);
    }

    /**
     * Returns whether this payment method should be active.
     */
    public function is_active()
    {
        $enabled = isset($this->settings['enabled']) ? $this->settings['enabled'] : 'no';
        return $enabled === 'yes';
    }

    /**
     * Returns script handles to enqueue for this payment method.
     */
    public function get_payment_method_script_handles()
    {
        $script_url = WC_MNEE_GATEWAY_PLUGIN_URL . 'assets/js/frontend/blocks.js';
        $script_asset_path = WC_MNEE_GATEWAY_PLUGIN_PATH . 'assets/js/frontend/blocks.asset.php';

        $script_asset = file_exists($script_asset_path)
            ? require $script_asset_path
            : ['dependencies' => [], 'version' => WC_MNEE_GATEWAY_VERSION];

        wp_register_script(
            'wc-mnee-payments-blocks',
            $script_url,
            $script_asset['dependencies'],
            $script_asset['version'],
            true
        );

        return ['wc-mnee-payments-blocks'];
    }

    /**
     * Returns data passed to the payment method JS.
     */
    public function get_payment_method_data()
    {
        return [
            'title' => isset($this->settings['title']) ? $this->settings['title'] : 'MNEE Stablecoin',
            'description' => isset($this->settings['description']) ? $this->settings['description'] : 'Pay with MNEE stablecoin.',
            'supports' => ['products'],
        ];
    }
}