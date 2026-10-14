# Production configuration

Every environment variable the deployment needs, where it is set, and which
steps are manual provider work. Nothing here is done automatically — each
"Set by" that names a provider is a step the operator runs.

## Vercel project settings (Production environment)

Set in the host's dashboard; `NEXT_PUBLIC_*` values are inlined into the
client bundle at build time, so changing them requires a redeploy. A missing
required variable fails `next build` (t3-env in `lib/env.client.ts` and
`lib/env.server.ts`; "Yes before launch" rows are required only when
`VERCEL_ENV=production`). The Convex URLs are required only there too: a
preview with them points at the dev deployment `peaceful-emu-861`, and a
preview without them builds the static site with no backend (forms fall back
to WhatsApp, the shop and log-in are off).

| Variable                         | Required for production | Purpose                                                                                                                                                                                                       |
| -------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Yes                     | Canonical/OG/sitemap origin. `lib/site.ts` refuses to build with a localhost fallback when `SITE_INDEXABLE` is true.                                                                                          |
| `SITE_INDEXABLE`                 | Decide at launch        | `true` invites indexing. Keep unset/`false` until content is owner-approved (KIT-41).                                                                                                                         |
| `NEXT_PUBLIC_CONVEX_URL`         | Yes                     | Browser → Convex data connection (websocket + actions).                                                                                                                                                       |
| `NEXT_PUBLIC_CONVEX_SITE_URL`    | Yes                     | The `*.convex.site` endpoints: Better Auth routes and `/enquiries` ingest.                                                                                                                                    |
| `LEAD_INGEST_SECRET`             | Yes                     | Bearer secret the enquiry sink sends to the Convex `/enquiries` route. `openssl rand -hex 32`; the same value is set on Convex below. Never `NEXT_PUBLIC_`-prefixed.                                          |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes before launch       | Renders the Turnstile widget on the enquiry form.                                                                                                                                                             |
| `NEXT_PUBLIC_POSTHOG_KEY`        | Optional                | PostHog project token (US cloud). Unset means no analytics. Approve the analytics paragraph in the privacy policy first.                                                                                      |
| `INDEXNOW_KEY`                   | Optional                | Any 8 to 128 letters, digits or dashes. When set on the indexable production site, every admin publish pings Bing and others (IndexNow) with the changed pages; ChatGPT search and Copilot read Bing's index. |
| `TURNSTILE_SECRET_KEY`           | Yes before launch       | Server-side siteverify in `app/actions/lead.ts`. Unset = check skipped (development only).                                                                                                                    |
| `CONVEX_DEPLOY_KEY`              | Yes                     | Production deploy key from the Convex dashboard. Lets the build run `npx convex deploy` so functions and site ship together. Production environment only.                                                     |

## Convex deployment settings

Set with `npx convex env set NAME value` (dev) or the production deployment's
dashboard/env UI — never in `.env.local`, never committed.

| Variable                                | Required            | Purpose                                                                                                                                                                                                                                                      |
| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SITE_URL`                              | Yes                 | Comma-separated literal origins allowed to call auth routes (CORS + CSRF `trustedOrigins`). Must include the production origin; wildcards are rejected at startup.                                                                                           |
| `BETTER_AUTH_SECRET` (or `AUTH_SECRET`) | Yes                 | Hashes verification codes. `openssl rand -base64 32`.                                                                                                                                                                                                        |
| `OTP_TRANSPORT`                         | Yes                 | `logger` or `whatsapp`. No default — unset fails closed. `logger` is accepted only on localhost or the dev deployment named in `lib/dev-deployment.ts`; setting it on production is refused by `chooseTransport`.                                            |
| `LEAD_INGEST_SECRET`                    | Yes                 | Must equal the host-side value.                                                                                                                                                                                                                              |
| `DEV_DEPLOYMENT_NAME`                   | **Never, anywhere** | Retired: no code reads it (a test enforces that). The one development deployment is the reviewed constant in `lib/dev-deployment.ts`, which a production URL cannot match, so setting this changes nothing. Remove it from dev (step 8) and never create it. |

## Payments (Convex deployment settings)

| Variable                  | Required           | Purpose                                                                                                                                                                                                                        |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PAYMENT_PROVIDER`        | Yes, to take money | `razorpay` on production. `simulated` walks the whole flow with an in-site test gateway and is refused anywhere but local or the dev deployment (`lib/payments.ts`). Unset: checkout places the order and says payment is off. |
| `RAZORPAY_KEY_ID`         | With `razorpay`    | Test (`rzp_test_…`) or live key id from the Razorpay dashboard. Sent to the browser for Checkout; not a secret.                                                                                                                |
| `RAZORPAY_KEY_SECRET`     | With `razorpay`    | Creates orders, verifies Checkout signatures and reads payments. Never in the Next.js env.                                                                                                                                     |
| `RAZORPAY_WEBHOOK_SECRET` | With `razorpay`    | The secret typed when adding the webhook in the Razorpay dashboard; verifies `X-Razorpay-Signature`.                                                                                                                           |

Razorpay dashboard steps: turn on **auto-capture**; add a webhook to
`https://<deployment>.convex.site/razorpay/webhook` with the events
`order.paid` and `payment.captured` and the secret above; add the site's
domain under the account's website details. Test mode first: card
4100 2800 0000 1007 (any future expiry, any CVV, any OTP of 4+ digits) or UPI
`success@razorpay`. Receipts number per financial year from the prefix in
Settings, e.g. ICT/26-27/0001.

## Documents in R2 (Convex deployment settings)

