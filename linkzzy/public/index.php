<?php
declare(strict_types=1);

// Let PHP's built-in dev server serve real files (CSS, JS, uploads) directly.
if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($file !== __DIR__ . '/' && is_file($file)) {
        return false;
    }
}

require dirname(__DIR__) . '/app/bootstrap.php';

foreach (glob(APP_DIR . '/controllers/*.php') as $controller) {
    require $controller;
}

$routes = [
    ['GET',  '#^/$#',                                 'home'],
    ['GET',  '#^/register$#',                         'register_form'],
    ['POST', '#^/register$#',                         'register'],
    ['GET',  '#^/login$#',                            'login_form'],
    ['POST', '#^/login$#',                            'login'],
    ['POST', '#^/logout$#',                           'logout'],

    ['GET',  '#^/dashboard$#',                        'dashboard'],
    ['POST', '#^/dashboard/links$#',                  'link_create'],
    ['POST', '#^/dashboard/links/(\d+)$#',            'link_update'],
    ['POST', '#^/dashboard/links/(\d+)/toggle$#',     'link_toggle'],
    ['POST', '#^/dashboard/links/(\d+)/move$#',       'link_move'],
    ['POST', '#^/dashboard/links/(\d+)/delete$#',     'link_delete'],
    ['GET',  '#^/dashboard/appearance$#',             'appearance'],
    ['POST', '#^/dashboard/appearance$#',             'appearance_save'],
    ['POST', '#^/dashboard/theme$#',                  'theme_save'],
    ['GET',  '#^/dashboard/analytics$#',              'analytics'],
    ['GET',  '#^/dashboard/settings$#',               'settings'],
    ['POST', '#^/dashboard/settings/account$#',       'settings_account'],
    ['POST', '#^/dashboard/settings/password$#',      'settings_password'],
    ['POST', '#^/dashboard/settings/delete$#',        'settings_delete'],

    ['GET',  '#^/dashboard/billing$#',                'billing'],
    ['POST', '#^/billing/checkout$#',                 'billing_checkout'],
    ['GET',  '#^/billing/callback$#',                 'billing_callback'],
    ['POST', '#^/paystack/webhook$#',                 'paystack_webhook'],

    ['GET',  '#^/admin$#',                            'admin_index'],
    ['POST', '#^/admin/users/(\d+)/suspend$#',        'admin_toggle_suspend'],
    ['POST', '#^/admin/users/(\d+)/delete$#',         'admin_delete_user'],

    ['GET',  '#^/go/(\d+)$#',                         'link_redirect'],
    ['GET',  '#^/([a-z0-9_]{3,30})/?$#',              'profile'],
];

// No CSRF on the webhook: Paystack signs it instead.
const CSRF_EXEMPT = ['paystack_webhook'];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$method = $method === 'HEAD' ? 'GET' : $method;
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$path = $path === '/' ? '/' : rtrim($path, '/');
$pathForMatch = strtolower($path) === $path ? $path : null;

try {
    $allowed = false;
    foreach ($routes as [$verb, $pattern, $handler]) {
        if (!preg_match($pattern, $path, $m)) {
            continue;
        }
        $allowed = true;
        if ($verb !== $method) {
            continue;
        }
        if ($verb === 'POST' && !in_array($handler, CSRF_EXEMPT, true)) {
            verify_csrf();
        }
        $handler(...array_slice($m, 1));
        exit;
    }

    // Mixed-case profile URLs (e.g. /JaneDoe) → canonical lowercase.
    if ($method === 'GET' && preg_match('#^/[A-Za-z0-9_]{3,30}$#', $path) && $pathForMatch === null) {
        header('Location: ' . url(strtolower(ltrim($path, '/'))), true, 301);
        exit;
    }

    if ($allowed) {
        http_response_code(405);
        exit('Method not allowed');
    }
    abort(404);
} catch (Throwable $ex) {
    error_log((string) $ex);
    if (config('debug')) {
        http_response_code(500);
        echo '<pre>' . e((string) $ex) . '</pre>';
        exit;
    }
    abort(500);
}
