---
status: done
ticket: KIT-46 (precondition; raise a KIT-<n> for this slice before starting)
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Plan 001: Throttle `/phone-number/send-otp` before any billed transport exists

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `docs/plans/README.md` and set `status:` in this file's header.
>
> **Drift check (run first)**:
> `git diff --stat 4a6c88e..HEAD -- lib/phone-auth.ts lib/phone-auth.test.ts convex/auth.ts convex/persons.ts convex/schema.ts convex/http.ts lib/otp-transport.ts`
> If any of those files changed, compare the "Current state" excerpts against
> the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none. **Must land before** `OTP_TRANSPORT=whatsapp` is implemented (KIT-46).
- **Category**: security
- **Planned at**: commit `4a6c88e`, 2026-09-20

## Why this matters

Phone verification is built end to end (Better Auth Phone Number plugin on
Convex) but nothing limits how often a code may be _sent_. `allowedAttempts: 5`
caps verification _guesses_; sends are unbounded. Today the only transport
logs to the local Convex console, so the cost is nil. The moment the WhatsApp
transport lands (KIT-46), every send is a billed Meta message and an
unthrottled endpoint becomes a cost sink and a harassment vector against any
Indian mobile number. Spec §10 "Cost and abuse controls" requires per-phone,
per-IP and global daily ceilings that fail closed; none exist. The
`rateLimits` table that already throttles enquiries also never expires rows,
so it grows with attack volume. This plan adds the send throttle using the
existing fixed-window limiter, and a daily sweep for stale rows.

Cloudflare Turnstile (also required by §10) is **out of scope** here: it needs
a site key, a client widget and a sign-in UI that does not exist yet.

## Concurrent-work notice (check before Step 1)

At planning time the working tree held **uncommitted** changes (not yet on
`main`) that add a `by_window` index on `rateLimits.windowStart` and an
opportunistic prune inside `consumeRateLimit` (`convex/persons.ts`,
`convex/schema.ts`). Run `git log --oneline -5 -- convex/schema.ts` and
`grep -n "by_window" convex/schema.ts`:

- If `by_window` exists: **skip** the `by_windowStart` index, `purgeStaleRateLimits` and `convex/crons.ts` in Step 1, and the `purgeStaleRateLimits` test in Step 2. Pruning is already handled.
- If it does not exist: proceed with Step 1 as written.

## Current state

- `lib/phone-auth.ts` — builds the Better Auth options shared by the Convex
  adapter and the memory-adapter tests. The `before` hook normalises the phone
  and, on `send-otp`, deletes the previous verification row:

```ts
// lib/phone-auth.ts:7-10
export function phoneAuthOptions(delivery: {
  send: (target: { phoneNumber: string; code: string }) => Promise<void>
  record: (person: { phone: string; name: string }) => Promise<void>
}) {
// lib/phone-auth.ts:21-41
        const raw = ctx.body?.phoneNumber
        const phone = typeof raw === "string" ? toE164(raw) : null
        if (!phone)
          throw new APIError("BAD_REQUEST", {
            message: "Enter a valid Indian mobile number.",
          })
        // ... comment about resend leaving one live code ...
        if (ctx.path === "/phone-number/send-otp") {
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(
            phone
          )
        }
        return {
          context: { ...ctx, body: { ...ctx.body, phoneNumber: phone } },
        }
```

- `convex/auth.ts:31-51` — `createAuth(ctx)` calls `phoneAuthOptions({ send, record })`; `record` runs `ctx.runMutation(internal.persons.recordVerifiedPerson, person)` after guarding `"runMutation" in ctx`. Mirror that pattern for the throttle.
- `convex/persons.ts:133-155` — `consumeRateLimit(ctx, key, limit, windowMs)`: fixed window; inserts a `rateLimits` row per key, resets `count` when the window elapses, returns `false` once `count >= limit`. Reuse it; do not write a second limiter.
- `convex/persons.ts:157-158` — `export const ENQUIRY_RATE_LIMITED = "Enquiry rate limit reached."` — the pattern for a sentinel error message.
- `convex/schema.ts:82-86` — `rateLimits: defineTable({ key, count, windowStart }).index("by_key", ["key"])`. No index on `windowStart`; no deletion anywhere.
- `convex/http.ts:64-74` — `authComponent.registerRoutesLazy(http, createAuth, {...})` exposes the plugin at `/api/auth/*` on the Convex site URL. Public.
- `lib/phone-auth.test.ts:10-62` — the `harness()` that boots `betterAuth` with `memoryAdapter`, `rateLimit: { enabled: false }`, a `convexTest` persons DB and capture callbacks. New tests go here and follow this harness.
- `convex/persons.db.test.ts:25-31` — builds the convex-test module map with `Bun.Glob("**/*.ts")`, skipping `*.test.ts`. Any new `convex/*.ts` file is picked up automatically. Copy this block into a new test file rather than importing it.
- Better Auth exposes `getIp(request | headers, options)` from `better-auth/api`; it reads `x-forwarded-for` by default and returns `null` when nothing trustworthy is present (in `bun test` it returns a localhost address). Whether Convex HTTP actions surface a client IP header is **unverified** — treat `ip` as optional everywhere.

