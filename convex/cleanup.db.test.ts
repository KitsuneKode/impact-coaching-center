import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import { UNDELIVERABLE_FOR_MS } from "./otp"
import schema from "./schema"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

describe("daily cleanup", () => {
  test("drops expired undeliverable numbers and spent limits, keeps live ones", async () => {
    const t = convexTest(schema, modules)
    const now = Date.now()
    await t.run(async (ctx) => {
      await ctx.db.insert("otpUndeliverable", {
        phone: "+919800000001",
        code: 131026,
        at: now - UNDELIVERABLE_FOR_MS - 1000,
      })
      await ctx.db.insert("otpUndeliverable", {
        phone: "+919800000002",
        code: 131026,
        at: now,
      })
      await ctx.db.insert("rateLimits", {
        key: "old",
        count: 1,
        windowStart: now - 3 * 24 * 60 * 60 * 1000,
      })
      await ctx.db.insert("rateLimits", {
        key: "live",
        count: 1,
        windowStart: now,
      })
    })
    await t.mutation(internal.cleanup.weekly, {})
    const numbers = await t.run((ctx) =>
      ctx.db.query("otpUndeliverable").collect()
    )
    expect(numbers.map((row) => row.phone)).toEqual(["+919800000002"])
    const limits = await t.run((ctx) => ctx.db.query("rateLimits").collect())
    expect(limits.map((row) => row.key)).toEqual(["live"])
  })
})
