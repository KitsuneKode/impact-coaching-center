import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { enquiryTimings, enquiryTracks } from "../lib/leads"
import { readToday, readWeek, sourceOf } from "./dashboard"
import { findVerifiedPerson } from "./persons"
import { internal } from "./_generated/api"
import schema from "./schema"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>
const DAY = 24 * 60 * 60 * 1000

async function staff(t: T, role: "staff" | "owner" = "staff") {
  const phone = role === "owner" ? "+919800000001" : "+919800000002"
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Desk",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  const viewer = await t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
  if (!viewer) throw new Error("staff fixture missing")
  return viewer
}

const enquire = (t: T, phone: string, name: string) =>
  t.mutation(internal.persons.recordEnquiry, {
    phone,
    name,
    track: enquiryTracks[0]!,
    timing: enquiryTimings[0]!,
  })

describe("where an enquiry came from", () => {
  const base = { _id: "x" as never, _creationTime: 0, personId: "p" as never }
  test("a campaign tag wins, then the desk channel, then the referring site", () => {
    expect(
      sourceOf({ ...base, channel: "website", utm: { source: "Facebook" } })
    ).toBe("facebook")
    expect(sourceOf({ ...base, channel: "walk_in" })).toBe("walk in")
    expect(
      sourceOf({
        ...base,
        channel: "website",
        referrer: "https://www.google.com/search?q=apsc",
      })
    ).toBe("google.com")
    expect(sourceOf({ ...base, channel: "website" })).toBe("website, direct")
  })
})

describe("the overview", () => {
  test("the week counts enquiries, not people: one phone, two children", async () => {
    const t = convexTest(schema, modules)
    const desk = await staff(t)
    await enquire(t, "+919812345670", "Riya")
    await enquire(t, "+919812345670", "Arjun")
    await enquire(t, "+919876543211", "Bikash")
    const week = await t.run((ctx) => readWeek(ctx, desk, Date.now() + 1000))
    expect(week.enquiries).toMatchObject({ thisWeek: 3, lastWeek: 0 })
    expect(week.stages.new).toBe(2)
    expect(week.firstCall.waiting).toBe(2)
    // Book sales are for the shop's people, not every desk.
    expect(week.sales).toBeUndefined()
  })

  test("the queue lists new enquiries to call and only rows with something in them", async () => {
    const t = convexTest(schema, modules)
    const owner = await staff(t, "owner")
    await enquire(t, "+919876543212", "Pallabi")
    const today = await t.run((ctx) => readToday(ctx, owner, Date.now()))
    expect(today.uncalled.count).toBe(1)
    expect(today.toCall).toEqual([
      expect.objectContaining({ name: "Pallabi", reason: "new" }),
    ])
    expect(today.toSend.count).toBe(0)
    expect(today.refundsDue).toBe(0)
  })

  test("an overdue follow-up is called before a new enquiry", async () => {
    const t = convexTest(schema, modules)
    const desk = await staff(t)
    await enquire(t, "+919876543213", "Newest")
    await enquire(t, "+919876543214", "Promised")
    await t.run(async (ctx) => {
      const promised = await ctx.db
        .query("persons")
        .withIndex("by_phone", (q) => q.eq("phone", "+919876543214"))
        .first()
      await ctx.db.patch(promised!._id, {
        leadStatus: "interested",
        nextFollowUpAt: Date.now() - 2 * DAY,
      })
    })
    const today = await t.run((ctx) => readToday(ctx, desk, Date.now()))
    expect(today.toCall.map((row) => [row.name, row.reason])).toEqual([
      ["Promised", "overdue"],
      ["Newest", "new"],
    ])
    expect(today.followUps.overdue).toBe(1)
  })
})

describe("website visits by source", () => {
  test("visits count per source per day, and enquiries made from them are set beside them", async () => {
    const t = convexTest(schema, modules)
    const desk = await staff(t)
    const { api } = await import("./_generated/api")
    for (let i = 0; i < 3; i++)
      await t.mutation(api.visits.record, { source: "google" })
    await t.mutation(api.visits.record, { source: "facebook" })
    await t.mutation(internal.persons.recordEnquiry, {
      phone: "+919811111111",
      name: "Asha",
      track: enquiryTracks[0]!,
      timing: enquiryTimings[0]!,
      utmSource: "google",
    })
    const week = await t.run((ctx) => readWeek(ctx, desk, Date.now() + 1000))
    expect(week.visits).toEqual([
      { source: "google", visits: 3, enquired: 1 },
      { source: "facebook", visits: 1, enquired: 0 },
    ])
    const rows = await t.run((ctx) => ctx.db.query("visits").take(10))
    expect(rows).toHaveLength(2)
    // The enquiry lands on today, the last of thirty days.
    expect(week.daily).toHaveLength(30)
    expect(week.daily.at(-1)).toBe(1)
  })
})
