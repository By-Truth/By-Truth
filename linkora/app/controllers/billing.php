<?php
declare(strict_types=1);

function billing(): void
{
    $user = require_auth();
    $payments = query(
        "SELECT * FROM payments WHERE user_id = ? AND status = 'success' ORDER BY paid_at DESC LIMIT 12",
        [$user['id']]
    )->fetchAll();

    render('dashboard/billing', [
        'title'    => 'Plan — Linkora',
        'active'   => 'billing',
        'user'     => $user,
        'pro'      => is_pro($user),
        'payments' => $payments,
        'enabled'  => paystack_enabled(),
    ]);
}

function billing_checkout(): void
{
    $user = require_auth();
    if (!paystack_enabled()) {
        flash('error', 'Payments aren’t set up yet. Please check back soon.');
        redirect('/dashboard/billing');
    }
    $authUrl = paystack_initialize($user);
    if ($authUrl === null) {
        flash('error', 'We couldn’t reach Paystack. Please try again in a moment.');
        redirect('/dashboard/billing');
    }
    redirect($authUrl);
}

function billing_callback(): void
{
    $user = require_auth();
    $reference = input('reference');
    $owned = $reference !== '' && query('SELECT 1 FROM payments WHERE reference = ? AND user_id = ?', [$reference, $user['id']])->fetchColumn();

    if ($owned && paystack_verify($reference)) {
        flash('success', 'You’re on Pro! Every theme and full analytics are unlocked.');
    } else {
        flash('error', 'We couldn’t confirm that payment. If you were charged, it will be applied automatically within a few minutes.');
    }
    redirect('/dashboard/billing');
}

/** Paystack → us. Configure https://your-domain/paystack/webhook in the Paystack dashboard. */
function paystack_webhook(): void
{
    $payload = (string) file_get_contents('php://input');
    $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
    $secret = (string) config('paystack.secret_key');

    if ($secret === '' || !hash_equals(hash_hmac('sha512', $payload, $secret), $signature)) {
        http_response_code(401);
        exit;
    }

    $event = json_decode($payload, true);
    if (($event['event'] ?? '') === 'charge.success' && !empty($event['data']['reference'])) {
        // Re-verify with the API rather than trusting the payload's amount.
        paystack_verify((string) $event['data']['reference']);
    }
    http_response_code(200);
    exit;
}
