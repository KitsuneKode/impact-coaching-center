---
status: TODO
ticket: none (supersedes the wave plan in docs/agents/2026-09-21-execution-runbook.md)
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Launch plan — integrate, then ship four vertical journeys

Written 22 September 2026 after a whole-repository review of `main`, every
remote branch and every PR, plus the Kitsu-Lab registry. It replaces the
multi-agent wave plan. One integration line, one writer at a time, and each
phase ends with something the owner can click through.

## Where we actually are

| Line                                                 | Holds                                                                                                                                                        | Verdict                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `main`                                               | Marketing site, enquiry → Convex, phone sign-in (logger transport), read-only 100-row inbox                                                                  | Behind                                                     |
| `fix/review-batch-1`                                 | Admin shell (sidebar, ⌘K), leads data table + owner export, orders queue + status machine, people/roles, `/login` modal, `/account`, InputOTP, 25 primitives | Green: lint, typecheck, 230 tests, build. The real base.   |
| PR #6 `kit-53-otp-resend-safety`                     | Lease/generation guard so overlapping sends keep one valid code                                                                                              | Edits files `fix/review-batch-1` deleted — port, not merge |
| `holding/ict-auth-completion`                        | Ignore a late send/verify response for a phone the visitor has since changed                                                                                 | Port into the new sign-in form                             |
| `holding/kit-63-promotion-domain`                    | Pure promotion validation, delivery state, selection, dismissal key; analytics adapter                                                                       | Good logic, ICT-coupled. Moves to Kitsu-Lab, generalised   |
| `holding/abandoned-admin-promotions`, `owner-demo-*` | Superseded experiments                                                                                                                                       | Archive                                                    |
| PR #1 ImgBot                                         | Image compression from 11 Sep                                                                                                                                | Re-run or close                                            |

Nothing public-facing for the paid scope (Resources, Books, Promotions) exists
yet, while the back office for Orders does. The order below fixes that: every
phase builds a journey from the visitor's first click to the owner's screen.

## Decisions taken (22 Sep)

Recorded so they are not re-litigated. Items marked **needs input** block only
the phase named.

1. `fix/review-batch-1` is the new base. PR #6 and `ict-auth-completion` are
   ported onto it, not merged as-is.
2. One writer on the integration line until Phase 0 lands.
3. Stop producing coordination documents. Keep ADRs, `CONTEXT.md`, plans in
   this folder, a real README, and the owner guide. No new runbooks or agent
   prompts.
4. Light palette only at launch. Pick one of the two KIT-67 candidates and
   delete `components/dev/theme-preview.tsx`. **24 Sep:** both candidates stay
   and the switch stays until the owner has tried them longer.
5. Resource gate: verify phone → required first/last name → a three-question,
   skippable, resumable questionnaire (target exam, first attempt or repeater,
   preferred batch). As already settled in
   `2026-09-22-commerce-and-account-surfaces.md`.
6. Staff may change lead status, add notes and set follow-ups. Owner alone may
   export, change roles, refund and edit catalogue/promotions. This supersedes
   the read-only-staff rule in `2026-09-22-audit-defects.md` step 3: read-only
   staff cannot do the follow-up job the brief describes.
7. Books keep the real cart from the commerce plan. **Needs input:** title
   count. Under ~5 titles we drop the cart for per-book "Buy now".
8. Reusable components live in **Kitsu-Lab** and are installed here through
   the shadcn registry (see Architecture). ICT keeps only adapters.
9. **Needs input (Phase 5):** WhatsApp route (Meta direct or a BSP such as
   MSG91/Interakt), hosting (Cloudflare Workers or Vercel Pro), domain
   control, the 30% prototype-approval date, ICT content (Telegram, library,
   policy sign-off, exterior photo, book scans).
10. **Needs input (Phase 2):** confirm the ICT contract lets you reuse general
    components. Build nothing ICT-specific into Kitsu-Lab either way.
11. **24 Sep, owner:**
    - ICT waits on promotions. The owner is still improving `@kitsu/promotions`
      in Kitsu-Lab and will say when it is ready. Only then does ICT install it
      and add its adapters. Nothing promotion-related is built here before that.
    - The past-dated Kouxal poster in "More in APSC" stays. It is revisited
      with the course-sync work.
    - "We reply the same day" stays as marketing copy.

