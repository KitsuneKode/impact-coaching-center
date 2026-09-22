import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import schema from "./schema"
import { readInbox, staffFromIdentity } from "./leads"

/**
 * Who may read the leads inbox.
 *
 * Authentication is not authorization (spec §21). Every verified student
 * holds a valid session, so the case that matters here is not "anonymous is
 * refused" - it is "a real, verified, signed-in student is refused".
 */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const PHONE = "+919876543210"

/** A verified Person with an enquiry against them, at the given role. */
async function seed(
  t: ReturnType<typeof convexTest>,
  role: "student" | "staff" | "owner"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone: PHONE,
    name: "Rituparna",
  })
  await t.run((ctx) =>
    ctx.db.patch(id, { role, leadStatus: "new", lastEnquiryAt: Date.now() })
  )
  return id
}

/** The identity shape the phone plugin leaves behind. */
const VERIFIED = { phoneNumber: PHONE, phoneNumberVerified: true }

describe("leads inbox authorization", () => {
  test("an anonymous visitor sees nothing and is not authorized", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "staff")
    const result = await t.run((ctx) => readInbox(ctx, null))
    expect(result.authorized).toBe(false)
    expect(result.leads).toEqual([])
    expect(await t.run((ctx) => staffFromIdentity(ctx, null))).toBeNull()
  })

  test("a verified STUDENT is refused, session and all", async () => {
    // The whole reason the check lives in the query rather than the page.
    const t = convexTest(schema, modules)
    await seed(t, "student")
    const result = await t.run((ctx) => readInbox(ctx, VERIFIED))
    expect(result.authorized).toBe(false)
    expect(result.leads).toEqual([])
    expect(await t.run((ctx) => staffFromIdentity(ctx, VERIFIED))).toBeNull()
  })

  test("staff sees the queue", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "staff")
    const result = await t.run((ctx) => readInbox(ctx, VERIFIED))
    expect(result.authorized).toBe(true)
    expect(result.leads).toHaveLength(1)
    expect(result.leads[0]!.phone).toBe(PHONE)
  })

  test("an owner sees the queue too", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "owner")
    expect(
      await t.run((ctx) => staffFromIdentity(ctx, VERIFIED))
    ).not.toBeNull()
  })

  test("the projection never leaks the synthetic address or free text", async () => {
    // ADR-0001: the placeholder email must never be presented as contactable.
    const t = convexTest(schema, modules)
    const id = await seed(t, "staff")
    await t.run((ctx) =>
      ctx.db.patch(id, { email: "placeholder@person.ict.invalid" })
    )
    const result = await t.run((ctx) => readInbox(ctx, VERIFIED))
    const row = result.leads[0]!
    // An allowed set, not an exact list: the point is that nothing escapes
    // the projection, and an exact list would fail every time a field the
    // screen legitimately shows is added.
    const allowed = [
      "id",
      "interestTrack",
      "lastEnquiryAt",
      "leadStatus",
      "name",
      "phone",
      "verifiedAt",
    ]
    for (const key of Object.keys(row)) expect(allowed).toContain(key)
    expect(Object.keys(row)).not.toContain("email")
    expect(JSON.stringify(row)).not.toContain("person.ict.invalid")
  })

  test("a Person with no lead status is not in the follow-up queue", async () => {
    // Reading a Resource creates a Person but not a lead, or staff drown in
    // casual readers and stop trusting the queue.
    const t = convexTest(schema, modules)
    const id = await seed(t, "staff")
    await t.run((ctx) => ctx.db.patch(id, { leadStatus: undefined }))
    const result = await t.run((ctx) => readInbox(ctx, VERIFIED))
    expect(result.leads).toEqual([])
  })
})


describe("bounded inbox pagination", () => {
  test("can reach enquiries beyond the first hundred without mixing statuses", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "staff")
    await t.run(async (ctx) => {
      for (let i = 0; i < 110; i++) await ctx.db.insert("persons", {
        phone: `+91900000${String(i).padStart(4, "0")}`, name: `Person ${i}`,
        role: "student", source: "website", leadStatus: "new", lastEnquiryAt: i + 1,
      })
      await ctx.db.insert("persons", { phone: "+918000000001", name: "Closed",
        role: "student", source: "website", leadStatus: "lost", lastEnquiryAt: Date.now() + 1000 })
    })
    const first = await t.run((ctx) => readInbox(ctx, VERIFIED, { status: "new", paginationOpts: { numItems: 25, cursor: null } }))
    expect(first.leads).toHaveLength(25)
    expect(first.isDone).toBe(false)
    const ids = new Set(first.leads.map((row) => row.id))
    let cursor = first.continueCursor
    let done = false
    for (let i = 0; i < 6 && !done; i++) {
      const next = await t.run((ctx) => readInbox(ctx, VERIFIED, { status: "new", paginationOpts: { numItems: 25, cursor } }))
      for (const row of next.leads) { expect(ids.has(row.id)).toBe(false); ids.add(row.id); expect(row.leadStatus).toBe("new") }
      cursor = next.continueCursor; done = next.isDone
    }
    expect(done).toBe(true)
    expect(ids.size).toBe(111)
  })
  test("a revoked role cannot reuse a cursor to read protected rows", async () => {
    const t = convexTest(schema, modules)
    const id = await seed(t, "staff")
    await t.run((ctx) => ctx.db.patch(id, { role: "student" }))
    const result = await t.run((ctx) => readInbox(ctx, VERIFIED, { status: "new", paginationOpts: {numItems: 25,cursor: null} }))
    expect(result.authorized).toBe(false)
    expect(result.leads).toEqual([])
  })
})
