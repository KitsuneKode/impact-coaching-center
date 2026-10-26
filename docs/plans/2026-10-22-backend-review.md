---
status: done
ticket: none
spec: none
---

# Backend review

## Status on `feat/launch`, 27 Oct 2026

The review below audited the old `fix/form-guards` checkout. Each finding was
rechecked against `feat/launch`:

| Finding                              | Status       | Where                                                                                                                          |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| F01 owner can unlink phone           | Fixed        | `lib/phone-auth.ts` allowlists auth routes; `/update-user` is closed                                                           |
| F02 cart crosses accounts            | Fixed        | `lib/cart-store.ts` lines carry an `owner`                                                                                     |
| F03 verify after erasure             | Accepted     | Needs a code entered during the seconds of an erasure; makes a fresh nameless Person, which that phone's holder is entitled to |
| F04 lead pages throw                 | Fixed        | one `.paginate()` per query; fragment search streams                                                                           |
| F05 shared file deleted              | Fixed        | saves release files; the weekly sweep deletes only what nothing uses                                                           |
| F06 failed merge drops guest lines   | Fixed 27 Oct | the toast offers "Try again" with the saved lines                                                                              |
| F07 quick-add bypasses server        | Gone         | book cards replaced by bundles via `useCartActions`                                                                            |
| F08 lost checkout ack                | Fixed        | ADR-0005: a persisted checkout, "Confirming" state, webhook settles                                                            |
| F09 notes on a tombstone             | Fixed        | `deletedAt` rows refused                                                                                                       |
| F10 lease generation reuse           | Fixed        | new leases count from the clock                                                                                                |
| F11 erasure stops at 100 auth rows   | Fixed        | `deleteMany` cursor drained                                                                                                    |
| F12 refusals look like saves         | Fixed        | refused writes roll back to the server cart                                                                                    |
| F13 merge bypasses line limit        | Fixed        | `withinOrderCap` after merging                                                                                                 |
| F14 invalid attempts spend the limit | Fixed        | validation before `consumeRateLimit`                                                                                           |
| F15 resource save scans catalogue    | Fixed        | release + sweep, indexed by key                                                                                                |
| F16 search hides the 26th match      | Fixed        | one flat page, bounds stated                                                                                                   |
| F17 due-today goes stale             | Fixed        | callers pass `now`                                                                                                             |
| F18 follow-ups unaudited             | Fixed        | `follow_up_change` activity                                                                                                    |
| F19 seed deletes edited posts        | Fixed        | saves clear `sample`                                                                                                           |
| F20 sync overwrites art              | Fixed 27 Oct | slugs checked before any file is written                                                                                       |
| F21 erasure in one transaction       | Mitigated    | over 2,000 rows is refused with a reason; staff help                                                                           |
| P01 collection dead end              | Fixed        | `packed` removed; routes per fulfilment                                                                                        |
| P02 refund after cancel              | Fixed        | `cancelled → refunded` while `refundDueAt`                                                                                     |
| Next/Sharp advisories                | Fixed        | next 16.3.8; see the package update                                                                                            |
| Build failure (fonts)                | Fixed        | build passes; `/redesign` removed                                                                                              |

## Original review

Audit baseline: `fix/form-guards`, commit `408931b69be8f32e05f74160f5a648434cfd6144`.
Review only: no source fixes, provider changes, deployment, or database writes.
The current implementation is v1; the October ship plan's v2 work is planned,
not evidence of implementation. Payment and hosted WhatsApp remain explicit gates.

- [x] Reconcile branch, clean working tree, domain decisions, and active ship plan.
- [x] Map Convex modules, server callers, and current test infrastructure.
- [x] Audit identity, authentication, permissions, and account erasure.
- [x] Audit cart, checkout, and order integrity.
- [x] Audit catalogue, editorial, admin, and query scaling.
- [x] Audit HTTP/server integrations and dependency posture.
- [x] Verify reproductions and run local quality gates.
- [x] Consolidate ranked findings, improvement options, and verification limits here.

