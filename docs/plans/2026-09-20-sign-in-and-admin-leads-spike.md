---
status: partial
ticket: none (raise a KIT-<n> "Spike: sign-in UI and read-only leads inbox" under "Impact Website")
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Plan 005: Spike the first authenticated surfaces — `/sign-in` and a read-only `/admin/leads`

> **Executor instructions**: This is a **design spike**, not a build plan. Its
> output is (a) a throwaway branch proving the wiring works locally and (b) an
> implementation plan file with every open question below answered from
> evidence. Nothing from the spike branch is merged. Follow the steps, run the
> verifications, honour the STOP conditions. When done, update
> `docs/plans/README.md` and this file's `status:`.
>
> **Drift check (run first)**:
> `git diff --stat 4a6c88e..HEAD -- convex lib/auth-server.ts lib/phone-auth.ts app/api app/layout.tsx`
> On any change, re-read the cited excerpts before proceeding.

## Status

- **Priority**: P2
- **Effort**: M (spike) — the follow-on build is L
- **Risk**: LOW (nothing merges)
- **Depends on**: Plan 001 (send throttle) must be merged before any sign-in UI reaches a shared preview; the spike itself can run locally without it.
- **Category**: direction
- **Planned at**: commit `4a6c88e`, 2026-09-20

## Why this matters

The Person foundation (KIT-39) shipped a complete phone-verification backend
that nothing calls: there is no `ConvexProvider`, no sign-in route, and no
consumer of `getCurrentPerson`. The quotation and spec §12/§19 promise ICT a
staff dashboard whose first job is following up enquiries — and enquiries are
already landing in Convex with `leadStatus` and `activities`. A `/sign-in`
page plus a read-only `/admin/leads` list is the smallest slice that turns the
foundation into something a staff member can see, needs no Meta approval
(logger transport locally), no Razorpay, and no new tables. This spike settles
the wiring questions so the build plan that follows is executable by a weaker
model in one pass.

## Current state

- `lib/auth-server.ts` — wraps `convexBetterAuthNextJs({ convexUrl, convexSiteUrl })` lazily; exports only `handler`. Its doc comment lists the other returns (`preloadAuthQuery, isAuthenticated, getToken, fetchAuthQuery, fetchAuthMutation, fetchAuthAction`) and says: "Add each back here when a caller exists." The spike creates the first callers.
- `app/api/auth/[...all]/route.ts` — `export const { GET, POST } = handler`.
- `convex/auth.ts:67-76` — `getCurrentPerson` query: `safeGetAuthUser` → `findVerifiedPerson`; returns `{ id, name, phone, role, verifiedAt } | null`. Comment: "getAuthUser throws ConvexError 'Unauthenticated' for anonymous visitors" — every public surface must use the safe variant (spec §10 "Verified behavior").
- `convex/persons.ts:12-34` — `findVerifiedPerson(ctx, identity)` is the only way to get a domain Person from an auth identity. Role lives on the Person (`student | staff | owner`), `convex/schema.ts:24`.
- `convex/schema.ts:14-54` — `persons` has `leadStatus`, `interestTrack`, `lastEnquiryAt`, `assigneeId`, `nextFollowUpAt`; only index is `by_phone`. `activities` indexed `by_person`.
- `lib/phone-auth.ts` — plugin routes are `/phone-number/send-otp` (body `{ phoneNumber }`) and `/phone-number/verify` (body `{ phoneNumber, code }`); `updatePhoneNumber` is forbidden.
- `lib/otp-transport.ts:24-50` — locally, `OTP_TRANSPORT=logger` on the Convex dev deployment prints the code to the Convex log; production refuses. There is **no** way to sign in on a hosted preview until KIT-46.
- `.env.example` documents `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`; Convex-side `SITE_URL` (trusted origins) and `OTP_TRANSPORT` are set on the deployment, `convex/http.ts:71-73`.
- Design system: `components/ui/{button,badge,card,section,accordion}.tsx`; Base UI + shadcn patterns; spec §7 says add shadcn Field/Input/Table/Sidebar "only as needed" and start leads with "tables/lists and explicit status controls".
- Vocabulary (CONTEXT.md): **Person**, **Verification** ("Avoid: sign-up, registration, login" — the _route_ may be `/sign-in` per spec §5, but code names say `verify`/`verification`), **Lead status** (New/Contacted/Interested/Enrolled/Lost), **Enquiry**. Role values `student|staff|owner` are field values, not type names.
- Spec §10 table: Admin requires `staff` or `owner`; sessions: students 90-day sliding, staff 7 days. Spec §21: "A session proves identity and never implies a permission."

## Commands you will need

