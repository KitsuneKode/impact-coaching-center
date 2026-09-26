---
status: in-progress
ticket: KIT-57, KIT-58, KIT-69, KIT-70, KIT-67
spec: docs/plans/2026-09-22-launch-plan.md
---

# Next sessions: one brief each

Written 26 September 2026 at the end of a long session, so each piece of
remaining work can start in a fresh session with full context. Run them in
this order; A to C do not depend on the design decision, D does.

## Where things stand

- `main` has everything from PR #10: dev-deployment sign-in, Markdown
  policies, onboarding questions, account deletion, admin fixes, `/preview`
  books/cart/resources screens, success stories redesign, six concepts at
  `/redesign`, and `bun run demo` / `bun run otp`. Full record:
  `docs/plans/2026-09-26-client-demo-readiness.md`.
- `feat/catalog-backend` (pushed, not merged) adds the catalog schema,
  `lib/catalog.ts` rules with tests, `convex/catalog.ts` (public reads and the
  gated `openResource`) and `convex/catalogAdmin.ts` (owner-only editing).
  Not yet pushed to the Convex dev deployment.
- Dev backend: Convex `peaceful-emu-861`. Sign-in codes: `bun run otp`.
  Owner 8134827648, staff 9999900001.
- Not verified by hand yet: the login modal closing after sign-in (fix
  2ea9bf8), concepts 2 to 6, `/preview` on phones and in dark palettes.

Every session: read `AGENTS.md`, work on a branch, run `bun run check` and
`bun run build`, click through what you changed in the browser, and end with
Blocked on me / Changed / Found.

## A. Books and resources, for real (KIT-57, KIT-58)

Branch: continue `feat/catalog-backend`.

Paste to start:

> Continue docs/plans/2026-09-27-next-sessions.md section A on
> feat/catalog-backend. The Convex layer exists (convex/catalog.ts,
> convex/catalogAdmin.ts, lib/catalog.ts). Build the rest, reusing the
> /preview components in components/commerce: owner admin at /admin/books
> and /admin/resources (list, create, edit, publish, image upload via
> catalogAdmin.uploadUrl) added to components/admin/nav.ts; public /books,
> /books/[slug] and /resources reading convex/catalog (server-rendered with
> convex/nextjs fetchQuery for books, client openResource for the reader);
> PageViewer showing real page images when present; the cart pricing from
> Convex instead of lib/preview-catalogue.ts; a devSeed seedCatalog loading
> the preview titles as sample:true; convex-test DB tests for openResource
> (verified only, one open recorded) and saveBook (owner only, revision
> conflict, slug clash). Then retire /preview/books and /preview/resources.
> Keep /books and /resources noindex while every record is sample. Checkout
> stays a labelled prototype.

Done when: an owner adds a book with a cover and publishes it, it appears on
/books; a signed-out visitor is sent to log in from a resource; a signed-in
one reads its pages and the open shows on their lead sheet.

## B. Production readiness (KIT-69)

Branch: `feat/production-readiness`.

Paste to start:

> Work KIT-69 from docs/plans/2026-09-27-next-sessions.md section B. Add
> t3-env (@t3-oss/env-nextjs) for the Next side, replacing the checks in
> lib/env.ts, so a missing variable fails the build. Fix the Better Auth
> "Base URL is not set" warning without breaking the trustedOrigins fix in
> convex/auth.ts. Write docs/production.md: every Convex and Vercel variable
> for production, where each comes from, and that DEV_DEPLOYMENT_NAME must
> never be set there. Do not create production deployments or change
> provider settings; list those steps for me to approve.

## C. Lead workflow and orders (launch plan Phase 1, KIT-70)

Branch: `feat/leads-and-orders`.

Paste to start:

> Work section C of docs/plans/2026-09-27-next-sessions.md. Leads: make
> "needs action" (new plus follow-up due) the default view, write an audit
> activity for every export, and render rows as cards below md. Orders
> (KIT-70): a random human reference like ICT-7K3F9 (Crockford base32,
> collision-checked), courier name and tracking number on orders, required
> before an order can move to shipped, and shown on /account.

## D. Redesign (KIT-67, then KIT-66)

Starts only after I send references. Paste to start, with the references:

> Work section D of docs/plans/2026-09-27-next-sessions.md. References:
> [links/screenshots]. First produce a design brief, not code: layout
> structure for the home page and shared sections, a palette derived from
> those references with contrast checked in both light and dark, a type
> pairing and scale, radius, shadow and motion rules. After I approve it,
> put it into app/globals.css tokens, rebuild the shared components (header,
> footer, buttons, cards, section headers, forms, dialogs) as generic,
> prop-driven blocks that could be sold separately, then cut the home page
> to about 8 sections (KIT-66). The /redesign concepts were judged too
> generic; use them only as a record of what not to repeat.

## Housekeeping (any session, with my approval)

Close ImgBot PR #1; delete merged branches (`feat/client-demo-readiness`,
`feat/dev-deployment-demo`, `feat/policies-markdown`, `fix/review-batch-1`,
`kit-53-otp-resend-safety`, `bhuyanmanash2002/kit-53-reproducible-client-materials`);
tag the four `holding/*` branches as `archive/*` and delete them; remove the
old worktrees.
