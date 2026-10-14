<div class="card auth-card">
    <h1>Create your <?= e(brand()) ?></h1>
    <p class="muted">Free forever. Takes about a minute.</p>
    <form method="post" action="<?= url('register') ?>" class="form" novalidate>
        <?= csrf_field() ?>
        <div class="field<?= isset($errors['username']) ? ' has-error' : '' ?>">
            <label for="username">Username</label>
            <div class="input-prefix">
                <span><?= e(site_host()) ?>/</span>
                <input id="username" name="username" value="<?= e($username) ?>" required maxlength="30" autocomplete="username" autocapitalize="none" spellcheck="false" autofocus>
            </div>
            <?php if (isset($errors['username'])): ?><p class="field-error"><?= e($errors['username']) ?></p><?php endif; ?>
        </div>
        <div class="field<?= isset($errors['email']) ? ' has-error' : '' ?>">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" value="<?= e($email) ?>" required autocomplete="email">
            <?php if (isset($errors['email'])): ?><p class="field-error"><?= e($errors['email']) ?></p><?php endif; ?>
        </div>
        <div class="field<?= isset($errors['password']) ? ' has-error' : '' ?>">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" required minlength="8" autocomplete="new-password">
            <?php if (isset($errors['password'])): ?><p class="field-error"><?= e($errors['password']) ?></p><?php else: ?><p class="field-hint">At least 8 characters.</p><?php endif; ?>
        </div>
        <button class="btn btn-accent btn-block btn-lg" type="submit">Create my page</button>
    </form>
    <p class="auth-switch">Already have an account? <a href="<?= url('login') ?>">Log in</a></p>
</div>