| Purpose                                      | Command                                                                                                                                                        | Expected                                                                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Convex dev (separate terminal, keep running) | `bunx convex dev`                                                                                                                                              | deployment URL printed; `OTP_TRANSPORT=logger` and `SITE_URL=http://localhost:3000` set in the dashboard or via `bunx convex env set` |
| Next dev                                     | `bun run dev`                                                                                                                                                  | http://localhost:3000                                                                                                                 |
| Gates                                        | `bun run check && bun run build`                                                                                                                               | exit 0                                                                                                                                |
| Read component docs                          | `cat node_modules/@convex-dev/better-auth/README.md` and `ls node_modules/@convex-dev/better-auth/dist/nextjs node_modules/@convex-dev/better-auth/dist/react` | —                                                                                                                                     |

## Scope

**In scope (spike branch only, never merged):** `app/providers.tsx`, `app/layout.tsx` (wrap with provider), `app/sign-in/page.tsx`, `app/admin/leads/page.tsx`, `lib/auth-client.ts`, `lib/auth-server.ts` (re-export what the spike calls), `convex/leads.ts` (one query), `convex/schema.ts` (one index), `convex/leads.test.ts`.

**Deliverable that IS committed:** `docs/plans/2026-09-2X-sign-in-and-admin-leads.md` — the build plan, written to the template of the other files in `docs/plans/`, with the open questions below answered.

**Out of scope:** WhatsApp transport, Turnstile, any write from the admin (status changes, notes), CSV export, `/account`, staff-assisted phone change, Reader, Books. Do not add shadcn Sidebar/Table/Recharts in the spike — a `<ul>`/`<table>` is enough to prove the data path.

## Git workflow

- Branch: `<handle>/spike-sign-in-admin-leads` — **delete after the plan is written**; nothing from it is merged. Commit freely on it.
- The plan file is committed on a normal branch: `docs: plan the sign-in and leads-inbox slice`.

## Steps

### Step 1: Read the integration, then wire the provider

Read `node_modules/@convex-dev/better-auth/README.md` sections on Next.js and
React clients. Record in your notes: the exact provider component name and
import path, the client `createAuthClient` import and its `convexClient()`
plugin, and how `getToken`/`isAuthenticated` are used in a Server Component.

Create `lib/auth-client.ts` (client) and `app/providers.tsx` (`"use client"`,
wraps children in the component's provider with a `ConvexReactClient` built
from `NEXT_PUBLIC_CONVEX_URL`). Wrap `{children}` in `app/layout.tsx` with it.

**Verify**: `bun run dev` → `/` still renders for an anonymous visitor with no console error. `bun run build` → exit 0. **This is acceptance gate §24's "public pages render for signed-out visitors"** — record the result.

### Step 2: `/sign-in`

Two-step client form: mobile number → code. Call the plugin routes through the
auth client (`phoneNumber.sendOtp`, `phoneNumber.verify` — confirm exact
method names from the installed `better-auth/client/plugins` types and record
them). Show the server's error message on 400/403/429 (Plan 001 adds 429).
On success, `router.push` to `?next=` or `/`. Minimum 30-second resend cooldown
in the client (spec §10). Do **not** render the code anywhere; read it from the
`bunx convex dev` log.

**Verify**: sign in locally with a test number; `bunx convex data persons` (or dashboard) shows one Person with `verifiedAt` set and `name: ""`. Record: how many round trips, what the 400 message looks like in the UI, and whether the session cookie is set on `localhost:3000` (DevTools → Application).

### Step 3: Role gate and the leads query

Add index `.index("by_leadStatus", ["leadStatus", "lastEnquiryAt"])` to
`persons` in `convex/schema.ts`.

Create `convex/leads.ts`:

```ts
import { v } from "convex/values"
import { authComponent } from "./auth"
import { findVerifiedPerson } from "./persons"
import { query } from "./_generated/server"

/** staff or owner, or null. Authentication is not authorization (spec §21). */
async function requireStaff(
  ctx: Parameters<typeof findVerifiedPerson>[0] & { auth: unknown }
) {
  const identity = await authComponent.safeGetAuthUser(ctx as never)
  const person = await findVerifiedPerson(ctx, identity)
  if (!person || (person.role !== "staff" && person.role !== "owner"))
    return null
  return person
}

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("interested"),
      v.literal("enrolled"),
      v.literal("lost")
    ),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff) return { page: [], isDone: true, continueCursor: "" }
    const result = await ctx.db
      .query("persons")
      .withIndex("by_leadStatus", (q) => q.eq("leadStatus", args.status))
      .order("desc")
      .paginate(args.paginationOpts)
    // Return only what the list needs; never the whole document.
    return {
      ...result,
      page: result.page.map((p) => ({
        id: p._id,
        name: p.name,
        phone: p.phone,
        interestTrack: p.interestTrack,
        lastEnquiryAt: p.lastEnquiryAt,
        nextFollowUpAt: p.nextFollowUpAt,
      })),
    }
  },
})
```

(Fix the `requireStaff` typing against the generated `QueryCtx` rather than
using `as never` — the sketch shows intent, not final code. Record what the
clean signature turned out to be.)

