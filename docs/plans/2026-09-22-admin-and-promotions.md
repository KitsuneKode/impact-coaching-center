---
status: in-progress
ticket: KIT-55 / KIT-63
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Shared admin and promotions

User approved the 21 September architecture review and requested implementation. Isolated base e69b4d7 includes existing sign-in work. Preserve public visual design and URLs. No main merge or deployment.

## Contracts

Base UI/shadcn and existing tokens; no second design system. Shared backend guards resolve verified Person per operation: owner writes, staff reads, students/anonymous denied. Expected revision checked transactionally. Public layouts own marketing chrome; admin layout owns navigation. Feature modules retain their own fields and rules.

Promotions: plain text, known route targets and typed CTA, announcement/inline/dialog presentations, UTC schedule with Asia/Kolkata entry, draft/published/paused/archived state and derived scheduled/live/expired state. Deterministic priority. Drafts never returned publicly. Dismissal is independent of analytics consent. No coupon or broadcast engine.

## Tasks and verification

- [ ] Shared access guards and error/revision helpers; database tests for role revocation and stale writes.
- [ ] Complete existing inbox: indexed per-status cursor pagination (default New), bounded cursor history and honest page count. Regression covering >100 records and chronological order.
- [ ] Reuse shadcn components for responsive admin shell, lists/forms, loading/empty/error/unavailable/forbidden and logout. Separate public layout without changing URLs. Verify public rendering without backend config.
- [ ] Promotion validation and selection domain. Test boundary times, routes, priority ties, invalid content/schedules and safe CTA.
- [ ] Promotion backend: owner-only create/edit/publish/pause/archive, audited revisions; bounded public and admin queries. Database tests for unauthorized writes and draft exclusion.
- [ ] Owner editor with schedule/preview and read-only staff list. Public placements respect dismissal, expiry, protected routes and active dialogs. No sample marketing content.
- [ ] Typed analytics allowlist and explicit opt-in transport; validated attribution per acknowledged enquiry. Never emit personal data or raw WhatsApp URLs. Test payload and persistence boundaries.
- [ ] Reconcile old permission text and status claims; document exact remaining provider and business gates.
- [ ] Run bun run check, bun run build and browser checks; independent review of combined diff.

## Ownership and pending decisions

Coordinator owns schema/generated API, access/inbox, admin/public layouts, promotions and attribution. Auth worker owns phone-auth/otp and sign-in response fixes in a separate worktree. First-owner bootstrap awaits user choice; protected features can be tested with isolated seeded roles without enabling bootstrap. No production role changes.

## Completion boundaries

Local code/tests are separate from backend deployment, actual cookies/OTP delivery, Classplus entitlement, Reader processing and live payment qualification. Continue existing feature plans as contracts become available; never mark externally blocked work live.