Vocabulary (CONTEXT.md): the thing being verified is a **Person**; the code is a
**Verification**. Do not introduce `user`, `account` or `customer` in names.

Spec §10 lines to honour: "Convex rate limiting per phone number, per IP, and a
global daily send ceiling that fails closed with a truthful message." and "The
code is never returned in a response and never written to a production log."

## Commands you will need

| Purpose       | Command                           | Expected on success                        |
| ------------- | --------------------------------- | ------------------------------------------ |
| Install       | `bun install --frozen-lockfile`   | exit 0                                     |
| One test file | `bun test lib/phone-auth.test.ts` | all pass                                   |
| Convex tests  | `bun test convex/`                | all pass                                   |
| Full gate     | `bun run check`                   | format, lint, typecheck, tests all clean   |
| Build gate    | `bun run build`                   | exit 0 (required: touches server boundary) |
| Format write  | `bun run format`                  | rewrites files; run before `check`         |

## Scope

**In scope** (the only files you should modify or create):

- `lib/phone-auth.ts`
- `lib/phone-auth.test.ts`
- `convex/auth.ts`
- `convex/otp.ts` (create)
- `convex/otp.test.ts` (create)
- `convex/crons.ts` (create)
- `convex/schema.ts` (add one index only)
- `convex/persons.ts` (only if you must export something; do not change behaviour)
- `.env.example` (document nothing new — there are no new variables; touch only if you find you need one, and then STOP first)

**Out of scope** (do NOT touch):

- `lib/otp-transport.ts` — the WhatsApp transport is KIT-46, a separate slice.
- `convex/http.ts` — the enquiry route's own throttle is already implemented.
- Anything under `components/` or `app/` — there is no sign-in UI yet; do not add one.
- Better Auth's built-in `rateLimit` option — the Convex component's storage for it is unverified; this plan uses our own `rateLimits` table deliberately.

## Git workflow

- Branch: `<your-handle>/kit-<n>-otp-send-throttle` (the repo uses `<handle>/kit-<n>-<slug>`, e.g. `bhuyanmanash2002/kit-39-person-foundation`).
- Conventional commits, lowercase imperative sentence, e.g. `feat: put a ceiling on public enquiry submissions` (from `git log`). Suggested: `feat: throttle verification code sends per phone, address and day`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the Convex allowance mutation and the sweep

Create `convex/otp.ts`:

