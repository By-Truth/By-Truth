<?php
// Copy to config.local.php and fill in. config.local.php is git-ignored.
return [
    'base_url' => 'https://your-domain.com',
    'db' => [
        'host' => '127.0.0.1',
        'name' => 'linkora',
        'user' => 'linkora',
        'pass' => 'change-me',
    ],
    'paystack' => [
        'secret_key' => 'sk_test_xxx',
        'public_key' => 'pk_test_xxx',
        'pro_price'  => 250000, // ₦2,500 in kobo
        'currency'   => 'NGN',
    ],
];
