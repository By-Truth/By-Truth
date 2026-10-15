<?php
declare(strict_types=1);

function analytics(): void
{
    $user = require_auth();
    $pro = is_pro($user);
    $ranges = $pro ? [7, 30, 90] : [(int) config('free_analytics_days')];
    $days = (int) input('days', (string) $ranges[0]);
    if (!in_array($days, $ranges, true)) {
        $days = $ranges[0];
    }
    $since = gmdate('Y-m-d 00:00:00', strtotime('-' . ($days - 1) . ' days'));
    $uid = $user['id'];

    $views = (int) query('SELECT COUNT(*) FROM page_views WHERE user_id = ? AND created_at >= ?', [$uid, $since])->fetchColumn();
    $clicks = (int) query('SELECT COUNT(*) FROM link_clicks WHERE user_id = ? AND created_at >= ?', [$uid, $since])->fetchColumn();

    // Fill every day in the range, including days with no traffic.
    $daily = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $daily[gmdate('Y-m-d', strtotime("-$i days"))] = ['views' => 0, 'clicks' => 0];
    }
    foreach (query('SELECT DATE(created_at) d, COUNT(*) n FROM page_views WHERE user_id = ? AND created_at >= ? GROUP BY d', [$uid, $since]) as $row) {
        $daily[$row['d']]['views'] = (int) $row['n'];
    }
    foreach (query('SELECT DATE(created_at) d, COUNT(*) n FROM link_clicks WHERE user_id = ? AND created_at >= ? GROUP BY d', [$uid, $since]) as $row) {
        $daily[$row['d']]['clicks'] = (int) $row['n'];
    }

    $topLinks = query(
        'SELECT l.id, l.title, l.url, COUNT(c.id) AS clicks
         FROM links l
         LEFT JOIN link_clicks c ON c.link_id = l.id AND c.created_at >= ?
         WHERE l.user_id = ?
         GROUP BY l.id, l.title, l.url
         ORDER BY clicks DESC, l.position
         LIMIT 10',
        [$since, $uid]
    )->fetchAll();

    $referrers = query(
        "SELECT COALESCE(referrer, 'Direct') AS source, COUNT(*) AS n
         FROM page_views WHERE user_id = ? AND created_at >= ?
         GROUP BY source ORDER BY n DESC LIMIT 6",
        [$uid, $since]
    )->fetchAll();

    $devices = query(
        'SELECT device, COUNT(*) AS n FROM page_views WHERE user_id = ? AND created_at >= ? GROUP BY device',
        [$uid, $since]
    )->fetchAll(PDO::FETCH_KEY_PAIR);

    render('dashboard/analytics', [
        'title'     => 'Analytics — ' . brand(),
        'active'    => 'analytics',
        'user'      => $user,
        'pro'       => $pro,
        'days'      => $days,
        'ranges'    => $ranges,
        'views'     => $views,
        'clicks'    => $clicks,
        'ctr'       => $views > 0 ? round($clicks / $views * 100, 1) : 0,
        'daily'     => $daily,
        'topLinks'  => $topLinks,
        'referrers' => $referrers,
        'devices'   => ['mobile' => (int) ($devices['mobile'] ?? 0), 'desktop' => (int) ($devices['desktop'] ?? 0)],
    ]);
}
