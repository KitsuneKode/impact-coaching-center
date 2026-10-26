import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { financialYear, hmacHex } from "../lib/payments"
import { beginCheckoutAs } from "./checkout"
import { findVerifiedPerson } from "./persons"
import { DEFAULT_SETTINGS } from "./settings"
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
    beginCheckoutAs(ctx, person, { fulfilment: "collection" })
  )
  if (!result.ok) throw new Error("checkout not begun")
  await t.mutation(internal.payments.attachGatewayOrder, {
    checkoutId: result.checkoutId,
    gatewayOrderId,
  })
  return {
    personId: person.id,
    checkoutId: result.checkoutId,
    bundleId,
    totalPaise: result.totalPaise,
  }
}

const orderFor = (t: T, gatewayOrderId: string) =>
  t.run(
    async (ctx) =>
      (await ctx.db.query("orders").collect()).find(
        (o) => o.payment.razorpayOrderId === gatewayOrderId
      ) ?? null
  )

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
  test("makes the order, numbers the receipt, counts the sets, empties the cart", async () => {
    const t = convexTest(schema, modules)
    const { personId, checkoutId, bundleId, totalPaise } = await placed(
      t,
      "+919800000001",
      "order_A"
    )
    const settled = await settle(t, "order_A", totalPaise)
    expect(settled?.receiptNumber).toBe(`ICT/${financialYear(Date.now())}/0001`)
    const order = await orderFor(t, "order_A")
    expect(order).toMatchObject({
      reference: settled?.reference,
      status: "paid",
      closed: false,
      checkoutId,
      totalPaise,
    })
    expect(order?.payment.razorpayPaymentId).toBe("pay_1")
    expect(
      order?.history.map((step: { status: string }) => step.status)
    ).toEqual(["paid"])
    expect(order?.receiptToken).toMatch(/^[\w-]{24}$/)
    const checkout = await t.run((ctx) => ctx.db.get(checkoutId))
    expect(checkout).toMatchObject({ status: "paid", orderId: order?._id })
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
    const cart = await t.run((ctx) =>
      ctx.db
        .query("carts")
        .withIndex("by_person", (q) => q.eq("personId", personId))
        .first()
    )
    expect(cart?.lines).toEqual([])
  })

  test("settling twice makes one order and returns the same receipt", async () => {
    const t = convexTest(schema, modules)
    const { bundleId, totalPaise } = await placed(t, "+919800000002", "order_B")
    const first = await settle(t, "order_B", totalPaise, "pay_B")
    const again = await settle(t, "order_B", totalPaise, "pay_B")
    expect(again).toEqual(first)
    expect(await t.run((ctx) => ctx.db.query("orders").collect())).toHaveLength(
      1
    )
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
  })

  test("receipts count up across orders in the same year", async () => {
    const t = convexTest(schema, modules)
    const a = await placed(t, "+919800000003", "order_C")
    const b = await placed(t, "+919800000004", "order_D")
    expect((await settle(t, "order_C", a.totalPaise))?.receiptNumber).toMatch(
      /\/0001$/
    )
    expect((await settle(t, "order_D", b.totalPaise))?.receiptNumber).toMatch(
      /\/0002$/
    )
  })

  test("a payment for a different amount makes no order and asks for a refund", async () => {
    const t = convexTest(schema, modules)
    const { totalPaise } = await placed(t, "+919800000005", "order_E")
    expect(await settle(t, "order_E", totalPaise - 100)).toBeNull()
    expect(await orderFor(t, "order_E")).toBeNull()
    const audits = await t.run((ctx) => ctx.db.query("auditLog").collect())
    expect(
      audits.some((a) => a.summary.includes("Refund it in Razorpay"))
    ).toBe(true)
  })

  test("an unknown gateway order settles nothing", async () => {
    const t = convexTest(schema, modules)
    expect(await settle(t, "order_NOPE", 100)).toBeNull()
  })

  test("a replaced attempt that is paid anyway still becomes the order", async () => {
    const t = convexTest(schema, modules)
    const { checkoutId, totalPaise } = await placed(
      t,
      "+919800000008",
      "order_R"
    )
    await t.run((ctx) => ctx.db.patch(checkoutId, { status: "replaced" }))
    expect(await settle(t, "order_R", totalPaise)).not.toBeNull()
    expect((await orderFor(t, "order_R"))?.status).toBe("paid")
  })

  test("tells the buyer and the desk once, however many times it settles", async () => {
    const t = convexTest(schema, modules)
    process.env.SITE_URL = "https://ict.example"
    await t.run((ctx) =>
      ctx.db.insert("siteSettings", {
        ...DEFAULT_SETTINGS,
        deskPhone: "+919800000099",
        revision: 0,
      })
    )
    const { totalPaise } = await placed(t, "+919800000009", "order_M")
    await settle(t, "order_M", totalPaise)
    await settle(t, "order_M", totalPaise)
    const messages = await t.run((ctx) => ctx.db.query("messages").collect())
    expect(messages.map((m) => [m.template, m.to]).sort()).toEqual([
      ["desk_new_order", "+919800000099"],
      ["order_paid", "+919800000009"],
    ])
    const order = await orderFor(t, "order_M")
    const paid = messages.find((m) => m.template === "order_paid")
    expect(paid?.params[2]).toBe(
      `https://ict.example/receipt/${order?.receiptToken}`
    )
    delete process.env.SITE_URL
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
    const { bundleId, totalPaise } = await placed(t, "+919800000006", "order_F")
    const event = paidEvent("evt_1", "order_F", totalPaise)
    expect(await t.mutation(internal.payments.handleWebhook, event)).toBe(true)
    expect(await t.mutation(internal.payments.handleWebhook, event)).toBe(false)
    const events = await t.run((ctx) => ctx.db.query("paymentEvents").collect())
    expect(events).toHaveLength(1)
    const order = await orderFor(t, "order_F")
    expect(events[0]?.orderId).toBe(order!._id)
    expect(order?.status).toBe("paid")
    const set = await t.run((ctx) => ctx.db.get("bundles", bundleId))
    expect(set?.soldCount).toBe(5)
  })

  test("an authorized-only event is recorded but settles nothing", async () => {
    const t = convexTest(schema, modules)
    const { totalPaise } = await placed(t, "+919800000016", "order_H")
    await t.mutation(internal.payments.handleWebhook, {
      ...paidEvent("evt_auth", "order_H", totalPaise),
      type: "payment.authorized",
    })
    expect(await orderFor(t, "order_H")).toBeNull()
  })

  test("the signed route settles the order once, and refuses a bad signature", async () => {
    const t = convexTest(schema, modules)
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test"
    process.env.SITE_URL ??= "http://localhost:3000"
    const { totalPaise } = await placed(t, "+919800000026", "order_I")
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
    const order = await orderFor(t, "order_I")
    expect(order?.status).toBe("paid")
    expect(order?.receiptNumber).toMatch(/\/0001$/)
    delete process.env.RAZORPAY_WEBHOOK_SECRET
  })
})

