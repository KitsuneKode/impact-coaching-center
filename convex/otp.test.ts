import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import schema from "./schema"
import {
  OTP_ATTEMPTS,
  SENDS_PER_DAY_GLOBAL,
  SENDS_PER_IP_HOUR,
  SENDS_PER_PHONE_10_MIN,
  SENDS_PER_PHONE_DAY,
} from "./otp"

/**
 * Ceilings on verification-code sends.
 *
 * These exist before the transport that makes them cost money, so there is no
 * billed path to observe yet. What is testable is the allowance arithmetic,
 * and that one bucket cannot spend another's.
 */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const claim = internal.otp.claimOtpSend
const release = internal.otp.releaseOtpSend
const PHONE = "9876543210"

async function finishSend(
  t: ReturnType<typeof convexTest>,
  phone: string,
  ip?: string
) {
  const result = await t.mutation(claim, { phone, ip })
  if (result.ok)
    await t.mutation(release, { phone, generation: result.generation })
  return result
}

describe("claimOtpSend", () => {
  test("allows a few sends, then refuses the number", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++)
      expect(await finishSend(t, PHONE)).toMatchObject({ ok: true })
    expect(await finishSend(t, PHONE)).toEqual({
      ok: false,
      reason: "phone",
    })
  })

  test("refuses a number that is not an Indian mobile before spending anything", async () => {
    const t = convexTest(schema, modules)
    expect(await finishSend(t, "not-a-number")).toEqual({
      ok: false,
      reason: "phone",
    })
    expect(await t.run((ctx) => ctx.db.query("rateLimits").collect())).toEqual(
      []
    )
    expect(
      await t.run((ctx) => ctx.db.query("otpSendLeases").collect())
    ).toEqual([])
  })

  test("one number's ceiling does not touch another's", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++) await finishSend(t, PHONE)
    expect(await finishSend(t, PHONE)).toEqual({ ok: false, reason: "phone" })
    expect(await finishSend(t, "9812345678")).toMatchObject({ ok: true })
  })

  test("the same number written differently shares one allowance", async () => {
    const t = convexTest(schema, modules)
    // Normalised before the key is built, so these are not three buckets.
    for (const form of ["9876543210", "+919876543210", "098765 43210"])
      expect(await finishSend(t, form)).toMatchObject({ ok: true })
    expect(await finishSend(t, PHONE)).toEqual({ ok: false, reason: "phone" })
  })

  test("an address ceiling stops a flood across many numbers", async () => {
    const t = convexTest(schema, modules)
    const ip = "203.0.113.4"
    // Distinct numbers, each well inside its own ceiling, so only the address
    // bucket can refuse.
    for (let n = 0; n < SENDS_PER_IP_HOUR; n++)
      expect(
        await finishSend(t, `98765${String(43210 + n).padStart(5, "0")}`, ip)
      ).toMatchObject({ ok: true })
    expect(await finishSend(t, "9812345678", ip)).toEqual({
      ok: false,
      reason: "address",
    })
    // A different address is unaffected by its neighbour's spending.
    expect(await finishSend(t, "9812345678", "203.0.113.9")).toMatchObject({
      ok: true,
    })
  })

  test("a short-window check does not wipe a day bucket at its ceiling", async () => {
    // Regression. The prune inside consumeRateLimit used the CALLING bucket's
    // window as its cutoff. Every send checks the ten-minute bucket first, so
    // it deleted the per-day and global-per-day rows whatever counts sat in
    // them, and neither of those two ceilings ever fired.
    const t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      await ctx.db.insert("rateLimits", {
        key: "otp:global:day",
        count: SENDS_PER_DAY_GLOBAL,
        windowStart: Date.now() - 11 * 60_000,
      })
    })
    // The deployment ceiling must be what refuses, and it must say so.
    expect(await finishSend(t, PHONE)).toEqual({
      ok: false,
      reason: "deployment",
    })
    const rows = await t.run((ctx) => ctx.db.query("rateLimits").collect())
    expect(rows.find((r) => r.key === "otp:global:day")?.count).toBe(
      SENDS_PER_DAY_GLOBAL
    )
  })

  test("a day bucket still expires once its own window has passed", async () => {
    const t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      await ctx.db.insert("rateLimits", {
        key: "otp:global:day",
        count: SENDS_PER_DAY_GLOBAL,
        windowStart: Date.now() - 25 * 60 * 60_000,
      })
    })
    expect(await finishSend(t, PHONE)).toMatchObject({ ok: true })
  })

  test("a spoofed address cannot mint a bucket", async () => {
    const t = convexTest(schema, modules)
    await finishSend(t, PHONE, "not-an-address")
    const rows = await t.run((ctx) => ctx.db.query("rateLimits").collect())
    expect(rows.filter((r) => r.key.startsWith("otp:ip:"))).toEqual([])
  })

  test("the daily ceiling is above the ten-minute one", async () => {
    // Otherwise the per-day bucket could never be reached and the constant
    // would be decorative.
    expect(SENDS_PER_PHONE_DAY).toBeGreaterThan(SENDS_PER_PHONE_10_MIN)
  })

  test("a refused send still leaves the allowance spent, never refunded", async () => {
    const t = convexTest(schema, modules)
    const ip = "203.0.113.4"
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++)
      await finishSend(t, PHONE, ip)
    expect(await finishSend(t, PHONE, ip)).toEqual({
      ok: false,
      reason: "phone",
    })
    const rows = await t.run((ctx) => ctx.db.query("rateLimits").collect())
    // The phone bucket refused first, so the address bucket never saw the
    // last call - failing closed can only ever refuse more, never fewer.
    const phoneRow = rows.find((r) => r.key.startsWith("otp:phone:10m:"))
    expect(phoneRow?.count).toBe(SENDS_PER_PHONE_10_MIN)
  })

  test("an overlapping claim keeps the live code and does not spend again", async () => {
    const t = convexTest(schema, modules)
    const first = await t.mutation(claim, { phone: PHONE })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const hash = "a".repeat(64)
    expect(
      await t.mutation(internal.otp.commitOtpCode, {
        phone: PHONE,
        generation: first.generation,
        codeHash: hash,
        codeExpiresAt: Date.now() + 60_000,
      })
    ).toBe(true)
    const [second, third] = await Promise.all([
      t.mutation(claim, { phone: PHONE }),
      t.mutation(claim, { phone: PHONE }),
    ])
    expect(second).toEqual({ ok: false, reason: "inflight" })
    expect(third).toEqual({ ok: false, reason: "inflight" })
    const phoneRow = (
      await t.run((ctx) => ctx.db.query("rateLimits").collect())
    ).find((row) => row.key.startsWith("otp:phone:10m:"))
    expect(phoneRow?.count).toBe(1)
    const lease = await t.run((ctx) => ctx.db.query("otpSendLeases").unique())
    expect(lease?.codeHash).toBe(hash)
    expect(lease?.generation).toBe(first.generation)
  })

  test("a stale generation cannot replace the code a newer send committed", async () => {
    const t = convexTest(schema, modules)
    const first = await t.mutation(claim, { phone: PHONE })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    await t.run(async (ctx) => {
      const row = await ctx.db.query("otpSendLeases").unique()
      if (!row) throw new Error("expected a lease")
      await ctx.db.patch(row._id, { inflightUntil: Date.now() - 1 })
    })
    const second = await t.mutation(claim, { phone: PHONE })
    expect(second.ok).toBe(true)
    if (!second.ok) return
    const stale = "b".repeat(64)
    const current = "c".repeat(64)
    expect(
      await t.mutation(internal.otp.commitOtpCode, {
        phone: PHONE,
        generation: first.generation,
        codeHash: stale,
        codeExpiresAt: Date.now() + 60_000,
      })
    ).toBe(false)
    expect(
      await t.mutation(internal.otp.commitOtpCode, {
        phone: PHONE,
        generation: second.generation,
        codeHash: current,
        codeExpiresAt: Date.now() + 60_000,
      })
    ).toBe(true)
    const lease = await t.run((ctx) => ctx.db.query("otpSendLeases").unique())
    expect(lease?.codeHash).toBe(current)
  })

  test("verify accepts one code once, then nothing", async () => {
    const t = convexTest(schema, modules)
    const claimed = await t.mutation(claim, { phone: PHONE })
    expect(claimed.ok).toBe(true)
    if (!claimed.ok) return
    const hash = "d".repeat(64)
    await t.mutation(internal.otp.commitOtpCode, {
      phone: PHONE,
      generation: claimed.generation,
      codeHash: hash,
      codeExpiresAt: Date.now() + 60_000,
    })
    expect(
      await t.mutation(internal.otp.verifyOtpCode, {
        phone: PHONE,
        codeHash: hash,
      })
    ).toBe("ok")
    expect(
      await t.mutation(internal.otp.verifyOtpCode, {
        phone: PHONE,
        codeHash: hash,
      })
    ).toBe("missing")
  })

  test("wrong guesses stop at the attempt ceiling", async () => {
    const t = convexTest(schema, modules)
    const claimed = await t.mutation(claim, { phone: PHONE })
    expect(claimed.ok).toBe(true)
    if (!claimed.ok) return
    await t.mutation(internal.otp.commitOtpCode, {
      phone: PHONE,
      generation: claimed.generation,
      codeHash: "e".repeat(64),
      codeExpiresAt: Date.now() + 60_000,
    })
    for (let n = 0; n < OTP_ATTEMPTS - 1; n++)
      expect(
        await t.mutation(internal.otp.verifyOtpCode, {
          phone: PHONE,
          codeHash: "f".repeat(64),
        })
      ).toBe("invalid")
    expect(
      await t.mutation(internal.otp.verifyOtpCode, {
        phone: PHONE,
        codeHash: "f".repeat(64),
      })
    ).toBe("exhausted")
    expect(
      await t.mutation(internal.otp.verifyOtpCode, {
        phone: PHONE,
        codeHash: "e".repeat(64),
      })
    ).toBe("missing")
  })

  test("abort drops a committed code and lets the next send proceed", async () => {
    const t = convexTest(schema, modules)
    const claimed = await t.mutation(claim, { phone: PHONE })
    expect(claimed.ok).toBe(true)
    if (!claimed.ok) return
    await t.mutation(internal.otp.commitOtpCode, {
      phone: PHONE,
      generation: claimed.generation,
      codeHash: "1".repeat(64),
      codeExpiresAt: Date.now() + 60_000,
    })
    await t.mutation(internal.otp.abortOtpCode, {
      phone: PHONE,
      generation: claimed.generation,
    })
    expect(
      await t.mutation(internal.otp.verifyOtpCode, {
        phone: PHONE,
        codeHash: "1".repeat(64),
      })
    ).toBe("missing")
    expect(await t.mutation(claim, { phone: PHONE })).toMatchObject({
      ok: true,
    })
  })
})
