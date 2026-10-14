<?php $flashes = take_flashes(); if ($flashes): ?>
<div class="flashes" role="status">
    <?php foreach ($flashes as $f): ?>
        <div class="flash flash-<?= e($f['type']) ?>"><?= e($f['message']) ?></div>
    <?php endforeach; ?>
</div>
<?php endif; ?>
