# Linkzzy

**One link, your whole world.** A simple, elegant link-in-bio platform in plain PHP and MySQL. It uses no framework and has no build step.

- **Landing page** with a "claim your username" form, theme showcase and pricing
- **Registration and login** with hashed passwords, CSRF protection and session hardening
- **Profile pages** at `yoursite.com/username`, with OG tags and a share/copy-link button
- **Link management**: add, edit inline, reorder, hide/show and delete, with a live phone preview
- **6 themes**: Minimal, Midnight and Sunset are free. Ocean, Forest and Lavender are Pro.
- **Profile settings**: display name, bio and avatar upload
- **Analytics**: views, clicks, click-through rate, a daily chart, top links, referrers and a device split. Bots and the owner's own visits aren't counted.
- **Paystack payments** for Pro: 30 days per payment, verified both on the callback and through a signed webhook
- **Admin dashboard**: site stats, revenue, user search, suspend and delete

## Requirements

- PHP 8.1+ with `pdo_mysql`, `curl` and `mbstring`
- MySQL 5.7+ or MariaDB 10.3+
- Apache with `mod_rewrite`, or Nginx

## Setup

```bash
# 1. Create the database
mysql -u root -p < database/schema.sql

# 2. Configure
cp app/config.local.example.php app/config.local.php
#    then edit DB credentials, base_url and Paystack keys

# 3. Make uploads writable
chmod 775 public/uploads/avatars

# 4. Run locally
php -S localhost:8000 -t public public/index.php
```

Open http://localhost:8000 and create an account. To make yourself an admin, run:

```bash
php bin/make-admin.php you@example.com
```

You can also use environment variables instead of `config.local.php`: `APP_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PRO_PRICE` (in kobo) and `PRO_CURRENCY`.

## Deploying

Point the web server's document root at **`public/`**, never at the project root.

**Apache:** `public/.htaccess` already routes everything through `index.php`.

**Nginx:**

```nginx
root /var/www/linkzzy/public;
index index.php;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}
location ~ \.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
}
location ^~ /uploads/ {
    location ~ \.php$ { deny all; }
}
```

Serve the site over HTTPS. Session cookies are marked `Secure` automatically when you do.

## Paystack

1. Add your secret and public keys to `config.local.php`.
2. In the Paystack dashboard, go to **Settings → API Keys & Webhooks** and set the webhook URL to `https://your-domain.com/paystack/webhook`.

When a user clicks **Upgrade**, Linkzzy creates a pending payment and sends them to Paystack's checkout. After payment, Paystack redirects back to `/billing/callback`, which verifies the transaction with the API. The webhook is a backup in case the user closes the tab. Activation is idempotent and checks the amount and currency. Each payment adds 30 days of Pro, and nothing renews automatically.

If you leave the keys empty, the Upgrade button shows "Coming soon".

## Project layout

```
app/
  bootstrap.php     config, sessions, includes
  helpers.php       db, views, csrf, auth, validation
  themes.php        theme definitions (CSS variables) — add a theme here
  paystack.php      Paystack API + payment activation
  controllers/      route handlers
  views/            PHP templates
bin/make-admin.php  grant/revoke admin
database/schema.sql
public/             web root: index.php (router), assets, uploads
```

## Renaming the brand

The name and tagline are settings, not hard-coded text. To rename the site, set them in `app/config.local.php`:

```php
'app_name' => 'YourBrand',
'tagline'  => 'One link, your whole world',
```

Or set the `APP_NAME` environment variable. The logo, page titles, "Made with …" footer and session cookie all follow it.

## Adding a theme

Add an entry to `themes()` in `app/themes.php`, using the same variables as the other themes. It appears automatically on the landing page, in the theme picker and on profiles. Set `'pro' => true` to make it a Pro theme.
