<!doctype html>
<html lang="en">
<head>
    <?php partial('head', ['title' => $title ?? 'Linkora']); ?>
    <meta property="og:title" content="Linkora — One link, your whole world">
    <meta property="og:description" content="Create a beautiful link-in-bio page in minutes. Add your links, pick a theme, share it anywhere.">
    <meta property="og:type" content="website">
</head>
<body class="marketing">
<header class="site-header">
    <div class="container site-header-inner">
        <?php partial('logo'); ?>
        <nav class="site-nav" aria-label="Main">
            <a href="#how">How it works</a>
            <a href="#themes">Themes</a>
            <a href="#pricing">Pricing</a>
        </nav>
        <div class="site-header-cta">
            <?php if (!empty($user)): ?>
                <a class="btn btn-dark" href="<?= url('dashboard') ?>">Dashboard</a>
            <?php else: ?>
                <a class="btn btn-ghost" href="<?= url('login') ?>">Log in</a>
                <a class="btn btn-dark" href="<?= url('register') ?>">Get started</a>
            <?php endif; ?>
        </div>
    </div>
</header>
<?php partial('flashes'); ?>
<?= $content ?>
<footer class="site-footer">
    <div class="container site-footer-inner">
        <?php partial('logo'); ?>
        <p>One link, your whole world.</p>
        <p class="muted">&copy; <?= date('Y') ?> Linkora</p>
    </div>
</footer>
<script src="<?= asset('js/app.js') ?>" defer></script>
</body>
</html>
