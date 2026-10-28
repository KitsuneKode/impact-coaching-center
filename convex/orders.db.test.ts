import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { CLOSED_STATUSES, type OrderStatus } from "../lib/order-status"
import {
  allocateOrderReference,
  applyCourierChange,
  applyStatusChange,
  applyStatusChanges,
  readOrdersPage,
} from "./orders"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

/** The fulfilment queue's rules. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

async function person(
  t: ReturnType<typeof convexTest>,
  phone: string,
  role: "student" | "staff" | "owner"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  const doc = await t.run((ctx) => ctx.db.get(id))
  return {
    id: doc!._id,
    name: doc!.name,
    phone: doc!.phone,
    role: doc!.role,
    grants: doc!.grants ?? [],
    locale: doc!.locale,
    verifiedAt: doc!.verifiedAt,
    revision: doc!.revision ?? 0,
  }
}

const BUNDLE = {
  slug: "a-set",
  exam: "APSC",
  title: { en: "A set" },
  description: { en: "" },
  bookIds: [],
  variants: {
    en: { pricePaise: 25000, available: true },
    as: { pricePaise: 25000, available: true },
  },
  soldCount: 0,
  sortOrder: 0,
  published: true,
  revision: 0,
  updatedAt: 0,
}

/** A paid order (and the checkout it came from), in any status. */
async function order(
  t: ReturnType<typeof convexTest>,
  personId: Id<"persons">,
  {
    status = "paid",
    placedAt = Date.now(),
    reference = "ICT-00001",
    fulfilment = "delivery",
    courier,
    refundDue = false,
  }: {
    status?: OrderStatus
    placedAt?: number
    reference?: string
    fulfilment?: "delivery" | "collection"
    courier?: { name: string; trackingNumber: string }
    refundDue?: boolean
  } = {}
) {
  return await t.run(async (ctx) => {
    const bundleId = await ctx.db.insert("bundles", BUNDLE)
    const lines = [
      {
        bundleId,
        slug: "a-set",
        title: "A set",
        language: "en" as const,
        books: ["A book"],
        quantity: 1,
        unitPaise: 25000,
      },
    ]
    const contact = { name: "Test Person", phone: "+919876543211" }
    const address =
      fulfilment === "delivery"
        ? {
            line1: "House 1",
            city: "North Lakhimpur",
            district: "Lakhimpur",
            pin: "787001",
          }
        : undefined
    const checkoutId = await ctx.db.insert("checkouts", {
      personId,
      status: "paid",
      fulfilment,
      contact,
      lines,
      itemsPaise: 25000,
      deliveryPaise: 5000,
      totalPaise: 30000,
      address,
      signature: reference,
      gatewayOrderId: `order_${reference}`,
      updatedAt: placedAt,
    })
    return ctx.db.insert("orders", {
      personId,
      reference,
      status,
      closed: CLOSED_STATUSES.has(status),
      history: [{ status: "paid", at: placedAt }],
      fulfilment,
      courier,
      contact,
      lines,
      itemsPaise: 25000,
      deliveryPaise: 5000,
      totalPaise: 30000,
      address,
      checkoutId,
      payment: {
        razorpayOrderId: `order_${reference}`,
        razorpayPaymentId: `pay_${reference}`,
        method: "upi",
        paidAt: placedAt,
      },
      receiptNumber: "ICT/26-27/0001",
      receiptToken: `token-${reference}`.padEnd(24, "x"),
      seller: { legalName: "Impact Career Tutorials", address: "ICT" },
      refundDueAt: refundDue ? placedAt : undefined,
      placedAt,
      revision: 0,
    })
  })
}

const PAGE = { numItems: 25, cursor: null }
const SHIP = {
  status: "shipped" as const,
  courier: { name: "DTDC", trackingNumber: "D123456789" },
}

