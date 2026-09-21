---
status: in progress (steps 1-4 done; the /admin/people screen remains)
ticket: KIT-55
spec: docs/agents/2026-09-21-execution-runbook.md §2 (shared contract freeze)
---

# Plan 008: the shared admin contract and shell (KIT-55)

> **Executor instructions**: follow step by step, run every verification
> command, stop on any STOP condition and report. When done, update
> `docs/plans/README.md` and this file's `status:`.

## Status

- **Priority**: P1 — five tickets are blocked behind it (KIT-56, 57, 58, 59, 63)
- **Effort**: L
- **Risk**: HIGH — this is the authorization surface. A mistake here is not a
  bug, it is a stranger reading every lead ICT has.

## The finding this plan starts from

`upsertPersonByPhone` hardcodes `role: "student"` (`convex/persons.ts:85`) and
**nothing anywhere promotes anyone**. The role column exists, `convex/leads.ts`
checks it, the tests cover all three values — and there is no code path to
staff or owner. `/admin/leads` is currently unreachable by every human being.

## Decisions taken 22 September

**Owner bootstrap: by hand, in the Convex dashboard.** Whoever holds dashboard
access patches one Person row to `role: "owner"`, once. Zero code and zero
attack surface, for something that happens once in the life of the product.
Recovery is the same action again. Every later staff member is granted by the
owner in the admin UI, never by an environment variable and never by anything
a public input can reach.

Rejected: an `OWNER_PHONES` allowlist (turns a one-time act into a standing
privilege — anyone with deploy access can grant themselves owner); a one-time
bootstrap token (most code and most to get wrong, for a single event);
first-verified-Person-becomes-owner (races against any visitor who finds the
site before ICT does).

**Shell: contract plus a real dashboard shell**, built from a registry sidebar
block rather than composed by hand.

## Steps

### 1. Authorization helpers with explicit categories — `convex/authz.ts`

One place that answers "may this caller do this". Returns a discriminated
result rather than throwing, because half the callers are public routes where
a throw is a 500 for an anonymous visitor.

Categories the runbook requires: `anonymous`, `forbidden`, `missing-record`,
`invalid-input`, `revision-conflict`.

- [x] `viewerPerson(ctx)` — the verified Person or an `anonymous` result
- [x] `requireStaff(ctx)` / `requireOwner(ctx)` — never trust a client-supplied
      role, never read a role out of anything a public input can set
- [x] Every protected mutation re-checks at the point of the write, not once at
      the start of a handler that then awaits

**STOP** if any helper needs a role argument from the client.

### 2. The revision convention

- [x] `revision: v.optional(v.number())` on persons that gets edited
- [x] Mutations take an expected revision, verify it transactionally, increment
      on success
- [x] A conflict returns `revision-conflict` **with the caller's input intact**,
      so the UI can re-present what they typed rather than discard it

### 3. Pagination envelope

- [x] Convex-native `paginationOpts`, one declared indexed sort order per
      feature, separate public and admin projections
- [x] No global-looking counts computed from a partial page — `/admin/leads`
      currently renders "N to follow up" from whatever it fetched, which stops
      being true the moment there is a second page

### 4. Staff management — owner only

- [x] `grantStaffByPhone` / `setRole`, owner-only, audited
- [x] **Last-owner protection**: refuse to demote or remove the final owner.
      Nobody can lock everyone out of the product.
- [x] No automatic staff exports (KIT-55)

### 5. The admin shell

- [x] Sidebar block installed from the registry, adapted to the tokens
- [ ] `/admin` home and `/admin/leads` done; `/admin/people` still to build
- [ ] Forbidden and session-expired states, from the design guide's §6
      convention
- [ ] Keyboard and mobile layout

### 6. Gates

- [ ] `bun run check` and `bun run build`
- [ ] Existing `convex/leads.db.test.ts` role coverage still passes
- [ ] Anonymous, student, staff and owner each exercised against the new
      helpers

## STOP conditions

- Any path that lets a role be set from a public input
- Any protected read or write that cannot name which category refused it
- Last-owner protection missing or bypassable
- Anything that requires editing another agent's files — this worktree is
  currently single-writer, and that assumption must hold for the duration