## Architecture: two repositories, one direction of flow

```
Kitsu-Lab (upstream, generic)                 ICT (consumer, specific)
─────────────────────────────                 ──────────────────────────
registry.json  ──shadcn build──▶ /r/*.json ──shadcn add @kitsu/…──▶ components/kitsu/…   (installed copy, never hand-edited)
  promotion (types + pure selection)                                 components/promotions/ict-*.tsx (adapters)
  promotion-provider / promo-bar / -card / -dialog                   convex/promotions.ts (source of records)
  promotion-editor (form + live preview)                             app/admin/promotions/*
  book-preview (+ new `image` page kind)                             components/reader/ict-reader.tsx
```

Rules that keep the two in sync without re-doing work:

- **Kitsu-Lab never imports ICT.** No routes, catalogue, tokens, Convex or
  copy. Anything ICT-shaped is a prop, a callback or an adapter.
- **ICT never edits an installed Kitsu file.** Fix or extend it upstream,
  rebuild the registry, then re-install with
  `bunx shadcn add @kitsu/<item> --overwrite`. A diff of that re-install is
  the whole review.
- ICT's `components.json` gets `"registries": { "@kitsu": "<lab-url>/r/{name}.json" }`.
  While iterating before a deploy, install from the local build instead:
  `bunx shadcn add ../kitsu-lab/public/r/<item>.json`.
- Styling travels as shadcn CSS variables (`--primary`, `--card`, `--radius`…),
  which ICT already maps to its own tokens, so installed components look like
  ICT without forking them. `base-nova` (lab) and `base-mira` (ICT) share the
  Base UI primitives.
- Pin the lab version ICT was built against in `components/kitsu/VERSION`
  (lab commit SHA) so drift is visible.

## Phase 0 — integrate (≈1 day)

- [x] Merge `fix/review-batch-1` into the integration branch; resolve against
      `main`.
- [x] Port PR #6's guarantee (at most one acceptable code per phone when sends
      overlap) onto `lib/phone-auth.ts` + `convex/otp.ts` as they exist on
      the base. Merged rather than re-written: only its two old sign-in files
      conflicted, and its commits riding in means PR #6 shows as merged when
      this branch lands.
- [x] Port `holding/ict-auth-completion`'s stale-response guard into
      `components/account/sign-in-form.tsx` (as `lib/phone-auth-flow.ts`).
- [ ] Pick the palette; delete the dev switch and the unused palette block.
- [x] `/admin` home: replace "orders appear as they are built" with real
      counts (new enquiries, follow-ups due, orders to pack).
