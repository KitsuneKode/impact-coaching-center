---
status: draft
ticket: none (raise a KIT-<n> "Sign-in and the read-only leads inbox" under "Impact Website")
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Plan 006: `/sign-in` and a read-only `/admin/leads`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command. If anything under "STOP conditions" occurs, stop and
> report. When done, update `docs/plans/README.md` and this file's `status:`.
>
> **Drift check (run first)**:
> `git diff --stat 1854bba..HEAD -- convex lib/auth-server.ts lib/phone-auth.ts app/api app/layout.tsx`

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MEDIUM — first authenticated surface; the role gate is the whole point
- **Depends on**: the send throttle (KIT-49, landed). A sign-in UI must not reach a shared preview without it.
- **Category**: direction
- **Planned at**: commit `1854bba`, 2026-09-20, from plan 005's spike

## Why this matters

KIT-39 shipped a complete phone-verification backend that **nothing calls**:
no `ConvexProvider`, no sign-in route, and `getCurrentPerson` has no consumer.
Enquiries are already landing in Convex with `leadStatus` and `activities`, and
the quotation promises ICT a staff dashboard whose first job is following them
up. `/sign-in` plus a read-only `/admin/leads` is the smallest slice that turns
the foundation into something a staff member can see. It needs no Meta
approval, no Razorpay and no new tables.

## Evidence gathered by the spike

Answered from the installed packages, not from memory:

- **Provider**: `ConvexBetterAuthProvider` from `@convex-dev/better-auth/react`
  (`dist/react/index.d.ts:26`), props `{ children, client, authClient, initialToken }`.
- **Also available**: `AuthBoundary` (`dist/react/index.d.ts:72`) and
  `authComponent.clientApi()`, which exposes `getAuthUser` as a client query.
- **Client plugin**: `phoneNumberClient()` from `better-auth/client/plugins`.
  Its `atomListeners` matcher names the live routes: `/phone-number/verify`,
  `/sign-in/phone-number`, `/phone-number/update`.
- **Error codes are enumerated** on the client plugin, so the UI can map them
  rather than string-matching prose: `OTP_EXPIRED`, `INVALID_OTP`,
  `TOO_MANY_ATTEMPTS`, `INVALID_PHONE_NUMBER`, `OTP_NOT_FOUND`,
  `PHONE_NUMBER_NOT_VERIFIED`, `PHONE_NUMBER_CANNOT_BE_UPDATED`,
  `SEND_OTP_NOT_IMPLEMENTED`, and others.
- **Server helpers**: `convexBetterAuthNextJs` returns `getToken`, `handler`,
  `isAuthenticated`, `preloadAuthQuery`, `fetchAuthQuery`, `fetchAuthMutation`,
  `fetchAuthAction` (`dist/nextjs/index.d.ts:6-20`). `lib/auth-server.ts`
  currently exports **only** `handler`, deliberately — add each back as a
  caller appears.
- **Our own hook already rejects** `updatePhoneNumber` (`lib/phone-auth.ts`),
  so a staff-assisted number change cannot be built on the plugin route. That
  is a separate, audited mutation.

## Not yet verified — do these first

The spike stopped before running a live deployment, so these are open. Each is
cheap once `bunx convex dev` is running with `OTP_TRANSPORT=logger`:

- [ ] Does the session cookie get set on `localhost:3000`? (DevTools → Application)
- [ ] How many round trips does a full sign-in take, and what does a 400 look like in the UI?
- [ ] Does a Convex HTTP action see a real client address? Request a code, then check `rateLimits` for an `otp:ip:*` row. **If none appears the per-address ceiling from KIT-49 is inert** and only the per-number and global ones bite.
- [ ] Confirm `getCurrentPerson` returns `null` rather than throwing for an anonymous visitor on a public page (acceptance gate §24).

## Steps

### Step 1: Provider and client

Create `lib/auth-client.ts` with `createAuthClient` + `convexClient()` +
`phoneNumberClient()`. Create `app/providers.tsx` (`"use client"`) wrapping
children in `ConvexBetterAuthProvider` with a `ConvexReactClient` built from
`NEXT_PUBLIC_CONVEX_URL`. Wrap `{children}` in `app/layout.tsx`.

**Verify**: `/` renders for an anonymous visitor with no console error;
`bun run build` exits 0. Record the anonymous result — it is acceptance gate
§24's "public pages render for signed-out visitors".

### Step 2: `/sign-in`

Two-step client form: number, then code. Call through the auth client. Map the
enumerated error codes above to sentences; do not string-match prose. Minimum
30-second resend cooldown client-side (spec §10) — note the server already
allows only three sends per number per ten minutes, so the cooldown is
courtesy, not the control.

Never render the code. Read it from the `bunx convex dev` log.

**Accessibility**: this is a form, so the baseline from the enquiry form
applies — focus moves to the field at fault, errors are announced, the
code input is `inputMode="numeric"` with `autocomplete="one-time-code"`.

### Step 3: The role gate

Add `.index("by_leadStatus", ["leadStatus", "lastEnquiryAt"])` to `persons`.

Create `convex/leads.ts` with a `requireStaff` helper built on
`findVerifiedPerson`, returning the Person only when `role` is `staff` or
`owner`. **Authentication is not authorization** (spec §21): the query itself
checks the role and returns nothing otherwise. Do not gate only in the page.

Tests must cover: anonymous, a verified `student`, a `staff`, and an `owner`.
The student case is the one that matters.

### Step 4: `/admin/leads`

A `<table>`. No shadcn Sidebar, Table or Recharts yet — a plain table proves
the data path, and spec §7 says add those "only as needed". Read-only: no
status changes, no notes, no export. Show phone, name, `leadStatus`,
`interestTrack`, `lastEnquiryAt`.

**Return only what the screen needs.** The query projects fields; it does not
return whole Person documents, and never the synthetic `@person.ict.invalid`
address (ADR-0001).

### Step 5: Sessions

Spec §10: students 90-day sliding, staff 7 days. Set these deliberately rather
than leaving Better Auth's default — a long student session is also the
cheapest way to avoid repeat billed verification once WhatsApp lands.

## Out of scope

WhatsApp transport, Turnstile, any admin write, CSV export, `/account`,
staff-assisted phone change, the Reader, Books.

## STOP conditions

- The role gate passes for a `student`. That is the failure this slice exists to prevent.
- A sign-in UI is about to reach a shared preview while `OTP_TRANSPORT` cannot deliver — there is no way to sign in on a hosted preview until KIT-46.
- You find yourself re-exporting all seven helpers from `lib/auth-server.ts` when the slice calls two.
- Adding a table or a column to `persons` to make the list easier.

## Maintenance notes

- Turnstile (spec §10) lands with this UI, not after it: sign-in is the first public surface that spends money per request.
- A CSP belongs here too. `next.config.ts` deliberately omits one because the layout inlines JSON-LD and the site embeds youtube-nocookie; this is the slice where the origin starts carrying sessions worth stealing.