Test in `convex/leads.test.ts` (copy the module-map block from
`convex/persons.db.test.ts:25-31`): anonymous → empty page; a `student` Person
→ empty page; a `staff` Person → sees a `new` lead created via
`internal.persons.recordEnquiry`; a `lost` filter excludes it. Use
`t.withIdentity(...)` from convex-test and record whether the Better Auth
component's `safeGetAuthUser` can be satisfied by `withIdentity` at all — if
not, that is a finding for the build plan (the query may need a testable seam
like `findVerifiedPerson` already has).

**Verify**: `bun test convex/leads.test.ts` → pass, or the seam finding recorded.

### Step 4: `/admin/leads` page

Server Component. Use `isAuthenticated()` / `getToken()` from
`lib/auth-server.ts` (re-export them now that a caller exists) and
`fetchAuthQuery(api.leads.listByStatus, { status: "new", paginationOpts: { numItems: 50, cursor: null } })`.
If not authenticated → `redirect("/sign-in?next=/admin/leads")`. If the page
is empty **and** the current Person is not staff, render "You do not have
access to this page." — do not leak whether leads exist. Render a plain list:
name, `formatPhone(phone)`, interestTrack, relative `lastEnquiryAt`. Add
`robots: { index: false }`.

**Verify**: as a fresh student sign-in → access message; after
`bunx convex run`-patching that Person to `role: "staff"` → the list shows the
enquiries submitted through the public form. Record screenshots at 390 px and
1440 px in your report (paths, not inline).

### Step 5: Write the build plan

Create `docs/plans/2026-09-2X-sign-in-and-admin-leads.md` (real date) using
the structure of `docs/plans/2026-09-20-otp-send-throttle.md`, answering:

1. Exact provider/client imports and the `layout.tsx` change (from Step 1).
2. Exact plugin client method names and error shapes (Step 2).
3. The clean `requireStaff` signature and whether convex-test can drive it (Step 3).
4. Whether `fetchAuthQuery` works in a Server Component with the lazy `auth-server.ts` wrapper, or the wrapper needs restructuring (Step 4).
5. Bundle cost of the provider on public pages (`bun run build` output before/after; record the First Load JS delta for `/`).
6. How the first `owner` gets its role — there is no bootstrap. Propose one (e.g. `bunx convex run` once, documented in the operating guide) and mark it as a decision for the maintainer.
7. Which shadcn additions the real build needs (spec §7 list) — name them, no more.
8. Turnstile placement (before send-otp, spec §10) as a step in the build plan, with the client widget and server verify call located.

Delete the spike branch.

**Verify**: the new plan file passes `bun run format:check`; every question above has an evidence-backed answer or is marked "open — needs maintainer decision".

## Done criteria

- [ ] Spike demonstrated locally: anonymous `/` renders; sign-in creates a verified Person; staff sees leads; student does not
- [ ] `docs/plans/2026-09-2X-sign-in-and-admin-leads.md` exists with all eight questions answered
- [ ] Spike branch deleted; `git status` clean on main apart from the plan file
- [ ] `docs/plans/README.md` row updated

## Executed — 20 September 2026 (PARTIAL)

The committed deliverable, `docs/plans/2026-09-20-sign-in-and-admin-leads.md`,
is written. **The throwaway spike branch was not built**, so the static half of
this spike is done and the runtime half is not.

Answered from the installed packages: the provider component and its props,
the client plugin and its enumerated error codes, the live plugin route names,
the seven helpers `convexBetterAuthNextJs` returns, and the fact that our own
hook already forbids `updatePhoneNumber`. Those were the questions that made
the build plan unexecutable, and they are closed.

Left open, and listed in the build plan under "Not yet verified": whether the
session cookie is set on localhost, the round-trip count and 400 rendering,
whether a Convex HTTP action sees a real client address, and the anonymous
`getCurrentPerson` path. Each needs `bunx convex dev` with
`OTP_TRANSPORT=logger` and a browser, which was not run here.

The address question is the one with teeth: if no `otp:ip:*` row appears, the
per-address ceiling added in KIT-49 is inert and only the per-number and global
ones bite.

## STOP conditions

- `bunx convex dev` needs credentials you do not have — report; do not create a new Convex project.
- The component README's Next.js integration differs materially from `lib/auth-server.ts`'s assumptions (e.g. `convexBetterAuthNextJs` no longer exported) — report before rewriting the wrapper.
- Wrapping `layout.tsx` in the provider makes any public route fail for anonymous visitors — that is the §24 gate failing; capture the error and stop.
- You are about to add a write mutation to the admin, a WhatsApp send, or a Turnstile key.

## Maintenance notes

- Whatever bootstraps the first `owner` must also prevent removing the last one (plan `2026-09-19-person-foundation.md`, follow-up list).
- Staff sessions must be shorter than student sessions (spec §10: 7 vs 90 days); note where that is configured in the build plan.
- The read-only list is deliberately the first admin surface. Status changes, notes and follow-up dates come next and each must write an `activities` row with `actorId`.
