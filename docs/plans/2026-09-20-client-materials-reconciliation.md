---
status: done
ticket: none (raise a KIT-<n> under "Impact Website" before starting; label it as content/contract work)
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Plan 002: Make every client-facing document agree with the ADRs before it is signed

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `docs/plans/README.md` and set `status:` in this file's header.
>
> **Drift check (run first)**:
> `git diff --stat 4a6c88e..HEAD -- docs/proposals scripts/generate-client-materials.mjs scripts/generate-final-quotation.mjs docs/adr`
> On any change, re-read the cited lines before editing.

## Status

- **Priority**: P1 (contract risk, not code risk)
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `4a6c88e`, 2026-09-20

## Why this matters

The quotation and the generated client materials (DOCX/PPTX/PDF) are what ICT
signs. Three decisions recorded in the ADRs and spec are contradicted by those
documents:

1. **Clerk** is listed as a client-owned production account. ADR-0001 and spec
   §10 removed Clerk: "Clerk is no longer part of the stack."
2. **"stock"** is listed among client-supplied data and among features
   ("Razorpay ... stock"). ADR-0002 and spec §9: "there are no stock counts"; Books
   are enabled/disabled only.
3. **Resend / transactional email** is described as the order-update channel in
   the generated materials. Spec §10 makes WhatsApp the messaging channel and
   states there is no email fallback at launch.

Separately, ADR-0001 says the switch from the brief's "name + email popup" to
WhatsApp phone verification "must be recorded in a countersigned change-note
before build". No such note exists in `docs/proposals/`. Commit `11ff31f`
("reconcile the spec and quotation with the ADRs") fixed the spec but missed
these. Signing a document that promises Clerk, stock counts and email updates
creates scope the team has already decided not to build.

## Current state

- `docs/proposals/2026-09-17-ict-client-quotation.md` — the Markdown quotation. Offending lines:
  - line 88: `Production accounts for the domain, Cloudflare, Convex, Clerk, PostHog, Razorpay, Google Search Console, and Google Business Profile will be owned by ICT.`
  - line 101: `... resource files, book data and covers, stock, delivery charges, library rules ...`
  - line 51 is already correct: `Books are enabled or disabled rather than stock-counted; no inventory management is included.` — keep it.
- `scripts/generate-client-materials.mjs` — generates the DOCX/PPTX under `docs/proposals/client-materials/`. Offending strings at lines 421, 1432, 1527, 1547, 1739 (`Clerk`, `stock`, `Resend email updates`).
- `scripts/generate-final-quotation.mjs` — generates `ICT-Final-Project-Quotation.docx`. Offending strings at lines 416, 488, 508, 524 (`stock`, `Clerk`, `Resend`).
- Both generators import `docx` from a machine-specific absolute path:
  `scripts/generate-final-quotation.mjs:1-21` imports from
  `/home/kitsunekode/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/docx/dist/index.mjs`. `docx` is **not** in `package.json`. Regeneration may therefore fail on another machine — see STOP conditions.
- `docs/proposals/client-materials/` — committed binaries: 4 DOCX, 1 PPTX, an `.md` meeting guide, and `pdf/` with 4 PDFs. These are the artefacts the client sees.
- `docs/adr/0001-one-person-record-verified-by-whatsapp.md:11` — the change-note requirement: "a deviation from their written brief that must be recorded in a countersigned change-note before build."
- Existing proposals use the `YYYY-MM-DD-<slug>.md` naming (`docs/agents/plans.md:13-14`).

Vocabulary to use in the client text (CONTEXT.md): "Verification" (not
sign-up/registration), "Person" is internal — in client-facing text say
"student" or "visitor". "Book availability is enabled or disabled" — never
"stock" or "inventory".

## Commands you will need

| Purpose                                   | Command                                                                                 | Expected                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Find remaining contradictions             | `rg -n "Clerk\|stock\|Resend" docs/proposals/*.md scripts/generate-*.mjs`               | see Done criteria                                        |
| Format check (md is formatted by oxfmt)   | `bun run format:check`                                                                  | exit 0                                                   |
| Regenerate materials (may fail; see STOP) | `bun scripts/generate-final-quotation.mjs && bun scripts/generate-client-materials.mjs` | files rewritten under `docs/proposals/client-materials/` |

## Scope

**In scope:**

- `docs/proposals/2026-09-17-ict-client-quotation.md`
- `docs/proposals/2026-09-20-change-note-whatsapp-verification.md` (create)
- `scripts/generate-client-materials.mjs`, `scripts/generate-final-quotation.mjs` (string edits only)
- `docs/proposals/client-materials/**` — only via regeneration, never hand-edited

**Out of scope:**

- The spec, ADRs and CONTEXT.md — they are the source of truth here, not the thing being fixed.
- Prices, payment schedule, timelines, maintenance fees — commercial terms are the maintainer's call; change wording only.
- Adding `docx`/`pptxgenjs` to `package.json` — a dependency decision for the maintainer.

## Git workflow

- Branch: `<handle>/kit-<n>-client-materials-reconciliation`
- Commit style from `git log`: `docs: reconcile the spec and quotation with the ADRs`. Suggested: `docs: remove Clerk, stock counts and email updates from client materials`.
- Do NOT push unless instructed.

## Steps

### Step 1: Fix the Markdown quotation

In `docs/proposals/2026-09-17-ict-client-quotation.md`:

- line 88: replace `Convex, Clerk, PostHog` with `Convex, Meta WhatsApp Business, PostHog`.
- line 101: replace `book data and covers, stock, delivery charges` with `book data and covers, which books are available to order, delivery charges`.

