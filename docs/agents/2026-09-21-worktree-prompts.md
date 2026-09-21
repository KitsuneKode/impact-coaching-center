# Worktree delegation pack — 21 September 2026

These are execution prompts linked to real Linear tickets, not replacement issue records. Each fenced prompt is self-contained. Use one prompt per worktree and one writer per shared file.

**Read `docs/agents/2026-09-21-execution-runbook.md` first.** It supersedes the
point-in-time branch/status assumptions below. Latest observed local implementation
is `5650e02`: sign-in/inbox already exists and KIT-54 is now review/completion,
not a rebuild. Local `main` remains stale. KIT-45/50 now show Done in Linear,
but KIT-50's unchecked owner answers remain an evidence gate. Do not dispatch from
status labels or branch names alone.

## Current handoff

- KIT-39 foundation, KIT-49 OTP send limits, KIT-51 client reconciliation and KIT-52 hygiene are marked Done in Linear; do not redo them. Done does not mean merged/live.
- KIT-45 policy/contact and KIT-50 library decisions remain In Progress. Existing policy/library routes and later rate-limit fixes are on the stacked branch.
- Latest inspected stacked commit: `204c787` on `bhuyanmanash2002/kit-45-policy-pages-and-contact`. The sign-in spike is PARTIAL; its build plan exists but runtime qualification is outstanding.
- Current root worktree has uncommitted enquiry feedback corrections and approved editorial/state specification changes. New worktrees do not inherit those changes.
- Before implementation, the integration owner must provide an explicit committed baseline containing reviewed fixes, latest plans/spec and shared contracts. Do not automatically cherry-pick an unreviewed stack or mix another worktree's uncommitted changes. Planning may begin read-only meanwhile.

## Launch lanes

1. Auth lane: KIT-53, then KIT-54, then KIT-55 (sequential where shared contracts change).
2. Editorial lane: KIT-56 design now; implementation after KIT-55.
3. Books lane: KIT-57 design now; implementation after KIT-55; KIT-59 then KIT-60.
4. Resources lane: KIT-58 design now; clarify downloads before delivery implementation.

Do not launch all twelve implementations simultaneously. KIT-61 also waits for provider access; KIT-62 waits for owner library answers; KIT-63 follows shared admin. KIT-64 can start with the runbook and add qualification as features land. Hosted auth/Reader/checkout additionally need KIT-46; learn-domain migration remains documentation-only.

## Shared-file ownership and acceptance

The integration owner coordinates convex/schema.ts and generated files, app/layout.tsx, navigation/sitemap, components/ui, package.json/bun.lock and global plan/spec edits. Feature agents propose minimal changes and agree ownership before touching these files. Never copy environment secrets between worktrees or deploy them into the same shared Convex environment without coordination. Use isolated local/approved development data.

Each ticket reports: changed files, behavior implemented, verification evidence, unresolved decisions, dependency contracts and remaining release gates. Keep status In Review when implementation is ready; do not call an unmerged or unqualified feature live. User asked implementation focus: run existing proportionate checks, no new testing framework or broad repeated audit.

## KIT-53: Concurrent OTP resend safety

