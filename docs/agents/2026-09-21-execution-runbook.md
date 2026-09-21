# Parallel execution runbook — 21 September 2026

Read this before the per-ticket prompts in `2026-09-21-worktree-prompts.md`.
This is a coordination/acceptance contract, not permission to merge, deploy or
change provider accounts. Do not claim all edge cases are eliminated by a plan.

## 0. Establish the actual baseline

Observed during this review: root is `df2faa8` with uncommitted fixes/spec changes;
local `main` is still `059ccf2`. The other worktree is at `5650e02`, on a branch
named `bhuyanmanash2002/kit-53-reproducible-client-materials`. It contains merge
commits `1e8c293`/`9c5d7d8` and the sign-in implementation. These observations do
not establish remote main state or fresh runtime verification. Its branch name
does NOT match Linear KIT-53 (OTP concurrency). Do not rename or overwrite another
agent's branch; verify the ticket title and diff when assigning work.

Coordinator duties before launching implementation workers:

1. Inventory worktrees and their owners, dirty state and exact HEADs. Do not stash,
   reset, switch or clean another agent's worktree. Identify which commits are
   already integrated; never replay them automatically.
2. Select an approved committed integration baseline containing latest reviewed
   source and the approved spec/runbook. Reconcile root-only changes explicitly.
   Obtain permission before committing/merging if not already authorized. Until
   then, agents may inspect/design, but dependent implementations must not guess.
3. Record BASE_SHA, branch, paths, owners, environment/ports and allowed files in
   the dispatch message. New worktrees branch from BASE_SHA, not moving `main`.
4. Create each worktree using the product's isolated-worktree mechanism where
   available. CLI alternative after approval: `git worktree add -b <unique-branch>
<absolute-new-worktree-path> <BASE_SHA>`. Resolve these values first; never paste
   placeholders or reuse an occupied path. Each worker checks its cwd and HEAD.
5. Give each worker a separate local Convex deployment/ports or an approved isolated
   dev environment. Do not copy `.env.local` wholesale or print secrets. Do not
   let multiple `convex dev` processes deploy different schemas to one backend.
6. Subagents do not become isolated merely by being spawned. Explicitly assign
   their worktree path and verify their tool calls use it. Keep one writer per
   worktree; review-only agents may share a tree without editing.

## 1. Dispatch in waves

With four available agent slots, use one coordinator and three workers; four
independent worker sessions are an alternative, not extra slots in this session.

| Wave                            | Worker A                                                    | Worker B                                        | Worker C                                            |
| ------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| A                               | KIT-53 concurrency; then narrow KIT-54 existing-code review | KIT-56 editorial design/schema proposal         | KIT-57 Books design/schema proposal                 |
| B                               | KIT-54 runtime completion; then KIT-55 auth/admin contracts | KIT-58 resource design and unresolved decisions | KIT-64 operational runbook; no production drill     |
| C, after shared contract commit | KIT-56 implementation                                       | KIT-57 implementation                           | KIT-58 approved local implementation                |
| D, after Book/Order contract    | KIT-59 then KIT-60 in one coordinated payment lane          | KIT-63 promotions/analytics                     | KIT-61 or KIT-62 only if their external gates clear |

Design workers deliver small decisions/file maps, not speculative mock backends.
Only start implementation after the design is approved and prerequisite code is
in the worktree. Reuse existing plans; do not recreate completed slices.

## 2. Shared contract freeze

KIT-55/integration owner must publish these interfaces in code and a short handoff
before dependent admin writes begin:

- Domain Person identity and shared backend owner/staff-read authorization helpers;
  no client-supplied role and no public self-promotion. Explicit anonymous,
  forbidden, missing-record, invalid-input and revision-conflict categories.
- Owner bootstrap and recovery procedure reviewed before use; first/last-owner
  safety and immediate authorization recheck on every protected operation.
- A common integer revision convention for edits: mutation takes expected revision,
  verifies it transactionally, increments on success; conflicts preserve input.
- Native Convex pagination envelope, declared indexed filters/sort order per feature
  and public versus admin projections. Public Load more; admin bounded cursor
  history. No global-looking counts or sorting computed from a partial page.
- A single loading/error/empty/retry convention built from existing primitives.
  Choose the installed-client error recovery behavior explicitly; never promise
  retained later-page data if the chosen error boundary discards it.
- Public publication invalidation strategy covering lists, detail, metadata and
  sitemap. Draft privacy cannot rely on a hidden link or stale public cache.

Coordinator owns shared schema/generated files, layout/navigation/sitemap and
dependency changes. Feature workers submit exact schema/index proposals; after
approval the coordinator integrates them and supplies a new contract commit.
Do not let every worker generate its own incompatible role/table abstraction.

## 3. Feature ambiguity and edge-case checklist

### KIT-53/54: OTP and existing sign-in

KIT-54 must inspect `5650e02`, not build the same pages again. Include
`components/marketing/sign-in-form.tsx`, `app/admin/leads/page.tsx` and existing
`app/admin/layout.tsx` in its scope. Verify these hypotheses against current code:

- Return destinations: parse against the allowed origin, reject protocol-relative,
  backslash-normalized external URLs, unsafe schemes and ambiguous repeated next
  parameters. Use a safe internal fallback; never pass unchecked input to routing.
- A late send/verify response for the previous phone must not overwrite current
  input/session flow. Preserve navigation intent without exposing sensitive URLs.
