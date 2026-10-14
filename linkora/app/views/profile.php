<?php
/** @var array $owner @var array $links @var array $theme @var bool $pro @var bool $preview */
$name = display_name($owner);
$avatar = avatar_url($owner);
$pageUrl = profile_url($owner);
$desc = $owner['bio'] !== '' ? $owner['bio'] : $name . ' on Linkora';
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($name) ?> | Linkora</title>
    <meta name="description" content="<?= e($desc) ?>">
    <link rel="canonical" href="<?= e($pageUrl) ?>">
    <meta property="og:title" content="<?= e($name) ?>">
    <meta property="og:description" content="<?= e($desc) ?>">
    <meta property="og:url" content="<?= e($pageUrl) ?>">
    <meta property="og:type" content="profile">
    <?php if ($avatar): ?><meta property="og:image" content="<?= e($avatar) ?>"><?php endif; ?>
    <meta name="twitter:card" content="summary">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= asset('css/profile.css') ?>">
</head>
<body class="profile<?= $preview ? ' is-preview' : '' ?>" style="<?= e(theme_style($theme)) ?>">
<main class="profile-main">
    <button type="button" class="share-btn" data-share="<?= e($pageUrl) ?>" data-title="<?= e($name) ?>" aria-label="Share this page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
    </button>

    <header class="profile-head">
        <?php if ($avatar): ?>
            <img class="avatar" src="<?= e($avatar) ?>" alt="<?= e($name) ?>" width="96" height="96">
        <?php else: ?>
            <div class="avatar avatar-initial" aria-hidden="true"><?= e(initials($owner)) ?></div>
        <?php endif; ?>
        <h1><?= e($name) ?></h1>
        <?php if ($owner['display_name'] !== ''): ?><p class="handle">@<?= e($owner['username']) ?></p><?php endif; ?>
        <?php if ($owner['bio'] !== ''): ?><p class="bio"><?= nl2br(e($owner['bio'])) ?></p><?php endif; ?>
    </header>

    <nav class="links" aria-label="Links">
        <?php foreach ($links as $link): ?>
            <a class="link" href="<?= url('go/' . $link['id']) ?>" rel="noopener"<?= $preview ? ' target="_blank"' : '' ?>><?= e($link['title']) ?></a>
        <?php endforeach; ?>
        <?php if (!$links): ?>
            <p class="empty">Nothing here yet — check back soon.</p>
        <?php endif; ?>
    </nav>

    <?php if (!$pro): ?>
        <footer class="brand">
            <a href="<?= url('/') ?>"<?= $preview ? ' target="_blank"' : '' ?>>Made with <strong>Linkora</strong></a>
        </footer>
    <?php endif; ?>
</main>
<div class="toast" role="status" aria-live="polite"></div>
<script>
(function () {
    var btn = document.querySelector('[data-share]');
    var toast = document.querySelector('.toast');
    function show(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 1800);
    }
    function copy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        var t = document.createElement('textarea');
        t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } finally { document.body.removeChild(t); }
        return Promise.resolve();
    }
    btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-share');
        if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            navigator.share({ title: btn.getAttribute('data-title'), url: url }).catch(function () {});
        } else {
            copy(url).then(function () { show('Link copied'); });
        }
    });
})();
</script>
</body>
</html>
