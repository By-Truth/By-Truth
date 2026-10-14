<?php
declare(strict_types=1);

const MAX_LINKS = 50;

function dashboard(): void
{
    $user = require_auth();
    $links = query('SELECT * FROM links WHERE user_id = ? ORDER BY position, id', [$user['id']])->fetchAll();
    $clicks = query(
        'SELECT link_id, COUNT(*) AS n FROM link_clicks WHERE user_id = ? GROUP BY link_id',
        [$user['id']]
    )->fetchAll(PDO::FETCH_KEY_PAIR);

    render('dashboard/links', [
        'title'  => 'Links — Linkora',
        'active' => 'links',
        'user'   => $user,
        'links'  => $links,
        'clicks' => $clicks,
        'errors' => take_errors(),
    ]);
    clear_old();
}

function take_errors(): array
{
    $errors = $_SESSION['errors'] ?? [];
    unset($_SESSION['errors']);
    return $errors;
}

/** Fetch one of the current user's links or 404. */
function owned_link(array $user, string $id): array
{
    $link = query('SELECT * FROM links WHERE id = ? AND user_id = ?', [(int) $id, $user['id']])->fetch();
    if (!$link) {
        abort(404);
    }
    return $link;
}

function validated_link_input(): ?array
{
    $title = mb_substr(input('title'), 0, 100);
    $url = normalize_url(input('url'));
    if ($title === '' || $url === null) {
        flash('error', $title === '' ? 'Give your link a title.' : 'That URL doesn’t look right. Try something like https://example.com');
        return null;
    }
    return [$title, $url];
}

function link_create(): void
{
    $user = require_auth();
    $count = (int) query('SELECT COUNT(*) FROM links WHERE user_id = ?', [$user['id']])->fetchColumn();
    if ($count >= MAX_LINKS) {
        flash('error', 'You’ve reached the ' . MAX_LINKS . ' link limit.');
        redirect('/dashboard');
    }
    if (!$data = validated_link_input()) {
        remember_input(['title' => input('title'), 'url' => input('url')]);
        redirect('/dashboard');
    }
    // New links go to the top, where people expect to see them.
    query('UPDATE links SET position = position + 1 WHERE user_id = ?', [$user['id']]);
    query('INSERT INTO links (user_id, title, url, position) VALUES (?, ?, ?, 0)', [$user['id'], $data[0], $data[1]]);
    flash('success', 'Link added.');
    redirect('/dashboard');
}

function link_update(string $id): void
{
    $user = require_auth();
    $link = owned_link($user, $id);
    if ($data = validated_link_input()) {
        query('UPDATE links SET title = ?, url = ? WHERE id = ?', [$data[0], $data[1], $link['id']]);
        flash('success', 'Link saved.');
    }
    redirect('/dashboard#link-' . $link['id']);
}

function link_toggle(string $id): void
{
    $user = require_auth();
    $link = owned_link($user, $id);
    query('UPDATE links SET is_active = 1 - is_active WHERE id = ?', [$link['id']]);
    redirect('/dashboard#link-' . $link['id']);
}

function link_move(string $id): void
{
    $user = require_auth();
    $link = owned_link($user, $id);
    $direction = input('direction') === 'up' ? -1 : 1;

    $ids = query('SELECT id FROM links WHERE user_id = ? ORDER BY position, id', [$user['id']])->fetchAll(PDO::FETCH_COLUMN);
    $from = array_search($link['id'], $ids);
    $to = $from + $direction;
    if ($from !== false && isset($ids[$to])) {
        [$ids[$from], $ids[$to]] = [$ids[$to], $ids[$from]];
        $stmt = db()->prepare('UPDATE links SET position = ? WHERE id = ?');
        foreach ($ids as $pos => $linkId) {
            $stmt->execute([$pos, $linkId]);
        }
    }
    redirect('/dashboard#link-' . $link['id']);
}

function link_delete(string $id): void
{
    $user = require_auth();
    $link = owned_link($user, $id);
    query('DELETE FROM links WHERE id = ?', [$link['id']]);
    flash('success', 'Link deleted.');
    redirect('/dashboard');
}

// ---------------------------------------------------------------- appearance

function appearance(): void
{
    $user = require_auth();
    render('dashboard/appearance', [
        'title'  => 'Appearance — Linkora',
        'active' => 'appearance',
        'user'   => $user,
        'pro'    => is_pro($user),
    ]);
}

