<?php
declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__));
define('APP_DIR', __DIR__);

$GLOBALS['config'] = require APP_DIR . '/config.php';

require APP_DIR . '/helpers.php';
require APP_DIR . '/themes.php';
require APP_DIR . '/paystack.php';

date_default_timezone_set('UTC');
error_reporting(E_ALL);
ini_set('display_errors', config('debug') ? '1' : '0');

if (PHP_SAPI !== 'cli') {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name(preg_replace('/[^a-z0-9]/', '', strtolower(brand())) . '_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}
