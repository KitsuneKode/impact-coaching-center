# Production configuration

Every environment variable the deployment needs, where it is set, and which
steps are manual provider work. Nothing here is done automatically — each
"Set by" that names a provider is a step the operator runs.

## Vercel project settings (Production environment)

Set in the host's dashboard; `NEXT_PUBLIC_*` values are inlined into the
client bundle at build time, so changing them requires a redeploy. A missing
required variable fails `next build` (t3-env in `lib/env.client.ts` and
`lib/env.server.ts`; "Yes before launch" rows are required only when
`VERCEL_ENV=production`). Preview deployments keep pointing at the dev
deployment `peaceful-emu-861`.

| Variable                         | Required for production | Purpose                                                                                                                                                              |
| -------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Yes                     | Canonical/OG/sitemap origin. `lib/site.ts` refuses to build with a localhost fallback when `SITE_INDEXABLE` is true.                                                 |
| `SITE_INDEXABLE`                 | Decide at launch        | `true` invites indexing. Keep unset/`false` until content is owner-approved (KIT-41).                                                                                |
| `NEXT_PUBLIC_CONVEX_URL`         | Yes                     | Browser → Convex data connection (websocket + actions).                                                                                                              |
| `NEXT_PUBLIC_CONVEX_SITE_URL`    | Yes                     | The `*.convex.site` endpoints: Better Auth routes and `/enquiries` ingest.                                                                                           |
| `LEAD_INGEST_SECRET`             | Yes                     | Bearer secret the enquiry sink sends to the Convex `/enquiries` route. `openssl rand -hex 32`; the same value is set on Convex below. Never `NEXT_PUBLIC_`-prefixed. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes before launch       | Renders the Turnstile widget on the enquiry form.                                                                                                                    |
| `TURNSTILE_SECRET_KEY`           | Yes before launch       | Server-side siteverify in `app/actions/lead.ts`. Unset = check skipped (development only).                                                                           |
| `CONVEX_DEPLOY_KEY`              | Yes                     | Production deploy key from the Convex dashboard. Lets the build run `npx convex deploy` so functions and site ship together. Production environment only.            |

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