function appearance_save(): void
{
    $user = require_auth();
    $displayName = mb_substr(input('display_name'), 0, 60);
    $bio = mb_substr(str_replace(["\r\n", "\r"], "\n", input('bio')), 0, 160);
    $avatar = $user['avatar'];

    if (!empty($_POST['remove_avatar'])) {
        delete_avatar_file($avatar);
        $avatar = null;
    } elseif (!empty($_FILES['avatar']) && $_FILES['avatar']['error'] !== UPLOAD_ERR_NO_FILE) {
        $stored = store_avatar($_FILES['avatar']);
        if ($stored === null) {
            flash('error', 'Avatar must be a JPG, PNG, WEBP or GIF under 2 MB.');
            redirect('/dashboard/appearance');
        }
        delete_avatar_file($avatar);
        $avatar = $stored;
    }

    query('UPDATE users SET display_name = ?, bio = ?, avatar = ? WHERE id = ?', [$displayName, $bio, $avatar, $user['id']]);
    flash('success', 'Profile updated.');
    redirect('/dashboard/appearance');
}

function theme_save(): void
{
    $user = require_auth();
    $key = input('theme');
    $themes = themes();
    if (!isset($themes[$key])) {
        abort(400);
    }
    if ($themes[$key]['pro'] && !is_pro($user)) {
        flash('info', $themes[$key]['name'] . ' is a Pro theme. Upgrade to unlock it.');
        redirect('/dashboard/billing');
    }
    query('UPDATE users SET theme = ? WHERE id = ?', [$key, $user['id']]);
    flash('success', 'Theme switched to ' . $themes[$key]['name'] . '.');
    redirect('/dashboard/appearance');
}

function store_avatar(array $file): ?string
{
    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 2 * 1024 * 1024 || !is_uploaded_file($file['tmp_name'])) {
        return null;
    }
    $info = @getimagesize($file['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
    if (!$info || !isset($types[$info[2]])) {
        return null;
    }
    $name = bin2hex(random_bytes(16)) . '.' . $types[$info[2]];
    $dir = APP_ROOT . '/public/uploads/avatars';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return move_uploaded_file($file['tmp_name'], $dir . '/' . $name) ? $name : null;
}

function delete_avatar_file(?string $name): void
{
    if ($name && preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|gif)$/', $name)) {
        @unlink(APP_ROOT . '/public/uploads/avatars/' . $name);
    }
}

// ---------------------------------------------------------------- settings

function settings(): void
{
    $user = require_auth();
    render('dashboard/settings', [
        'title'  => 'Settings — Linkora',
        'active' => 'settings',
        'user'   => $user,
        'errors' => take_errors(),
    ]);
}

function settings_account(): void
{
    $user = require_auth();
    $username = strtolower(input('username'));
    $email = strtolower(input('email'));
    $errors = [];

    if ($username !== $user['username'] && ($err = validate_username($username, (int) $user['id']))) {
        $errors['username'] = $err;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        $errors['email'] = 'Enter a valid email address.';
    } elseif ($email !== $user['email'] && query('SELECT 1 FROM users WHERE email = ?', [$email])->fetchColumn()) {
        $errors['email'] = 'Another account already uses this email.';
    }
    if ($errors) {
        $_SESSION['errors'] = $errors;
        redirect('/dashboard/settings');
    }

    query('UPDATE users SET username = ?, email = ? WHERE id = ?', [$username, $email, $user['id']]);
    flash('success', $username !== $user['username'] ? 'Saved. Your new link is ' . site_host() . '/' . $username : 'Account saved.');
    redirect('/dashboard/settings');
}

function settings_password(): void
{
    $user = require_auth();
    $current = $_POST['current_password'] ?? '';
    $new = $_POST['new_password'] ?? '';

    if (!is_string($current) || !password_verify($current, $user['password_hash'])) {
        $_SESSION['errors'] = ['current_password' => 'Your current password is incorrect.'];
    } elseif (!is_string($new) || strlen($new) < 8) {
        $_SESSION['errors'] = ['new_password' => 'Use at least 8 characters.'];
    } else {
        query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($new, PASSWORD_DEFAULT), $user['id']]);
        session_regenerate_id(true);
        flash('success', 'Password changed.');
    }
    redirect('/dashboard/settings');
}

function settings_delete(): void
{
    $user = require_auth();
    $password = $_POST['password'] ?? '';
    if (!is_string($password) || !password_verify($password, $user['password_hash'])) {
        $_SESSION['errors'] = ['delete' => 'Password incorrect — your account was not deleted.'];
        redirect('/dashboard/settings');
    }
    delete_avatar_file($user['avatar']);
    query('DELETE FROM users WHERE id = ?', [$user['id']]);
    logout_user();
    flash('info', 'Your account and all its data have been deleted.');
    redirect('/');
}
