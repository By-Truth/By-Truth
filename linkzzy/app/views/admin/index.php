<?php /** @var array $users @var array $stats @var array $revenue @var array $payments */ ?>
<div class="page-head">
    <div>
        <h1>Admin</h1>
        <p class="muted">Everything happening on <?= e(brand()) ?>.</p>
    </div>
</div>

<div class="stats stats-6">
    <div class="stat"><p class="stat-label">Users</p><p class="stat-value"><?= number_format($stats['users']) ?></p><p class="stat-sub">+<?= number_format($stats['new_week']) ?> this week</p></div>
    <div class="stat"><p class="stat-label">Pro users</p><p class="stat-value"><?= number_format($stats['pro']) ?></p></div>
    <div class="stat"><p class="stat-label">Links</p><p class="stat-value"><?= number_format($stats['links']) ?></p></div>
    <div class="stat"><p class="stat-label">Views today</p><p class="stat-value"><?= number_format($stats['views_today']) ?></p></div>
    <div class="stat"><p class="stat-label">Clicks today</p><p class="stat-value"><?= number_format($stats['clicks_today']) ?></p></div>
    <div class="stat"><p class="stat-label">Revenue</p><p class="stat-value"><?php
        if (!$revenue) { echo '₦0'; }
        foreach ($revenue as $cur => $amt) { echo e(money((int) $amt, $cur)) . '<br>'; } ?></p></div>
</div>

<div class="card">
    <div class="card-head">
        <h2 class="card-title">Users <span class="muted">(<?= number_format($total) ?>)</span></h2>
        <form method="get" action="<?= url('admin') ?>" class="search">
            <input type="search" name="q" value="<?= e($search) ?>" placeholder="Search username or email" aria-label="Search users">
        </form>
    </div>
    <div class="table-scroll">
        <table class="table">
            <thead>
            <tr><th>User</th><th>Email</th><th>Plan</th><th class="num">Links</th><th class="num">Views</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
            <?php foreach ($users as $u): ?>
                <tr class="<?= $u['is_suspended'] ? 'is-suspended' : '' ?>">
                    <td>
                        <a href="<?= e(profile_url($u)) ?>" target="_blank" rel="noopener">@<?= e($u['username']) ?></a>
                        <?php if ($u['is_admin']): ?><span class="badge">Admin</span><?php endif; ?>
                        <?php if ($u['is_suspended']): ?><span class="badge badge-danger">Suspended</span><?php endif; ?>
                    </td>
                    <td><?= e($u['email']) ?></td>
                    <td><?= is_pro($u) ? '<span class="badge badge-pro">Pro</span>' : 'Free' ?></td>
                    <td class="num"><?= (int) $u['link_count'] ?></td>
                    <td class="num"><?= number_format((int) $u['view_count']) ?></td>
                    <td><?= e(time_ago($u['created_at'])) ?></td>
                    <td class="row-actions">
                        <?php if ((int) $u['id'] !== (int) $user['id']): ?>
                            <form method="post" action="<?= url('admin/users/' . $u['id'] . '/suspend') ?>">
                                <?= csrf_field() ?>
                                <button class="btn btn-sm btn-outline" type="submit"><?= $u['is_suspended'] ? 'Reinstate' : 'Suspend' ?></button>
                            </form>
                            <form method="post" action="<?= url('admin/users/' . $u['id'] . '/delete') ?>" data-confirm="Permanently delete @<?= e($u['username']) ?> and all their data?">
                                <?= csrf_field() ?>
                                <button class="btn btn-sm btn-danger-ghost" type="submit">Delete</button>
                            </form>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$users): ?>
                <tr><td colspan="7" class="muted">No users found.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if ($pages > 1): ?>
        <nav class="pager" aria-label="Pagination">
            <?php $qs = $search !== '' ? '&q=' . urlencode($search) : ''; ?>
            <?php if ($page > 1): ?><a class="btn btn-sm btn-outline" href="<?= url('admin?page=' . ($page - 1) . $qs) ?>">Previous</a><?php endif; ?>
            <span class="muted">Page <?= $page ?> of <?= $pages ?></span>
            <?php if ($page < $pages): ?><a class="btn btn-sm btn-outline" href="<?= url('admin?page=' . ($page + 1) . $qs) ?>">Next</a><?php endif; ?>
        </nav>
    <?php endif; ?>
</div>

<div class="card">
    <h2 class="card-title">Recent payments</h2>
    <?php if (!$payments): ?>
        <p class="muted">No payments yet.</p>
    <?php else: ?>
        <div class="table-scroll">
            <table class="table">
                <thead><tr><th>User</th><th>Reference</th><th class="num">Amount</th><th>Paid</th></tr></thead>
                <tbody>
                <?php foreach ($payments as $p): ?>
                    <tr>
                        <td>@<?= e($p['username']) ?></td>
                        <td><code><?= e($p['reference']) ?></code></td>
                        <td class="num"><?= e(money((int) $p['amount'], $p['currency'])) ?></td>
                        <td><?= e(time_ago($p['paid_at'])) ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>
