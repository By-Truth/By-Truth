# Law Firm Website

A premium, responsive website for a Nigerian law firm, built with **Next.js 16 (App Router)**, **TypeScript** and **Tailwind CSS 4**.

> **All firm information is placeholder content.** Anything in square brackets, such as `[LAW FIRM NAME]`, must be replaced with information supplied by the firm. No lawyers, credentials, clients, results or statistics have been invented.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Command         | Purpose                         |
| --------------- | ------------------------------- |
| `npm run dev`   | Development server              |
| `npm run build` | Production build                |
| `npm run start` | Serve the production build      |
| `npm run lint`  | ESLint                          |
| `npx tsc --noEmit` | Type check                   |

## Replacing placeholder content

All content lives in `src/data/`, separate from the UI:

| File                        | Contents                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- |
| `src/data/site.ts`          | Firm name, tagline, address, phone, email, WhatsApp, hours, social links, map, intro/about copy, principles |
| `src/data/practiceAreas.ts` | Practice areas (one should be `featured: true`)                              |
| `src/data/attorneys.ts`     | Lawyer profiles                                                              |
| `src/data/articles.ts`      | Legal insights                                                               |
| `src/data/images.ts`        | Photography library                                                          |

How placeholders are handled (`src/lib/placeholder.ts`):

- A value containing `[...]` is treated as "not supplied".
- Placeholder phone, email and WhatsApp values are shown as text and never turned into `tel:`, `mailto:` or `wa.me` links.
- **The floating WhatsApp button only appears once a real number is set** in `site.whatsapp` (international format, e.g. `2348012345678`).
- Placeholder values are stripped from JSON-LD structured data, so nothing false is published to search engines.
- Practice areas and lawyer profiles with placeholder names, sample articles (`isSample: true`) and the placeholder Privacy Policy / Terms of Use pages are marked `noindex` and left out of `sitemap.xml`.

Other notes:

- **Slugs:** once a real name is supplied, update the entry's `slug` (e.g. `corporate-commercial-law`), which becomes the page URL.
- **Portraits:** put photos in `public/images/team/` and set `portrait` on the attorney. Until then a neutral placeholder is shown. Stock photos of unrelated people are deliberately not used.
- **Map:** set `site.mapEmbedUrl` to a Google Maps embed URL (Share → Embed a map → copy the `src`).
- **Logo:** set `site.logo` to use an image logo instead of the text wordmark.
- **Policies:** `/privacy-policy` and `/terms-of-use` only contain a suggested structure. The firm must provide the actual wording.
- **Photography:** the current images are licensed stock photos from [Unsplash](https://unsplash.com/license). Replace them with the firm's own photography when it is available.

### Connecting a CMS

Pages read content only through the async functions in `src/lib/content.ts`, and all shapes are defined in `src/types/content.ts`. To use a CMS or database, re-implement those functions so they return the same types. No component changes are needed.

## Forms and security

The consultation form (`/consultation`) and contact form (`/contact`) post JSON to `/api/consultation` and `/api/contact`. Both routes go through `src/lib/forms/handler.ts`, which applies these checks in order:

1. **Same-origin check.** The `Origin` header must match the host.
2. **Rate limiting.** 8 requests per 10 minutes per IP per form.
3. **Content-type and size limits.** Only JSON is accepted, up to 16 KB.
4. **Signed, single-use form token.** The token comes from `/api/form-token` and is sent both as an HttpOnly `SameSite=Strict` cookie and as a header (double submit). It is HMAC-signed, and a submission made within 3 seconds of loading the form is rejected. Replayed tokens are rejected too.
5. **Honeypot field.** A bot that fills it gets a fake success response and nothing is delivered.
6. **Validation and sanitisation.** The rules are shared with the browser (`src/lib/forms/validation.ts`). Control characters are stripped, lengths are limited, and link spam is rejected.
7. **Delivery.** HTML in outgoing email is escaped, and no personal data is written to logs.

### Configuring delivery (required in production)

Set **one** of these in the environment (see `.env.example`):

- **Email via Resend:** `RESEND_API_KEY`, `FORM_RECIPIENT_EMAIL`, `FORM_SENDER_EMAIL`
- **Webhook** (Zapier, Make, a CRM…): `FORM_WEBHOOK_URL`, plus an optional `FORM_WEBHOOK_SECRET` that signs the body in an `X-Signature` header (HMAC-SHA256)

In development, an unconfigured site accepts submissions and logs only the field names. **In production, an unconfigured site returns an error rather than silently discarding enquiries.**

Also set `FORM_TOKEN_SECRET` (32+ random characters) and `NEXT_PUBLIC_SITE_URL`.

> The rate limiter and the replay store are in-memory, so they protect a single server instance. On serverless or multi-instance hosting, move them to a shared store such as Redis or Upstash. The function signatures are ready for that swap.

Security headers are set in `next.config.ts`: CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and `nosniff`.

## SEO

- Every page has a unique title, description, canonical URL, Open Graph and X/Twitter metadata (`buildMetadata` in `src/lib/seo.ts`).
- `sitemap.xml` and `robots.txt` are generated from `src/app/sitemap.ts` and `src/app/robots.ts`.
- JSON-LD covers `LegalService`, `WebSite`, `Person`, `Article`, `Service` and `BreadcrumbList` (`src/lib/structured-data.ts`).
- A default 1200×630 social image is generated at `/og-image`.

## Accessibility and motion

- A skip link, semantic landmarks and one `h1` per page.
- Visible focus states throughout. The mobile menu traps focus, closes on Escape and returns focus to the toggle.
- Every form field has a label. Errors are linked to their fields with `aria-describedby`, the error summary is announced, and focus moves to the success message after submitting.
- Scroll reveals use CSS scroll-driven animations with no JavaScript. Browsers without support simply show the content, and every animation is turned off under `prefers-reduced-motion`.

## Project structure

```
src/
  app/                 Routes (pages, API routes, sitemap, robots, OG image)
  components/
    layout/            Header, Footer, WhatsApp button, contact details
    home/              Homepage sections
    practice/ team/ insights/ legal/
    forms/             Form components and the submission hook
    ui/                Buttons, containers, headings, icons, breadcrumbs…
  data/                Editable content (placeholders)
  lib/                 Content access, SEO, structured data, forms, security
  types/               Shared content types
```
