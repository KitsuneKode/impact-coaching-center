---
status: in-progress
ticket: none (spans KIT-41, KIT-45 follow-up, launch plan Phase 1)
spec: docs/plans/2026-09-22-launch-plan.md
---

# Client demo readiness — 26 September 2026

Goal: the owner can be walked through the public site, sign-in with the
onboarding questions, their own account (including deletion), and the staff
dashboard with realistic data — locally and through a preview link — and can
take home policy drafts they only need to fill in and approve.

Promotions and the ebook reader are demonstrated from Kitsu-Lab, not built
here (launch plan decision 11). PostHog waits until this and the backend work
are done. The palette switch stays visible in the demo on purpose: the point is
to show the owner that neither current palette is final.

## Decisions (26 Sep, owner of the repo)

1. Policies are Markdown files ICT can edit. Researched defaults are marked
   _proposed_; facts only ICT can supply are marked _fill_. Both render
   highlighted until the document is approved; an approved document with a
   marker left in it fails the tests.
2. Account deletion is self-serve. Profile, questionnaire answers and sessions
   are erased; paid orders keep an anonymised copy for tax and accounting.
3. The demo runs on the cloud dev deployment `peaceful-emu-861`, opted in by
   `DEV_DEPLOYMENT_NAME` (lib/dev-deployment.ts) so the logger OTP transport
   and the seed can run there and nowhere else.
4. The questionnaire (target exam, first attempt or repeater, preferred batch;
   skippable, resumable) follows the first sign-in and is resumable from
   /account. Answers appear on the lead sheet. The Resource gate reuses it.

## Steps

- [x] AGENTS.md working agreement (Opus 5.5 guidance).
- [x] Named hosted dev deployment for the logger transport and the seed, with
      tests; env set on `peaceful-emu-861`; functions pushed; fixture seeded;
      a code confirmed in `convex logs`.
- [x] Policies in Markdown with proposed/fill markers: privacy (incl. deletion
      and grievance contact), terms, cancellations and refunds, shipping and
      delivery. Renderer, legend, tests.
- [x] Self-serve account deletion: Convex mutation, audit row, /account UI,
      privacy wording.
- [x] Onboarding questionnaire after first sign-in; /account resume; lead
      sheet shows answers. Students only.
- [x] Found in the browser, not by tests, and fixed: Better Auth never got
      SITE_URL as trustedOrigins ("Invalid origin" on every browser sign-in);
      paginated() rejected .paginate()'s split fields (/admin/leads crashed on
      a full page); rows-per-page menus had no options; raw server text shown
      on sign-in errors.
- [x] One name field with cleanName (lib/person-name.ts).
- [x] Preview link: Vercel preview env for this branch pointing at the dev
      deployment; branch alias trusted in SITE_URL. Deployment Protection
      still gates it (owner decision: Share link or turn it off for previews).
- [ ] Launch plan Phase 1 remainder: actionable default view, export audit
      row, mobile card rows.
- [ ] Launch plan and Linear updated.

## Verification loop

Each item is checked by hand on the running app, not inferred from tests.

- `bun run check` and `bun run build` pass.
- Public: `/`, `/courses`, one course page, `/success-stories`, `/contact`,
  `/library`, four policy pages at 390 px and 1440 px.
- Enquiry form submits and the lead appears at the top of `/admin/leads`.
- Sign-in as a new number → name → questionnaire (answer one, skip the rest)
  → /account shows answers and lets them finish.
- Owner: leads default view, open a lead sheet, change status, add a note, set
  a follow-up, export; orders queue status change; people role change.
- Staff: cannot export, cannot change roles.
- Account deletion as a student: confirm, signed out, lead sheet shows the
  Person as deleted, orders keep their totals with no name or phone.

### Run 26 Sep, against peaceful-emu-861 from localhost:3000

- [x] `bun run check` (289 tests) and `bun run build`.
- [x] New number → code (from `convex logs`) → name → questionnaire →
      /account shows answers.
- [x] Delete account → signed out → confirmation screen → tombstone row has
      no number or name.
- [x] Staff sign-in skips the questionnaire, lands on /admin; leads table,
      lead sheet, orders queue load; rows per page 50 loads the rest.
- [x] /privacy at mobile width renders markers legibly.
- [x] Owner: Export visible, People page with grant/remove. Staff: no
      Export, People says "Owner only". (Export file not downloaded; no role
      actually changed.)
