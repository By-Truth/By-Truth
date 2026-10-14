<?php
$sample = ['Latest YouTube video', 'Shop my favourites', 'Book a session', 'Newsletter'];
$price = money((int) config('paystack.pro_price'), (string) config('paystack.currency'));
?>
<section class="hero">
    <div class="container hero-inner">
        <div class="hero-copy">
            <p class="eyebrow">Link in bio, done beautifully</p>
            <h1>One link.<br><em>Your whole world.</em></h1>
            <p class="lead">Bring your videos, shop, socials and everything you make into one simple page. Create it in minutes, make it yours, share it anywhere.</p>
            <form class="claim" action="<?= url('register') ?>" method="get">
                <label class="claim-field">
                    <span class="claim-prefix"><?= e(site_host()) ?>/</span>
                    <input name="username" placeholder="yourname" autocomplete="off" maxlength="30" pattern="[A-Za-z0-9_]{3,30}" aria-label="Choose your username">
                </label>
                <button class="btn btn-accent btn-lg" type="submit">Claim your link</button>
            </form>
            <p class="hint">Free forever. No credit card.</p>
        </div>
        <div class="hero-visual" aria-hidden="true">
            <div class="phone" style="<?= e(theme_style(theme('sunset'))) ?>">
                <div class="phone-screen">
                    <div class="mini-avatar">A</div>
                    <div class="mini-name">Ada Okafor</div>
                    <div class="mini-bio">Designer · Lagos · Making pretty things</div>
                    <?php foreach ($sample as $s): ?><div class="mini-btn"><?= e($s) ?></div><?php endforeach; ?>
                </div>
            </div>
            <div class="phone phone-back" style="<?= e(theme_style(theme('midnight'))) ?>">
                <div class="phone-screen">
                    <div class="mini-avatar">T</div>
                    <div class="mini-name">Tobi Beats</div>
                    <div class="mini-bio">New EP out now</div>
                    <?php foreach (['Spotify', 'Apple Music', 'Tour dates'] as $s): ?><div class="mini-btn"><?= e($s) ?></div><?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="section" id="how">
    <div class="container">
        <h2 class="section-title">Simple as one, two, three</h2>
        <div class="steps">
            <div class="step">
                <span class="step-num">1</span>
                <h3>Create</h3>
                <p>Pick your username and you’re live at <strong><?= e(site_host()) ?>/you</strong> in under a minute.</p>
            </div>
            <div class="step">
                <span class="step-num">2</span>
                <h3>Customize</h3>
                <p>Add your links, a photo and a short bio. Choose a theme that feels like you.</p>
            </div>
            <div class="step">
                <span class="step-num">3</span>
                <h3>Share</h3>
                <p>Copy your link into Instagram, TikTok, X or WhatsApp — and watch the clicks come in.</p>
            </div>
        </div>
    </div>
</section>

<section class="section section-alt" id="themes">
    <div class="container">
        <h2 class="section-title">Themes that look good everywhere</h2>
        <p class="section-sub">Every theme is crafted for phones first. Switch anytime — your links stay the same.</p>
        <div class="theme-strip">
            <?php foreach (themes() as $key => $t): ?>
                <figure class="theme-card">
                    <div class="theme-swatch" style="<?= e(theme_style($t)) ?>">
                        <span class="sw-avatar"></span>
                        <span class="sw-line"></span>
                        <span class="sw-btn"></span><span class="sw-btn"></span><span class="sw-btn"></span>
                    </div>
                    <figcaption><?= e($t['name']) ?><?php if ($t['pro']): ?> <span class="badge badge-pro">Pro</span><?php endif; ?></figcaption>
                </figure>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section" id="pricing">
    <div class="container">
        <h2 class="section-title">Honest pricing</h2>
        <div class="plans">
            <div class="plan">
                <h3>Free</h3>
                <p class="plan-price">₦0<span>/forever</span></p>
                <ul class="checklist">
                    <li><?= icon('check') ?>Unlimited visitors</li>
                    <li><?= icon('check') ?>Up to <?= MAX_LINKS ?> links</li>
                    <li><?= icon('check') ?>3 beautiful themes</li>
                    <li><?= icon('check') ?>7-day analytics</li>
                </ul>
                <a class="btn btn-outline btn-block" href="<?= url('register') ?>">Start free</a>
            </div>
            <div class="plan plan-featured">
                <h3>Pro <span class="badge badge-pro">Popular</span></h3>
                <p class="plan-price"><?= e($price) ?><span>/month</span></p>
                <ul class="checklist">
                    <li><?= icon('check') ?>Everything in Free</li>
                    <li><?= icon('check') ?>All premium themes</li>
                    <li><?= icon('check') ?>90-day analytics</li>
                    <li><?= icon('check') ?>Remove Linkora branding</li>
                </ul>
                <a class="btn btn-accent btn-block" href="<?= url('register') ?>">Go Pro</a>
            </div>
        </div>
    </div>
</section>

<section class="section cta">
    <div class="container cta-inner">
        <h2>Your audience is one tap away.</h2>
        <a class="btn btn-accent btn-lg" href="<?= url('register') ?>">Create your Linkora</a>
    </div>
</section>
