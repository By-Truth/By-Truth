<div class="card auth-card error-card">
    <p class="error-code"><?= (int) $code ?></p>
    <h1><?= e($title) ?></h1>
    <?php if ($code === 404): ?>
        <p class="muted">This page doesn’t exist — but it could be yours.</p>
        <a class="btn btn-accent" href="<?= url('register') ?>">Claim a Linkora</a>
    <?php else: ?>
        <a class="btn btn-dark" href="<?= url('/') ?>">Go home</a>
    <?php endif; ?>
</div>