## Verdict and scope

The backend has useful foundations, but this commit is not ready for launch.
There are **21 confirmed current defects**, plus **two reproduced order-state
defects that must be fixed before live payments**. Four current defects are P1:
owner lockout, carts crossing account boundaries, erasure racing verification,
and lead queries that fail after their first scan page. P2 means a concrete
correctness, data-integrity, or scale defect, not a style preference.

Reviewed all non-generated Convex modules and schema, the Better Auth/Next
bridge, enquiry ingestion and submission, cart/checkout callers, catalogue
import, and associated tests. This is a whole-backend review of this local
commit, not a diff-only review or a statement about another branch/deployment.
The identity reviewer hit a provider usage limit before reporting; its temporary
probes were recovered, inspected, rerun, and extended by the primary reviewer.

All findings below have high confidence from code and local reproductions.
F17's expected subscription behavior is supported by Convex documentation;
the overnight browser subscription itself was not exercised.

## Verification

- `bun run check`: PASS; formatting, lint, both application/scripts TypeScript
  projects, and **358 tests / 30 files / 912 assertions**.
- `bunx --no-install tsc --noEmit -p convex/tsconfig.json`: PASS.
- AST inspection: all **65 registered functions** (25 queries, 26 public
  mutations, 14 internal mutations) declare both argument and return validators.
- **32 supplemental probes** passed while asserting the present behavior:
  11 commerce, 11 catalogue/leads/import, and 10 identity/erasure probes.
  Some are positive controls; this is not a count of separate bugs.
- `bun run build`: FAIL, 42 Turbopack errors resolving generated Google-font
  imports, with `next/font/google queries have exactly one entry`. The trace
  includes `app/redesign/3/page.tsx:20` and its generated EB Garamond CSS.
  The root cause was not established; this is not evidence of a Convex defect
  or proof of a network outage. The production build gate remains open.
- `bun audit`: FAIL; 25 advisories (2 critical, 11 high, 11 moderate, 1 low).
  Reachability assessment and upgrade direction are below.

Temporary repro commands, each run in a separate process to isolate mocks:

```sh
bun test /tmp/ict-commerce-audit-408931b
bun test /tmp/impact-backend-review-408931b.test.ts
bun test /tmp/ict-identity-audit/integration.test.ts
```

These scratch files are not committed regression tests and may be cleared by
the OS. The triggers below preserve the essential evidence independently.
Client probes control React scheduling and network results; they are not real
browser, localStorage, cross-tab, or device verification. Identity probes
register the installed Better Auth component and call real public functions.
No live data, deployment, provider configuration, or external account changed.

## Current defects, ordered for remediation

Effort includes regression coverage: S = hours, M = roughly a day, L = multiple
days. Risk describes the change, not the severity of leaving the defect.

### F01 — P1: the only owner can unlink their only sign-in method

**Evidence:** `lib/phone-auth.ts:130`, `convex/auth.ts:101`,
`convex/persons.ts:19`. The custom hook guards phone-plugin paths but lets the
generic `/update-user` route through. Installed Better Auth 1.6.33 deliberately
permits clearing the phone and resets its verification flag.

**Repro/impact:** In the actual local auth handler, an authenticated owner clearing
their phone receives 200, then `canManagePeople` becomes false. OTP sign-in with
the original number subsequently fails because its synthetic email still exists
on the detached auth user. The owner Person remains, so first-owner bootstrap
also remains blocked. This is self-lockout, not demonstrated role escalation.

**Fix:** Reject generic updates to protected phone identity fields, including
clears; route supported identity changes through an audited recovery operation.
Test the real handler and last-owner recovery. **S; LOW**.

### F02 — P1: a previous account's cart is merged into the next account

**Evidence:** `lib/cart-store.ts:72`, `lib/cart-store.ts:152`,
`lib/cart-store.ts:169`. The persisted store has no account owner marker.

