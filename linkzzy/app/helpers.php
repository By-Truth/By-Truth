<?php
declare(strict_types=1);

const RESERVED_USERNAMES = [
    'admin', 'administrator', 'api', 'assets', 'billing', 'dashboard', 'go', 'help',
    'linkzzy', 'login', 'logout', 'paystack', 'pricing', 'privacy', 'register', 'root',
    'settings', 'signup', 'static', 'support', 'terms', 'uploads', 'user', 'users', 'www',
];

// ---------------------------------------------------------------- config & db

function config(string $key, $default = null)
{
    $value = $GLOBALS['config'];
    foreach (explode('.', $key) as $part) {
        if (!is_array($value) || !array_key_exists($part, $value)) {
            return $default;
        }
        $value = $value[$part];
    }
    return $value;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config('db');
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['host'], $c['port'], $c['name']);
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
    }
    return $pdo;
}

function query(string $sql, array $params = []): PDOStatement
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function brand(): string
{
    return (string) config('app_name', 'Linkzzy');
}

// ---------------------------------------------------------------- http

function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function base_url(): string
{
    $configured = rtrim((string) config('base_url'), '/');
    if ($configured !== '') {
        return $configured;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
}

function url(string $path = '/'): string
{
    return base_url() . '/' . ltrim($path, '/');
}

/** Display form of the site host, e.g. "yourbrand.com". */
function site_host(): string
{
    return (string) parse_url(base_url(), PHP_URL_HOST) . (parse_url(base_url(), PHP_URL_PORT) ? ':' . parse_url(base_url(), PHP_URL_PORT) : '');
}

function redirect(string $path): void
{
    header('Location: ' . (preg_match('#^https?://#', $path) ? $path : url($path)));
    exit;
}

function back(string $fallback = '/dashboard'): void
{
    $ref = $_SERVER['HTTP_REFERER'] ?? '';
    if ($ref !== '' && str_starts_with($ref, base_url() . '/')) {
        redirect($ref);
    }
    redirect($fallback);
}

function abort(int $code = 404): void
{
    http_response_code($code);
    echo view('error', ['code' => $code, 'title' => $code === 404 ? 'Page not found' : 'Something went wrong'], 'layout_auth');
    exit;
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

function input(string $key, string $default = ''): string
{
    $value = $_POST[$key] ?? $_GET[$key] ?? $default;
    return is_string($value) ? trim($value) : $default;
}

// ---------------------------------------------------------------- views

function view(string $template, array $data = [], ?string $layout = 'layout'): string
{
    extract($data, EXTR_SKIP);
    ob_start();
    require APP_DIR . '/views/' . $template . '.php';
    $content = ob_get_clean();
    if ($layout === null) {
        return $content;
    }
    ob_start();
    require APP_DIR . '/views/' . $layout . '.php';
    return ob_get_clean();
}

function render(string $template, array $data = [], ?string $layout = 'layout'): void
{
    echo view($template, $data, $layout);
}

function partial(string $name, array $data = []): void
{
    extract($data, EXTR_SKIP);
    require APP_DIR . '/views/partials/' . $name . '.php';
}

function asset(string $path): string
{
    $file = APP_ROOT . '/public/assets/' . $path;
    $v = is_file($file) ? substr((string) filemtime($file), -6) : '1';
    return url('assets/' . $path) . '?v=' . $v;
}

// ---------------------------------------------------------------- session helpers

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $token = $_POST['_csrf'] ?? '';
    if (!is_string($token) || !hash_equals(csrf_token(), $token)) {
        http_response_code(419);
        echo view('error', ['code' => 419, 'title' => 'Your session expired. Go back, refresh and try again.'], 'layout_auth');
        exit;
    }
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function take_flashes(): array
{
    $f = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $f;
}

function remember_input(array $data): void
{
    $_SESSION['old'] = $data;
}

function old(string $key, string $default = ''): string
{
    return (string) ($_SESSION['old'][$key] ?? $default);
}

function clear_old(): void
{
    unset($_SESSION['old']);
}

// ---------------------------------------------------------------- auth

function current_user(bool $refresh = false): ?array
{
    static $user = false;
    if ($refresh) {
        $user = false;
    }
    if ($user === false) {
        $user = null;
        if (!empty($_SESSION['user_id'])) {
            $user = query('SELECT * FROM users WHERE id = ?', [$_SESSION['user_id']])->fetch() ?: null;
            if ($user && $user['is_suspended']) {
                logout_user();
                $user = null;
            }
        }
    }
    return $user;
}

function login_user(array $user): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
}

function logout_user(): void
{
    $_SESSION = [];
    session_regenerate_id(true);
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        flash('info', 'Please log in to continue.');
        redirect('/login');
    }
    return $user;
}

function require_admin(): array
{
    $user = require_auth();
    if (!$user['is_admin']) {
        abort(404);
    }
    return $user;
}

