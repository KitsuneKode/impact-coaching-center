# Frontend / Convex split — 22 September 2026

A two-writer arrangement: one agent owns Convex and the domain logic, one owns
the interface. This is the contract between them.

Read `docs/agents/2026-09-21-execution-runbook.md` and
`docs/plans/2026-09-22-commerce-and-account-surfaces.md` first. The second
settles _what_ these surfaces do; this settles _who builds which half_.

## 0. The seam

**Every decision lives in Convex. The frontend renders answers and collects
input.**

That is the whole rule, and it is testable: if a component contains an `if`
that decides whether something is _allowed_, _owed_, _priced_ or _valid_, it is
in the wrong file.

| Belongs in Convex                           | Belongs in a component                    |
| ------------------------------------------- | ----------------------------------------- |
| May this caller do this (`convex/authz.ts`) | Which of the returned states to render    |
| What a cart costs, including delivery       | How money is displayed                    |
| Whether a profile is complete               | Whether the banner is currently dismissed |
| Whether an order may advance                | Which button is disabled while saving     |
| Whether a sample page range is approved     | How pages are laid out and paged through  |
| Validation that decides acceptance          | Validation that gives instant feedback    |

The last row is the one that gets fudged. Client-side validation exists so a
person is not told "invalid" after a round trip; it is **never** the thing that
decides. Both run. The server's answer wins, always.

**Consequences the frontend must honour**

- No component computes a price, a total, a discount or a delivery charge.
  It renders what a Convex query returned, even when the arithmetic looks
  trivial enough to inline. Two implementations of one sum is how a checkout
  charges a number the confirmation email disagrees with.
- No component decides a role. `viewer.role === "staff"` may choose _chrome_
  (`components/admin/admin-shell.tsx` does exactly this) but must never be the
  only thing standing between a person and data.
- Mutations take the expected `revision` and surface `revision-conflict` by
  re-presenting what the person typed. KIT-55 built this; using it is not
  optional.

## 1. Ownership

**Convex agent owns:** `convex/**`, `lib/` modules that are pure domain logic
(`lib/leads.ts`, `lib/phone-auth.ts`, `lib/otp-transport.ts`, `lib/policies.ts`),
and proposes `convex/schema.ts` changes.

**Frontend agent owns:** `app/**` (except route handlers), `components/**`,
`app/globals.css`, `docs/design-guide.md`.

**Shared, changed only by agreement:** `convex/schema.ts`, `app/layout.tsx`,
navigation and sitemap, `components/ui/**`, `package.json` / `bun.lock`.

One writer per file. If a task needs a file the other owns, it asks rather than
edits.

## 2. The interface contract

Before the frontend builds a screen, the Convex agent publishes the function
names and their return shapes. Not prose — the actual signature, in code.

Every list returns the pagination envelope KIT-55 established. Every protected
read or write returns a **discriminated result** whose refusal names its
category (`anonymous`, `forbidden`, `missing-record`, `invalid-input`,
`revision-conflict`) rather than a bare boolean. The frontend renders a
different thing for each; collapsing them is what produces "something went
wrong" screens that tell nobody anything.

Note the discriminant trap already hit once on this codebase: `Refusal` is
`{ ok: false, … }`, so `"ok" in result` is **always true**. Use `result.ok`.
Typecheck caught it last time; it would have shipped as silent data loss.

## 2.5 Sequencing — integration before new surfaces

A second agent reviewed the repository on 22 September and reached a
conclusion worth adopting: **consolidate what exists across branches, then
finish one complete customer journey — do not add more disconnected screens.**

That is right, and it changes the order below. This branch alone differs from
`main` across 84 files, mixing authentication routes, owner controls,
typography, themes and dependencies. KIT-53 and KIT-54 read Done in Linear
while their implementations are not all on `main`. Done is not merged, and
merged is not qualified.

**Integration comes first, staged, in this order** — each stage reviewable on
its own rather than as one 84-file cherry-pick:

1. OTP concurrency (the separate `kit-53-otp-resend` worktree).
2. Sign-in response and session handling.
3. Shared authorization and owner safeguards (KIT-55).
4. Admin navigation and pagination.
5. Visual changes and dependencies.

**Then one vertical journey, end to end**, rather than four horizontal layers:

> owner publishes a book → visitor previews it → verified customer orders it →
> owner fulfils it

Every prompt below is scoped to a slice of that journey. A slice that cannot
be walked end to end is not done, however many of its tests pass.