**Verify**: `rg -n "Clerk|stock" docs/proposals/2026-09-17-ict-client-quotation.md` → exactly one match, line 51 (`stock-counted`).

### Step 2: Fix the generator strings

In both `.mjs` files, edit only the quoted strings at the cited lines:

- `Clerk` → remove from account lists; add `Meta WhatsApp Business` where accounts are enumerated.
- `stock` as a feature/data item → `book availability` (e.g. "server-verified amount, availability, signature and payment status"; "books, covers, prices, availability and delivery rules"; "ICT remains responsible for book prices, availability, delivery areas ...").
- `Resend email updates` / `transactional email through Resend` → `WhatsApp order and application updates`. Remove `Resend` from any account list.

Do not restructure the documents or touch layout code.

**Verify**: `rg -n "Clerk|Resend" scripts/generate-*.mjs` → 0 matches. `rg -n "stock" scripts/generate-*.mjs` → 0 matches, or only matches that are the phrase `stock-counted` / `not stock-counted`.

### Step 3: Write the change-note

Create `docs/proposals/2026-09-20-change-note-whatsapp-verification.md` with this content (fill the two `<...>` fields from the quotation; leave signature blocks blank):

```markdown
# Change note 1: mobile-number verification replaces the email popup

**Project:** Impact Career Tutorials website and admissions platform
**Reference:** Proposal and quotation dated 17 September 2026
**Date:** 20 September 2026

## What the requirement document said

`Website Req.pdf` asks for a popup that collects a name and email address
(phone optional) before free study material opens, and an admin view of
"leads (name + email)" to build an email list.

## What changes

1. Free study material opens after a one-time **mobile-number verification over
   WhatsApp**, with the student's name and explicit consent. Email is optional
   and is collected only where it has a purpose (for example at checkout).
2. The list ICT receives is therefore a list of **verified WhatsApp numbers with
   names**, not email addresses. Enquiry forms remain open without verification.
3. Order and library-application updates are sent over **WhatsApp**, not email.
4. Account recovery is phone-only. A student who loses access to their number
   asks ICT staff, who change it from the dashboard with an audit record.

## Why

ICT's audience identifies itself by mobile number, and ICT already talks to
students on WhatsApp. Email lists from this audience are largely unused. Each
verification message is billed by Meta to ICT at the rate on Meta's official
rate card; expected volume is roughly one message per new student.

## What does not change

Scope, price (<total from quotation>), payment schedule and delivery stages
in the 17 September quotation are unchanged.

## Acceptance

For Impact Career Tutorials — Name / Signature / Date:

Service provider — Name / Signature / Date:
```

**Verify**: `bun run format:check` → exit 0 (fix with `bun run format` if it complains about the new file).

### Step 4: Regenerate the binaries (attempt)

Run `bun scripts/generate-final-quotation.mjs` then
`bun scripts/generate-client-materials.mjs`.

**Verify**: exit 0 and `git status --short docs/proposals/client-materials` shows modified DOCX/PPTX. If the PDFs are produced by a separate step that is not in the repo, report which PDFs are now stale rather than converting by hand.

If either script fails to import `docx` (absolute path does not exist on this machine), **STOP** and report: the source strings are fixed; the binaries are stale and must be regenerated by the maintainer or after `docx` is added as a dev dependency.

## Done criteria

- [ ] `rg -n "Clerk|Resend" docs/proposals/*.md scripts/generate-*.mjs` → 0 matches
- [ ] `rg -n "stock" docs/proposals/*.md scripts/generate-*.mjs` → only `stock-counted` phrasings
- [ ] `docs/proposals/2026-09-20-change-note-whatsapp-verification.md` exists
- [ ] `bun run format:check` exits 0
- [ ] Either the binaries are regenerated, or the report names which ones are stale
- [ ] `docs/plans/README.md` status row updated

## Executed — 20 September 2026

Steps 1-4 landed. The quotation, both generators and the change-note are done;
`Clerk` and `Resend` are gone from every Markdown and generator source, and the
only remaining `stock` is the correct `stock-counted` phrasing on quotation
line 51.

More occurrences existed than the plan cited - `generate-final-quotation.mjs`
also carried them at 334, 420, 527 and 566, and `generate-client-materials.mjs`
at 1803. The done criteria ("0 matches") governed, so all were fixed.

The `docx` import resolved on this machine, so the DOCX and PPTX were
regenerated: `ICT-Brief-Project-Proposal.docx`,
`ICT-Digital-Growth-Platform-Presentation.pptx`,
`ICT-Final-Project-Quotation.docx` and
`ICT-Project-Proposal-and-Quotation.docx`.

**The four PDFs under `client-materials/pdf/` are stale.** They still contain
the removed terms - `ICT-Final-Project-Quotation.pdf` alone has six matches.
Nothing in the repo converts DOCX to PDF and LibreOffice is not on this
machine, so they were left rather than hand-converted. **Do not send the PDFs
to ICT until they are regenerated from the new DOCX.**

## STOP conditions

- The generator import path for `docx` does not resolve (expected on any machine other than the author's). Fix the strings, report the stale binaries, stop.
- Any cited line no longer contains the quoted text.
- You are tempted to change a price, percentage, date or fee.

## Maintenance notes

- Make the generators reproducible before the next client round: add `docx` (and the PPTX library) as dev dependencies and import by package name. Deferred here because it is a dependency decision.
- The spec §11 table still lists "Transactional email (fallback)" as a vendor row. That is internal and arguably still true as a _future_ option; it was left alone deliberately. If the maintainer wants it gone, it is a one-line spec edit.
- Get the change-note countersigned **before** any Reader or WhatsApp work starts; ADR-0001 makes that a precondition.