**Repro/impact:** Sign in as A and mirror A's server cart; sign out and sign in
as B. A's mirrored lines remain locally and are submitted to B's `mergeCart`.
Shopping history crosses account boundaries and B's server cart is contaminated.
The hook probe reproduces this without modifying the backend's authorization.

**Fix:** Separate guest selections from account mirrors, scope pending work and
sync completion to the viewer, and clear/swap mirrors on account changes.
Preserve genuine guest selections. **M; MED**.

### F03 — P1: an in-flight verification recreates data after successful erasure

**Evidence:** `lib/phone-auth.ts:233`, `lib/phone-auth.ts:240`,
`convex/auth.ts:80`, `convex/persons.ts:91`, `convex/account.ts:105`.
OTP verification, Person recording, and session creation span separate
transactions in the HTTP action.

**Repro/impact:** Pause a legitimate verification just before its Person callback.
Erase the existing account through `deleteOwnAccount`, then resume verification.
The request returns 200 and recreates a verified Person under the original phone
with the old name. Erasure's transaction is atomic, but the surrounding auth
workflow can outlive it. No new post-erasure signup was requested.

**Fix:** Fence verification completion against erasure/revocation state and
recheck the auth identity before recording. Reject a workflow started before
erasure while still permitting a deliberate new verification. Add the controlled
interleaving test against the actual component. **M; HIGH** because auth and
privacy boundaries interact.

### F04 — P1: lead search and dashboard counts fail on a second scan page

**Evidence:** `convex/leads.ts:219`, `convex/leads.ts:225`,
`convex/leads.ts:664`, `convex/leads.ts:670`.

**Repro/impact:** Seed 201 eligible leads without the requested phone fragment.
The second page throws `Only a single paginated query`. Separately, place 200
settled follow-ups ahead of an active one; the due-count loop throws the same
error. Installed convex-test enforces this deployment constraint, so both were
reproduced locally. The current tests use smaller fixtures.

**Fix:** Perform one native pagination read per invocation. Use maintained
counts, a bounded indexed read, or separate scheduled aggregation for counts.
Do not replace pagination with an unbounded `collect()`. **M; MED**.

### F05 — P2: image cleanup deletes files retained by another field of the same book

**Evidence:** `convex/catalogAdmin.ts:75`, `convex/catalogAdmin.ts:345`,
`convex/catalogAdmin.ts:354`.

**Repro/impact:** Save the same valid storage ID as cover and sample page, then
replace/remove just the cover. Save succeeds, the sample ID remains, and its
file is gone. Replacing samples while retaining the cover also deletes it.
The reference guard excludes the whole current book and cleans fields separately.

**Fix:** Compute all references in the book's final state, then delete only IDs
outside that union and unreferenced elsewhere. **S; LOW**.

### F06 — P2: a failed guest-cart merge discards selections and never retries

**Evidence:** `lib/cart-store.ts:151`, `lib/cart-store.ts:162`,
`lib/cart-store.ts:169`.

**Repro/impact:** Merge guest lines into an empty server cart while the mutation
returns a refusal. `mergedFor` was already set, `finally` sets `synced`, and the
server mirror empties the local cart. Later renders do not retry.

**Fix:** Retain the guest snapshot until acknowledgement and provide retry;
scope acknowledgement to the current viewer. Address with F02. **M; MED**.

### F07 — P2: shelf quick-add bypasses the server cart

**Evidence:** `components/commerce/book-card.tsx:16`,
`components/commerce/book-card.tsx:50`.

**Repro/impact:** A signed-in buyer uses shelf quick-add. It calls the raw local
Zustand action and shows success without a cart mutation. The next server-cart
emission overwrites the addition. Checkout orders the server cart, so the
acknowledged book can be absent from the actual order.

**Fix:** Use the shared authenticated cart actions, as the detail-page path does.
**S; LOW**.

### F08 — P2: lost checkout acknowledgements have no usable recovery path

**Evidence:** `app/checkout/page.tsx:135`, `app/checkout/page.tsx:201`,
`app/checkout/page.tsx:258`, `convex/checkout.ts:199`.

