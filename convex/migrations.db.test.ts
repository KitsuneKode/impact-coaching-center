import { convexTest } from "convex-test"
import { defineSchema } from "convex/server"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import schema from "./schema"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

/** The schema as step 1 of the runbook leaves it: legacy rows allowed. */
const loose = defineSchema(schema.tables, { schemaValidation: false })

const LEGACY = {
  fulfilment: "delivery",
  contact: { name: "Old Buyer", phone: "+919800000001" },
  lines: [],
  itemsPaise: 50000,
  deliveryPaise: 6000,
  totalPaise: 56000,
  address: { line1: "1 Road", city: "Tezpur", pin: "784001" },
  placedAt: 1_700_000_000_000,
  idempotencyKey: "k",
}

describe("ordersToV2", () => {
  test("paid legacy orders gain the v2 fields; unpaid ones become checkouts", async () => {
    const t = convexTest(loose, modules)
    const personId = await t.mutation(internal.persons.recordVerifiedPerson, {
      phone: "+919800000001",
      name: "Old Buyer",
    })
    const [paidId, packedId, unpaidId] = await t.run(async (ctx) => {
      const insert = (row: Record<string, unknown>) =>
        // Legacy shapes are exactly what the strict types refuse.
        ctx.db.insert("orders", { ...LEGACY, personId, ...row } as never)
      return Promise.all([
        insert({
          reference: "ICT-PAID1",
          status: "delivered",
          payment: { razorpayOrderId: "order_1", razorpayPaymentId: "pay_1" },
          receiptNumber: "ICT/26-27/0001",
          updatedAt: 1_700_000_100_000,
        }),
        insert({
          reference: "ICT-PACK1",
          status: "packed",
          payment: {
            razorpayOrderId: "order_2",
            razorpayPaymentId: "pay_2",
            paidAt: 1_700_000_050_000,
          },
        }),
        insert({
          reference: "ICT-OPEN1",
          status: "awaiting_payment",
          payment: { razorpayOrderId: "order_3" },
        }),
      ])
    })

    await t.mutation(internal.migrations.ordersToV2, {})

    const { paid, packed, unpaid, checkouts } = await t.run(async (ctx) => ({
      paid: await ctx.db.get(paidId),
      packed: await ctx.db.get(packedId),
      unpaid: await ctx.db.get(unpaidId),
      checkouts: await ctx.db.query("checkouts").take(10),
    }))
    expect(unpaid).toBeNull()
    expect(checkouts.map((c) => c.status).sort()).toEqual([
      "open",
      "paid",
      "paid",
    ])

    expect(paid?.closed).toBe(true)
    expect(paid?.history.map((h) => h.status)).toEqual(["paid", "delivered"])
    expect(paid?.receiptNumber).toBe("ICT/26-27/0001")
    expect(paid?.receiptToken).toHaveLength(24)
    expect(paid?.payment.method).toBe("unknown")
    expect(paid && "idempotencyKey" in paid).toBe(false)

    expect(packed?.status).toBe("paid")
    expect(packed?.closed).toBe(false)
    expect(packed?.history).toEqual([{ status: "paid", at: 1_700_000_050_000 }])
    // No receipt number before: one is issued in the year it was paid.
    expect(packed?.receiptNumber).toMatch(/\/23-24\/0001$/)
    expect(packed?.seller.legalName).toBeTruthy()

    // A second run finds nothing to move.
    await t.mutation(internal.migrations.ordersToV2, {})
    expect(
      await t.run((ctx) => ctx.db.query("checkouts").take(10))
    ).toHaveLength(3)
  })
})
