---
status: draft
ticket: KIT-55
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Auth and admin contract (KIT-55)

This is the shared-contract freeze the runbook §2 requires before dependent
admin writes begin. It names interfaces and invariants, not implementations.
Approve the open decisions in §9 before privileged code lands. KIT-53's lease
work is the model for what "verified" means here: nothing below is a claim
until it is checked in the backend, per call.

## 1. Source of truth

- A Better Auth session proves **who** is calling (a verified mobile number).
  It never carries permission. Role is not put in the session, the JWT, or
  any client-readable field.
- `persons.role` (`"student" | "staff" | "owner"`) is the only role store.
  It is written by `recordVerifiedPerson`/`upsertPersonByPhone` (always
  `"student"`) and by `setPersonRole` (§5). No public input reaches it.
- There is one sign-in (`/sign-in`, WhatsApp code). There is no admin login
  route and no second auth instance. `/sign-in?next=/admin/...` is the whole
  "admin login".

## 2. Shared authorization helpers

Live in `convex/` next to `persons.ts` (today `staffFromIdentity` sits in
`convex/leads.ts`; it moves to a shared module, e.g. `convex/authz.ts`, so
leads, books, resources and promotions share one implementation).

```ts
// Identity → verified Person, or null. Already exists as findVerifiedPerson.
personFromIdentity(ctx, identity): Promise<PersonSummary | null>

// Verified Person with role staff or owner, or null. Existing shape.
staffFromIdentity(ctx, identity): Promise<PersonSummary | null>

// Verified Person with role owner, or null.
ownerFromIdentity(ctx, identity): Promise<PersonSummary | null>
```

`PersonSummary` is the existing projection (`id, name, phone, role,
verifiedAt`) — never the raw auth document (ADR-0001 forbids the synthetic
email leaving the backend).

Rules that make these safe:

- Every protected query/mutation re-derives the caller's Person and role in
  the same call. No memoized role across requests — demotion takes effect on
  the next request on every device.
- The check runs inside the Convex function, never in page markup. A guard in
  a component protects the render, not the data.
- Callers take `identity` as a parameter (like `readInbox`) so the decision
  is testable without standing up the auth component.

## 3. Error categories

Five categories, and only these, per the runbook:

| Category            | Meaning                      | Produced by                      |
| ------------------- | ---------------------------- | -------------------------------- |
| `anonymous`         | No session / session expired | personFromIdentity → null        |
| `forbidden`         | Signed in, role insufficient | staff/owner helper → null        |
| `missing-record`    | Target document absent       | mutation lookup                  |
| `invalid-input`     | Args fail domain validation  | arg validation, before any write |
| `revision-conflict` | `expectedRevision` stale     | §6                               |

Convention (mirrors the OTP verdict pattern):

- **Public/anonymous-reachable queries return a verdict envelope**, e.g.
  `{ authorized: false }` like `readInbox` — the page renders the truthful
  state instead of catching a 500. `anonymous` and `forbidden` may share one
  `authorized: false` at the data layer; the page may still distinguish the
  copy, but no data leaves either way.
- **Mutations throw** `ConvexError` carrying a `code` from the table, after
  the authorization check and before the first write. Ordering inside every
  admin mutation: authenticate → authorize → validate → revision-check →
  write. A failure at any step writes nothing.

## 4. Bootstrap and recovery — decided (option A, approved 22 Sep)

**`bootstrapOwner` as an `internalMutation`.**

- Works only while `count(owners) === 0`; grants `role: "owner"` to the E.164
  phone in args. The phone must already belong to a **verified** Person —
  bootstrap never creates a record and never promotes an unverified one,
  so the deployment owner signs in once with WhatsApp OTP first.
- Writes an `activities` row recording the grant so bootstrap is auditable.
- Run once from the deployment owner via `npx convex run` — no HTTP route,
  no public surface, nothing for a client to probe.
- **Recovery:** if every owner is later removed, `count(owners) === 0`
  re-opens the same path — the deployment owner runs it again. There is no
  self-service recovery; a "recover my admin" flow is account-takeover
  surface.
- Break-glass fallback: direct edit in the Convex dashboard. It bypasses the
  audit row, so it is documented as emergency-only, not the procedure.

## 5. Role changes

```ts
setPersonRole(args: {
  phone: string            // E.164-able; normalized like every other path
  role: "student" | "staff" | "owner"
  expectedRevision: number
}): { ok: true, revision: number } | throws categorized error
```

Guards, all inside the one mutation:

- Caller must pass `ownerFromIdentity` — owner-only writes; staff are
  read-only everywhere (ticket requirement).
- **Last-owner protection:** demoting a Person whose role is `owner` is
  refused when `count(owners) <= 1`. Checked transactionally — two owners
  demoting each other concurrently cannot both pass, because the OCC retry
  re-reads the count.
- Self-demotion is allowed only while another owner exists (same check).
- No-op writes (`role` unchanged) succeed without a revision bump or audit
  row, so a retry is free.
- **Audit:** a non-no-op change writes an `activities` row
  (`kind: "role_change"` — new literal — with `actorId` = caller, and
  `fromRole`/`toRole` fields added to `activities`). Role history never lives
  only in the current field value.