Free notes are stored as whole PDFs in a Cloudflare R2 bucket through
Convex's R2 component (`convex/files.ts`), and read in the page-curl reader a
few pages at a time on a one-hour signed link. Images (covers, sample pages)
stay in Convex storage.

| Variable               | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `R2_ENDPOINT`          | `https://<account-id>.r2.cloudflarestorage.com`                   |
| `R2_BUCKET`            | The bucket name, e.g. `ict-documents`                             |
| `R2_ACCESS_KEY_ID`     | From an R2 API token with Object Read & Write on that bucket only |
| `R2_SECRET_ACCESS_KEY` | Same token                                                        |
| `R2_TOKEN`             | Same token's value                                                |

Bucket CORS (R2 dashboard → bucket → Settings → CORS), so the browser can
upload and the reader can fetch:

```json
[
  {
    "AllowedOrigins": ["https://<site domain>"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Range",
      "Accept-Ranges"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

Without these variables the admin hides the PDF upload and turns PDFs into
page images instead, so nothing breaks. Locally any S3-compatible server
works; a SeaweedFS container on `http://localhost:8333` with
`-s3.domainName=localhost` was used in development.

## WhatsApp sign-in codes (Convex deployment settings)

`OTP_TRANSPORT=whatsapp` sends the 6-digit code through the WhatsApp Cloud
API with an approved **copy-code authentication template**
(`lib/otp-transport.ts`). The deployment refuses to start the auth instance
when it is chosen without its settings, so a misconfiguration shows at once
rather than as silent missing codes.

| Variable                   | Purpose                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| `WHATSAPP_ACCESS_TOKEN`    | A permanent system-user token with `whatsapp_business_messaging` |
| `WHATSAPP_PHONE_NUMBER_ID` | The ID of ICT's new sending number (not the number itself)       |
| `WHATSAPP_OTP_TEMPLATE`    | The approved template's name; defaults to `verification_code`    |
| `WHATSAPP_OTP_LANGUAGE`    | The template's language code; defaults to `en`                   |

Meta steps for ICT: a Meta Business portfolio verified with the GSTIN; a
new number (not the one on the WhatsApp Business app) added to the
WhatsApp Business Account; an authentication template with a copy-code
button, submitted and approved; a system user with a permanent token. Codes
are billed per message by Meta (authentication category, India rate).

Convex sets `CONVEX_URL`, `CONVEX_SITE_URL` itself — do not set them.

## Regions

- **Convex: EU West (Ireland).** A deployment's region is fixed when it is
  created and cannot be changed later (moving means a new deployment plus an
  export and import), so create production in EU West from the start.
- **Vercel functions: Dublin (`dub1`)**, pinned in `vercel.json`, next to the
  Convex region.

## Steps to approve, in order

Nothing below has been run. Each step changes a provider account.

1. **Convex region default.** Dashboard → team settings → default region →
   EU West (Ireland).
2. **Create the production deployment.** Dashboard → project
   `impact-coaching-center` → create the Production deployment, region
   EU West. Confirm the region shown on the deployment's settings page before
   going on; it cannot be changed later.
3. **Convex production variables.** On the production deployment
   (dashboard → Settings → Environment Variables, or
   `npx convex env set --prod NAME value`):
   - `SITE_URL` = the production origin, for example `https://<domain>`
   - `BETTER_AUTH_SECRET` = output of `openssl rand -base64 32`
   - `LEAD_INGEST_SECRET` = output of `openssl rand -hex 32` (keep it for step 5)
   - `OTP_TRANSPORT` = `whatsapp` once KIT-46 ships. Until then production
     cannot sign anyone in: `logger` is refused there by design.
4. **Deploy key.** Dashboard → production deployment → Settings → Generate
   production deploy key. Copy it for step 5.
5. **Vercel production variables.** Project → Settings → Environment
   Variables, scope **Production** only: `CONVEX_DEPLOY_KEY` (step 4),
   `NEXT_PUBLIC_CONVEX_SITE_URL` (the production `https://<name>.convex.site`),
   `NEXT_PUBLIC_SITE_URL`, `LEAD_INGEST_SECRET` (same value as step 3),
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (step 6).
   `NEXT_PUBLIC_CONVEX_URL` is filled in by `convex deploy` during the build.
6. **Turnstile.** Cloudflare → Turnstile → add site for the production
   domain, managed mode. Copy the site key and secret into step 5.
7. **Vercel build command** (Production): `npx convex deploy --cmd 'bun run
build'`. Check Project → Settings → Functions shows region `dub1` after the
   first deploy.
8. **Tidy dev.** `npx convex env remove DEV_DEPLOYMENT_NAME` on
   `peaceful-emu-861` (unused, see the table above).
9. **First owner.** After the first production deploy, with the owner's
   number verified once on the live site:
   `npx convex run --prod people:bootstrapOwner '{"phone":"<owner mobile>"}'`.
   It refuses once any owner exists.

Still separate work, not configuration: WhatsApp OTP transport (KIT-46),
Razorpay payments (KIT-60; checkout records orders as `awaiting_payment` and
says so), domain and DNS (KIT-42; then set `SITE_INDEXABLE=true`), Google
Business Profile and Search Console (KIT-43).

## Verifying after deploy

- `curl -I https://<domain>/` shows the CSP plus the baseline headers from
  `next.config.ts`.
- Sign in with a real phone on the deployed build, place a collection order,
  and confirm it appears in `/admin` — the dev deployment is seeded with the
  owner account; production needs `people.bootstrapOwner` run once.
