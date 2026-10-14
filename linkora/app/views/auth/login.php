<div class="card auth-card">
    <h1>Welcome back</h1>
    <p class="muted">Log in to manage your page.</p>
    <?php if ($error): ?><div class="flash flash-error"><?= e($error) ?></div><?php endif; ?>
    <form method="post" action="<?= url('login') ?>" class="form">
        <?= csrf_field() ?>
        <div class="field">
            <label for="login">Email or username</label>
            <input id="login" name="login" value="<?= e($login) ?>" required autocomplete="username" autocapitalize="none" spellcheck="false" autofocus>
        </div>
        <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" required autocomplete="current-password">
        </div>
        <button class="btn btn-dark btn-block btn-lg" type="submit">Log in</button>
    </form>
    <p class="auth-switch">New here? <a href="<?= url('register') ?>">Create your Linkora</a></p>
</div>
