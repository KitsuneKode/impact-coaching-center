import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import { readInboxPage } from "./leads"
import schema from "./schema"

/**
 * Who may read the leads inbox, and what they see.
 *
 * `readInboxPage` takes the already-resolved viewer (or null) rather than a
 * session, so the role and data decisions are testable without standing up
 * the Better Auth component. The live path's other half - session freshness
 * - is covered by `sessionStale` in people.db.test.ts; the glue between them
 * is `inboxPage` → `requireStaff`, which needs a real deployment to observe.
 */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const PHONE = "+919876543210"
const PAGE = { numItems: 25, cursor: null }

/** A verified Person at the given role, with an enquiry only when asked. */
async function seed(
  t: ReturnType<typeof convexTest>,
  role: "student" | "staff" | "owner",
  {
    phone = PHONE,
    leadStatus,
    lastEnquiryAt,
  }: {
    phone?: string
    leadStatus?: "new" | "contacted" | "interested" | "enrolled" | "lost"
    lastEnquiryAt?: number
  } = {}
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Rituparna",
  })
  await t.run((ctx) =>
    ctx.db.patch(id, {
      role,
      ...(leadStatus !== undefined ? { leadStatus } : {}),
      ...(lastEnquiryAt !== undefined ? { lastEnquiryAt } : {}),
    })
  )
  return id
}

/** The viewer shape findVerifiedPerson returns, minus the DB round trip. */
async function viewer(
  t: ReturnType<typeof convexTest>,
  id: unknown
): Promise<Parameters<typeof readInboxPage>[1]> {
  const doc = await t.run((ctx) => ctx.db.get(id as never))
  if (!doc) return null
  return {
    id: doc._id,
    name: doc.name,
    phone: doc.phone,
    role: doc.role,
    verifiedAt: doc.verifiedAt,
    revision: doc.revision ?? 0,
  }
}

describe("leads inbox authorization", () => {
  test("an anonymous caller gets an empty page", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "staff")
    const result = await t.run((ctx) => readInboxPage(ctx, null, PAGE))
    expect(result.page).toEqual([])
  })

  test("a verified STUDENT is refused, session and all", async () => {
    // The whole reason the check lives in the query rather than the page.
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "student"))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toEqual([])
  })

  test("staff sees the queue", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff", { leadStatus: "new" }))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toHaveLength(1)
    expect(result.page[0]!.phone).toBe(PHONE)
  })

  test("an owner sees the queue too", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "owner", { leadStatus: "new" }))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toHaveLength(1)
  })
})

describe("the queue's order and shape", () => {
  test("most recently active first, across statuses", async () => {
    // Regression: by_leadStatus groups the queue by the status string, which
    // sorts "lost" ahead of "interested" - an old "lost" lead used to sit
    // above a fresh "new" one. The inbox order is time, not status.
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff")
    const old = Date.now() - 1000
    await seed(t, "student", {
      phone: "+919000000001",
      leadStatus: "lost",
      lastEnquiryAt: old,
    })
    await seed(t, "student", {
      phone: "+919000000002",
      leadStatus: "new",
      lastEnquiryAt: old + 500,
    })
    const me = await viewer(t, staffId)
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page.map((row) => row.phone)).toEqual([
      "+919000000002",
      "+919000000001",
    ])
  })

  test("the projection never leaks the synthetic address or free text", async () => {
    // ADR-0001: the placeholder email must never be presented as contactable.
    const t = convexTest(schema, modules)
    const id = await seed(t, "staff", { leadStatus: "new" })
    await t.run((ctx) =>
      ctx.db.patch(id, { email: "placeholder@person.ict.invalid" })
    )
    const me = await viewer(t, id)
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    const row = result.page[0]!
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
    const me = await viewer(t, await seed(t, "staff"))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toEqual([])
  })

  test("pages stay full while more leads exist behind them", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff")
    for (let i = 0; i < 4; i++) {
      await seed(t, "student", {
        phone: `+9190000010${i}0`,
        leadStatus: "new",
        lastEnquiryAt: Date.now() + i,
      })
    }
    const me = await viewer(t, staffId)
    const first = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: null })
    )
    expect(first.page).toHaveLength(2)
    expect(first.isDone).toBe(false)
    const second = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: first.continueCursor })
    )
    expect(second.page).toHaveLength(2)
    // A page that exactly fills numItems cannot know it is the last - Convex
    // only reports done when the index scan comes back short, so the queue
    // drains with one empty page rather than a falsely confident total.
    expect(second.isDone).toBe(false)
    const third = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: second.continueCursor })
    )
    expect(third.page).toEqual([])
    expect(third.isDone).toBe(true)
  })
})