**Repro/impact:** Commit an order but drop its response. The server clears the
cart; mirroring renders the empty-cart branch and removes retry controls. A
reload also loses the in-memory idempotency key. Same-key recovery works in the
backend, but the UI no longer exposes it and incorrectly states the order did
not go through. The account's order history is a manual fallback.

**Fix:** Persist unresolved attempts independently of cart contents and reconcile
their keys before allowing a fresh attempt. Use uncertain-outcome copy until
resolved. **M; MED**.

### F09 — P2: staff can write personal text onto an erased tombstone

**Evidence:** `convex/leads.ts:523`, `convex/leads.ts:567`,
`convex/leads.ts:610`.

**Repro/impact:** Erase an account, then use its tombstone's current revision to
set a lead status and append a note. Both succeed, and the erased Person returns
to the action inbox. An already-open staff sheet can still append text.

**Fix:** Reject status, follow-up, note, and call mutations for `deletedAt` rows;
make historical detail read-only. **S; LOW**.

### F10 — P2: deleting OTP leases reuses generations and defeats stale-send guards

**Evidence:** `convex/account.ts:89`, `convex/otp.ts:153`,
`convex/otp.ts:184` (generation creation/check).

**Repro/impact:** Claim send generation 1; erase the account, which deletes the
lease; claim again and receive generation 1. Commit the fresh code, then commit
the old in-flight send using its still-matching generation. Both commits return
`ok`; the fresh code becomes invalid and the stale code is accepted. This is a
generation-reuse bug across erasure, not evidence of OTP guessing or takeover.

**Fix:** Use non-reusable attempt identity or a revocation fence that survives
lease deletion. Include stale commit/release/abort interleavings. **M; MED**.

### F11 — P2: erasure stops after the first 100 auth rows

**Evidence:** `convex/account.ts:113`, `convex/account.ts:119`,
`convex/account.ts:126`.

**Repro/impact:** Create 101 sessions and erase through the real public mutation.
It returns success but one session remains, including fixture IP/user-agent data.
The component's continuation metadata is ignored for session/account/verification
deletion. Deleting the auth user prevents normal access through `safeGetAuthUser`;
this finding is incomplete cleanup, not proof that leftover sessions retain access.

**Fix:** Drain continuation pages with bounded resumable cleanup and explicit
completion semantics. Keep authorization revoked from the first transaction.
**M; MED**.

### F12 — P2: resolved cart refusals are silently treated as successful writes

**Evidence:** `lib/cart-store.ts:189`, `lib/cart-store.ts:207`.

**Repro/impact:** Have `setCartLine` resolve with its valid `{ok:false}` result,
such as the line-limit refusal. Only rejected promises are handled, so the
optimistic selection stays displayed without an error, despite differing from
the server cart checkout uses.

**Fix:** Inspect structured results and reconcile refused writes while preserving
later edits. **S; MED**.

### F13 — P2: cart merges bypass the total line limit

**Evidence:** `convex/carts.ts:89`, `convex/carts.ts:99`,
`convex/carts.ts:140`.

**Repro/impact:** Merge two disjoint 50-line arrays. Both succeed and store 100
lines because only the incoming array is capped. A normal positive quantity
update then fails against the 50-line limit. Repeated merges grow the document
until database limits intervene.

**Fix:** Validate the final union before writing and return an explicit overflow
result; do not silently drop selections. **S; LOW**.

### F14 — P2: invalid checkout attempts consume the new-order allowance

**Evidence:** `convex/checkout.ts:124`, `convex/checkout.ts:132`,
`convex/checkout.ts:147`, `convex/checkout.ts:160`.

**Repro/impact:** Submit ten delivery attempts without an address, then a valid
collection order. Zero orders exist, but the valid attempt is rate-limited for
the remainder of the hour. Returning a refusal commits the counter increment.

**Fix:** Validate address, cart, and items before spending the new-order budget;
keep an independent invalid-attempt throttle if required. **S; LOW**.

