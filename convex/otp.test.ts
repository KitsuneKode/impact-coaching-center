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

const spend = internal.otp.consumeSendAllowance
const PHONE = "9876543210"

describe("consumeSendAllowance", () => {
  test("allows a few sends, then refuses the number", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++)
      expect(await t.mutation(spend, { phone: PHONE })).toBeNull()
    expect(await t.mutation(spend, { phone: PHONE })).toBe("phone")
  })

  test("refuses a number that is not an Indian mobile before spending anything", async () => {
    const t = convexTest(schema, modules)
    expect(await t.mutation(spend, { phone: "not-a-number" })).toBe("phone")
    expect(await t.run((ctx) => ctx.db.query("rateLimits").collect())).toEqual(
      []
    )
  })

  test("one number's ceiling does not touch another's", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < SENDS_PER_PHONE_10_MIN; n++)
      await t.mutation(spend, { phone: PHONE })
    expect(await t.mutation(spend, { phone: PHONE })).toBe("phone")
    expect(await t.mutation(spend, { phone: "9812345678" })).toBeNull()
  })

  test("the same number written differently shares one allowance", async () => {
    const t = convexTest(schema, modules)
    // Normalised before the key is built, so these are not three buckets.
    for (const form of ["9876543210", "+919876543210", "098765 43210"])
      expect(await t.mutation(spend, { phone: form })).toBeNull()
    expect(await t.mutation(spend, { phone: PHONE })).toBe("phone")
  })

  test("an address ceiling stops a flood across many numbers", async () => {
    const t = convexTest(schema, modules)
    const ip = "203.0.113.4"
    // Distinct numbers, each well inside its own ceiling, so only the address
    // bucket can refuse.
    for (let n = 0; n < SENDS_PER_IP_HOUR; n++)
      expect(
        await t.mutation(spend, {
          phone: `98765${String(43210 + n).padStart(5, "0")}`,
          ip,
        })
      ).toBeNull()
    expect(await t.mutation(spend, { phone: "9812345678", ip })).toBe("address")
    // A different address is unaffected by its neighbour's spending.
    expect(
      await t.mutation(spend, { phone: "9812345678", ip: "203.0.113.9" })
    ).toBeNull()
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
    expect(await t.mutation(spend, { phone: PHONE })).toBe("deployment")
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
    expect(await t.mutation(spend, { phone: PHONE })).toBeNull()
  })

  test("a spoofed address cannot mint a bucket", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(spend, { phone: PHONE, ip: "not-an-address" })
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
      await t.mutation(spend, { phone: PHONE, ip })
    expect(await t.mutation(spend, { phone: PHONE, ip })).toBe("phone")
    const rows = await t.run((ctx) => ctx.db.query("rateLimits").collect())
    // The phone bucket refused first, so the address bucket never saw the
    // last call - failing closed can only ever refuse more, never fewer.
    const phoneRow = rows.find((r) => r.key.startsWith("otp:phone:10m:"))
    expect(phoneRow?.count).toBe(SENDS_PER_PHONE_10_MIN)
  })
})