```ts
import { v } from "convex/values"

import { toE164 } from "../lib/leads"
import { internalMutation } from "./_generated/server"
import { consumeRateLimit } from "./persons"

/** Raised when a caller exceeds a verification-code send ceiling. */
export const OTP_SEND_LIMITED = "Verification code send limit reached."

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** A resend button pressed a few times. More than this is not a person. */
export const SENDS_PER_PHONE_10_MIN = 3
/** Spec §10: roughly one code per new Person; ten a day is generous. */
export const SENDS_PER_PHONE_DAY = 10
/** One shared connection (a college or a cafe) may hold several Persons. */
export const SENDS_PER_IP_HOUR = 15
/** Global daily ceiling. Every send is a billed message once WhatsApp lands. */
export const SENDS_PER_DAY_GLOBAL = 500

/**
 * Spend one send of allowance for this number, this address and the whole
 * deployment. Returns false as soon as any ceiling is hit. Fail closed: an
 * allowance already spent on a bucket that passed is not refunded when a
 * later bucket refuses, which is the conservative direction.
 *
 * Internal: only the auth hook in convex/auth.ts calls this.
 */
export const consumeSendAllowance = internalMutation({
  args: { phone: v.string(), ip: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return false
    const checks: Array<[string, number, number]> = [
      [`otp:phone:10m:${phone}`, SENDS_PER_PHONE_10_MIN, 10 * MINUTE],
      [`otp:phone:day:${phone}`, SENDS_PER_PHONE_DAY, DAY],
      ...(args.ip
        ? ([[`otp:ip:${args.ip}`, SENDS_PER_IP_HOUR, HOUR]] as Array<
            [string, number, number]
          >)
        : []),
      ["otp:global:day", SENDS_PER_DAY_GLOBAL, DAY],
    ]
    for (const [key, limit, windowMs] of checks) {
      if (!(await consumeRateLimit(ctx, key, limit, windowMs))) return false
    }
    return true
  },
})

/**
 * Delete rate-limit rows whose window ended more than a day ago. The longest
 * window in use is 24h, so anything older than 48h can no longer influence a
 * decision. Runs from convex/crons.ts.
 */
export const purgeStaleRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 2 * DAY
    const stale = await ctx.db
      .query("rateLimits")
      .withIndex("by_windowStart", (q) => q.lt("windowStart", cutoff))
      .take(500)
    for (const row of stale) await ctx.db.delete(row._id)
    return stale.length
  },
})
```

In `convex/schema.ts`, change the `rateLimits` table's trailing
`.index("by_key", ["key"])` to
`.index("by_key", ["key"]).index("by_windowStart", ["windowStart"])`.

Create `convex/crons.ts`:

```ts
import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// Rate-limit rows are only ever rewritten in place, never removed, so a flood
// of distinct keys would grow the table forever without this.
crons.daily(
  "purge stale rate limits",
  { hourUTC: 21, minuteUTC: 30 }, // 03:00 IST
  internal.otp.purgeStaleRateLimits
)

export default crons
```

**Verify**: `bun run typecheck` → exit 0. (`convex/_generated` is regenerated by
`npx convex dev` / `bunx convex dev`; if `internal.otp` does not typecheck,
run `bunx convex codegen` once and re-run typecheck. If codegen needs a
deployment you do not have, see STOP conditions.)

### Step 2: Write the failing Convex tests

Create `convex/otp.test.ts`. Copy the module-map block from
`convex/persons.db.test.ts:25-31` verbatim (the `Bun.Glob` loop), then:

