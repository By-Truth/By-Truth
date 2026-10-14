<?php
/** @var array $daily @var array $topLinks @var array $referrers @var array $devices */
$maxViews = max(1, max(array_column($daily, 'views')));
$maxLink = max(1, ...array_map(fn ($l) => (int) $l['clicks'], $topLinks ?: [['clicks' => 0]]));
$totalDevices = max(1, $devices['mobile'] + $devices['desktop']);
// Show roughly 7 date labels regardless of range.
$labelEvery = max(1, (int) ceil(count($daily) / 7));
?>
<div class="page-head">
    <div>
        <h1>Analytics</h1>
        <p class="muted">Last <?= $days ?> days. Your own visits aren’t counted.</p>
    </div>
    <div class="range" role="group" aria-label="Date range">
        <?php foreach ([7, 30, 90] as $r): ?>
            <?php if (in_array($r, $ranges, true)): ?>
                <a class="range-btn<?= $r === $days ? ' is-active' : '' ?>" href="<?= url('dashboard/analytics?days=' . $r) ?>"><?= $r ?>d</a>
            <?php else: ?>
                <a class="range-btn is-locked" href="<?= url('dashboard/billing') ?>" title="Pro feature"><?= icon('lock') ?><?= $r ?>d</a>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
</div>

<div class="stats">
    <div class="stat"><p class="stat-label">Page views</p><p class="stat-value"><?= number_format($views) ?></p></div>
    <div class="stat"><p class="stat-label">Link clicks</p><p class="stat-value"><?= number_format($clicks) ?></p></div>
    <div class="stat"><p class="stat-label">Click-through rate</p><p class="stat-value"><?= $ctr ?>%</p></div>
</div>

<div class="card">
    <h2 class="card-title">Page views per day</h2>
    <div class="chart" role="img" aria-label="Bar chart of page views per day">
        <div class="chart-grid" aria-hidden="true">
            <span><?= number_format($maxViews) ?></span>
            <span><?= number_format((int) round($maxViews / 2)) ?></span>
            <span>0</span>
        </div>
        <div class="chart-bars" style="--n: <?= count($daily) ?>">
            <?php $i = 0; foreach ($daily as $date => $d): $i++; ?>
                <div class="bar-col" tabindex="0">
                    <div class="bar" style="--h: <?= $d['views'] ? max(0.02, round($d['views'] / $maxViews, 4)) : 0 ?>"></div>
                    <div class="tip"><strong><?= date('D, M j', strtotime($date)) ?></strong><?= number_format($d['views']) ?> views · <?= number_format($d['clicks']) ?> clicks</div>
                    <span class="bar-label"><?= ($i - 1) % $labelEvery === 0 || $i === count($daily) ? date('M j', strtotime($date)) : '' ?></span>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <details class="table-toggle">
        <summary>Show as table</summary>
        <table class="table">
            <thead><tr><th>Date</th><th class="num">Views</th><th class="num">Clicks</th></tr></thead>
            <tbody>
            <?php foreach (array_reverse($daily, true) as $date => $d): ?>
                <tr><td><?= date('D, M j', strtotime($date)) ?></td><td class="num"><?= $d['views'] ?></td><td class="num"><?= $d['clicks'] ?></td></tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </details>
</div>

<div class="grid-2">
    <div class="card">
        <h2 class="card-title">Top links</h2>
        <?php if (!$topLinks): ?>
            <p class="muted">Add some links to see which ones people tap.</p>
        <?php endif; ?>
        <ul class="hbars">
            <?php foreach ($topLinks as $l): ?>
                <li>
                    <div class="hbar-text"><span class="hbar-name"><?= e($l['title']) ?></span><span class="hbar-value"><?= number_format((int) $l['clicks']) ?></span></div>
                    <div class="hbar-track"><div class="hbar-fill" style="width: <?= round($l['clicks'] / $maxLink * 100, 2) ?>%"></div></div>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <div class="card">
        <h2 class="card-title">Where visitors come from</h2>
        <?php if (!$referrers): ?>
            <p class="muted">No visits yet. Share your link to get started.</p>
        <?php endif; ?>
        <ul class="hbars">
            <?php $maxRef = max(1, ...array_map(fn ($r) => (int) $r['n'], $referrers ?: [['n' => 0]]));
            foreach ($referrers as $r): ?>
                <li>
                    <div class="hbar-text"><span class="hbar-name"><?= e($r['source']) ?></span><span class="hbar-value"><?= number_format((int) $r['n']) ?></span></div>
                    <div class="hbar-track"><div class="hbar-fill" style="width: <?= round($r['n'] / $maxRef * 100, 2) ?>%"></div></div>
                </li>
            <?php endforeach; ?>
        </ul>
        <div class="devices">
            <p><span class="muted">Mobile</span> <strong><?= round($devices['mobile'] / $totalDevices * 100) ?>%</strong></p>
            <p><span class="muted">Desktop</span> <strong><?= round($devices['desktop'] / $totalDevices * 100) ?>%</strong></p>
        </div>
    </div>
</div>

<?php if (!$pro): ?>
    <p class="upsell"><?= icon('star') ?> See 30 and 90 days of history with <a href="<?= url('dashboard/billing') ?>">Pro</a>.</p>
<?php endif; ?>