function is_pro(array $user): bool
{
    return $user['plan'] === 'pro' && $user['pro_until'] !== null && strtotime($user['pro_until']) > time();
}

// ---------------------------------------------------------------- domain helpers

function validate_username(string $username, ?int $ignoreUserId = null): ?string
{
    if (!preg_match('/^[a-z0-9_]{3,30}$/', $username)) {
        return 'Usernames are 3–30 characters: lowercase letters, numbers and underscores.';
    }
    if (in_array($username, RESERVED_USERNAMES, true) || $username === strtolower(preg_replace('/[^A-Za-z0-9_]/', '', brand()))) {
        return 'That username is reserved. Try another one.';
    }
    $taken = query('SELECT id FROM users WHERE username = ?', [$username])->fetchColumn();
    if ($taken && (int) $taken !== $ignoreUserId) {
        return 'That username is already taken.';
    }
    return null;
}

/** Normalise a user-supplied link. Returns null when it isn't a safe, usable URL. */
function normalize_url(string $url): ?string
{
    $url = trim($url);
    if ($url === '' || strlen($url) > 2048) {
        return null;
    }
    if (preg_match('/^(mailto|tel):/i', $url)) {
        return preg_match('/^(mailto|tel):[^\s<>"]+$/i', $url) ? $url : null;
    }
    if (!preg_match('#^[a-z][a-z0-9+.-]*://#i', $url)) {
        $url = 'https://' . $url;
    }
    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    if (!in_array($scheme, ['http', 'https'], true) || !filter_var($url, FILTER_VALIDATE_URL)) {
        return null;
    }
    $host = (string) parse_url($url, PHP_URL_HOST);
    return str_contains($host, '.') ? $url : null;
}

function profile_url(array $user): string
{
    return url($user['username']);
}

function avatar_url(array $user): ?string
{
    return $user['avatar'] ? url('uploads/avatars/' . $user['avatar']) : null;
}

function display_name(array $user): string
{
    return $user['display_name'] !== '' ? $user['display_name'] : '@' . $user['username'];
}

function initials(array $user): string
{
    $name = $user['display_name'] !== '' ? $user['display_name'] : $user['username'];
    return mb_strtoupper(mb_substr($name, 0, 1));
}

function is_bot(): bool
{
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    return $ua === '' || (bool) preg_match('/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|embedly|curl|wget|python|headless/i', $ua);
}

function is_mobile(): bool
{
    return (bool) preg_match('/Mobile|Android|iPhone|iPad|iPod/i', $_SERVER['HTTP_USER_AGENT'] ?? '');
}

function referrer_host(): ?string
{
    $ref = $_SERVER['HTTP_REFERER'] ?? '';
    $host = $ref !== '' ? strtolower((string) parse_url($ref, PHP_URL_HOST)) : '';
    if ($host === '' || $host === strtolower((string) parse_url(base_url(), PHP_URL_HOST))) {
        return null;
    }
    return substr(preg_replace('/^www\./', '', $host), 0, 190);
}

function money(int $minorUnits, string $currency): string
{
    $symbols = ['NGN' => '₦', 'USD' => '$', 'GHS' => 'GH₵', 'ZAR' => 'R', 'KES' => 'KSh '];
    $amount = $minorUnits / 100;
    $formatted = number_format($amount, fmod($amount, 1.0) === 0.0 ? 0 : 2);
    return ($symbols[$currency] ?? $currency . ' ') . $formatted;
}

function time_ago(string $datetime): string
{
    $diff = time() - strtotime($datetime);
    if ($diff < 60) return 'just now';
    if ($diff < 3600) return floor($diff / 60) . 'm ago';
    if ($diff < 86400) return floor($diff / 3600) . 'h ago';
    if ($diff < 86400 * 30) return floor($diff / 86400) . 'd ago';
    return date('M j, Y', strtotime($datetime));
}

function icon(string $name): string
{
    static $icons = [
        'copy'     => '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
        'link'     => '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
        'palette'  => '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A5.7 5.7 0 0 0 22 9.7C22 5.4 17.5 2 12 2z"/>',
        'chart'    => '<path d="M3 3v18h18"/><path d="M8 17V11"/><path d="M13 17V7"/><path d="M18 17v-4"/>',
        'star'     => '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
        'settings' => '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
        'shield'   => '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'up'       => '<path d="m18 15-6-6-6 6"/>',
        'down'     => '<path d="m6 9 6 6 6-6"/>',
        'trash'    => '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
        'eye'      => '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
        'eye-off'  => '<path d="M17.9 17.9A10 10 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/>',
        'external' => '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        'share'    => '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
        'lock'     => '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        'check'    => '<path d="M20 6 9 17l-5-5"/>',
        'plus'     => '<path d="M12 5v14M5 12h14"/>',
        'logout'   => '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    ];
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . ($icons[$name] ?? '') . '</svg>';
}
