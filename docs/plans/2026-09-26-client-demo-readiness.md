---
status: in-progress
ticket: none (spans KIT-41, KIT-45 follow-up, launch plan Phase 1)
spec: docs/plans/2026-09-22-launch-plan.md
---

# Client demo readiness — 26 September 2026

Goal: the owner can be walked through the public site, sign-in with the
onboarding questions, their own account (including deletion), and the staff
dashboard with realistic data — locally and through a preview link — and can
take home policy drafts they only need to fill in and approve.

Promotions and the ebook reader are demonstrated from Kitsu-Lab, not built
here (launch plan decision 11). PostHog waits until this and the backend work
are done. The palette switch stays visible in the demo on purpose: the point is
to show the owner that neither current palette is final.

## Decisions (26 Sep, owner of the repo)

1. Policies are Markdown files ICT can edit. Researched defaults are marked
   _proposed_; facts only ICT can supply are marked _fill_. Both render
   highlighted until the document is approved; an approved document with a
   marker left in it fails the tests.
2. Account deletion is self-serve. Profile, questionnaire answers and sessions
   are erased; paid orders keep an anonymised copy for tax and accounting.
3. The demo runs on the cloud dev deployment `peaceful-emu-861`, opted in by
   `DEV_DEPLOYMENT_NAME` (lib/dev-deployment.ts) so the logger OTP transport
   and the seed can run there and nowhere else.
4. The questionnaire (target exam, first attempt or repeater, preferred batch;
   skippable, resumable) follows the first sign-in and is resumable from
   /account. Answers appear on the lead sheet. The Resource gate reuses it.

## Steps

- [x] AGENTS.md working agreement (Opus 5.5 guidance).
- [x] Named hosted dev deployment for the logger transport and the seed, with
      tests; env set on `peaceful-emu-861`; functions pushed; fixture seeded;
      a code confirmed in `convex logs`.
- [ ] Policies in Markdown with proposed/fill markers: privacy (incl. deletion
      and grievance contact), terms, cancellations and refunds, shipping and
      delivery. Renderer, legend, tests.
- [ ] Self-serve account deletion: Convex mutation, audit row, /account UI,
      privacy wording.
- [ ] Onboarding questionnaire after first sign-in; /account resume; lead
      sheet shows answers.
- [ ] Launch plan Phase 1 remainder: actionable default view, export audit
      row, mobile card rows.
- [ ] Preview link: Vercel preview env for this branch pointing at the dev
      deployment.
- [ ] Verification loop (below) run and recorded; launch plan and Linear
      updated.

## Verification loop

Each item is checked by hand on the running app, not inferred from tests.

- `bun run check` and `bun run build` pass.
- Public: `/`, `/courses`, one course page, `/success-stories`, `/contact`,
  `/library`, four policy pages at 390 px and 1440 px.
- Enquiry form submits and the lead appears at the top of `/admin/leads`.
- Sign-in as a new number → name → questionnaire (answer one, skip the rest)
  → /account shows answers and lets them finish.
- Owner: leads default view, open a lead sheet, change status, add a note, set
  a follow-up, export; orders queue status change; people role change.
- Staff: cannot export, cannot change roles.
- Account deletion as a student: confirm, signed out, lead sheet shows the
  Person as deleted, orders keep their totals with no name or phone.
