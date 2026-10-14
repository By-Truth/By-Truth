<?php
/** Dashboard shell. @var string $content @var array $user @var string $active */
$nav = [
    'links'      => ['/dashboard', 'Links', 'link'],
    'appearance' => ['/dashboard/appearance', 'Appearance', 'palette'],
    'analytics'  => ['/dashboard/analytics', 'Analytics', 'chart'],
    'billing'    => ['/dashboard/billing', 'Plan', 'star'],
    'settings'   => ['/dashboard/settings', 'Settings', 'settings'],
];
if (!empty($user['is_admin'])) {
    $nav['admin'] = ['/admin', 'Admin', 'shield'];
}
?>
<!doctype html>
<html lang="en">
<head>
    <?php partial('head', ['title' => $title ?? brand()]); ?>
    <meta name="robots" content="noindex">
</head>
<body class="app">
<header class="topbar">
    <div class="topbar-inner">
        <?php partial('logo'); ?>
        <nav class="tabs" aria-label="Dashboard">
            <?php foreach ($nav as $key => [$href, $label, $ic]): ?>
                <a href="<?= url($href) ?>" class="tab<?= ($active ?? '') === $key ? ' is-active' : '' ?>"<?= ($active ?? '') === $key ? ' aria-current="page"' : '' ?>>
                    <?= icon($ic) ?><span><?= e($label) ?></span>
                </a>
            <?php endforeach; ?>
        </nav>
        <div class="topbar-end">
            <?php if (is_pro($user)): ?><span class="badge badge-pro">Pro</span><?php endif; ?>
            <form method="post" action="<?= url('logout') ?>">
                <?= csrf_field() ?>
                <button class="btn btn-ghost btn-sm" type="submit" title="Log out"><?= icon('logout') ?><span class="hide-sm">Log out</span></button>
            </form>
        </div>
    </div>
</header>
<main class="app-main">
    <?php partial('flashes'); ?>
    <?= $content ?>
</main>
<script src="<?= asset('js/app.js') ?>" defer></script>
</body>
</html>
