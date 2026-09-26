# Production configuration

Every environment variable the deployment needs, where it is set, and which
steps are manual provider work. Nothing here is done automatically — each
"Set by" that names a provider is a step the operator runs.

## Host project settings (Vercel, or whichever platform builds the site)

Set in the host's dashboard; `NEXT_PUBLIC_*` values are inlined into the
client bundle at build time, so changing them requires a redeploy.

| Variable                         | Required for production | Purpose                                                                                                                                                              |
| -------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Yes                     | Canonical/OG/sitemap origin. `lib/site.ts` refuses to build with a localhost fallback when `SITE_INDEXABLE` is true.                                                 |
| `SITE_INDEXABLE`                 | Decide at launch        | `true` invites indexing. Keep unset/`false` until content is owner-approved (KIT-41).                                                                                |
| `NEXT_PUBLIC_CONVEX_URL`         | Yes                     | Browser → Convex data connection (websocket + actions).                                                                                                              |
| `NEXT_PUBLIC_CONVEX_SITE_URL`    | Yes                     | The `*.convex.site` endpoints: Better Auth routes and `/enquiries` ingest.                                                                                           |
| `LEAD_INGEST_SECRET`             | Yes                     | Bearer secret the enquiry sink sends to the Convex `/enquiries` route. `openssl rand -hex 32`; the same value is set on Convex below. Never `NEXT_PUBLIC_`-prefixed. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes before launch       | Renders the Turnstile widget on the enquiry form.                                                                                                                    |
| `TURNSTILE_SECRET_KEY`           | Yes before launch       | Server-side siteverify in `app/actions/lead.ts`. Unset = check skipped (development only).                                                                           |

## Convex deployment settings

Set with `npx convex env set NAME value` (dev) or the production deployment's
dashboard/env UI — never in `.env.local`, never committed.

| Variable                                | Required                | Purpose                                                                                                                                                                                                           |
| --------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                              | Yes                     | Comma-separated literal origins allowed to call auth routes (CORS + CSRF `trustedOrigins`). Must include the production origin; wildcards are rejected at startup.                                                |
| `BETTER_AUTH_SECRET` (or `AUTH_SECRET`) | Yes                     | Hashes verification codes. `openssl rand -base64 32`.                                                                                                                                                             |
| `OTP_TRANSPORT`                         | Yes                     | `logger` or `whatsapp`. No default — unset fails closed. `logger` is accepted only on localhost or the dev deployment named in `lib/dev-deployment.ts`; setting it on production is refused by `chooseTransport`. |
| `LEAD_INGEST_SECRET`                    | Yes                     | Must equal the host-side value.                                                                                                                                                                                   |
| `DEV_DEPLOYMENT_NAME`                   | **Never in production** | Exists only so a dev checkout can name its own deployment for the logger gate. Production must not carry it — `lib/dev-deployment.ts` documents why the name lives in code, not env.                              |

Convex sets `CONVEX_URL`, `CONVEX_SITE_URL` itself — do not set them.

## Manual provider steps (approve before running)

- **Convex production deployment**: `npx convex deploy` against a prod
  deployment, then set the Convex-side variables above on it. Until then the
  dev deployment `peaceful-emu-861` carries the functions.
- **WhatsApp OTP transport (KIT-46)**: provider account + sender; implement
  `sendOtp` in `lib/otp-transport.ts`, set `OTP_TRANSPORT=whatsapp`. The
  per-phone send lease and ceilings already exist (KIT-53) so the first
  billed send is rate-limited.
- **Turnstile**: create the Cloudflare site, take site key + secret, set both
  variables above. The CSP already allows `challenges.cloudflare.com`.
- **Payments (KIT-60)**: Razorpay credentials, server-side order creation,
  webhook signature verification, refunds — the checkout currently lands
  orders as `awaiting_payment` and says so.
- **Domain/DNS (KIT-42)**: point the domain at the host, set
  `NEXT_PUBLIC_SITE_URL` + Convex `SITE_URL` to the real origin, redeploy,
  then flip `SITE_INDEXABLE`.
- **Google Business Profile / Search Console (KIT-43)**: manual verification
  once the domain resolves.

## Verifying after deploy

- `curl -I https://<domain>/` shows the CSP plus the baseline headers from
  `next.config.ts`.
- Sign in with a real phone on the deployed build, place a collection order,
  and confirm it appears in `/admin` — the dev deployment is seeded with the
  owner account; production needs `people.bootstrapOwner` run once.