### F15 — P2: replacing resource pages repeatedly scans the entire catalogue

**Evidence:** `convex/catalogAdmin.ts:77`, `convex/catalogAdmin.ts:83`,
`convex/catalogAdmin.ts:97`.

**Repro/impact:** With 110 books, replace an allowed 300-page resource with one
page. Every removed ID rescans books/resources; with default transaction limits
enabled the save throws `Scanned too many documents` and rolls back. The API's
supported input size therefore fails against a modest catalogue.

**Fix:** Collect reference information once, or maintain indexed storage-reference
records; batch deletion if necessary. Preserve shared-file safety from F05.
**M; MED**.

### F16 — P2: fragment search claims completeness while hiding matching leads

**Evidence:** `convex/leads.ts:227`, `convex/leads.ts:235`,
`app/admin/leads/page.tsx:79`.

**Repro/impact:** Seed 26 matches and request the UI's initial 25. The response
contains 25 with `isDone:true` and no cursor, so the remaining lead is unreachable
through pagination and no truncation notice explains it. This reproduces without
F04's second-page exception.

**Fix:** Return truthful completion/continuation state or explicitly communicate
a limited search with a usable narrowing path. Fix with F04. **M; MED**.

### F17 — P2: due-today views do not refresh when the IST date changes

**Evidence:** `convex/leads.ts:154`, `convex/leads.ts:700`,
`app/admin/page.tsx:37`.

**Repro/impact:** The same database gives different due results before and after
IST midnight, but callers pass no changing time argument and there is no scheduled
date-state write. Time alone does not invalidate Convex subscriptions, so an idle
dashboard can miss newly due work. The pure result change is reproduced; live
subscription behavior was not exercised.

