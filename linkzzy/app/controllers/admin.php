<?php
declare(strict_types=1);

function admin_index(): void
{
    $admin = require_admin();
    $search = input('q');
    $page = max(1, (int) input('page', '1'));
    $perPage = 25;

    $where = '';
    $params = [];
    if ($search !== '') {
        $where = 'WHERE u.username LIKE ? OR u.email LIKE ?';
        $like = '%' . addcslashes($search, '%_\\') . '%';
        $params = [$like, $like];
    }

    $total = (int) query("SELECT COUNT(*) FROM users u $where", $params)->fetchColumn();
    $users = query(
        "SELECT u.*,
            (SELECT COUNT(*) FROM links l WHERE l.user_id = u.id) AS link_count,
            (SELECT COUNT(*) FROM page_views v WHERE v.user_id = u.id) AS view_count
         FROM users u $where
         ORDER BY u.created_at DESC, u.id DESC
         LIMIT $perPage OFFSET " . (($page - 1) * $perPage),
        $params
    )->fetchAll();

    $stats = [
        'users'       => (int) query('SELECT COUNT(*) FROM users')->fetchColumn(),
        'new_week'    => (int) query('SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL 7 DAY')->fetchColumn(),
        'pro'         => (int) query("SELECT COUNT(*) FROM users WHERE plan = 'pro' AND pro_until > NOW()")->fetchColumn(),
        'links'       => (int) query('SELECT COUNT(*) FROM links')->fetchColumn(),
        'views_today' => (int) query('SELECT COUNT(*) FROM page_views WHERE created_at >= CURDATE()')->fetchColumn(),
        'clicks_today'=> (int) query('SELECT COUNT(*) FROM link_clicks WHERE created_at >= CURDATE()')->fetchColumn(),
    ];
    $revenue = query(
        "SELECT currency, SUM(amount) AS total FROM payments WHERE status = 'success' GROUP BY currency"
    )->fetchAll(PDO::FETCH_KEY_PAIR);
    $payments = query(
        "SELECT p.*, u.username FROM payments p JOIN users u ON u.id = p.user_id
         WHERE p.status = 'success' ORDER BY p.paid_at DESC LIMIT 8"
    )->fetchAll();

    render('admin/index', [
        'title'    => 'Admin — ' . brand(),
        'active'   => 'admin',
        'user'     => $admin,
        'users'    => $users,
        'stats'    => $stats,
        'revenue'  => $revenue,
        'payments' => $payments,
        'search'   => $search,
        'page'     => $page,
        'pages'    => max(1, (int) ceil($total / $perPage)),
        'total'    => $total,
    ]);
}

function admin_target(array $admin, string $id): array
{
    $target = query('SELECT * FROM users WHERE id = ?', [(int) $id])->fetch();
    if (!$target) {
        abort(404);
    }
    if ((int) $target['id'] === (int) $admin['id']) {
        flash('error', 'You can’t do that to your own account.');
        back('/admin');
    }
    return $target;
}

function admin_toggle_suspend(string $id): void
{
    $admin = require_admin();
    $target = admin_target($admin, $id);
    query('UPDATE users SET is_suspended = 1 - is_suspended WHERE id = ?', [$target['id']]);
    flash('success', '@' . $target['username'] . ($target['is_suspended'] ? ' reinstated.' : ' suspended.'));
    back('/admin');
}

function admin_delete_user(string $id): void
{
    $admin = require_admin();
    $target = admin_target($admin, $id);
    delete_avatar_file($target['avatar']);
    query('DELETE FROM users WHERE id = ?', [$target['id']]);
    flash('success', '@' . $target['username'] . ' deleted.');
    back('/admin');
}