- [x] Enquiry form → "received" → top of /admin/leads. Failed until
      LEAD_INGEST_SECRET was set on both sides; it had never been set (KIT-40).

## Next, in order

1. **Review and merge** the three stacked PRs, each clicked through first.
2. **Demo isolation.** A second Convex deployment for the client demo so
   development cannot break it; move DEV_DEPLOYMENT_NAME there.
3. **t3-env** (`@t3-oss/env-nextjs`) for the Next side, replacing the
   hand-rolled `lib/env.ts` checks so a missing variable fails the build.
   Convex variables stay in Convex.
4. **Orders.** Random human reference (e.g. `ICT-7K3F9`, Crockford base32)
   instead of a guessable sequence; the Convex `_id` stays the key, so no
   UUIDv7. Courier name and tracking number, required to mark "shipped",
   shown on /account.
5. **Launch plan Phase 1 remainder** (above).
6. **Engineering audit** before the design pass: error boundaries per admin
   route, empty/loading/error states against docs/design-guide.md §6,
   duplicated table code, Better Auth baseURL warning, precomputed admin
   counts instead of scans.
7. **Design pass**: public pages, admin (shadcn blocks, Motion Primitives),
   branded 404/error, palette decision (KIT-67). The palette switch stays in
   the demo to show the owner that neither candidate is final.
8. **Books cart** (KIT-59) with Zustand + persist for the local cart.
9. Deferred by decision: PostHog, promotions in ICT (shown from Kitsu-Lab),
   ebook reader in ICT (shown from Kitsu-Lab).

## State at end of 26 September 2026

Everything below is on `feat/client-demo-readiness` (PR #10, open,
mergeable, `bun run check` green). Nothing here is on `main` or production.

### Built after the plan above was written

- Book, cart and free-resource screens under `/preview` (sample content,
  labelled, noindexed): typographic book covers, exam filters in the URL,
  quick add, a Zustand cart kept in the browser, one page-by-page reader
  for book samples and resources.
- Success stories redesigned: officers first, counted proof strip, one-line
  trust notes, "Share your result" action.
- Six homepage concepts at `/redesign/1` to `/redesign/6` (navy or royal
  blue with gold), all from `app/redesign/_data.ts`.
- shadcn Sonner toasts; FAQPage JSON-LD; guideline fixes; plain copy;
  long comments trimmed; `bun run otp` and `bun run demo`.
- Fixed: enquiries never reached Convex (`LEAD_INGEST_SECRET` unset on both
  sides; now set on the dev deployment, locally and for this preview only);
  the login modal stayed open after signing in (empty `@authModal` pages).

### Not yet verified by hand

- [ ] Login modal closes after sign-in (fix 2ea9bf8; browser tool was
      rate-limited).
- [ ] Concepts 2 to 6 viewed in a browser, desktop and phone.
- [ ] `/preview` screens at phone width and in the dark palettes.
- [ ] `bun run build` after the concepts were added.

### Open, in order

1. **Demo, then merge PR #10.** Close ImgBot PR #1 and delete the merged
   and holding branches.
2. **Design direction** (KIT-67): the owner reacts to `/redesign`; pick one
   direction, then turn it into tokens in `app/globals.css` (colour, type
   scale, radius, shadow, motion) before any page is restyled.
3. **Home page cut** (KIT-66) in the new tokens.
4. **Production readiness** (new): production Convex deployment in a region
   near India; `SITE_URL`, `LEAD_INGEST_SECRET`, `BETTER_AUTH_SECRET` and
   Vercel production env vars; Better Auth `baseURL` warning; t3-env so a
   missing variable fails the build. Sign-in on the dev deployment takes
   5 to 11 seconds.
5. **Demo isolation** (new): a separate Convex deployment for client demos.
6. **Lead workflow remainder**: actionable default view, an audit row per
   export, card rows on phones.
7. **Orders** (new): random human reference (`ICT-7K3F9`), courier and
   tracking number required before "shipped".
8. **Books and Resources for real** (KIT-57/58/59): Convex tables, admin
   upload, the preview screens wired to them, Razorpay behind the adapter.
9. **WhatsApp OTP** (KIT-46), Google Business Profile (KIT-43), device and
   performance passes (KIT-44).

### Waiting on ICT

Everything in `docs/proposals/2026-09-26-what-we-need-from-ict.md`, most
urgently: fact sign-off (KIT-41), consent for student names and photos,
who answers enquiries, the domain, book titles, the first PDFs, the
WhatsApp sender choice, and the Classplus questions (KIT-47).
