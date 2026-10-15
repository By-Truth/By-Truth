<?php
declare(strict_types=1);

function profile(string $username): void
{
    $owner = query('SELECT * FROM users WHERE username = ? AND is_suspended = 0', [$username])->fetch();
    if (!$owner) {
        abort(404);
    }
    $links = query(
        'SELECT id, title, url FROM links WHERE user_id = ? AND is_active = 1 ORDER BY position, id',
        [$owner['id']]
    )->fetchAll();

    $viewer = current_user();
    $isOwner = $viewer && (int) $viewer['id'] === (int) $owner['id'];
    if (!$isOwner && !is_bot()) {
        query(
            'INSERT INTO page_views (user_id, referrer, device) VALUES (?, ?, ?)',
            [$owner['id'], referrer_host(), is_mobile() ? 'mobile' : 'desktop']
        );
    }

    // Only the owner's dashboard preview may frame the page.
    header("Content-Security-Policy: frame-ancestors 'self'");

    render('profile', [
        'owner'   => $owner,
        'links'   => $links,
        'theme'   => effective_theme($owner),
        'pro'     => is_pro($owner),
        'preview' => isset($_GET['preview']),
    ], null);
}

function link_redirect(string $id): void
{
    $link = query(
        'SELECT l.id, l.user_id, l.url FROM links l
         JOIN users u ON u.id = l.user_id
         WHERE l.id = ? AND l.is_active = 1 AND u.is_suspended = 0',
        [(int) $id]
    )->fetch();
    if (!$link) {
        abort(404);
    }

    $viewer = current_user();
    if (!is_bot() && !($viewer && (int) $viewer['id'] === (int) $link['user_id'])) {
        query('INSERT INTO link_clicks (link_id, user_id) VALUES (?, ?)', [$link['id'], $link['user_id']]);
    }

    header('Cache-Control: no-store');
    header('Location: ' . $link['url'], true, 302);
    exit;
}