**Fix:** Pass a coarse, refreshed IST-day/cutoff argument, or materialize due-state
changes. Convex documents this behavior in its
[query best practices](https://docs.convex.dev/understanding/best-practices/).
**S; LOW**.

### F18 — P2: follow-up changes have no audit trail

**Evidence:** `convex/leads.ts:619`.

**Repro/impact:** Set a follow-up and then clear it. Both writes succeed and bump
revision, but no activity is inserted. Scheduled work can be postponed or removed
without retaining who changed it or the previous value.

**Fix:** Append a same-transaction activity with actor and structured old/new
follow-up values, including clears. **S; LOW**.

### F19 — P2: owner-edited sample posts are still deleted or overwritten by seeding

**Evidence:** `convex/blogAdmin.ts:201`, `convex/devSeed.ts:345`,
`convex/devSeed.ts:397`.

**Repro/impact:** Seed a post, replace it with real copy through `applySavePost`,
then run the local fixture cleanup. The post still carries `sample:true` and is
deleted; reseeding can overwrite it instead. Unlike book/resource saves, post
saves never remove the sample marker. This loses work on development deployments;
the seed's production gate is intact.

**Fix:** Clear `sample` on owner save and test both seed modes. **S; LOW**.

### F20 — P2: a rejected course sync can overwrite last-good artwork

**Evidence:** `scripts/sync-courses.ts:64`, `scripts/sync-courses.ts:84`.

**Repro/impact:** In a temporary copy with a mocked Classplus response, supply two
courses producing the same slug. Both covers overwrite the old file before the
uniqueness check rejects the snapshot. The catalogue stays unchanged, but its
artwork now belongs to the rejected course. The code comment claiming no prior
disk changes is incorrect.

**Fix:** Validate transformed rows before writing files and stage artwork before
promoting the accepted snapshot. **S; LOW**.

### F21 — P2 at scale: erasure processes all history in one transaction

**Evidence:** `convex/account.ts:45`, `convex/account.ts:58`,
`convex/account.ts:62`.

**Repro/impact:** Seed 17,000 text activity records in separate bounded setup
transactions, enable default transaction limits, then erase the account. The
mutation throws and leaves the Person unerased. The single transaction has no
continuation strategy. This is a long-history scale defect, not an assertion
that current users already have that history.

**Fix:** Immediately revoke access/mark erasure, then execute bounded, idempotent
history cleanup with observable completion. Coordinate with F03/F10/F11.
**L; HIGH** because interruption/retry and privacy semantics must hold.

## Two additional defects before live payments

### P01 — collection orders can enter a fulfilment dead end

**Evidence:** `convex/orders.ts:54`, `convex/orders.ts:55`,
`convex/orders.ts:267`. A paid collection order can become `packed`, but the
transition graph cannot then reach `ready_for_collection` and fulfilment guards
refuse shipping. Reproduced with a paid fixture. Make allowed transitions depend
on fulfilment, or support packing collection orders deliberately. **S; LOW**.

### P02 — paid cancellations cannot later record their refund

**Evidence:** `convex/orders.ts:54`, `convex/orders.ts:60`,
`convex/orders.ts:255`. Staff can cancel a paid order; `cancelled` then has no
outgoing transitions, including an owner refund. Reproduced with a paid fixture.
Separate payment/refund state from fulfilment cancellation, or define the
recovery transition explicitly. A status click must never be proof that a
provider refunded money. **M; MED**.

These are current state-machine errors, but public checkout currently creates
only `awaiting_payment`. They become live-money blockers when provider payment
confirmation is enabled. Missing Razorpay integration itself is already planned.

## Improvement areas, separate from confirmed defects

1. **Exercise public authorization boundaries in durable tests.** Existing suites
   heavily call helpers with constructed Viewer objects. For example,
   `convex/people.db.test.ts:42` tests an owner count and boolean rather than
   attempting last-owner demotion through `setRole`. Add real component/session
   fixtures for anonymous, student, staff, owner, expired/revoked sessions,
   cross-person IDs, and account deletion. Enable transaction limits in the
   relevant scale tests. Preserve the fast helper tests. **M; HIGH value**.
2. **Finish data-lifecycle policy.** Erasure also leaves old `carts` and
   `resourceOpens` rows; locally confirmed. Decide which pseudonymous records
   should remain, then clean up those with no retention purpose. Rate-limit keys
   include phones/IPs, and opportunistic pruning only runs on later traffic;
   empty OTP leases also persist. Add explicit retention/pruning rather than
   assuming counters disappear with time. **M**. No legal-compliance verdict is
   made; the public policy is still an unapproved draft.
3. **Make shipping data bounded and operationally usable.**
   `convex/checkout.ts:50` bounds line1/city but not optional line2/district;
   20,000-character optional fields were accepted. `convex/orders.ts:280` also
   accepts arbitrarily long courier names/tracking numbers. Add shared bounds
   and realistic PIN validation; client field limits are supplementary. **S**.
4. **Keep v2's audit model queryable.** Existing order activities identify the
   order in free text (`convex/orders.ts:299`) without an order foreign key.
   Use structured entity IDs in the planned audit/lead activity split, typed
   transition data, and a deliberate retention policy. Do this in v2 rather
   than building another competing audit abstraction. **M**.
5. **Use typed Convex env and focused domain helpers.** `convex/convex.config.ts`
   declares no env contract while handlers read `process.env`. The installed
   guidelines support typed app env. Adopt that at the v2 boundary; keep public
   handlers small, retain centralized authz/result validators, and extract
   persistence helpers only where they remove repetition. **S–M**.
6. **Complete import validation and runtime observability.** The Classplus script
   casts upstream JSON, reads one `limit=60` page, and has no explicit timeout.
   Validate a complete snapshot, define pagination/timeout/failure behavior, and
   retain last-good data. Add non-PII delivery failure categories/correlation IDs;
   `app/actions/lead.ts:104` currently suppresses every delivery detail into one
   generic log. Verify forwarded-IP provenance on the chosen host; a parser
   validates an address, not which proxy supplied it. **M**.

## Dependency and build posture

`next@16.3.5` and `sharp@0.35.4` are present. Patch Next to at least the verified
[16.3.8 security release](https://github.com/vercel/next.js/releases/tag/v16.3.8)
and resolve Sharp to at least 0.35.5, following its
[upstream advisory](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w).
Re-read the installed Next guides after upgrading, keep `bun.lock` consistent,
and rerun check/build plus image/auth smoke tests.

The raw advisory count is not a vulnerability count for this app:

- No `next/og` or `ImageResponse` use was found; the reported critical
  ImageResponse issue has no demonstrated application path here.
- Image optimization is used with remotePatterns, but the reported SSRF requires
  control of an allowlisted remote host/DNS. The current hosts are Convex and
  YouTube; this prerequisite was not established. Pinning the actual Convex
  deployment is still sensible narrowing, not proof the current app is exploitable.
- The Sharp advisory concerns SVG decoding under particular runtime conditions.
  No end-to-end exploit path or deployed runtime exposure was established.
- MCP/proxy-addr/brace advisories are largely under the shadcn tooling dependency;
  the app does not start an MCP/Express service from them. Hono's serveStatic issue
  was not found on an application route. Do not describe these as exposed Convex
  vulnerabilities solely because they appear in the lockfile.

Resolve the reproducible Turbopack/font build failure before claiming release
readiness. It is separate from both the passing local check and dependency audit.

## What is already sound / rejected findings

- Central database-derived role/owner checks exist. Actual public-boundary probes
  refused student escalation, last-owner demotion, and an eight-day-old staff
  session. No cross-person authorization bypass was demonstrated.
- All registered functions have args/returns validators; public projections are
  deliberately narrower than stored records. Retain these conventions.
- Order pricing reads server-side books/cart, freezes totals, and clears the cart
  in the same mutation. Same-key retries return the original order and reject
  keys belonging to another person. F08 is a recovery/caller defect.
- OTP hashes, bounded attempts, phone normalization, generation checks, and
  fail-closed transport selection are implemented. F03/F10 are lifecycle edges,
  not a reason to discard those safeguards.
- Normal check-then-write mutations are serializable; no generic "race" finding
  is raised for transactional upserts, role counts, or reference allocation.
- Phone-keyed Persons, Classplus course payments, availability switches rather
  than stock counts, page-image resources, and persistent storage URLs are
  documented choices. They are not bugs merely for differing from another stack.
- An authenticated enquiry HTTP route with a dedicated ingest secret is intended.
  Source enquiry idempotency and the logger's development-deployment gate are
  retained rather than re-reported as defects.
- Planned schema v2, bundle commerce, permissions, provider configuration,
  receipts, WhatsApp delivery, and Razorpay verification remain launch work;
  this audit does not claim they have been implemented or tested live.

## Recommended execution order

1. Land durable reproductions for F01–F04 and real auth-boundary fixtures first.
2. Fix identity/revocation and erasure together: F01/F03/F09/F10/F11/F21.
3. Fix cart ownership and acknowledgement as one coherent slice:
   F02/F06/F07/F08/F12/F13/F14. Keep the server as pricing authority.
4. Repair lead pagination/completeness and temporal refresh:
   F04/F16/F17/F18. Include 201-row and 26-match fixtures.
5. Fix file retention/cleanup and authoring preservation:
   F05/F15/F19/F20. Run cleanup with transaction limits enabled.
6. Carry P01/P02 and structured order/payment identity into schema v2 before
   taking money. Patch dependencies and restore the production build gate.

These are sequencing recommendations, not approved implementation work or new
Linear issues. Keep the October ship plan as launch authority and fold selected
fixes into it. No implementation branch, PR, commit, push, deployment, or provider
change was created by this audit.

## Remaining verification limits

No live Convex deployment, deployment schema checks, production logs, provider
credentials, actual WhatsApp/Razorpay/Classplus transactions, hosted CI result,
real uploads, browser overnight subscription, mobile device, or network-failure
journey was verified. No load test or p99 latency claim is made. Passing local
tests cannot close these gates, and this review cannot prove the absence of
all remaining logic errors.