- [x] Gates: `bun run check`, `bun run build`. Open one PR to `main` (#7).
- [ ] Archive the superseded branches after the PR merges.

## Phase 1 — lead workflow staff can actually use (≈1–1.5 days)

The follow-up queue is the product the client bought first.

- [x] Staff writes: status change, note, next follow-up — each an
      `activities` row with actor, using the existing revision convention.
- [x] Lead detail as a Sheet from the table: timeline, status select, note
      box, follow-up date picker, Call / WhatsApp buttons.
- [ ] Default view = actionable (new + overdue follow-ups); filters for
      status, exam, source, date; search by name/number. A "Follow-up due"
      view exists; it is not yet the default.
- [ ] Export stays owner-only; confirm CSV has a UTF-8 BOM (Assamese names in
      Excel) and that each export writes an audit row. Owner-only and the BOM
      are done; the audit row is not.
- [ ] Mobile: rows collapse to cards below `md`.

## Phase 2 — promotions, upstream first (≈2–3 days)

**On hold for ICT (24 Sep):** start the ICT half only when the owner says the
Kitsu-Lab component is complete (decision 11).

Build in Kitsu-Lab per its spec
(`docs/superpowers/specs/2026-09-22-promotions-design.md` there), then install.

- [x] Lab: `promotion` core, provider, bar/card/dialog, editor, demo page,
      tests, registry build (Kitsu-Lab #4, plus corner and sheet placements).
- [ ] ICT: `convex/promotions.ts` (table, owner-only mutations with revision,
      public `live` HTTP route returning published records only).
- [ ] ICT: adapters — allowed routes and CTA targets (moved from
      `holding/kit-63`'s `ROUTE_TARGETS`), analytics bridge, dismissal storage.
- [ ] ICT: `/admin/promotions` list grouped Live / Scheduled / Draft / Ended,
      editor with live preview.
- [ ] Replace hardcoded `offer`/`nextBatch` in the hero eyebrow with an
      `inline` slot. The stale "VICTOR 8.0 · 14 Sep" banner is the first
      record the owner schedules — and ends.

### Brainstorm: how promotions reach a static page

| Option                                    | For                                                                                                                         | Against                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Server-render in the layout               | No client fetch, no flash                                                                                                   | Makes every page dynamic; the Cloudflare static cache has no ISR                                              |
| Convex live query (`useQuery`)            | Instant updates                                                                                                             | Websocket for every anonymous visitor; the provider should shrink, not grow                                   |
| **One cached GET + client-side schedule** | Pages stay static; tiny; schedule boundaries flip on time because the client evaluates `[start, end)` against its own clock | A brief moment before the bar appears — acceptable for a non-critical message; reserve space only for the bar |

Chosen: the third. The endpoint returns every _published_ record whose end is
in the future; the client decides live/scheduled. Records are small and few.

## Phase 3 — Books, the whole journey (≈3–4 days)

Owner publishes a book → visitor browses and previews → verified customer
orders → owner fulfils (the orders queue already exists).

- [ ] `books` table: title, slug, edition, description, price (paise), cover,
      enabled, fulfilment options, sample page range.
- [ ] `/admin/books` list + editor (owner), cover upload to Convex storage.
- [ ] `/books`, `/books/[slug]` with Product/Offer JSON-LD from real values.
- [ ] Sample preview with the Kitsu `BookPreview` (page/spread engines only,
      image pages — see Phase 4).
- [ ] Cart (localStorage → server merge on sign-in), `/checkout` behind
      sign-in, server-priced order with `items` referencing `bookId`.
- [ ] Payment behind a provider adapter; **labelled prototype** until live
      Razorpay keys, webhook verification and refund handling are tested.

## Phase 4 — Resources and the Reader (≈3 days)

- [x] Lab: `image` page kind for `BookPreview` (src, srcSet, width, height,
      alt) so page engines render rasters without `render` callbacks. Generic,
      useful to anyone.
- [ ] ICT admin upload: the staff browser rasterizes the PDF with pdf.js
      (the lab's `pdf-runtime`, loaded **only in admin**) to WebP at ~1024/1600
      widths, uploads the images to Convex storage. No server-side PDF
      tooling, and ADR-0003 holds: visitors never download pdf.js or the PDF.
- [ ] `/resources` (search + filters, indexable), `/resources/[slug]`
      (indexable description; the Reader opens behind the gate via the
      existing intercepting-route modal).
- [x] Gated reader access: `openResource` verifies a signed-in Person and
      records the open once per Person/Resource (`resource_open` activity).
      Shipped model differs from the original wording on purpose: Convex
      storage URLs are signed but not expiring, and no consent-version scheme
      exists yet - the protection is that only rasterized page images exist
      in storage (source PDFs never reach the client), the URL itself is not
      the gate. Revisit only if ICT asks for link-expiry, which would mean
      proxying images through a route handler.
- [ ] Questionnaire after name, as decided.

## Phase 5 — launch hardening

- [ ] WhatsApp OTP transport behind `lib/otp-transport.ts` (**needs input**).
- [ ] Turnstile on send-otp and enquiry.
- [ ] CSP with a nonce (JSON-LD) and `frame-src` youtube-nocookie.
- [ ] Scope the Convex/Better Auth provider to routes that need it (admin,
      account, login, reader, checkout) so marketing pages ship no auth client.
- [ ] Homepage down to ~8 sections; add Resources and Books sections; move
      Podcast/Campus/Posters to `/success-stories` or `/about`.
- [ ] PostHog through the typed adapter (8 events, no replay).
- [ ] One Playwright smoke per journey: enquiry, sign-in, resource unlock,
      book order (prototype), promotion schedule.
- [ ] Real README; owner guide covering the five tasks from spec §19.
- [ ] Host, domain, Search Console, Google Business Profile.

## Explicitly not doing

Kanban boards, charts on the admin home, A/B tests or audience segments for
promotions, avatar uploads, email flows, Assamese translation, a second Reader,
more coordination documents.
