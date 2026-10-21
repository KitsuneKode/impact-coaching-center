import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { financialYear, hmacHex } from "../lib/payments"
import { placeOrderAs } from "./checkout"
import { findVerifiedPerson } from "./persons"
import { internal } from "./_generated/api"
import schema from "./schema"

/** Settling a payment: the one place an order becomes paid and gets a receipt. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>

async function buyer(t: T, phone: string) {
  await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Buyer",
  })
  const person = await t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
  if (!person) throw new Error("buyer did not resolve")
  return person
}

/** A published one-book set and a placed order for two of it, collected. */
async function placed(t: T, phone: string, gatewayOrderId: string) {
  const person = await buyer(t, phone)
  const bundleId = await t.run(async (ctx) => {
    const bookId = await ctx.db.insert("books", {
      slug: `${gatewayOrderId}-book`,
      exam: "APSC",
      contents: [],
      editions: {
        en: { title: "Book", edition: "2026", pages: 100, samplePages: [] },
      },
      revision: 0,
      updatedAt: 0,
    })
    return ctx.db.insert("bundles", {
      slug: `${gatewayOrderId}-set`,
      exam: "APSC",
      title: { en: "Set" },
      description: { en: "" },
      bookIds: [bookId],
      variants: {
        en: { pricePaise: 50000, available: true },
        as: { pricePaise: 45000, available: false },
      },
      soldCount: 3,
      sortOrder: 0,
      published: true,
      revision: 0,
      updatedAt: 0,
    })
  })
  await t.run((ctx) =>
    ctx.db.insert("carts", {
      personId: person.id,
      lines: [
        {
          slug: `${gatewayOrderId}-set`,
          language: "en",
          quantity: 2,
          at: 0,
        },
      ],
      updatedAt: 0,
    })
  )
  const result = await t.run((ctx) =>
    placeOrderAs(ctx, person, {
      fulfilment: "collection",
      idempotencyKey: `key-${gatewayOrderId}`,
    })
  )
  if (!result.ok) throw new Error("order not placed")
  const order = await t.run(async (ctx) =>
    (await ctx.db.query("orders").collect()).find(
      (o) => o.reference === result.reference
    )
  )
  await t.mutation(internal.payments.attachGatewayOrder, {
    orderId: order!._id,
    gatewayOrderId,
  })
  return { orderId: order!._id, bundleId, totalPaise: result.totalPaise }
}

const settle = (
  t: T,
  gatewayOrderId: string,
  amountPaise: number,
  paymentId = "pay_1"
) =>
  t.mutation(internal.payments.settle, {
    gatewayOrderId,
    paymentId,
    method: "upi",
    amountPaise,
    source: "checkout",
  })

describe("settle", () => {
  test("marks the order paid, numbers the receipt and counts the sets", async () => {
    const t = convexTest(schema, modules)
    const { orderId, bundleId, totalPaise } = await placed(
      t,
      "+919800000001",
      "order_A"
    )
    const receipt = await settle(t, "order_A", totalPaise)
    expect(receipt).toBe(`ICT/${financialYear(Date.now())}/0001`)
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.status).toBe("paid")
    expect(order?.payment?.razorpayPaymentId).toBe("pay_1")
    expect(order?.receiptNumber).toBe(receipt!)
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
  })

  test("settling twice changes nothing and returns the same receipt", async () => {
    const t = convexTest(schema, modules)
    const { bundleId, totalPaise } = await placed(t, "+919800000002", "order_B")
    const first = await settle(t, "order_B", totalPaise, "pay_B")
    const again = await settle(t, "order_B", totalPaise, "pay_B")
    expect(again).toBe(first)
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
  })

  test("receipts count up across orders in the same year", async () => {
    const t = convexTest(schema, modules)
    const a = await placed(t, "+919800000003", "order_C")
    const b = await placed(t, "+919800000004", "order_D")
    expect(await settle(t, "order_C", a.totalPaise)).toMatch(/\/0001$/)
    expect(await settle(t, "order_D", b.totalPaise)).toMatch(/\/0002$/)
  })

  test("a payment for a different amount does not settle", async () => {
    const t = convexTest(schema, modules)
    const { orderId, totalPaise } = await placed(t, "+919800000005", "order_E")
    expect(await settle(t, "order_E", totalPaise - 100)).toBeNull()
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.status).toBe("awaiting_payment")
  })

  test("an unknown gateway order settles nothing", async () => {
    const t = convexTest(schema, modules)
    expect(await settle(t, "order_NOPE", 100)).toBeNull()
  })
})

