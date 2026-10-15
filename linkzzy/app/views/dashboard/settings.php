<?php /** @var array $user @var array $errors */ ?>
<div class="page-head">
    <div>
        <h1>Settings</h1>
        <p class="muted">Your account details.</p>
    </div>
</div>

<div class="stack">
    <form method="post" action="<?= url('dashboard/settings/account') ?>" class="card form">
        <?= csrf_field() ?>
        <h2 class="card-title">Account</h2>
        <div class="field<?= isset($errors['username']) ? ' has-error' : '' ?>">
            <label for="username">Username</label>
            <div class="input-prefix">
                <span><?= e(site_host()) ?>/</span>
                <input id="username" name="username" value="<?= e($user['username']) ?>" required maxlength="30" autocapitalize="none" spellcheck="false">
            </div>
            <?php if (isset($errors['username'])): ?><p class="field-error"><?= e($errors['username']) ?></p><?php else: ?><p class="field-hint">Changing this changes your page link — update it wherever you’ve shared it.</p><?php endif; ?>
        </div>
        <div class="field<?= isset($errors['email']) ? ' has-error' : '' ?>">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" value="<?= e($user['email']) ?>" required>
            <?php if (isset($errors['email'])): ?><p class="field-error"><?= e($errors['email']) ?></p><?php endif; ?>
        </div>
        <button class="btn btn-dark" type="submit">Save account</button>
    </form>

    <form method="post" action="<?= url('dashboard/settings/password') ?>" class="card form">
        <?= csrf_field() ?>
        <h2 class="card-title">Password</h2>
        <div class="field<?= isset($errors['current_password']) ? ' has-error' : '' ?>">
            <label for="current_password">Current password</label>
            <input id="current_password" type="password" name="current_password" required autocomplete="current-password">
            <?php if (isset($errors['current_password'])): ?><p class="field-error"><?= e($errors['current_password']) ?></p><?php endif; ?>
        </div>
        <div class="field<?= isset($errors['new_password']) ? ' has-error' : '' ?>">
            <label for="new_password">New password</label>
            <input id="new_password" type="password" name="new_password" required minlength="8" autocomplete="new-password">
            <?php if (isset($errors['new_password'])): ?><p class="field-error"><?= e($errors['new_password']) ?></p><?php endif; ?>
        </div>
        <button class="btn btn-dark" type="submit">Change password</button>
    </form>

    <form method="post" action="<?= url('dashboard/settings/delete') ?>" class="card form card-danger" data-confirm="Delete your account, links and analytics forever? This can’t be undone.">
        <?= csrf_field() ?>
        <h2 class="card-title">Delete account</h2>
        <p class="muted">Permanently removes your page, links and analytics.</p>
        <div class="field<?= isset($errors['delete']) ? ' has-error' : '' ?>">
            <label for="delete_password">Confirm with your password</label>
            <input id="delete_password" type="password" name="password" required autocomplete="current-password">
            <?php if (isset($errors['delete'])): ?><p class="field-error"><?= e($errors['delete']) ?></p><?php endif; ?>
        </div>
        <button class="btn btn-danger" type="submit">Delete my account</button>
    </form>
</div>
