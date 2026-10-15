<?php
// Grant (or revoke) admin access: php bin/make-admin.php you@example.com [--revoke]
declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

$login = strtolower($argv[1] ?? '');
if ($login === '') {
    fwrite(STDERR, "Usage: php bin/make-admin.php <email-or-username> [--revoke]\n");
    exit(1);
}
$flag = in_array('--revoke', $argv, true) ? 0 : 1;
$stmt = query('UPDATE users SET is_admin = ? WHERE email = ? OR username = ?', [$flag, $login, $login]);
if ($stmt->rowCount() === 0 && !query('SELECT 1 FROM users WHERE email = ? OR username = ?', [$login, $login])->fetchColumn()) {
    fwrite(STDERR, "No user found for '$login'.\n");
    exit(1);
}
echo $flag ? "$login is now an admin.\n" : "$login is no longer an admin.\n";