describe("the fulfilment queue", () => {
  test("a student gets an empty page and cannot move anything", async () => {
    const t = convexTest(schema, modules)
    const student = await person(t, "+919876543210", "student")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id)

    expect(
      await t.run((ctx) => readOrdersPage(ctx, student, "to_send", PAGE))
    ).toMatchObject({ page: [] })
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, student, {
          orderId,
          ...SHIP,
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
  })

  test("each tab holds its own work: open oldest first, done newest first", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const now = Date.now()
    const at = (hours: number) => now - hours * 3_600_000
    await order(t, buyer.id, { reference: "ICT-PAID1", placedAt: at(1) })
    await order(t, buyer.id, { reference: "ICT-PAID2", placedAt: at(5) })
    await order(t, buyer.id, {
      reference: "ICT-SHIP1",
      status: "shipped",
      placedAt: at(9),
    })
    await order(t, buyer.id, {
      reference: "ICT-READY",
      status: "ready_for_collection",
      fulfilment: "collection",
    })
    await order(t, buyer.id, {
      reference: "ICT-OWED1",
      status: "cancelled",
      refundDue: true,
    })
    await order(t, buyer.id, {
      reference: "ICT-DONE1",
      status: "delivered",
      placedAt: at(30),
    })
    await order(t, buyer.id, {
      reference: "ICT-DONE2",
      status: "collected",
      fulfilment: "collection",
      placedAt: at(20),
    })

    const tab = async (name: Parameters<typeof readOrdersPage>[2]) =>
      (await t.run((ctx) => readOrdersPage(ctx, staff, name, PAGE))).page.map(
        (row) => row.reference
      )
    expect(await tab("to_send")).toEqual(["ICT-PAID2", "ICT-PAID1"])
    expect(await tab("on_the_way")).toEqual(["ICT-SHIP1"])
    expect(await tab("to_collect")).toEqual(["ICT-READY"])
    expect(await tab("refund_due")).toEqual(["ICT-OWED1"])
    expect(await tab("done")).toEqual(["ICT-OWED1", "ICT-DONE2", "ICT-DONE1"])
  })
})