describe("webhook events", () => {
  const paidEvent = (
    eventId: string,
    gatewayOrderId: string,
    amount: number
  ) => ({
    eventId,
    type: "payment.captured",
    gatewayOrderId,
    paymentId: `pay_${eventId}`,
    method: "upi",
    amountPaise: amount,
  })

  test("an event is recorded and settled together; a retry changes nothing", async () => {
    const t = convexTest(schema, modules)
    const { orderId, bundleId, totalPaise } = await placed(
      t,
      "+919800000006",
      "order_F"
    )
    const event = paidEvent("evt_1", "order_F", totalPaise)
    expect(await t.mutation(internal.payments.handleWebhook, event)).toBe(true)
    expect(await t.mutation(internal.payments.handleWebhook, event)).toBe(false)
    const events = await t.run((ctx) => ctx.db.query("paymentEvents").collect())
    expect(events).toHaveLength(1)
    expect(events[0]?.orderId).toBe(orderId)
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.status).toBe("paid")
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
  })

  test("an authorized-only event is recorded but settles nothing", async () => {
    const t = convexTest(schema, modules)
    const { orderId, totalPaise } = await placed(t, "+919800000016", "order_H")
    await t.mutation(internal.payments.handleWebhook, {
      ...paidEvent("evt_auth", "order_H", totalPaise),
      type: "payment.authorized",
    })
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.status).toBe("awaiting_payment")
  })

  test("the signed route settles the order once, and refuses a bad signature", async () => {
    const t = convexTest(schema, modules)
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test"
    process.env.SITE_URL ??= "http://localhost:3000"
    const { orderId, totalPaise } = await placed(t, "+919800000026", "order_I")
    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_route",
            order_id: "order_I",
            amount: totalPaise,
            method: "upi",
          },
        },
      },
    })
    const send = async (signature: string) =>
      (
        await t.fetch("/razorpay/webhook", {
          method: "POST",
          headers: {
            "x-razorpay-signature": signature,
            "x-razorpay-event-id": "evt_route",
          },
          body,
        })
      ).status
    expect(await send("00".repeat(32))).toBe(401)
    const signature = await hmacHex("whsec_test", body)
    expect(await send(signature)).toBe(200)
    expect(await send(signature)).toBe(200)
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.status).toBe("paid")
    expect(order?.receiptNumber).toMatch(/\/0001$/)
    delete process.env.RAZORPAY_WEBHOOK_SECRET
  })
})

describe("receipts", () => {
  test("name the seller as they were when paid, whatever settings say later", async () => {
    const t = convexTest(schema, modules)
    const { orderId, totalPaise } = await placed(t, "+919800000036", "order_J")
    await settle(t, "order_J", totalPaise)
    await t.run((ctx) =>
      ctx.db.insert("siteSettings", {
        shippingPaise: 0,
        pickupAddress: "Somewhere new",
        legalName: "Renamed Ltd",
        receiptPrefix: "NEW",
        revision: 0,
        updatedAt: 0,
      })
    )
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.seller?.legalName).toBe("Impact Career Tutorials")
  })
})

describe("attachGatewayOrder", () => {
  test("keeps the first gateway order, so a retried payment reuses it", async () => {
    const t = convexTest(schema, modules)
    const { orderId } = await placed(t, "+919800000007", "order_G")
    const kept = await t.mutation(internal.payments.attachGatewayOrder, {
      orderId,
      gatewayOrderId: "order_OTHER",
    })
    expect(kept).toBe("order_G")
  })
})

describe("unpaid orders", () => {
  test("expire after three days, and a late payment revives one", async () => {
    const t = convexTest(schema, modules)
    const { orderId, bundleId, totalPaise } = await placed(
      t,
      "+919800000091",
      "order_late"
    )
    const now = Date.now()
    expect(await t.mutation(internal.orders.expireUnpaid, { now })).toBe(0)
    expect(
      await t.mutation(internal.orders.expireUnpaid, {
        now: now + 3 * 24 * 60 * 60 * 1000 + 1000,
      })
    ).toBe(1)
    const expired = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(expired?.status).toBe("cancelled")
    expect(expired?.expiredAt).toBeDefined()

    const receipt = await settle(t, "order_late", totalPaise, "pay_late")
    expect(receipt).toMatch(/^ICT\//)
    const paid = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(paid?.status).toBe("paid")
    expect(paid?.expiredAt).toBeUndefined()
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
  })

  test("a payment for an order a person cancelled is flagged, not kept", async () => {
    const t = convexTest(schema, modules)
    const { orderId, totalPaise } = await placed(t, "+919800000092", "order_x")
    await t.run((ctx) => ctx.db.patch(orderId, { status: "cancelled" }))
    expect(await settle(t, "order_x", totalPaise, "pay_x")).toBeNull()
    const order = await t.run((ctx) => ctx.db.get("orders", orderId))
    expect(order?.status).toBe("cancelled")
    expect(order?.refundDueAt).toBeDefined()
    expect(order?.payment?.razorpayPaymentId).toBe("pay_x")
    const notes = await t.run((ctx) => ctx.db.query("activities").collect())
    expect(
      notes.some((note) => note.body?.includes("Refund it in Razorpay"))
    ).toBe(true)
  })
})
