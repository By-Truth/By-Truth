<?php
declare(strict_types=1);

function paystack_enabled(): bool
{
    return config('paystack.secret_key') !== '';
}

/** Call the Paystack API. Returns the decoded JSON body, or null on transport failure. */
function paystack_request(string $method, string $path, ?array $body = null): ?array
{
    $ch = curl_init('https://api.paystack.co' . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . config('paystack.secret_key'),
            'Content-Type: application/json',
            'Cache-Control: no-cache',
        ],
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $response = curl_exec($ch);
    curl_close($ch);
    if (!is_string($response)) {
        return null;
    }
    $data = json_decode($response, true);
    return is_array($data) ? $data : null;
}

/** Start a checkout. Returns Paystack's authorization URL or null. */
function paystack_initialize(array $user): ?string
{
    $reference = 'LNK-' . $user['id'] . '-' . bin2hex(random_bytes(8));
    $amount = (int) config('paystack.pro_price');
    $currency = (string) config('paystack.currency');

    query(
        'INSERT INTO payments (user_id, reference, amount, currency) VALUES (?, ?, ?, ?)',
        [$user['id'], $reference, $amount, $currency]
    );

    $res = paystack_request('POST', '/transaction/initialize', [
        'email'        => $user['email'],
        'amount'       => $amount,
        'currency'     => $currency,
        'reference'    => $reference,
        'callback_url' => url('billing/callback'),
        'metadata'     => ['user_id' => (int) $user['id'], 'plan' => 'pro'],
    ]);

    if (!$res || empty($res['status']) || empty($res['data']['authorization_url'])) {
        query("UPDATE payments SET status = 'failed' WHERE reference = ?", [$reference]);
        return null;
    }
    return $res['data']['authorization_url'];
}

/** Ask Paystack about a transaction and apply it. Returns true when the payment is (now) successful. */
function paystack_verify(string $reference): bool
{
    $res = paystack_request('GET', '/transaction/verify/' . rawurlencode($reference));
    if (!$res || empty($res['status']) || ($res['data']['status'] ?? '') !== 'success') {
        return false;
    }
    return activate_pro_payment($reference, (int) $res['data']['amount'], (string) $res['data']['currency']);
}

/**
 * Mark a payment successful and extend the user's Pro plan. Idempotent:
 * the callback and the webhook may both report the same payment.
 */
function activate_pro_payment(string $reference, int $amountPaid, string $currency): bool
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $payment = query('SELECT * FROM payments WHERE reference = ? FOR UPDATE', [$reference])->fetch();
        if (!$payment) {
            $pdo->rollBack();
            return false;
        }
        if ($payment['status'] === 'success') {
            $pdo->commit();
            return true;
        }
        if ($amountPaid < (int) $payment['amount'] || strtoupper($currency) !== $payment['currency']) {
            query("UPDATE payments SET status = 'failed' WHERE id = ?", [$payment['id']]);
            $pdo->commit();
            return false;
        }

        query("UPDATE payments SET status = 'success', paid_at = NOW() WHERE id = ?", [$payment['id']]);
        query(
            "UPDATE users SET plan = 'pro',
                pro_until = DATE_ADD(GREATEST(COALESCE(pro_until, NOW()), NOW()), INTERVAL ? DAY)
             WHERE id = ?",
            [(int) config('paystack.pro_days'), $payment['user_id']]
        );
        $pdo->commit();
        return true;
    } catch (Throwable $ex) {
        $pdo->rollBack();
        throw $ex;
    }
}