describe("receipts", () => {
  test("name the seller as they were when paid, whatever settings say later", async () => {
    const t = convexTest(schema, modules)
    const { totalPaise } = await placed(t, "+919800000036", "order_J")
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
    const order = await orderFor(t, "order_J")
    expect(order?.seller?.legalName).toBe("Impact Career Tutorials")
  })
})

describe("attachGatewayOrder", () => {
  test("keeps the first gateway order, so a retried payment reuses it", async () => {
    const t = convexTest(schema, modules)
    const { checkoutId } = await placed(t, "+919800000007", "order_G")
    const kept = await t.mutation(internal.payments.attachGatewayOrder, {
      checkoutId,
      gatewayOrderId: "order_OTHER",
    })
    expect(kept).toBe("order_G")
  })
})

describe("refunds from Razorpay", () => {
  const refund = (id: string, gatewayOrderId: string, refundPaise: number) => ({
    eventId: `evt_${id}`,
    type: "refund.processed",
    gatewayOrderId,
    refundId: `rfnd_${id}`,
    refundPaise,
  })

  test("a full refund closes a cancelled order without counting it twice", async () => {
    const t = convexTest(schema, modules)
    const { bundleId, totalPaise } = await placed(t, "+919800000041", "order_K")
    await settle(t, "order_K", totalPaise)
    const paid = (await orderFor(t, "order_K"))!
    // Cancelled by the owner: off the sold count, refund owed.
    await t.run(async (ctx) => {
      await ctx.db.patch(paid._id, {
        status: "cancelled",
        refundDueAt: Date.now(),
      })
      const set = await ctx.db.get(bundleId)
      await ctx.db.patch(bundleId, { soldCount: (set?.soldCount ?? 0) - 2 })
    })
    await t.mutation(
      internal.payments.handleWebhook,
      refund("full", "order_K", totalPaise)
    )
    const order = await orderFor(t, "order_K")
    expect(order).toMatchObject({ status: "refunded", closed: true })
    expect(order?.refundDueAt).toBeUndefined()
    const set = await t.run((ctx) => ctx.db.get(bundleId))
    expect(set?.soldCount).toBe(3)
  })

  test("a part refund is noted and changes nothing else", async () => {
    const t = convexTest(schema, modules)
    const { totalPaise } = await placed(t, "+919800000042", "order_L")
    await settle(t, "order_L", totalPaise)
    await t.mutation(
      internal.payments.handleWebhook,
      refund("part", "order_L", 100)
    )
    expect((await orderFor(t, "order_L"))?.status).toBe("paid")
    const notes = await t.run((ctx) => ctx.db.query("activities").collect())
    expect(notes.some((n) => n.body?.includes("part of the total"))).toBe(true)
  })
})