```ts
import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import schema from "./schema"
import {
  SENDS_PER_DAY_GLOBAL,
  SENDS_PER_IP_HOUR,
  SENDS_PER_PHONE_10_MIN,
  SENDS_PER_PHONE_DAY,
} from "./otp"

// <module map block copied from persons.db.test.ts goes here>

const allow = internal.otp.consumeSendAllowance
const phone = "+919876543210"

describe("consumeSendAllowance", () => {
  test("a number gets a few resends, then is refused", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++)
      expect(await t.mutation(allow, { phone })).toBe(true)
    expect(await t.mutation(allow, { phone })).toBe(false)
  })
  test("a different number is unaffected by its neighbour", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n <= SENDS_PER_PHONE_10_MIN; n++)
      await t.mutation(allow, { phone })
    expect(await t.mutation(allow, { phone: "+919876500011" })).toBe(true)
  })
  test("the same number written differently shares one allowance", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++)
      await t.mutation(allow, { phone: "98765 43210" })
    expect(await t.mutation(allow, { phone: "09876543210" })).toBe(false)
  })
  test("an invalid number is refused without spending anything", async () => {
    const t = convexTest(schema, modules)
    expect(await t.mutation(allow, { phone: "+16507001234" })).toBe(false)
    expect(
      await t.run((ctx) => ctx.db.query("rateLimits").collect())
    ).toHaveLength(0)
  })
  test("one address cannot request codes for many numbers", async () => {
    const t = convexTest(schema, modules)
    const ip = "203.0.113.4"
    for (let n = 0; n < SENDS_PER_IP_HOUR; n++)
      expect(
        await t.mutation(allow, {
          phone: `98765${String(43210 + n).padStart(5, "0")}`,
          ip,
        })
      ).toBe(true)
    expect(await t.mutation(allow, { phone: "9812345678", ip })).toBe(false)
    expect(
      await t.mutation(allow, { phone: "9812345678", ip: "203.0.113.9" })
    ).toBe(true)
  })
  test("the deployment has a daily ceiling", async () => {
    const t = convexTest(schema, modules)
    // Spend the global bucket directly; iterating 500 phones is slow and
    // proves nothing the per-phone tests do not.
    await t.run((ctx) =>
      ctx.db.insert("rateLimits", {
        key: "otp:global:day",
        count: SENDS_PER_DAY_GLOBAL,
        windowStart: Date.now(),
      })
    )
    expect(await t.mutation(allow, { phone })).toBe(false)
  })
  test("a phone's daily allowance survives the ten-minute window rolling over", async () => {
    const t = convexTest(schema, modules)
    await t.run((ctx) =>
      ctx.db.insert("rateLimits", {
        key: `otp:phone:day:${phone}`,
        count: SENDS_PER_PHONE_DAY,
        windowStart: Date.now(),
      })
    )
    expect(await t.mutation(allow, { phone })).toBe(false)
  })
})

describe("purgeStaleRateLimits", () => {
  test("removes rows older than two days and keeps live ones", async () => {
    const t = convexTest(schema, modules)
    const now = Date.now()
    await t.run(async (ctx) => {
      await ctx.db.insert("rateLimits", {
        key: "old",
        count: 1,
        windowStart: now - 3 * 24 * 3_600_000,
      })
      await ctx.db.insert("rateLimits", {
        key: "live",
        count: 1,
        windowStart: now,
      })
    })
    expect(await t.mutation(internal.otp.purgeStaleRateLimits, {})).toBe(1)
    const rows = await t.run((ctx) => ctx.db.query("rateLimits").collect())
    expect(rows.map((r) => r.key)).toEqual(["live"])
  })
})
```

**Verify**: `bun test convex/otp.test.ts` → all 8 pass. (If Step 1 was done
first they pass immediately; that is fine — the point is they exist.)

### Step 3: Add the `throttle` seam to `phoneAuthOptions`

In `lib/phone-auth.ts`:

1. Extend the `delivery` parameter type with
   `throttle: (target: { phone: string; ip: string | null }) => Promise<boolean>`.
2. Import `getIp` alongside `APIError, createAuthMiddleware` from `"better-auth/api"`.
3. Inside the hook, **after** the phone is normalised and **before** the
   `deleteVerificationByIdentifier` call, add:

```ts
if (ctx.path === "/phone-number/send-otp") {
  // Before the delete below: a refused resend must leave the live
  // code intact, or a flood could be used to log a real Person out
  // of their own verification.
  const ip = getIp(
    ctx.request ?? ctx.headers ?? new Headers(),
    ctx.context.options
  )
  if (!(await delivery.throttle({ phone, ip }))) {
    throw new APIError("TOO_MANY_REQUESTS", {
      message:
        "Too many codes were requested for this number. Wait a few minutes and try again.",
    })
  }
}
```

Keep the existing delete block; it now runs only when the throttle passed.
Keep the existing comments.

**Verify**: `bun run typecheck` → errors only in `convex/auth.ts` and
`lib/phone-auth.test.ts` (missing `throttle`). Nothing else.

### Step 4: Wire the throttle in `convex/auth.ts`

In `createAuth`, pass a third callback to `phoneAuthOptions`, mirroring `record`:

```ts
    throttle: async ({ phone, ip }) => {
      if (!("runMutation" in ctx))
        throw new Error("Sending a verification code requires a mutation-capable context.")
      return await ctx.runMutation(internal.otp.consumeSendAllowance, {
        phone,
        ip: ip ?? undefined,
      })
    },
```

**Verify**: `bun run typecheck` → errors only in `lib/phone-auth.test.ts`.

### Step 5: Extend the memory-adapter harness and add hook tests

In `lib/phone-auth.test.ts` `harness()`:

- add `let allowSend = true` and `let throttled: { phone: string; ip: string | null } | null = null`
- pass `throttle: async (target) => { throttled = target; return allowSend }` to `phoneAuthOptions`
- return `allowSend: (v: boolean) => { allowSend = v }` and `lastThrottle: () => throttled`

Add tests to the existing `describe`:

