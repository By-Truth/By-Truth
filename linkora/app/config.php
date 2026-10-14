<?php
/**
 * Default configuration. Don't edit this file for your server —
 * copy config.local.example.php to config.local.php and override there,
 * or set the matching environment variables.
 */

$config = [
    'app_name' => 'Linkora',
    // Public URL without a trailing slash, e.g. https://linkora.app
    // Leave empty to derive it from the current request.
    'base_url' => getenv('APP_URL') ?: '',
    'debug'    => getenv('APP_DEBUG') === '1',

    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('DB_PORT') ?: 3306),
        'name' => getenv('DB_NAME') ?: 'linkora',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: '',
    ],

    'paystack' => [
        'secret_key' => getenv('PAYSTACK_SECRET_KEY') ?: '',
        'public_key' => getenv('PAYSTACK_PUBLIC_KEY') ?: '',
        // Price in the smallest currency unit: 250000 kobo = ₦2,500
        'pro_price'  => (int) (getenv('PRO_PRICE') ?: 250000),
        'currency'   => getenv('PRO_CURRENCY') ?: 'NGN',
        'pro_days'   => 30,
    ],

    // Free plan limits
    'free_analytics_days' => 7,
];

$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $config = array_replace_recursive($config, require $local);
}

return $config;
