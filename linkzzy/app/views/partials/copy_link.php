<?php /** @var array $user */ $link = profile_url($user); ?>
<div class="share-pill">
    <a class="share-url" href="<?= e($link) ?>" target="_blank" rel="noopener"><?= e(site_host() . '/' . $user['username']) ?></a>
    <button type="button" class="btn btn-sm btn-dark" data-copy="<?= e($link) ?>"><?= icon('copy') ?><span>Copy link</span></button>
</div>