- Per-phone concurrency must hold across backend instances; refuse/serialize
  overlapping sends without accepting superseded codes. Analyze delivery timeout,
  worker crash, lease expiry and stale lease holder if a lease design is chosen.
- Actual paginated inbox, not `.take(100)` labelled complete. Define ordering and
  permitted status filters; empty and forbidden states must be distinct.
- No configured provider must show a safe unavailable state on admin routes too.
  Logout/role revocation clears protected data and rejects subsequent operations.
- Verify local cookies, anonymous public rendering, OTP/session/role behavior.
  A passing mocked test or static build does not prove this runtime integration.
- Turnstile/abuse protection and session lifetime decisions are hosted-release
  requirements, not silently waived by the local spike. No hosted OTP until
  KIT-46 and send/concurrency controls are qualified. No email fallback.

### KIT-56: publishing

Proposed minimal defaults to approve in its design: Markdown without HTML/MDX;
approved assets only; stable slug after first publication; explicit manual closing
of vacancies; no scheduling or parallel unpublished revision system initially.
If a deadline is displayed, define its timezone and ensure Apply cannot remain
active past it. Decide whether editing a published record updates it immediately
or requires unpublishing; do not implement both accidentally. Real application
destination and content approval are publication gates. Closed vacancies retain
useful details; drafts are private even by ID/slug and in metadata.

### KIT-57/59/60: Books and commerce

Public browsing/approved samples need no login. No stock counts. Owner changes
availability/fulfilment; staff are read-only. Collection requires no shipping
address. Quantity limits, pickup instructions, refunds and shipping charges need
owner approval before checkout activation; do not invent them to unblock a demo.

Before checkout/reconciliation code, one joint contract must define internal Order,
payment-attempt and provider identifiers; immutable price/delivery snapshots;
idempotency scope; legal transitions; retry/reconciliation ownership. Cover:

- Same cart submitted twice; retry after uncertain provider timeout; price or
  availability changes; account switches; tampered totals and another Person's ID.
- Provider order/amount/currency matching; authorization versus captured payment;
  webhook before browser return; duplicate, delayed and out-of-order webhooks.
- Late success after expiry/cancellation; two successful attempts for one Order;
  refund requested/pending/failed/completed. Never silently charge again, fulfil
  twice or auto-refund without an approved policy/authority.
- No shipping configuration means shipping unavailable, not free shipping. Unknown
  PIN code differs from temporarily unavailable quote; preserve cart on failure.

### KIT-58: resources

Reader-only remains the existing approved baseline; original downloads are an open
change request. Do not expose originals while awaiting an answer. Authentication
does not imply resource-access consent or marketing consent. Check current access
policy server-side for existing sessions too; version required acknowledgements
separately from optional marketing. Define whether repeat accesses create events
or reuse an access grant before designing deduplication.

Define upload size/type limits, conversion failure/quarantine, page ordering,
private originals, short-lived page URLs and revocation behavior before delivery
code. Authorized images can be copied/screenshotted; do not promise DRM. Reading
position is keyed by Person/Resource/version and cleared appropriately on logout.

### External and owner gates

KIT-47 must supply actual Classplus entitlement/contract before production sync.
KIT-50 currently says Done but its description still contains unchecked library
answers; treat actual approved answers as the gate, not the status label. Same
rule for draft policies. No live Razorpay, WhatsApp, DNS or domain work today merely
because a local feature passes. `learn.` remains documentation-only.

## 4. Review, handoff and integration

Workers report exact HEAD/base, changed files, any shared-file changes, checks run,
runtime evidence, known failures and remaining gates. Use the repo's required
check/build commands for applicable changes, but do not repeat whole-platform
audits or install a new test framework. Focus security/state checks on actual risk.

Coordinator reviews the changed slice only. Integration is sequential: dependencies
first, then feature commits. Rebase/merge only with permission and preserve other
agents' changes. After combined changes, run integration gates once on the exact
candidate; one worker's passing branch does not validate the combined tree.

No automatic merge to main, force-push, deployment or production action. Keep work
In Review until accepted; record merged/deployed/live verification separately.

## Today: realistic outcome

Aim for a coherent local auth/admin foundation plus approved feature contracts and
one or two working public content/catalogue slices, depending on runtime findings
and available approved content. This is a target, not a completion promise. Full
commerce, private Reader delivery and production launch remain gated on external
access/policy decisions and integration verification. Report completed slices, not
an inflated percentage of tickets or screens.

## Coordinator prompt

```text
Coordinate Impact Website using docs/agents/2026-09-21-execution-runbook.md and
the matching prompts in docs/agents/2026-09-21-worktree-prompts.md. First verify
current Linear titles/status/comments, worktrees and exact commits. Do not assume
local main is current. Reconcile the reviewed committed baseline with its owner;
preserve all uncommitted work and don't commit/merge without authorization.
Use one coordinator plus at most three isolated worker subagents in this session.
Each worker gets an explicit absolute worktree path, BASE_SHA, ticket, files and
dependency contracts. Start Wave A, not all tickets. For unresolved designs,
collect bounded proposals and ask only questions that change scope/security or
business policy. Publish shared contracts before downstream writes. Review each
changed slice once, run required integration gates on the combined candidate,
and report implemented/local-qualified/merged/live separately. No DNS, domain,
live payments, provider-account changes, production data mutations or deployment.
```
