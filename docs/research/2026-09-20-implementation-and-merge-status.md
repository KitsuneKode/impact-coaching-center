# Implementation and merge status — 20 September 2026

Point-in-time review: local `df2faa8` on `bhuyanmanash2002/kit-39-person-foundation`,
compared with `main` at `059ccf2`. This is not deployment acceptance.

## Implemented on the foundation branch

- Canonical phone parsing and verified domain Person lookup; enquiry and auth
  share one Person record without treating an enquiry as verified ownership.
- Better Auth/Convex wiring with local-only logger and unavailable WhatsApp
  transport failing closed. No hosted phone verification is claimed.
- Authenticated enquiry ingestion, validation, repeat deduplication, submission
  ceilings and truthful delivery/handoff states.
- Shared CTA/parsing modules, typed catalogue importer, custom 404, responsive
  repairs and required check/build CI.

## Merge sequence

1. PR #2 targets main. At review, GitHub reported MERGEABLE/CLEAN and green checks
   for remote `368888f`. Local `df2faa8` adds follow-up plans and is not covered by
   those hosted results. The uncommitted editorial/state specification also is not
   in that PR head.
2. Review found a false prior-receipt claim on rate limiting and a green success
   icon on failed delivery. The local correction uses neutral limit copy and an
   information icon for non-success; associated comments were corrected. Commit
   and push only after final review, then require fresh CI for that exact head.
   Do not merge the older PR head solely because its checks are green.
3. PR #3 is stacked on the foundation branch, not main. It contains policy/contact
   routes, a library draft and OTP send ceilings. This audit inspected its diff
   inventory only: it is not approved by this report. After #2 lands, update its
   base/history as needed and review/check the resulting diff before merging.
4. PR #1 is unrelated image optimization and was not reviewed here.

## Open correctness gate before hosted OTP

`lib/phone-auth.ts` deletes old verification rows in one operation and the plugin
inserts the new row separately. Concurrent requests can interleave and leave two
live codes. The sequential resend checks do not establish atomic replacement.
PR #3's multi-send rate ceiling does not itself serialize per-phone sends. Resolve
this through an integration-supported atomic operation or verified concurrency
control before enabling hosted OTP; do not claim a one-live-code guarantee yet.

## Next implementation order

1. Close the foundation feedback fix and its exact-head merge gates.
2. Review the stacked policy/OTP branch; reconcile client-facing scope and owner
   content inputs. Keep policies visibly draft until approved.
3. Complete OTP concurrency/send safeguards, then the existing sign-in/admin-leads
   integration spike. Establish owner bootstrap/recovery, backend authorization
   and the shared admin shell before content editing.
4. Build Blog and Careers as the first shared publishing workflow: public
   list/detail routes, owner editors, staff read-only, publication-filtered queries,
   cursor pagination and all states in the approved specification. Reuse existing
   controls; select a table/editor package only when needed. No invented content.
5. Build the independent Book catalogue, cart and online-payment Order workflow,
   then fulfilment; shipping stays disabled until coverage/charges are configured.
6. Complete Reader/resources, library applications, promotions, analytics,
   operational alerts, backup/recovery and approval-dependent launch work.

Classplus catalogue access remains a provider dependency. Snapshot design can
progress behind that explicit assumption; it does not authorize unsupported
production API use. Vercel previews and the later `learn.` cutover remain separate
from local implementation. No PR, domain, DNS or deployment was changed here.
