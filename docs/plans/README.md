# Implementation plans

Plans follow `docs/agents/plans.md`: `YYYY-MM-DD-<slug>.md`, a `status` /
`ticket` / `spec` header, checkbox steps. This index orders them and records
what the 20 September 2026 audit considered and rejected, so nobody re-audits
it. Executors: read a plan fully before starting, honour its STOP conditions,
update your row here and the `status:` in the plan's header when done.

## Execution order and status

| Plan                                            | Title                                                               | Priority | Effort | Depends on                              | Status                                               |
| ----------------------------------------------- | ------------------------------------------------------------------- | -------- | ------ | --------------------------------------- | ---------------------------------------------------- |
| `2026-09-19-person-foundation.md`               | Person foundation: seams, schema, phone verification (KIT-39)       | —        | —      | —                                       | DONE                                                 |
| `2026-09-20-client-materials-reconciliation.md` | Client documents agree with the ADRs; change-note drafted           | P1       | S      | —                                       | DONE                                                 |
| `2026-09-20-policy-pages-and-contact.md`        | `/contact` + four draft policy routes (KIT-45)                      | P1       | M      | —                                       | DONE                                                 |
| `2026-09-20-otp-send-throttle.md`               | Throttle `send-otp` per phone/IP/day; sweep stale rate-limit rows   | P1       | M      | — (before KIT-46)                       | DONE                                                 |
| `2026-09-20-hygiene-batch.md`                   | Eight small audit fixes in one batch                                | P2       | M      | step 5 after/with the throttle plan     | DONE                                                 |
| `2026-09-20-sign-in-and-admin-leads-spike.md`   | Spike `/sign-in` + read-only `/admin/leads`; produce the build plan | P2       | M      | throttle plan before any shared preview | PARTIAL (build plan written; runtime half never run) |
| `2026-09-20-sign-in-and-admin-leads.md`         | `/sign-in` + read-only `/admin/leads` (from the spike)              | P2       | L      | KIT-49 before any shared preview        | DONE (step 5, session lifetimes, deferred to KIT-46) |

| `2026-09-20-library-draft.md` (no plan file) | `/library` as a draft plus its seven questions for ICT (KIT-50) | P2 | S | — | DONE (built to request, without a plan) |

Status values: TODO · IN PROGRESS · DONE · BLOCKED (one-line reason) · REJECTED (one-line rationale).

## Dependency notes

- The throttle plan must merge **before** the WhatsApp transport (KIT-46) — the first billed send must already be rate limited.
- The spike can run locally without the throttle, but no sign-in UI should reach a shared preview URL before it.
- The hygiene batch's Step 5 edits a comment in `lib/otp-transport.ts` that the throttle plan's neighbourhood touches; land it after or in the same branch to avoid a trivial conflict.
- The client-materials plan is contract work; do it before the next client conversation regardless of code order.

## Concurrent work seen at planning time

The 20 September working tree held uncommitted edits (`lib/client-address.ts`,
address validation in `app/actions/lead.ts` / `convex/http.ts`, a `by_window`
index and prune in `convex/persons.ts` / `convex/schema.ts`, the two comment
fixes, a `throttled` lead-form state). They overlap the throttle plan's sweep
and hygiene Steps 5 and 8; both plans tell the executor to check the tree
first. Whoever owns those edits should commit them before either plan starts.

## Not plans, but blocking launch (tracked in Linear, not here)

KIT-40 prove a real enquiry arrives in production · KIT-41 owner sign-off of
every unverified claim · KIT-42 domain, certificate and the **hosting
decision** · KIT-43 Google Business Profile and Search Console · KIT-44
accessibility/performance/device passes · KIT-46 WhatsApp OTP transport ·
KIT-47 Classplus API entitlement · KIT-48 missing content assets.

## Findings considered and rejected (20 September 2026 audit)

- Enquiry idempotency window (60 s, same key) vs. rate limiting split — by design and well argued in `convex/persons.ts`; not a bug.
- Logger OTP transport gated on a local `CONVEX_SITE_URL` — correct fail-closed behaviour; not a finding.
- `getAuthUser` 500 risk on public pages — nothing calls the auth surface yet; recorded as an acceptance check in the spike plan instead.
- `alternates.canonical: "/"` default in `app/layout.tsx` — every existing route sets its own; revisit only if a route forgets (the policy-pages plan sets them explicitly).
- `docs/research-notes.ts` compiled into the project — CHECKPOINT §F already tracks it; cosmetic.
- Moving `shadcn` to `devDependencies` — its CSS is imported at build; a `--production` install on some host would break the build for no real gain.
- Content Security Policy — needed, but requires a nonce for the JSON-LD script and `frame-src` for YouTube; deferred to the sign-in build, when the origin starts carrying sessions.
