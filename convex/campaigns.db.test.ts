import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import type { CampaignInput } from "../lib/campaigns"
import { applySaveCampaign, applySetCampaignStatus } from "./campaigns"
import { findVerifiedPerson } from "./persons"
import { api, internal } from "./_generated/api"
import schema from "./schema"

/** Who may run promotions, and what a visitor is shown. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>

async function viewer(
  t: T,
  phone: string,
  role: "student" | "staff" | "owner"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  return t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
}

const bar: CampaignInput = {
  name: "Free workshop",
  kinds: ["bar"],
  tag: "New batch",
  headline: "Start with a free workshop.",
  body: "",
  cta: "Join a free workshop",
  href: "/contact",
  coupon: "",
  reelIds: [],
  routes: [],
  delaySeconds: 0,
  restDays: 7,
  priority: 10,
}

async function owner(t: T) {
  const o = await viewer(t, "+919876500001", "owner")
  if (!o) throw new Error("owner did not resolve")
  return o
}

describe("saveCampaign", () => {
  test("a new campaign starts as a draft and is audited", async () => {
    const t = convexTest(schema, modules)
    const o = await owner(t)
    const r = await t.run((ctx) => applySaveCampaign(ctx, o, { fields: bar }))
    expect(r.ok).toBe(true)
    const rows = await t.run((ctx) => ctx.db.query("campaigns").collect())
    expect(rows).toHaveLength(1)
    expect(rows[0]!.status).toBe("draft")
    expect(rows[0]!.revision).toBe(0)
    const audit = await t.run((ctx) => ctx.db.query("auditLog").collect())
    expect(audit.map((a) => a.action)).toEqual(["save"])
    expect(audit[0]!.entity).toBe("campaign")
  })

  test("staff without the promotions grant are refused", async () => {
    const t = convexTest(schema, modules)
    const staff = await viewer(t, "+919876500002", "staff")
    const r = await t.run((ctx) =>
      applySaveCampaign(ctx, staff!, { fields: bar })
    )
    expect(r).toEqual({ ok: false, reason: "forbidden" })
    expect(
      await t.run((ctx) => ctx.db.query("campaigns").collect())
    ).toHaveLength(0)
  })

  test("invalid input names the field and writes nothing", async () => {
    const t = convexTest(schema, modules)
    const o = await owner(t)
    const r = await t.run((ctx) =>
      applySaveCampaign(ctx, o, {
        fields: { ...bar, href: "javascript:alert(1)" },
      })
    )
    expect(r).toEqual({ ok: false, reason: "invalid-input", field: "link" })
    expect(
      await t.run((ctx) => ctx.db.query("campaigns").collect())
    ).toHaveLength(0)
  })

  test("an edit needs the revision it was read at", async () => {
    const t = convexTest(schema, modules)
    const o = await owner(t)
    const made = await t.run((ctx) =>
      applySaveCampaign(ctx, o, { fields: bar })
    )
    if (!made.ok) throw new Error("setup")
    const stale = await t.run((ctx) =>
      applySaveCampaign(ctx, o, {
        id: made.id,
        expectedRevision: 5,
        fields: { ...bar, headline: "Changed." },
      })
    )
    expect(stale).toEqual({
      ok: false,
      reason: "revision-conflict",
      current: 0,
    })
    const good = await t.run((ctx) =>
      applySaveCampaign(ctx, o, {
        id: made.id,
        expectedRevision: 0,
        fields: { ...bar, headline: "Changed." },
      })
    )
    expect(good.ok && good.revision).toBe(1)
  })

  test("saving an older single-kind row moves it to the list", async () => {
    const t = convexTest(schema, modules)
    const o = await owner(t)
    const id = await t.run((ctx) =>
      ctx.db.insert("campaigns", {
        ...bar,
        kinds: undefined,
        kind: "modal",
        body: "Two days.",
        status: "draft",
        revision: 0,
        updatedAt: 0,
      })
    )
    await t.run((ctx) =>
      applySaveCampaign(ctx, o, {
        id,
        expectedRevision: 0,
        fields: { ...bar, kinds: ["modal", "bar"], body: "Two days." },
      })
    )
    const doc = await t.run((ctx) => ctx.db.get(id))
    expect(doc?.kinds).toEqual(["bar", "modal"])
    expect(doc?.kind).toBeUndefined()
  })
})

describe("setCampaignStatus", () => {
  test("goes live, records who and from what, and is idempotent", async () => {
    const t = convexTest(schema, modules)
    const o = await owner(t)
    const made = await t.run((ctx) =>
      applySaveCampaign(ctx, o, { fields: bar })
    )
    if (!made.ok) throw new Error("setup")
    const live = await t.run((ctx) =>
      applySetCampaignStatus(ctx, o, {
        id: made.id,
        expectedRevision: 0,
        status: "live",
      })
    )
    expect(live.ok && live.revision).toBe(1)
    const again = await t.run((ctx) =>
      applySetCampaignStatus(ctx, o, {
        id: made.id,
        expectedRevision: 1,
        status: "live",
      })
    )
    expect(again.ok && again.revision).toBe(1)
    const audit = await t.run((ctx) => ctx.db.query("auditLog").collect())
    const status = audit.filter((a) => a.action === "publish")
    expect(status).toHaveLength(1)
    expect(status[0]!.from).toBe("draft")
    expect(status[0]!.to).toBe("live")
  })

  test("staff cannot switch a campaign", async () => {
    const t = convexTest(schema, modules)
    const o = await owner(t)
    const staff = await viewer(t, "+919876500003", "staff")
    const made = await t.run((ctx) =>
      applySaveCampaign(ctx, o, { fields: bar })
    )
    if (!made.ok) throw new Error("setup")
    const r = await t.run((ctx) =>
      applySetCampaignStatus(ctx, staff!, {
        id: made.id,
        expectedRevision: 0,
        status: "live",
      })
    )
    expect(r).toEqual({ ok: false, reason: "forbidden" })
  })
})

describe("liveCampaigns", () => {
  /** Insert a campaign directly, live unless said otherwise. */
  const put = (
    t: T,
    patch: Partial<CampaignInput> & {
      status?: "draft" | "live" | "paused"
    } = {}
  ) =>
    t.run((ctx) => {
      const { status = "live", ...rest } = patch
      return ctx.db.insert("campaigns", {
        ...bar,
        ...rest,
        status,
        revision: 0,
        updatedAt: 0,
      })
    })
  const ask = (t: T, path: string, now: number) =>
    t.query(api.campaigns.liveCampaigns, { path, now })

  test("shows a live campaign to an anonymous visitor, without internal fields", async () => {
    const t = convexTest(schema, modules)
    await put(t)
    const rows = await ask(t, "/courses", 1000)
    expect(rows).toHaveLength(1)
    expect(Object.keys(rows[0]!).sort()).not.toContain("status")
    expect(Object.keys(rows[0]!).sort()).not.toContain("name")
  })

  test("hides drafts and paused campaigns", async () => {
    const t = convexTest(schema, modules)
    await put(t, { status: "draft" })
    await put(t, { status: "paused" })
    expect(await ask(t, "/", 1000)).toHaveLength(0)
  })

  test("respects the dates", async () => {
    const t = convexTest(schema, modules)
    await put(t, { startsAt: 1000, endsAt: 2000 })
    expect(await ask(t, "/", 999)).toHaveLength(0)
    expect(await ask(t, "/", 1000)).toHaveLength(1)
    expect(await ask(t, "/", 2000)).toHaveLength(0)
  })

  test("respects the pages", async () => {
    const t = convexTest(schema, modules)
    await put(t, { routes: ["/courses"] })
    expect(await ask(t, "/courses/lakhya-2027", 1)).toHaveLength(1)
    expect(await ask(t, "/books", 1)).toHaveLength(0)
  })

  test("a campaign on several surfaces says so; an older single kind still reads", async () => {
    const t = convexTest(schema, modules)
    await put(t, { kinds: ["bar", "modal"] })
    await t.run((ctx) =>
      ctx.db.insert("campaigns", {
        ...bar,
        kinds: undefined,
        kind: "reel",
        reelIds: ["dQw4w9WgXcQ"],
        status: "live",
        revision: 0,
        updatedAt: 0,
        priority: 1,
      })
    )
    const rows = await ask(t, "/", 1)
    expect(rows.map((r) => r.kinds)).toEqual([["bar", "modal"], ["reel"]])
    const bars = await t.query(api.campaigns.liveBars, { now: 1 })
    expect(bars).toHaveLength(1)
  })

  test("highest priority first, and at most six", async () => {
    const t = convexTest(schema, modules)
    for (let i = 0; i < 8; i++) await put(t, { name: `c${i}`, priority: i })
    const rows = await ask(t, "/", 1)
    expect(rows).toHaveLength(6)
    const first = await t.run((ctx) => ctx.db.get(rows[0]!.id))
    expect(first!.priority).toBe(7)
  })
})

describe("adminCampaigns", () => {
  test("is empty for an anonymous caller", async () => {
    const t = convexTest(schema, modules)
    await t.run((ctx) =>
      ctx.db.insert("campaigns", {
        ...bar,
        status: "live",
        revision: 0,
        updatedAt: 0,
      })
    )
    const r = await t.query(api.campaigns.adminCampaigns, {})
    expect(r).toEqual({ rows: [], truncated: false })
  })
})

describe("the promotions grant", () => {
  test("staff the owner trusted with promotions can run them", async () => {
    const t = convexTest(schema, modules)
    const staff = await viewer(t, "+919876500009", "staff")
    await t.run((ctx) => ctx.db.patch(staff!.id, { grants: ["promotions"] }))
    const granted = { ...staff!, grants: ["promotions" as const] }
    const made = await t.run((ctx) =>
      applySaveCampaign(ctx, granted, { fields: bar })
    )
    expect(made.ok).toBe(true)
  })
})