describe("the status machine", () => {
  test("staff ship a paid parcel: history, audit and the buyer told", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id)

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, { orderId, ...SHIP, expectedRevision: 0 })
      )
    ).toEqual({ ok: true, revision: 1 })

    const doc = await t.run((ctx) => ctx.db.get(orderId))
    expect(doc).toMatchObject({
      status: "shipped",
      closed: false,
      courier: SHIP.courier,
    })
    expect(doc?.history.map((step) => [step.status, step.by])).toEqual([
      ["paid", undefined],
      ["shipped", staff.id],
    ])

    const audit = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", buyer.id))
        .collect()
    )
    expect(audit).toHaveLength(1)
    expect(audit[0]).toMatchObject({
      kind: "order_status",
      actorId: staff.id,
      from: "paid",
      to: "shipped",
    })

    const [message] = await t.run((ctx) => ctx.db.query("messages").collect())
    expect(message).toMatchObject({
      key: "ICT-00001:shipped:buyer",
      template: "order_shipped",
      to: "+919876543211",
    })
    expect(message?.params).toEqual([
      "ICT-00001",
      "DTDC",
      "D123456789",
      "https://www.dtdc.in/",
    ])

    // Delivered closes it.
    await t.run((ctx) =>
      applyStatusChange(ctx, staff, {
        orderId,
        status: "delivered",
        expectedRevision: 1,
      })
    )
    expect((await t.run((ctx) => ctx.db.get(orderId)))?.closed).toBe(true)
  })

  test("an illegal move is refused, and a closed order has no exits", async () => {
    const t = convexTest(schema, modules)
    const owner = await person(t, "+919876543210", "owner")
    const buyer = await person(t, "+919876543211", "student")
    const paid = await order(t, buyer.id)
    const delivered = await order(t, buyer.id, {
      status: "delivered",
      reference: "ICT-00003",
    })
    const move = (orderId: Id<"orders">, status: OrderStatus) =>
      t.run((ctx) =>
        applyStatusChange(ctx, owner, { orderId, status, expectedRevision: 0 })
      )
    const refused = {
      ok: false as const,
      reason: "invalid-input" as const,
      field: "transition",
    }

    // A paid parcel cannot leap to delivered.
    expect(await move(paid, "delivered")).toEqual(refused)
    // Paid is set by a verified payment, never by a click.
    expect(await move(paid, "paid")).toEqual(refused)
    expect(await move(delivered, "cancelled")).toEqual(refused)
    expect(await move(delivered, "refunded")).toEqual(refused)
  })

  test("cancelling is the owner's call, owes a refund and unsells the set", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const owner = await person(t, "+919876543212", "owner")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id)
    const bundleId = await t.run(async (ctx) => {
      const row = await ctx.db.get(orderId)
      await ctx.db.patch(row!.lines[0]!.bundleId, { soldCount: 4 })
      return row!.lines[0]!.bundleId
    })
    const move = (
      viewer: typeof staff,
      status: OrderStatus,
      expectedRevision: number
    ) =>
      t.run((ctx) =>
        applyStatusChange(ctx, viewer, { orderId, status, expectedRevision })
      )

    expect(await move(staff, "cancelled", 0)).toEqual({
      ok: false,
      reason: "forbidden",
    })
    expect(await move(owner, "cancelled", 0)).toEqual({ ok: true, revision: 1 })
    const cancelled = await t.run((ctx) => ctx.db.get(orderId))
    expect(cancelled).toMatchObject({ closed: true })
    expect(cancelled?.refundDueAt).toBeDefined()
    expect((await t.run((ctx) => ctx.db.get(bundleId)))?.soldCount).toBe(3)
    const owed = await t.run((ctx) =>
      readOrdersPage(ctx, owner, "refund_due", PAGE)
    )
    expect(owed.page[0]?.refundDue).toBe(true)

    // Refunding is the owner's too, and does not unsell it twice.
    expect(await move(staff, "refunded", 1)).toEqual({
      ok: false,
      reason: "forbidden",
    })
    expect(await move(owner, "refunded", 1)).toEqual({ ok: true, revision: 2 })
    const refunded = await t.run((ctx) => ctx.db.get(orderId))
    expect(refunded?.refundDueAt).toBeUndefined()
    expect((await t.run((ctx) => ctx.db.get(bundleId)))?.soldCount).toBe(3)
  })

  test("a cancelled order with nothing owed has no refund to mark", async () => {
    const t = convexTest(schema, modules)
    const owner = await person(t, "+919876543212", "owner")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, { status: "cancelled" })
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, owner, {
          orderId,
          status: "refunded",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "transition" })
  })

  test("a stale revision is refused before anything is checked or written", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id)
    await t.run((ctx) => ctx.db.patch(orderId, { revision: 4 }))

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, { orderId, ...SHIP, expectedRevision: 2 })
      )
    ).toEqual({ ok: false, reason: "revision-conflict", current: 4 })
    expect((await t.run((ctx) => ctx.db.get(orderId)))?.status).toBe("paid")
  })

  test("`shipped` refuses to apply without courier details", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id)

    for (const courier of [
      undefined,
      { name: "", trackingNumber: "D123" },
      { name: "DTDC", trackingNumber: "  " },
      { name: "D".repeat(61), trackingNumber: "D123" },
      { name: "DTDC", trackingNumber: "1".repeat(41) },
    ])
      expect(
        await t.run((ctx) =>
          applyStatusChange(ctx, staff, {
            orderId,
            status: "shipped",
            courier,
            expectedRevision: 0,
          })
        )
      ).toEqual({ ok: false, reason: "invalid-input", field: "courier" })
    expect((await t.run((ctx) => ctx.db.get(orderId)))?.status).toBe("paid")
  })

  test("a courier slipped into another transition is refused", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, { status: "shipped" })

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId,
          status: "delivered",
          courier: SHIP.courier,
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "courier" })
  })

  test("fulfilment routes cannot cross: parcels ship, collections are collected", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const collection = await order(t, buyer.id, { fulfilment: "collection" })
    const delivery = await order(t, buyer.id, { reference: "ICT-00009" })

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId: collection,
          ...SHIP,
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "fulfilment" })
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId: delivery,
          status: "ready_for_collection",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "fulfilment" })
  })

  test("a mistyped tracking number can be corrected, audited", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, {
      status: "shipped",
      courier: { name: "DTDC", trackingNumber: "WRONG" },
    })

    expect(
      await t.run((ctx) =>
        applyCourierChange(ctx, staff, {
          orderId,
          courier: { name: "India Post", trackingNumber: "PP123" },
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: true, revision: 1 })
    expect((await t.run((ctx) => ctx.db.get(orderId)))?.courier).toEqual({
      name: "India Post",
      trackingNumber: "PP123",
    })
    const audit = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", buyer.id))
        .collect()
    )
    expect(audit.map((row) => row.kind)).toEqual(["courier_update"])

    // Not a correction path for an order still on the shelf.
    const paid = await order(t, buyer.id, { reference: "ICT-00010" })
    expect(
      await t.run((ctx) =>
        applyCourierChange(ctx, staff, {
          orderId: paid,
          courier: { name: "DTDC", trackingNumber: "D1" },
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "status" })
  })
})