```ts
test("a refused send returns 429 and leaves the live code intact", async () => {
  const h = harness()
  await h.send()
  const live = h.lastCode()
  h.allowSend(false)
  expect((await h.send()).status).toBe(429)
  expect(h.db.verification).toHaveLength(1)
  h.allowSend(true)
  expect((await h.verify(undefined, { code: live })).status).toBe(200)
})
test("the throttle sees the normalised number, never the raw input", async () => {
  const h = harness()
  await h.send("98765 43210")
  expect(h.lastThrottle()?.phone).toBe("+919876543210")
})
test("verify is not throttled by the send ceiling", async () => {
  const h = harness()
  await h.send()
  h.allowSend(false)
  expect((await h.verify()).status).toBe(200)
})
test("a refused send delivers nothing", async () => {
  const h = harness()
  h.allowSend(false)
  expect((await h.send()).status).toBe(429)
  expect(h.sentTo()).toBe("")
  expect(h.db.verification).toHaveLength(0)
})
```

**Verify**: `bun test lib/phone-auth.test.ts` → all pass (9 existing + 4 new = 13).

### Step 6: Gates

`bun run format` then `bun run check` then `bun run build`.

**Verify**: all three exit 0. Test count is 157 + 12 = 169 (8 in `convex/otp.test.ts`, 4 in `lib/phone-auth.test.ts`); report the actual number.

## Test plan

Covered by Steps 2 and 5. Pattern files: `convex/persons.db.test.ts` (Convex
DB behaviour), `lib/phone-auth.test.ts` (real plugin through the memory
adapter). No mocking of the plugin's verifier — the spec forbids overriding
`verifyOTP`.

## Done criteria

- [ ] `bun run check` exits 0; `bun run build` exits 0
- [ ] `bun test convex/otp.test.ts` — 8 tests pass
- [ ] `bun test lib/phone-auth.test.ts` — 13 tests pass
- [ ] `grep -n "throttle" lib/phone-auth.ts convex/auth.ts` shows the seam and its wiring
- [ ] `grep -n "by_windowStart" convex/schema.ts` → 1 match
- [ ] `git status --short` shows only in-scope files
- [ ] `docs/plans/README.md` status row updated; this file's `status:` set to `done`

## STOP conditions

Stop and report back if:

- `lib/phone-auth.ts:33-37` no longer contains the `deleteVerificationByIdentifier` block, or `convex/auth.ts` no longer has the `record` callback shape shown above.
- `getIp` is not exported from `better-auth/api` in the installed version (`grep -n "getIp" node_modules/better-auth/dist/api/index.d.mts` returns nothing).
- `bunx convex codegen` demands a login or deployment you do not have and `internal.otp` therefore cannot typecheck — report; do not hand-edit `convex/_generated`.
- The memory-adapter harness returns something other than 429 for an `APIError("TOO_MANY_REQUESTS")` — report the status you got rather than changing the assertion.
- You find yourself wanting to edit `lib/otp-transport.ts` or `convex/http.ts`.

## Executed — 20 September 2026

Steps 1-6 landed. Per the concurrent-work notice, the `by_windowStart` index,
`purgeStaleRateLimits` and `convex/crons.ts` were **skipped**: `by_window` and
an opportunistic prune inside `consumeRateLimit` already shipped with the
enquiry ceilings, and they bound the table without a scheduled sweep.

`bunx convex codegen` needed the gitignored `.env.local` from the main
checkout, which points at the local anonymous deployment; with it, `internal.otp`
generated normally and nothing under `convex/_generated` was hand-edited.

## Maintenance notes

- The constants at the top of `convex/otp.ts` are the knobs. When WhatsApp
  pricing is confirmed (spec §11), revisit `SENDS_PER_DAY_GLOBAL` against the
  agreed monthly spend ceiling.
- Whether Convex HTTP actions expose a client IP is unverified. On the first
  preview deployment, request a code and check the `rateLimits` table for an
  `otp:ip:*` row. If none appears, the per-IP bucket is inert and the
  `x-forwarded-for` question in `app/actions/lead.ts:74` applies here too.
- Turnstile (spec §10) is still missing and must be added with the sign-in UI.
- A reviewer should check the ordering in the hook: throttle → delete → plugin.
  Swapping the first two lets a flood retire a real Person's live code.