**Two corrections to that review**, checked against this tree rather than
assumed. It reports a contract document at
`docs/plans/2026-09-22-auth-admin-contract.md` that describes `/sign-in` and
thrown mutation errors. No such file exists; the real one is
`docs/plans/2026-09-22-shared-admin-contract.md`, it is **tracked**, it
specifies typed decision results _over_ throws, and it never mentions
`/sign-in`. It also reports the misleading "to follow up" count as present —
true on `main`, removed on this branch in `f0e73a9`, where only the comment
explaining its removal remains.

**One bullet of that finding does stand, and matters.** The contract's recovery
story covers _zero owners_ — patch a row again — but says nothing about **an
existing owner who loses access to their verified phone number.** With
phone-only identity and no email recovery (ADR-0001), that person cannot get
back in, and last-owner protection means nobody can be promoted past them. It
needs an audited, staff-assisted number change recording actor, previous
number, new number and reason, which the spec already requires at §Identity and
which nothing implements. Raised as an open decision in §8.

## 3. Prompts for the Convex agent

One prompt per worktree. Each is self-contained.

Run **C0 before any of the others.**

### C0 — Staged integration review

```text
Work on integrating existing branch work in the Impact Website project. This is
a review and integration task, NOT an implementation task. Do not rebuild
features that already exist.

Read docs/agents/2026-09-21-execution-runbook.md §0,
docs/agents/2026-09-22-frontend-and-convex-split.md §2.5, and
docs/plans/README.md first.

Context:
Work is spread across main, the kit-53-otp-resend worktree and the
kit-45-policy-pages branch. That last one differs from main across 84 files,
mixing auth routes, owner controls, typography, themes and dependencies.
Linear marks KIT-53 and KIT-54 Done, but their implementations are not all on
main. Treat ticket status as a claim to verify, never as evidence.

Task:
Review and integrate in five separate stages, each landing on its own and
reviewable alone:
1. OTP concurrency.
2. Sign-in response and session handling.
3. Shared authorization and owner safeguards.
4. Admin navigation and pagination.
5. Visual changes and dependencies.

Do not cherry-pick whole branches blindly. Do not stash, reset or clean another
worktree. For each stage report what moved, what conflicted, and what you chose.

Known true, do not re-litigate: main's convex/leads.ts takes 100 records and
app/admin/leads/page.tsx presents that as a follow-up count. It is misleading
and it is already fixed on the newer branch - integrate that fix, including its
status ordering, rather than writing a third version.

Acceptance:
bun run check and bun run build green after each stage, not only at the end.
Report integration evidence separately from ticket status: implemented, locally
verified, merged and live are four different claims.
```

### C1 — Person profile: names, questionnaire, completion state

