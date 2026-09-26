---
status: done
ticket: none
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Close the 22 Sep audit defects

Public pages stay as they are. This plan fixes behaviour and documents that
are wrong today. It does not restyle anything, and it does not build the
unfinished platform.

`docs/PITCH.md` was removed on 22 Sep 2026, and the spec’s research list no
longer cites it. That file described a Google Sheet workflow this repo does
not have.

## Out of scope

- Marketing pages, the library draft, policy copy, posters, and `toConfirm`.
  Those wait on the owner.
- WhatsApp delivery, Turnstile, Books, the Reader, blog, careers, payments.
- A Content-Security-Policy. A useful one needs a nonce in `app/layout.tsx`
  because of inline JSON-LD, plus `frame-src` for YouTube. That is a layout
  change, not a header-only fix. Leave the header absent.
- Session lifetimes. `docs/plans/2026-09-20-sign-in-and-admin-leads.md` step 5
  already defers the 90-day student / 7-day staff split to KIT-46. Do not
  set a single compromise lifetime here.
- OTP resend atomicity. KIT-53 owns it, and the runbook says to inspect the
  installed adapter and get a design approved before writing the mechanism.
  Do not pick a lock design in this plan.
- Moving `staffFromIdentity`, adding `returns` validators, choosing a host,
  or treating the Classplus public snapshot as a supported API.

## Step 1: Enquiry delivery fails closed

- [x] In `lib/lead-delivery.ts`, require both `LEAD_INGEST_SECRET` and
      `NEXT_PUBLIC_CONVEX_SITE_URL`. If either is missing, throw
      `"Enquiry delivery is unavailable."` Do not POST to `LEAD_WEBHOOK_URL`.
      ADR-0004 is the only persistence path.
- [x] Delete the webhook branch and the `LEAD_WEBHOOK_URL` reads. Keep
      `LeadThrottled` on HTTP 429, and keep non-OK responses as a thrown error
      so `app/actions/lead.ts` still returns `handoff` without claiming receipt.
- [x] Update `app/actions/lead.test.ts`: a missing secret, a missing site
      URL, and a secret without a site URL all return `handoff` and do not call
      `fetch`. The acknowledged-204 case stays on
      `https://example.convex.site/enquiries`.
- [x] `bun test app/actions/lead.test.ts`

## Step 2: The inbox queue is ordered by recency, and a cap is labelled as a cap

The index `by_leadStatus` sorts the status string first. Descending, that
puts `lost` ahead of `interested`. `readInbox` then `.take(100)`, and
`app/admin/leads/page.tsx` prints that length as “N to follow up.”

- [x] Add an index on `persons` for `lastEnquiryAt` alone, in `convex/schema.ts`.
      Do not add columns. Persons with no enquiry are absent from that index;
      keep the existing `leadStatus !== undefined` guard.
- [x] In `convex/leads.ts`, read that index `.order("desc")`, still capped.
      Return `truncated: boolean` from whether the cap was filled. Do not count
      the table.
- [x] In `app/admin/leads/page.tsx`, change only the heading sentence. When
      `truncated` is true, say the list is the latest 100, not the size of the
      queue. When it is false, the length is the queue. No other edit in that
      file: no layout, no new controls, no status actions.
- [x] Extend `convex/leads.db.test.ts` with two Persons whose statuses would
      sort the wrong way on `by_leadStatus` (`lost` more recent than `new`) and
      assert the recent one comes first. Assert `truncated` is false for that
      pair.
- [x] `bun test convex/leads.db.test.ts`

## Step 3: Make the staff-write contradiction explicit

Launch rule, already written and not to be re-decided here: staff are
read-only; the owner writes. Sources: the 20 Sep storefront scope at the top
of the spec, `docs/plans/2026-09-22-auth-admin-contract.md` §5, and the
runbook’s KIT-57 note.

- [x] Under spec §12, add a short supersession note: the bullet list of staff
      writes (status changes, notes, WhatsApp replies, export) is not the launch
      rule. The read-only inbox is. Do not delete §12; later CRM work has to
      reopen it on purpose.
- [x] Do not add mutations, role helpers, or admin screens in this step.

## Step 4: The 11 Sep checkpoint stops reading as current

- [x] At the top of `docs/CHECKPOINT.md`, add a dated note that the file is
      the 11 Sep 2026 pitch snapshot. Current status is `docs/plans/README.md`.
      Do not rewrite the checklist underneath.

## Gates

- [x] `bun run check` after steps 1 and 2.
- [x] `bun run build` after step 2, because the inbox query shape and the
      admin page both change.

Set `status: done` here and flip this file’s row in `docs/plans/README.md`
only when every box above is checked against the tree.