- Sets `roleChangedAt` + `roleChangedById` on the Person for the common
  "who changed this" question without scanning activities.

## 6. Revision convention

Every admin-editable record carries `revision: v.number()`, default 0
(backfill existing rows on deploy). Every edit mutation takes
`expectedRevision`, compares it to the stored value inside the same
transaction, and writes `revision + 1` on success. A mismatch throws
`revision-conflict` **before** any write, and the caller keeps its draft —
the conflict response carries the current server revision and projection so
the UI can diff rather than silently lose input.

Applies to: `persons` now; `courses`, `books`, `banners`/promotions,
`resources`, `vacancies` as they land. New editable tables get the field at
creation — no grandfathered exceptions.

## 7. Pagination envelope

Native Convex pagination, one shape everywhere:

```ts
// Server: .paginate(paginationOptsValidator) → Convex's own envelope
{ page: Projection[], isDone: boolean, continueCursor: string }
```

- **Public surfaces:** append-style "Load more" (`usePaginatedQuery`),
  first-page size declared per feature.
- **Admin surfaces:** bounded cursor history — keep a cursor stack
  (prev/next), never an offset and never a fabricated total.
- Every list declares its backing index and direction in the feature plan
  (inbox: `by_lastEnquiryAt`, desc). No filtering that silently
  re-sorts outside the index, and **no counts or orderings computed from a
  partial page** — a partial page must never produce a global-looking number.
  The inbox cap is 100. A full page is labelled "Latest 100, not the whole
  queue." It is not presented as the size of the queue.
- Public vs admin projections are declared per query, like `readInbox`'s
  explicit map. Admin projections may include internal ids and timestamps;
  public ones only what the page renders.

## 8. Loading / error / empty / success

One convention, built from existing primitives (the leads page is the
template):

- **Loading** renders the page heading immediately (SSR markup answers
  "what page is this"), not a bare spinner.
- **Error** is `role="alert"` copy plus a retry affordance; mutation failures
  keep the person's input mounted.
- **Empty** states are truthful copy, distinct from forbidden
  (`authorized: false`) and from unconfigured (`convexConfigured === false`
  → the `Unavailable` state).
- **Session-expired** is the `anonymous` category rendered as the sign-in
  prompt with `?next=` preserved through `safeReturnPath`.
- Installed-client behavior, stated plainly: `ConvexReactClient` reconnects
  queries on its own; a rejected mutation surfaces its categorized code and
  does not retry automatically. No screen may promise retained later-page
  data that the error boundary discards.

## 9. Publication invalidation rule

For everything publishable (blog, vacancies, promotions, resources):

- One `publishedAt`/`state` field drives list, detail, metadata and
  `app/sitemap.ts` — they cannot drift apart because they read the same field.
- A draft is unreachable by id, slug, metadata, or sitemap — privacy never
  depends on an unlinked URL or a stale cache.
- Public pages that read Convex either render dynamically or are revalidated
  through a declared mechanism when the mutation lands; the mechanism is part
  of each feature's plan, not assumed.

## 10. Explicit non-goals

- No better-auth `admin` plugin adoption — its `user.role` store would split
  role across two systems and its `user/admin` model is not this domain's
  `student/staff/owner`.
- No client-supplied role or self-promotion path anywhere, including
  `updatePhoneNumber` (already refused) and sign-up bodies.
- No automatic staff exports or bulk data dumps.
- No second auth instance, no admin-only sign-in route, no email fallback.
- No sample metrics or decorative charts in the admin shell (ticket).

## 11. Decisions — all resolved 22 Sep

1. ~~**Bootstrap method** (§4)~~ **DECIDED:** `people.bootstrapOwner`
   internalMutation (requires an existing verified Person; refuses once any
   owner exists). Convex dashboard edit remains the documented break-glass
   fallback — both paths retained.
2. ~~`activities` gains `kind: "role_change"`~~ **DONE** — `role_change` is in
   the schema union; `setRole`, `grantStaffByPhone` and `bootstrapOwner` write
   audit rows with actor, target, old and new role.
3. ~~`persons` gains `revision`~~ **DONE** — revision/OCC is the standing
   convention; `roleChangedAt`/`roleChangedById` were dropped in favour of the
   `activities` audit row (one source of truth for who changed what).
4. ~~Verdict-envelope vs thrown `ConvexError`~~ **CONFIRMED house style** —
   verdict envelopes on public-reachable queries (`inboxPage`), thrown
   categorized errors inside mutations (`setRole`, `setOrderStatus`).
5. ~~**Session lifetimes**~~ **DECIDED:** 90-day sliding sessions for
   everyone; the 7-day staff cap is enforced server-side —
   `requireStaff`/`requireOwner` treat a privileged session older than
   `STAFF_SESSION_MAX_MS` as `anonymous`, which Better Auth's global refresh
   cannot express per role.

## 12. Acceptance mapping (ticket → contract)

- Shared role helpers → §2. Owner bootstrap/recovery → §4 (pending §9.1).
- Last-owner protection → §5. Owner-only writes, read-only staff → §3/§5.
- No arbitrary elevation from public inputs → §1/§10.
- Paginated-list/field/status primitives → §7/§8.
- Forbidden/session-expired states → §3/§8.
- `app/admin` layout and shared primitives → consumes §7/§8 verbatim.