[KIT-55 follow-on](https://linear.app/kitsunekode/issue/KIT-55)

```text
Work on the Person profile backend in the Impact Website project, in your own
isolated worktree.

Read AGENTS.md, CONTEXT.md, convex/_generated/ai/guidelines.md, ADR-0001,
docs/plans/2026-09-22-commerce-and-account-surfaces.md and
docs/agents/2026-09-22-frontend-and-convex-split.md first. Inspect current code
before writing; convex/authz.ts, convex/persons.ts and the revision convention
already exist and must be reused, not reimplemented.

Task:
persons.name is a single v.string(). Split it into given and family name
without a destructive migration: add the new optional fields, derive them on
read where absent, and backfill through the existing revision convention rather
than a schema rewrite. Existing rows must keep working untouched - absent
revision already means zero, and the same tolerance applies here.

Add questionnaire storage for exactly three answers: target exam, attempt
status (first attempt or repeater), preferred batch. Store them so that
"skipped" and "never asked" remain distinguishable - a null and a missing field
are different facts and the funnel depends on telling them apart.

Expose one query that answers whether a profile is complete and what is still
missing. The frontend must not assemble that verdict from parts; it renders the
answer.

Name is required, the questionnaire is optional. Enforce both server-side.
Never accept a role, a completion verdict or a revision from client input.

Acceptance:
convex-test coverage in the existing style for: first write on a pre-existing
row with no revision, a revision conflict preserving input, a skipped
questionnaire, and a partially answered one. bun run check and bun run build
stay green. Report the exact query and mutation signatures - the frontend is
blocked on them.

File ownership:
convex/persons.ts, convex/schema.ts (coordinate), and new convex modules.
Do not edit anything under app/ or components/.
```

### C2 — Books catalogue

[KIT-57](https://linear.app/kitsunekode/issue/KIT-57)

```text
Work on KIT-57 in the Impact Website project, in your own isolated worktree.

Read the Linear issue and comments, AGENTS.md, ADR-0002, ADR-0003,
docs/plans/2026-09-22-commerce-and-account-surfaces.md and
docs/agents/2026-09-22-frontend-and-convex-split.md first.

Task:
Owner-managed Book catalogue in Convex. Fields: title, edition, language,
cover, price, boolean availability, stable slug, and the approved sample page
range. NO stock counts - ADR-0002 forbids them and the ticket repeats it.
Classplus has no role in Books.

Public list and detail queries, ungated, using the KIT-55 pagination envelope
with a declared indexed sort order. Separate public and admin projections: the
public shape must not carry anything an owner sees. Owner CRUD behind
requireOwner, every write re-checking at the point of the write.

Slugs are stable after first publication. A draft must be private by ID and
slug and absent from metadata - not merely unlinked.

Do not invent titles, prices, editions or sample content. If ICT has supplied
no books, ship the schema and queries with an empty table and say so; an empty
catalogue is a true state and the frontend has an empty state for it.

Acceptance:
convex-test coverage for pagination boundaries, draft invisibility to an
anonymous caller, and owner-only writes. Report the query and mutation
signatures and the exact public projection.

File ownership:
convex/books.ts, convex/schema.ts (coordinate). Nothing under app/ or
components/.
```

### C3 — Cart, orders and Razorpay

[KIT-59](https://linear.app/kitsunekode/issue/KIT-59) then
[KIT-60](https://linear.app/kitsunekode/issue/KIT-60)

```text
Work on KIT-59 in the Impact Website project, in your own isolated worktree.
Do not start KIT-60 until KIT-59's contract is committed.

Read the Linear issues, ADR-0002,
docs/plans/2026-09-22-commerce-and-account-surfaces.md and
docs/agents/2026-09-22-frontend-and-convex-split.md first.

Task:
Server-side cart, orders and a server-verified Razorpay flow.

The cart lives in localStorage until sign-in and then merges server-side. You
own the merge mutation. The rule is union, keeping the newest quantity per
title, and it must never silently discard what was added before signing in.

Totals are computed in Convex and only in Convex - line totals, delivery, and
the sum. The frontend renders them. It must be impossible for a component to
have its own opinion about what something costs.

Price at add versus price at pay is UNDECIDED. Do not pick one silently.
Implement the snapshot so either policy is expressible, surface both numbers
when they differ, and report the choice as an open decision.

Razorpay runs in test mode, through Standard Checkout. Do NOT build custom
card or UPI entry UI - we keep our branded cart and order screens and hand off
to their checkout.

Required, and each of these is a known way this goes wrong:
- All money in integer paise, computed server-side. No floats anywhere.
- Persist an immutable order snapshot BEFORE opening payment.
- Keep our order, the payment attempts and the provider's identifiers as
  separate records. One order can have several attempts.
- Verify the checkout signature against the server-stored order id.
- Fulfil only on verified CAPTURED payment. Not a browser success message,
  not an authorization.
- Validate webhook signatures against the RAW body. Deduplicate events and
  tolerate out-of-order delivery - Razorpay documents both as expected.
- Reconcile uncertain payments. Record refunds independently of fulfilment.

Handle explicitly: the buyer closes checkout, loses connectivity after paying,
double-clicks, uses two tabs, capture is delayed, two attempts both succeed,
the webhook arrives before the browser returns, a refund fails, and a book
becomes unavailable mid-checkout.

Delivery or ICT collection both supported. Collection must NOT require a
shipping address. Missing shipping configuration disables shipping; it must
never silently imply free delivery. Cash on collection awaits owner review -
leave the seam, do not build the flow.

Acceptance:
convex-test coverage for the merge rule, total computation in paise, refusal of
an unverified payment confirmation, webhook signature rejection, and duplicate
webhook delivery. Report signatures and the shape of every refusal category.

File ownership:
convex/cart.ts, convex/orders.ts, convex/payments.ts, convex/schema.ts
(coordinate). Nothing under app/ or components/.
```

### C4 — WhatsApp OTP transport

[KIT-46](https://linear.app/kitsunekode/issue/KIT-46)

```text
Work on KIT-46 in the Impact Website project, in your own isolated worktree.

Read the Linear issue, lib/otp-transport.ts, convex/auth.ts, convex/otp.ts and
the "Delivery channel" and "Testing strategy" sections of
docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md first. The
strategy is already decided; do not re-derive it.

Task:
Implement the "whatsapp" branch of sendOtp against the WhatsApp Cloud API. The
abstraction already exists and currently throws rather than pretending - keep
that property. Driven entirely by deployment environment variables; never a
hardcoded id, token or template name.

OTP must be sent as a pre-approved AUTHENTICATION template. A free-form message
containing a code is not permitted by Meta and will be rejected.

Delivery failure must fail the request. The plugin writes the verification row
BEFORE calling sendOTP, so a swallowed error leaves a stored, still-acceptable
code that nobody received. Awaiting the send is what prevents that; do not
background it.

chooseTransport must keep failing closed on an unset variable, and the logger
transport must keep refusing to run against a non-local CONVEX_SITE_URL. Do not
weaken either check to make testing easier.

Record send outcomes with the provider message id and delivery status, so staff
can tell "never received" from "entered wrong".

Testing: layer 1 (logger) already works and must keep working. Layer 2 is the
Meta test number - free template sends to up to five verified recipients with
no payment method on file. The credentials are the owner's to create; build
against the variables and report exactly which are required.

Acceptance:
Unit coverage for template payload shape, failure propagation and fail-closed
configuration, without sending real messages. State plainly that the live
network path is unverified until credentials exist. Do not claim otherwise.

File ownership:
lib/otp-transport.ts and the smallest supporting Convex operation. Coordinate
convex/auth.ts. Nothing under app/ or components/.
```

## 4. Frontend lane — what I build

Ordered so each piece is usable when the Convex half lands, and so nothing
waits on a contract it could have been built beside.

### F0 — The state convention, as code (first, everything depends on it)

`docs/design-guide.md` §6 defines nine states in a table. A table cannot be
imported. Five surfaces are about to implement it independently and they will
drift, exactly as the admin panels drifted.

Build it once: a page shell that always renders its heading, and a list
container that takes a query result and renders loading / loading-more / empty
/ no-match / error+retry / unavailable from one place, using `Skeleton`,
`Spinner` and `Empty`. Then `/books`, `/account/orders`, `/admin/leads` and
`/admin/people` are compositions rather than re-implementations.

This is the single highest-leverage frontend item, and it is what makes the
other agent's work plug in rather than need adapting.

### F1 — Post-verification name step

The gap proven on 22 September: a verified Person shows as their own phone
number twice over, with an avatar reading "45". Required, first and last name,
immediately after the code is accepted. Blocked on C1's signature only for the
write; the screen can be built ahead.

### F2 — Questionnaire banner and form

`components/ui/questionnaire.tsx` already exists and is unused. Three fields,
skippable, re-prompted by a dismissible banner that survives navigation and
does not nag within a session.

### F3 — Books: list, detail, sample Reader

Public and ungated. The Reader is shared with Resources (KIT-58) and serves
pre-rasterized page images per ADR-0003 — no PDF engine, no download, and copy
that never implies a sample is protected.

### F4 — Cart and checkout

localStorage until sign-in, then C3's merge mutation. Totals rendered, never
computed. Sign-in at checkout uses the existing intercepting-route modal.

### F5 — `/account`

Orders, the person's own details, saved addresses. Initials avatars only.

### F6 — Repairs found in the walkthrough, worth doing before new surfaces

- **Width discipline.** On `/library` and `/contact` the `h1` runs to ~810px,
  the body column stops at ~640px, and the right half of a 1440 viewport is
  empty. Three measures, no shared axis. This is most of what "feels weird".
- **KIT-44's reveal defect.** 27 blocks server-render at `opacity: 0` and
  depend on JS. Captured mid-fade on `/courses` and `/contact` seconds after
  navigation. On a budget Android this is the first impression.
- **Four `rounded-[0.75rem]`** remain off-scale; 12px matches no token.
- **The phone field accepts letters.** It validates and refuses correctly, but
  a `tel` input should not take `abcdef` in the first place.
- **The login page lacks the description line its modal has.**

### F7 — KIT-66 home page

Deferred by the owner; four decisions still open on the ticket.

## 5. Practices

**Reuse before building.** Thirty-two primitives are installed. Check
`components/ui/` first — `questionnaire.tsx` sat there unused while the
questionnaire was discussed as unbuilt work.

**Base UI, not Radix.** `components.json` says `"base": "base"`. Radix blocks
use `asChild` where Base UI uses `render`; pasting one drags a second primitive
library into the bundle. Use Radix-based registries as _visual reference_ and
rebuild. Aceternity is compatible but ships raw colours and hardcoded `dark:`
variants that the `shadcn/no-raw-colors` **error** rule rejects — adopt by
adapting to tokens, never by installing.

**Tokens only.** No raw colours, no arbitrary radii. The linter enforces both.
Undeclared theme colours generate _no CSS at all_ — that is how the admin
sidebar nearly shipped unstyled.

**Never `transition-all`.** There is a test guarding it. Name what moves.

**Forms.** `Field` with `data-invalid` and `aria-invalid`, validate on blur,
re-validate on change only after a field has already failed, `+91` as a
non-editable `InputGroup` addon, `InputOTP` for codes, and input preserved on
every failure.

**Every page keeps its heading in every state.** A page that cannot say what it
is until data arrives has nothing for a screen reader to announce.

**Success only after acknowledgement.** Never optimistic for money, a message
or a record.

**Transactional screens get no reveal animation.** A form does not introduce
itself.

## 6. Dashboards — what actually makes them good

The admin screens were built and then looked wrong, and the reason was
diagnosable rather than a matter of taste. Recorded so it is not rediscovered.

**One axis.** `Empty` centres itself inside whatever box it is given, so a
left-aligned `h1` sat above a panel floating mid-viewport. Nothing else was
wrong, and it read as unfinished. Heading, icon, title, description and action
share one left edge.

**Density is the point.** An admin screen is used for hours by the same four
people. It is not a marketing page and should not inherit its generous
vertical rhythm. Tabular numerals for anything numeric, so columns align.

**Hide what is not theirs, never disable it.** A disabled control tells staff a
capability is being withheld from them; absence says it is not their job.

**Never show a count derived from one page.** "N to follow up" computed from a
partial fetch stops being true at the second page, and a number that looks
authoritative and is wrong is worse than no number.

**Refusals speak in the backend's own words.** An owner who cannot remove
someone needs to know it is last-owner protection, not a network blip.

**Distinguish "misconfigured" from "down".** Staff can wait out one of them.

**Loading is the shape of the answer.** A skeleton table teaches the reader
that a table is coming; a spinner teaches nothing.

**Mobile matters more than it looks.** ICT's staff will open the inbox on a
phone. The registry sidebar already gives a sheet, a rail and a keyboard
shortcut — keep them.

## 7. Open decisions that block implementation

Commercial policy is never invented. A missing answer disables the feature; it
does not become a default. Missing shipping configuration disables shipping —
it must never silently imply free delivery.

1. **Owner recovery when the owner loses their phone.** Phone-only identity,
   no email recovery, plus last-owner protection, means one lost handset locks
   everyone out permanently. Needs an audited staff-assisted number change
   recording actor, previous number, new number and reason.
2. **Price at add versus price at pay.**
3. **Shipping**: approved PIN coverage, charges, dispatch expectations, returns.
4. **Collection**: hours, identification, holding period, uncollected orders.
5. **Books**: approved catalogue, prices, sample rights, max quantity per order.
6. **Refunds**: cancellation eligibility, who approves exceptions, partials.
7. **Resources**: reader-only, or downloadable originals for selected
   materials. Reader-only is the current baseline and ADR-0003 forbids changing
   it without a formal reversal.
8. **Publishing**: does editing a published article change it immediately, or
   create a draft. Do not accidentally implement both.
9. **Cash on collection** — ADR-0002 records it as awaiting owner review.

## 8. Review protocol

The Convex agent's work comes to me for review. I check, in this order:

1. **The seam** — did any decision leak into a component, or any presentation
   into Convex.
2. **Refusal categories** — five distinct, none collapsed, discriminated on
   `result.ok`.
3. **Pagination** — envelope used, sort order declared, no count from a partial
   page.
4. **Revision** — taken, verified transactionally, conflict preserves input.
5. **Authorization at the point of the write**, not once at the top of a
   handler that then awaits.
6. **Evidence** — tests that exercise the behaviour, not tests that mock past
   it. A passing build is not proof of runtime integration; the account-menu
   crash passed 216 tests and a production build.
