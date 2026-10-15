<?php /** @var array $user @var array $links @var array $clicks */ ?>
<div class="page-head">
    <div>
        <h1>Your links</h1>
        <p class="muted">Add, edit and reorder. Changes go live instantly.</p>
    </div>
    <?php partial('copy_link', ['user' => $user]); ?>
</div>

<div class="split">
    <section class="split-main">
        <form method="post" action="<?= url('dashboard/links') ?>" class="card add-link">
            <?= csrf_field() ?>
            <h2 class="card-title"><?= icon('plus') ?> Add a link</h2>
            <div class="add-link-fields">
                <input name="title" placeholder="Title — e.g. My portfolio" value="<?= e(old('title')) ?>" maxlength="100" required aria-label="Link title">
                <input name="url" placeholder="URL — e.g. example.com" value="<?= e(old('url')) ?>" required inputmode="url" aria-label="Link URL">
                <button class="btn btn-accent" type="submit">Add link</button>
            </div>
        </form>

        <?php if (!$links): ?>
            <div class="empty-state">
                <div class="empty-icon"><?= icon('link') ?></div>
                <h3>No links yet</h3>
                <p class="muted">Add your first link above — your website, latest video, shop or socials.</p>
            </div>
        <?php endif; ?>

        <ol class="link-list">
            <?php foreach ($links as $i => $link): $last = $i === count($links) - 1; ?>
                <li class="link-item<?= $link['is_active'] ? '' : ' is-hidden' ?>" id="link-<?= (int) $link['id'] ?>">
                    <div class="link-order">
                        <form method="post" action="<?= url('dashboard/links/' . $link['id'] . '/move') ?>">
                            <?= csrf_field() ?><input type="hidden" name="direction" value="up">
                            <button class="icon-btn" type="submit" title="Move up" aria-label="Move up"<?= $i === 0 ? ' disabled' : '' ?>><?= icon('up') ?></button>
                        </form>
                        <form method="post" action="<?= url('dashboard/links/' . $link['id'] . '/move') ?>">
                            <?= csrf_field() ?><input type="hidden" name="direction" value="down">
                            <button class="icon-btn" type="submit" title="Move down" aria-label="Move down"<?= $last ? ' disabled' : '' ?>><?= icon('down') ?></button>
                        </form>
                    </div>

                    <form method="post" action="<?= url('dashboard/links/' . $link['id']) ?>" class="link-edit">
                        <?= csrf_field() ?>
                        <input name="title" value="<?= e($link['title']) ?>" maxlength="100" required class="link-title-input" aria-label="Title">
                        <input name="url" value="<?= e($link['url']) ?>" required class="link-url-input" aria-label="URL">
                        <div class="link-meta">
                            <span class="muted"><?= (int) ($clicks[$link['id']] ?? 0) ?> clicks</span>
                            <button class="btn btn-sm btn-outline save-btn" type="submit">Save</button>
                        </div>
                    </form>

                    <div class="link-actions">
                        <form method="post" action="<?= url('dashboard/links/' . $link['id'] . '/toggle') ?>">
                            <?= csrf_field() ?>
                            <button class="icon-btn" type="submit" title="<?= $link['is_active'] ? 'Hide from page' : 'Show on page' ?>" aria-label="<?= $link['is_active'] ? 'Hide from page' : 'Show on page' ?>">
                                <?= icon($link['is_active'] ? 'eye' : 'eye-off') ?>
                            </button>
                        </form>
                        <form method="post" action="<?= url('dashboard/links/' . $link['id'] . '/delete') ?>" data-confirm="Delete “<?= e($link['title']) ?>”?">
                            <?= csrf_field() ?>
                            <button class="icon-btn icon-btn-danger" type="submit" title="Delete" aria-label="Delete"><?= icon('trash') ?></button>
                        </form>
                    </div>
                </li>
            <?php endforeach; ?>
        </ol>
    </section>

    <aside class="split-side">
        <div class="preview-wrap">
            <p class="preview-label">Live preview</p>
            <div class="device">
                <iframe src="<?= e(profile_url($user)) ?>?preview=1" title="Preview of your page"></iframe>
            </div>
            <a class="btn btn-ghost btn-sm" href="<?= e(profile_url($user)) ?>" target="_blank" rel="noopener"><?= icon('external') ?> Open my page</a>
        </div>
    </aside>
</div>
