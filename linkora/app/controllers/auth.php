<?php
declare(strict_types=1);

function home(): void
{
    render('home', [
        'title' => brand() . ' — ' . config('tagline'),
        'user'  => current_user(),
    ], 'layout_marketing');
}

function register_form(): void
{
    if (current_user()) {
        redirect('/dashboard');
    }
    $username = strtolower(preg_replace('/[^A-Za-z0-9_]/', '', $_GET['username'] ?? ''));
    render('auth/register', [
        'title'    => 'Create your ' . brand(),
        'username' => old('username', $username),
        'email'    => old('email'),
        'errors'   => $_SESSION['errors'] ?? [],
    ], 'layout_auth');
    unset($_SESSION['errors']);
    clear_old();
}

function register(): void
{
    $username = strtolower(input('username'));
    $email = strtolower(input('email'));
    $password = $_POST['password'] ?? '';

    $errors = [];
    if ($err = validate_username($username)) {
        $errors['username'] = $err;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        $errors['email'] = 'Enter a valid email address.';
    } elseif (query('SELECT 1 FROM users WHERE email = ?', [$email])->fetchColumn()) {
        $errors['email'] = 'An account with this email already exists. Log in instead?';
    }
    if (!is_string($password) || strlen($password) < 8) {
        $errors['password'] = 'Use at least 8 characters.';
    }

    if ($errors) {
        $_SESSION['errors'] = $errors;
        remember_input(['username' => $username, 'email' => $email]);
        redirect('/register');
    }

    query(
        'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
        [$username, $email, password_hash($password, PASSWORD_DEFAULT), $username]
    );
    $user = query('SELECT * FROM users WHERE id = ?', [db()->lastInsertId()])->fetch();
    login_user($user);
    flash('success', 'Welcome to ' . brand() . '! Add your first link below.');
    redirect('/dashboard');
}

function login_form(): void
{
    if (current_user()) {
        redirect('/dashboard');
    }
    render('auth/login', [
        'title' => 'Log in — ' . brand(),
        'login' => old('login'),
        'error' => $_SESSION['errors']['login'] ?? null,
    ], 'layout_auth');
    unset($_SESSION['errors']);
    clear_old();
}

function login(): void
{
    $login = strtolower(input('login'));
    $password = $_POST['password'] ?? '';

    $user = query('SELECT * FROM users WHERE email = ? OR username = ?', [$login, $login])->fetch();

    if (!$user || !is_string($password) || !password_verify($password, $user['password_hash'])) {
        $_SESSION['errors'] = ['login' => 'That email/username and password don’t match.'];
        remember_input(['login' => $login]);
        redirect('/login');
    }
    if ($user['is_suspended']) {
        $_SESSION['errors'] = ['login' => 'This account has been suspended. Contact support if you think this is a mistake.'];
        redirect('/login');
    }
    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }

    login_user($user);
    redirect('/dashboard');
}

function logout(): void
{
    logout_user();
    redirect('/');
}