[Open ticket](https://linear.app/kitsunekode/issue/KIT-53)

```text
Work on KIT-53 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Fix the non-atomic delete-old-code / plugin-insert sequence in lib/phone-auth.ts. Inspect installed Better Auth/Convex adapter support before choosing an atomic replacement or concurrency mechanism. Must hold across concurrent requests/processes; no in-memory-only lock. Preserve valid-code behavior on refused sends; handle delivery failure, replay, expired leases and retries. Do not enable hosted OTP. Acceptance: demonstrate overlapping sends cannot leave competing accepted codes; keep secrets out of logs except explicitly local logger. Own auth adapter changes; coordinate with sign-in owner.

File ownership:
lib/phone-auth.ts and the smallest supporting Convex/auth operation. Coordinate convex/auth.ts and convex/schema.ts with the integration owner; do not edit sign-in UI.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-54: Sign-in and read-only leads inbox

[Open ticket](https://linear.app/kitsunekode/issue/KIT-54)

```text
Work on KIT-54 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Inspect the existing implementation at 5650e02 and resume only remaining work in docs/plans/2026-09-20-sign-in-and-admin-leads.md. Do not rebuild sign-in/inbox. Follow the runbook's targeted checks for safe return URLs, late OTP responses, provider-unavailable behavior, role revocation, actual cursor pagination and runtime qualification. Local logger only; hosted enablement also requires KIT-46 and concurrent resend safety. No separate signup or duplicate auth system.

File ownership:
app/sign-in/**, components/marketing/sign-in-form.tsx, app/admin/leads/page.tsx, app/providers.tsx, lib/auth-client.ts, convex/leads.ts. Coordinate existing app/admin/layout.tsx, app/layout.tsx, lib/auth-server.ts and role helpers with the integration owner.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-55: Shared admin shell and owner access safeguards

[Open ticket](https://linear.app/kitsunekode/issue/KIT-55)

```text
Work on KIT-55 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Depends on sign-in contract. Establish shared role helpers, owner bootstrap/recovery procedure, last-owner protection, owner-only writes and read-only staff. Reuse Base UI/shadcn dashboard structure without sample metrics or unnecessary charts. Shared paginated-list/field/status patterns, keyboard/mobile layout and forbidden/session-expired states. Own app/admin layout and shared primitives. No arbitrary role elevation from public inputs; no automatic staff exports. Approve bootstrap method before privileged implementation.

File ownership:
app/admin/layout.tsx, components/admin/** and shared authorization/owner-access helpers. Coordinate shared components/ui, schema, package.json and bun.lock centrally.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-56: Blog and Careers publishing workflow

[Open ticket](https://linear.app/kitsunekode/issue/KIT-56)

```text
Work on KIT-56 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Design then implement /blog and /blog/[slug], /careers and /careers/[slug]. Owner edits/publishes; staff read-only. Blog includes student guidance; Careers means jobs at ICT. Draft/published; vacancy closed state removes Apply action. Approved HTTPS/email application destination only; no CV storage or ATS. Stable unique slugs, safe body rendering, publication-filtered paginated queries, draft privacy, stale edit conflicts, metadata/cache invalidation and all specified UI states. Reuse admin authorization and primitives. No fabricated articles/jobs/authors.

File ownership:
app/blog/**, app/careers/**, components/editorial/**, convex/blog.ts and convex/vacancies.ts. Propose schema additions to the integration owner; consume shared admin/auth rather than editing it.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-57: Book catalogue and approved sample previews

[Open ticket](https://linear.app/kitsunekode/issue/KIT-57)

```text
Work on KIT-57 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Design then implement independent owner-managed Book catalogue, /books and detail pages, approved samples and owner CRUD using shared admin. Classplus has no role in Books. Fields include approved title/edition/language/cover/price and boolean availability; no stock counts. Paginated browsing, empty/filter/loading/error states; stable IDs/slugs, safe preview assets. Public browsing ungated. No payments in this slice. Do not invent prices, stock, sample content or claim copyright protection.

File ownership:
app/books/**, components/books/**, convex/books.ts and Book domain helpers. Propose schema additions centrally; do not edit checkout or shared auth.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-58: Resource catalogue and secure reader

[Open ticket](https://linear.app/kitsunekode/issue/KIT-58)

```text
Work on KIT-58 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Design secure catalogue, approved samples and verified-phone Reader with reading/zoom/navigation/loading/error states. Current approved baseline is rasterized reader-only delivery; original-download request remains unresolved and requires explicit owner/maintainer decision. Do not introduce original-file downloads, public storage URLs or client-only access gates. Define safe upload/conversion and storage access before implementation. No executable document content; content and private originals must remain protected. Hosted reading blocked until KIT-46. Reuse shared admin; no separate identity.

File ownership:
resource/reader feature folders and their dedicated backend functions. Storage, conversion and access contracts need design approval; coordinate shared schema/admin centrally.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-59: Book cart, delivery quotes and online checkout

[Open ticket](https://linear.app/kitsunekode/issue/KIT-59)

```text
Work on KIT-59 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
After Book and auth contracts: persistent non-sensitive cart, bounded quantities, server-calculated integer-paise totals and immutable Order snapshots; shipping/ICT collection, online payment only. Shipping unconfigured/unsupported fails closed until approved PIN codes/charges; collection instructions need approval. Reuse Razorpay checkout, no custom card/UPI forms, cash or reservations. Checkout disabled until phone verification works. Handle changed price/availability, double clicks, uncertain timeout, safe retry and pending payment. Design order/payment contract together with fulfilment slice before coding.

File ownership:
app/cart/**, app/checkout/**, components/checkout/** and dedicated order/quote helpers. Coordinate the Order schema and payment contract with KIT-60 before implementation.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-60: Payment reconciliation and owner order fulfilment

[Open ticket](https://linear.app/kitsunekode/issue/KIT-60)

```text
Work on KIT-60 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
After checkout contract: verify Razorpay evidence server-side, idempotent webhook/event processing, ownership checks, reconciliation of missed/late/duplicate/out-of-order notifications. Separate payment and fulfilment states. Owner-only fulfilment/refunds with audit; staff read-only. Paid but unavailable requires explicit resolution not deletion/backorder. Order history/status with recovery states. No live charge/refund without authorization. Refund/collection/shipping policy approval gates launch.

File ownership:
order history/fulfilment feature folders, backend payment reconciliation and owner order operations. Consume KIT-59's agreed Order contract; coordinate webhook routing centrally.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-61: Classplus validated snapshots and owner Resync

[Open ticket](https://linear.app/kitsunekode/issue/KIT-61)

```text
Work on KIT-61 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Implement only against vendor-approved read-only contract. Complete bounded pagination, stable provider IDs/public slugs, validated atomic publish, last-good recovery, overlapping job exclusion, scheduled + owner Resync, sanitized run status. Preserve local visibility overrides; no second course-price authority. Course handoffs use verified provider deep links, never our payment flow. No account/classroom mirroring, session-cookie scraping, iframe/proxy assumption or DNS changes. Provider access can be assumed only for design, not production claims.

File ownership:
scripts/sync-courses.ts, lib/catalogue-import.ts and dedicated Convex catalogue/sync functions. Coordinate scheduler/schema and owner UI; no DNS/auth changes.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-62: Library application and owner review workflow

[Open ticket](https://linear.app/kitsunekode/issue/KIT-62)

```text
Work on KIT-62 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Extend existing draft /library after owner answers; do not rebuild landing page. Design validated application, consent, duplicate handling, owner review and read-only staff visibility. No online payment or invented seat counts/hours/fees. Use shared auth/admin patterns and truthful receipt/loading/error states. Align contact/notification expectations with approved policies.

File ownership:
existing app/library/** and dedicated application backend/admin feature files. Do not rebuild the completed draft page.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-63: Promotions and privacy-safe conversion analytics

[Open ticket](https://linear.app/kitsunekode/issue/KIT-63)

```text
Work on KIT-63 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Design a minimal owner-managed promotion workflow and typed analytics adapter. Schedule/display/dismissal rules, accessible controls, no invented urgency or obstructed checkout. Track course handoff, lead submission, resource gate, book/cart/payment outcomes without names/phone/email/free text or raw provider data. Reuse existing Motion and admin. No charts until useful real metrics exist, no exports by default; no bulk-marketing system.

File ownership:
dedicated promotion components/backend and typed analytics module. Funnel owners add agreed event calls; coordinate layout/header/footer centrally.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```

## KIT-64: Operational alerts, backup and recovery qualification

[Open ticket](https://linear.app/kitsunekode/issue/KIT-64)

```text
Work on KIT-64 in the Impact Website project, in your own isolated worktree.

Read docs/agents/2026-09-21-execution-runbook.md first; its current-state and
acceptance gates supersede older assumptions in this prompt or task plan.

First read the Linear issue AND comments, AGENTS.md, CONTEXT.md, relevant ADRs,
docs/plans/README.md and the current platform specification. Inspect current code
and history; do not repeat completed work or infer implementation from a checked
box. Confirm an explicit committed baseline with the integration owner. If the
required approved spec or prerequisite code is missing, report it; never invent it.

Task:
Document and implement minimal actionable failure visibility for enquiry delivery, sync and payments; safe log redaction, configuration checks, preview/live separation and restore procedure. No secrets or personal payloads in telemetry. Demonstrate recovery with nonproduction data; never overwrite production for a drill. Define operational owner and escalation. Respect deferred hosting decision and documentation-only learn-domain migration. Finish service-specific qualification as those slices land.

File ownership:
operational documentation and narrowly scoped configuration/observability helpers. Coordinate provider-specific changes with the feature owners; no production mutation.

Execution:
Resume an existing task plan where one exists. If none exists, propose a focused
design and file/interface map, obtain approval, then write the build plan under
docs/plans before implementation. You may investigate/design while blocked, but
do not implement dependent writes against guessed contracts. Resolve dependency
status from Linear and code; a Done ticket is not proof its commit is in your tree.

Reuse installed Base UI/shadcn controls, tokens, Tabler and Motion. Do not install a
second design system, auth system or server-data cache. Read installed Next docs
before framework changes. Public/admin lists must have bounded server pagination,
stable IDs, loading/loading-more/empty/no-match/error/retry/end states. Preserve
input on errors and handle session expiry; show success only after acknowledgement.
Enforce permissions server-side. No fabricated content, metrics, fees or policies.

No merge, push, deployment, DNS change, production data change, real payment or
provider-account mutation. Do not overwrite unrelated work or shared files owned
by another agent. Do not add test scaffolding; run existing relevant checks and
required check/build gates for your changes, reporting exact evidence and limits.

Finish with changed files, acceptance results, dependency/interface handoff and
remaining blockers. Update your task plan and Linear with evidence; don't mark
unimplemented design or a release-gated feature as completed/live.
```
