# Launch checklist

**Live by 31 October 2026.** Branch `feat/launch`, draft PR #18. Brand rules:
`docs/brand.md`.

How to use it: `[x]` under **Locked** means done and not touched again unless
something breaks or the owner asks. Work happens in three threads; each owns
its files, so they can run side by side without conflicts. A change outside a
thread's files goes through that thread.

## Locked (done, leave alone)

- [x] Pulse theme and tokens (`app/globals.css`), fonts, radius rule
- [x] Blue-field hero with the word reveal
- [x] Home exam stack (pinned, shrinking), restored 16 Oct
- [x] Header: floating bar, shrink on scroll, a panel per section
- [x] Sign-in by WhatsApp code, OTP abuse ceilings, rate limits
- [x] Account page, delete account by code
- [x] Razorpay checkout flow and receipts (test mode)
- [x] Search (filters, recent, empty state)
- [x] Blog: covers, pictures, videos, contents rail, progress
- [x] Admin typed confirmations and Undo
- [x] SEO base: sitemap, JSON-LD, breadcrumbs, llms.txt, IndexNow
- [x] English and Assamese routing, first-visit language choice

_Owner to confirm or move items back to a thread._

## Thread 1: public site UI

Owns `app/[locale]/**`, `components/home`, `components/marketing`,
`components/site`, `app/pulse.css`, `messages/*`.

- [ ] Book set page carousel (Image #11): rethink and rebuild
- [ ] Home sections after the exam stack: students, free first, books, teachers
- [ ] Courses page on phones: ranked list readability
- [ ] Mobile pass at 390, then 1440 / 1920 / 2560
- [ ] Empty, loading and error states on every public page
- [ ] Assamese strings sent for native review

## Thread 2: commerce and admin

Owns `app/(plain)/**` (cart, checkout, account), `app/admin/**`,
`components/admin`, `components/account`, `components/commerce`, `convex/**`.

- [ ] Cart and checkout click-through on a phone
- [ ] Orders: courier and centre pickup paths end to end
- [ ] Admin design pass (sidebar, tables, forms) for phone and desktop
- [ ] Promotions: create, schedule and show a campaign end to end
- [ ] Book sets in admin: prices per language, availability, covers

## Thread 3: launch and production

Owns `next.config.ts`, `proxy.ts`, `lib/env.ts`, `docs/production.md`,
deployment settings.

- [ ] Hosting decided (recommended Vercel Pro) by 26 Oct
- [ ] Production Convex deployment and env vars (`docs/production.md`)
- [ ] `SITE_INDEXABLE=true` and `NEXT_PUBLIC_SITE_URL` on production
- [ ] Domain DNS pointed, HTTPS, redirects
- [ ] Razorpay live keys and webhook
- [ ] WhatsApp: Meta number, templates, webhook, `WHATSAPP_*` secrets
- [ ] `AUTH_PROXY_SECRET` on both Convex and the site host
- [ ] R2 bucket and token for the PDFs
- [ ] Lighthouse on the production URL, then a real-phone click-through

## Waiting on ICT

- [ ] Razorpay account and keys, GSTIN
- [ ] New SIM and Meta Business setup
- [ ] Book sets: prices, covers, sample pages
- [ ] Teacher details, photos, toppers
- [ ] Library answers, staff list
- [ ] Policy pages approved
- [ ] Domain access
- [ ] The open facts in `toConfirm` (`lib/brand.ts`) and `libraryQuestions`
  (`lib/library.ts`): names, timings, ASSIST, Dhemaji address, policies

## After launch

- [ ] Dark mode (Pulse dark tokens and a toggle)
- [ ] Animation refinements the owner points out
- [ ] Book reviews
