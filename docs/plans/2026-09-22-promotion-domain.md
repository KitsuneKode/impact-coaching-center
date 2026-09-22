# Promotion domain and safe event boundary

status: IN PROGRESS
ticket: KIT-63
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md sections 16–17

## Approved slice

Implement pure promotion validation, derived delivery state, deterministic route selection,
and dismissal identity. One model supports announcement, inline and dialog placements.
Publish and schedule remain separate: published records are scheduled before their start,
live on the half-open interval [start, end), and expired afterwards. Paused and archived
records never deliver. Selection returns at most one record per placement, preferring
higher priority, then stable ID ordering; it does not mutate the input.

Routes and internal CTA destinations are exact approved public routes, including current
catalogue detail routes. The only WhatsApp target is the existing workshop intent; callers
resolve that intent through the existing contact helper. No arbitrary URLs, HTML or assets.
Dates are finite nonnegative milliseconds, start precedes end and the window is at most
365 days. Dismissal identity uses the separate dismissal version, not edit revision.

The analytics adapter remains inert unless a caller provides a transport and explicit
current opt-in. Each event has a fixed property contract. Runtime parsing constructs new
allowlisted objects so accidental extra fields, URLs, contact intents and personal details
cannot hitchhike on events. Callers remain responsible for supplying real opaque IDs,
visible impressions and acknowledged outcomes. No PostHog initialization or network calls.
Consent, impression deduplication and presentation suppression belong to the later UI slice.

## Execution

- [ ] Write focused domain and analytics boundary tests; observe failure.
- [ ] Implement the pure modules without dependencies or backend/UI changes.
- [ ] Run focused tests and repository check; report limits precisely.
