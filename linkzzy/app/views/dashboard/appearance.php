<?php /** @var array $user @var bool $pro */ $avatar = avatar_url($user); ?>
<div class="page-head">
    <div>
        <h1>Appearance</h1>
        <p class="muted">Make the page feel like you.</p>
    </div>
    <?php partial('copy_link', ['user' => $user]); ?>
</div>

<div class="split">
    <section class="split-main">
        <form method="post" action="<?= url('dashboard/appearance') ?>" enctype="multipart/form-data" class="card form">
            <?= csrf_field() ?>
            <h2 class="card-title">Profile</h2>
            <div class="avatar-row">
                <?php if ($avatar): ?>
                    <img class="avatar-lg" src="<?= e($avatar) ?>" alt="">
                <?php else: ?>
                    <div class="avatar-lg avatar-initial"><?= e(initials($user)) ?></div>
                <?php endif; ?>
                <div class="avatar-controls">
                    <label class="btn btn-outline btn-sm file-btn">
                        <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp,image/gif" data-autosubmit>
                        Upload photo
                    </label>
                    <?php if ($avatar): ?>
                        <button class="btn btn-ghost btn-sm" type="submit" name="remove_avatar" value="1">Remove</button>
                    <?php endif; ?>
                    <p class="field-hint">JPG, PNG, WEBP or GIF · up to 2 MB</p>
                </div>
            </div>
            <div class="field">
                <label for="display_name">Display name</label>
                <input id="display_name" name="display_name" value="<?= e($user['display_name']) ?>" maxlength="60">
            </div>
            <div class="field">
                <label for="bio">Bio</label>
                <textarea id="bio" name="bio" rows="3" maxlength="160" data-counter><?= e($user['bio']) ?></textarea>
                <p class="field-hint"><span data-count><?= mb_strlen($user['bio']) ?></span>/160</p>
            </div>
            <button class="btn btn-dark" type="submit">Save profile</button>
        </form>

        <div class="card">
            <h2 class="card-title">Theme</h2>
            <div class="theme-grid">
                <?php foreach (themes() as $key => $t):
                    $locked = $t['pro'] && !$pro;
                    $current = $user['theme'] === $key; ?>
                    <form method="post" action="<?= url('dashboard/theme') ?>">
                        <?= csrf_field() ?>
                        <input type="hidden" name="theme" value="<?= e($key) ?>">
                        <button type="submit" class="theme-option<?= $current ? ' is-current' : '' ?><?= $locked ? ' is-locked' : '' ?>"<?= $current ? ' aria-pressed="true"' : '' ?>>
                            <span class="theme-swatch" style="<?= e(theme_style($t)) ?>">
                                <span class="sw-avatar"></span>
                                <span class="sw-line"></span>
                                <span class="sw-btn"></span><span class="sw-btn"></span><span class="sw-btn"></span>
                            </span>
                            <span class="theme-name">
                                <?= e($t['name']) ?>
                                <?php if ($current): ?><span class="theme-tag"><?= icon('check') ?></span><?php elseif ($locked): ?><span class="theme-tag"><?= icon('lock') ?> Pro</span><?php endif; ?>
                            </span>
                        </button>
                    </form>
                <?php endforeach; ?>
            </div>
            <?php if (!$pro): ?>
                <p class="upsell"><?= icon('star') ?> Unlock every theme and remove <?= e(brand()) ?> branding with <a href="<?= url('dashboard/billing') ?>">Pro</a>.</p>
            <?php endif; ?>
        </div>
    </section>

    <aside class="split-side">
        <div class="preview-wrap">
            <p class="preview-label">Live preview</p>
            <div class="device">
                <iframe src="<?= e(profile_url($user)) ?>?preview=1" title="Preview of your page"></iframe>
            </div>
        </div>
    </aside>
</div>
