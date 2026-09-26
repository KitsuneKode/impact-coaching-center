import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import schema from "./schema"
import { ENQUIRY_RATE_LIMITED, findVerifiedPerson } from "./persons"
import { enquiryTracks, enquiryTimings } from "../lib/leads"

/** Database behaviour of the Person upsert. */

// convex-test's documented module map uses Vite's import.meta.glob, which
// Bun does not provide, so the map is built explicitly.

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

describe("domain identity and enquiries", () => {
  const lead = {
    phone: "+919876543210",
    name: "Rituparna",
    track: enquiryTracks[0]!,
    timing: enquiryTimings[0]!,
  }
  test("an enquiry creates one unverified Person; retry creates no duplicate activity", async () => {
    const t = convexTest(schema, modules)
    expect(await t.mutation(internal.persons.recordEnquiry, lead)).toBe(
      "recorded"
    )
    expect(await t.mutation(internal.persons.recordEnquiry, lead)).toBe(
      "recorded"
    )
    const people = await t.run((ctx) => ctx.db.query("persons").collect())
    expect(people).toHaveLength(1)
    expect(people[0]!.leadStatus).toBe("new")
    expect(people[0]!.verifiedAt).toBeUndefined()
    expect(
      await t.run((ctx) => ctx.db.query("activities").collect())
    ).toHaveLength(1)
    // A different timing is a second real enquiry, not a duplicate.
    expect(
      await t.mutation(internal.persons.recordEnquiry, {
        ...lead,
        timing: enquiryTimings[1]!,
      })
    ).toBe("recorded")
    expect(
      await t.run((ctx) => ctx.db.query("activities").collect())
    ).toHaveLength(2)
    expect(
      await t.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(1)
  })
  test("verification and enquiry retain the same Person and existing staff workflow", async () => {
    const t = convexTest(schema, modules)
    const id = await t.mutation(record, { phone: lead.phone })
    await t.run((ctx) =>
      ctx.db.patch(id, { role: "staff", leadStatus: "contacted" })
    )
    await t.mutation(internal.persons.recordEnquiry, lead)
    const person = await t.run((ctx) =>
      findVerifiedPerson(ctx, {
        phoneNumber: lead.phone,
        phoneNumberVerified: true,
      })
    )
    expect(person?.id).toBe(id)
    expect(person?.role).toBe("staff")
    expect(person?.name).toBe("Rituparna")
    expect((await t.run((ctx) => ctx.db.get(id)))?.leadStatus).toBe("contacted")
  })
  test("anonymous, unverified and missing identities cannot resolve a domain Person", async () => {
    const t = convexTest(schema, modules)
    for (const identity of [
      null,
      { phoneNumber: lead.phone, phoneNumberVerified: false },
      { phoneNumber: lead.phone, phoneNumberVerified: true },
      { phoneNumber: "invalid", phoneNumberVerified: true },
    ]) {
      expect(await t.run((ctx) => findVerifiedPerson(ctx, identity))).toBeNull()
    }
    await t.mutation(internal.persons.recordEnquiry, lead)
    expect(
      await t.run((ctx) =>
        findVerifiedPerson(ctx, {
          phoneNumber: lead.phone,
          phoneNumberVerified: true,
        })
      )
    ).toBeNull()
  })
  test("repairs legacy generated names without replacing genuine names", async () => {
    const t = convexTest(schema, modules)
    const id = await t.run((ctx) =>
      ctx.db.insert("persons", {
        phone: lead.phone,
        name: lead.phone,
        role: "student",
        source: "verification",
      })
    )
    await t.mutation(record, { phone: lead.phone, name: lead.name })
    expect((await t.run((ctx) => ctx.db.get(id)))?.name).toBe("Rituparna")
  })
  test("a phone number cannot enquire without limit", async () => {
    const t = convexTest(schema, modules)
    for (let n = 0; n < 10; n++)
      await t.mutation(internal.persons.recordEnquiry, {
        ...lead,
        track: enquiryTracks[n % enquiryTracks.length]!,
      })
    await expect(
      t.mutation(internal.persons.recordEnquiry, {
        ...lead,
        timing: enquiryTimings[1]!,
      })
    ).rejects.toThrow(ENQUIRY_RATE_LIMITED)
  })
  test("one address cannot flood on behalf of many numbers", async () => {
    const t = convexTest(schema, modules)
    const ip = "203.0.113.4"
    // Distinct numbers, so only the address ceiling can stop this.
    for (let n = 0; n < 20; n++)
      await t.mutation(internal.persons.recordEnquiry, {
        ...lead,
        phone: `98765${String(43210 + n).padStart(5, "0")}`,
        ip,
      })
    await expect(
      t.mutation(internal.persons.recordEnquiry, {
        ...lead,
        phone: "9812345678",
        ip,
      })
    ).rejects.toThrow(ENQUIRY_RATE_LIMITED)
    // A different address is unaffected by its neighbour's spending.
    expect(
      await t.mutation(internal.persons.recordEnquiry, {
        ...lead,
        phone: "9812345678",
        ip: "203.0.113.9",
      })
    ).toBe("recorded")
  })
  test("invalid enquiry cannot create a Person or activity", async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.mutation(internal.persons.recordEnquiry, { ...lead, track: "Unknown" })
    ).rejects.toThrow()
    expect(
      await t.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(0)
    expect(
      await t.run((ctx) => ctx.db.query("activities").collect())
    ).toHaveLength(0)
  })
})
