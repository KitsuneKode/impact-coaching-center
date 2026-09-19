import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import schema from "./schema"

/**
 * Database behaviour of the Person upsert.
 *
 * `mergePersonName` is tested in isolation, but the branch that matters -
 * whether a second arrival finds the existing row or inserts a duplicate
 * under the natural key - only exists against a real `ctx.db`.
 */

// convex-test's documented module map uses Vite's import.meta.glob, which
// Bun does not provide, so the map is built explicitly.
//
// Loading every module includes convex/auth.ts, which resolves the OTP
// transport at import time and throws when OTP_TRANSPORT is unset. Setting it
// here is what makes the harness loadable - and is itself a demonstration
// that the fail-closed guard fires at module load rather than at send time.
process.env.OTP_TRANSPORT ??= "logger"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  // _generated must be included: convex-test locates the modules root by
  // finding it in the map.
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const record = internal.persons.recordVerifiedPerson

describe("recordVerifiedPerson", () => {
  test("creates a Person on first verification", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna Das" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(1)
    expect(people[0]!.phone).toBe("+919876543210")
    expect(people[0]!.name).toBe("Rituparna Das")
    expect(people[0]!.role).toBe("student")
    expect(people[0]!.source).toBe("verification")
    expect(people[0]!.verifiedAt).toBeNumber()
  })

  test("a Person created by verification is not yet a lead", async () => {
    // ADR-0001: reading a Resource makes someone known, not a lead, or the
    // staff queue floods with casual readers.
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people[0]!.leadStatus).toBeUndefined()
  })

  test("verifying the same number twice does not create a second Person", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna" })
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(1)
  })

  test("a later verification does not overwrite a name we already have", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna Das" })
    await t.mutation(record, { phone: "+919876543210", name: "R" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people[0]!.name).toBe("Rituparna Das")
  })

  test("a later verification fills a name we did not have", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "" })
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna Das" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(1)
    expect(people[0]!.name).toBe("Rituparna Das")
  })

  test("re-verifying refreshes verifiedAt on the same record", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna" })
    const first = await t.run(async (ctx) => ctx.db.query("persons").collect())

    await new Promise((resolve) => setTimeout(resolve, 5))
    await t.mutation(record, { phone: "+919876543210", name: "Rituparna" })
    const second = await t.run(async (ctx) => ctx.db.query("persons").collect())

    expect(second[0]!._id).toBe(first[0]!._id)
    expect(second[0]!.verifiedAt!).toBeGreaterThan(first[0]!.verifiedAt!)
  })

  test("two different numbers are two different People", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "A" })
    await t.mutation(record, { phone: "+919876500011", name: "B" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(2)
  })

  test("the same number written differently lands on one Person", async () => {
    // The natural key only works if every entry point normalises first.
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210", name: "A" })
    await t.mutation(record, { phone: "09876543210", name: "A" })
    await t.mutation(record, { phone: "98765 43210", name: "A" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(1)
    expect(people[0]!.phone).toBe("+919876543210")
  })

  test("refuses a number that is not an Indian mobile", async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.mutation(record, { phone: "+16507001234", name: "A" })
    ).rejects.toThrow()

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(0)
  })

  test("a missing name is stored as empty rather than undefined", async () => {
    const t = convexTest(schema, modules)
    await t.mutation(record, { phone: "+919876543210" })

    const people = await t.run(async (ctx) => ctx.db.query("persons").collect())
    expect(people[0]!.name).toBe("")
  })
})
