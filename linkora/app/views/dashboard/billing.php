<?php
/** @var array $user @var bool $pro @var array $payments @var bool $enabled */
$price = money((int) config('paystack.pro_price'), (string) config('paystack.currency'));
?>
<div class="page-head">
    <div>
        <h1>Your plan</h1>
        <p class="muted"><?= $pro ? 'You’re on Pro — thank you for supporting Linkora.' : 'You’re on the Free plan.' ?></p>
    </div>
</div>

<div class="plans plans-dash">
    <div class="plan<?= $pro ? '' : ' is-current' ?>">
        <h3>Free <?php if (!$pro): ?><span class="badge">Current</span><?php endif; ?></h3>
        <p class="plan-price">₦0<span>/forever</span></p>
        <ul class="checklist">
            <li><?= icon('check') ?>Up to <?= MAX_LINKS ?> links</li>
            <li><?= icon('check') ?>3 themes</li>
            <li><?= icon('check') ?>7-day analytics</li>
        </ul>
    </div>
    <div class="plan plan-featured<?= $pro ? ' is-current' : '' ?>">
        <h3>Pro <?php if ($pro): ?><span class="badge badge-pro">Current</span><?php endif; ?></h3>
        <p class="plan-price"><?= e($price) ?><span>/<?= (int) config('paystack.pro_days') ?> days</span></p>
        <ul class="checklist">
            <li><?= icon('check') ?>All premium themes</li>
            <li><?= icon('check') ?>90-day analytics</li>
            <li><?= icon('check') ?>No Linkora branding</li>
        </ul>
        <?php if ($pro): ?>
            <p class="muted">Active until <strong><?= date('M j, Y', strtotime($user['pro_until'])) ?></strong>.</p>
        <?php endif; ?>
        <?php if ($enabled): ?>
            <form method="post" action="<?= url('billing/checkout') ?>">
                <?= csrf_field() ?>
                <button class="btn btn-accent btn-block" type="submit"><?= $pro ? 'Add another ' . (int) config('paystack.pro_days') . ' days' : 'Upgrade with Paystack' ?></button>
            </form>
            <p class="field-hint">Secure payment by Paystack · card, bank transfer or USSD. No auto-renewal.</p>
        <?php else: ?>
            <button class="btn btn-accent btn-block" disabled>Coming soon</button>
            <p class="field-hint">Payments aren’t configured on this server yet.</p>
        <?php endif; ?>
    </div>
</div>

<?php if ($payments): ?>
    <div class="card">
        <h2 class="card-title">Payment history</h2>
        <table class="table">
            <thead><tr><th>Date</th><th>Reference</th><th class="num">Amount</th></tr></thead>
            <tbody>
            <?php foreach ($payments as $p): ?>
                <tr>
                    <td><?= date('M j, Y', strtotime($p['paid_at'])) ?></td>
                    <td><code><?= e($p['reference']) ?></code></td>
                    <td class="num"><?= e(money((int) $p['amount'], $p['currency'])) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>