describe("moves in bulk", () => {
  test("each order moves or is refused on its own", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const a = await order(t, buyer.id, { reference: "ICT-0000A" })
    const b = await order(t, buyer.id, { reference: "ICT-0000B" })
    const c = await order(t, buyer.id, {
      reference: "ICT-0000C",
      fulfilment: "collection",
    })
    const results = await t.run((ctx) =>
      applyStatusChanges(ctx, staff, [
        { orderId: a, ...SHIP, expectedRevision: 0 },
        {
          orderId: b,
          status: "shipped",
          courier: { name: "DTDC", trackingNumber: "D2" },
          expectedRevision: 0,
        },
        { orderId: c, ...SHIP, expectedRevision: 0 },
      ])
    )
    expect(results).toEqual([
      { orderId: a, ok: true },
      { orderId: b, ok: true },
      { orderId: c, ok: false, reason: "fulfilment" },
    ])
    const statuses = await t.run(async (ctx) =>
      Promise.all([a, b, c].map(async (id) => (await ctx.db.get(id))?.status))
    )
    expect(statuses).toEqual(["shipped", "shipped", "paid"])
    // Each parcel carries its own tracking number to its own buyer.
    const messages = await t.run((ctx) => ctx.db.query("messages").collect())
    expect(messages.map((m) => m.params[2]).sort()).toEqual([
      "D123456789",
      "D2",
    ])
  })
})

describe("order references", () => {
  test("allocated references are Crockford-shaped and dodge collisions", async () => {
    const t = convexTest(schema, modules)
    const buyer = await person(t, "+919876543211", "student")

    /* Pin the generator's first draw to an existing reference, so the
       allocator must retry to find a free one. */
    const taken = await t.run((ctx) => allocateOrderReference(ctx))
    expect(taken).toMatch(/^ICT-[0-9A-HJKMNP-TV-Z]{5}$/)
    await order(t, buyer.id, { reference: taken })

    /* The allocator's first draw must equal `taken` so it hits the
       collision branch; after that it falls back to real randomness. */
    const original = Math.random
    const digits = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    const forced = taken
      .slice(4)
      .split("")
      .map((char) => digits.indexOf(char) / 32)
    let index = 0
    Math.random = () => (index < 5 ? forced[index++]! : original())
    const second = await t.run((ctx) => allocateOrderReference(ctx))
    Math.random = original

    expect(second).toMatch(/^ICT-[0-9A-HJKMNP-TV-Z]{5}$/)
    expect(second).not.toBe(taken)
  })
})
