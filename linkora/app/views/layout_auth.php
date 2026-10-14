<!doctype html>
<html lang="en">
<head>
    <?php partial('head', ['title' => $title ?? 'Linkora']); ?>
</head>
<body class="auth">
<main class="auth-main">
    <div class="auth-logo"><?php partial('logo'); ?></div>
    <?php partial('flashes'); ?>
    <?= $content ?>
</main>
<script src="<?= asset('js/app.js') ?>" defer></script>
</body>
</html>
