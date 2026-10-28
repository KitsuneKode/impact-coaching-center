import { v } from "convex/values"

import { CLOSED_STATUSES, type OrderStatus } from "../lib/order-status"
import type { Doc, Id } from "./_generated/dataModel"
import { internalMutation, type MutationCtx } from "./_generated/server"
import { internal } from "./_generated/api"
import { newReceiptToken } from "./orders"
import { nextReceipt } from "./payments"
import { readSettings } from "./settings"

/**
 * Orders made before ADR-0005, when an order existed before payment.
 * Run once per deployment that has them (docs/production.md, "Orders v2").
 */
type LegacyOrder = Omit<
  Doc<"orders">,
  | "status"
  | "closed"
  | "history"
  | "checkoutId"
  | "payment"
  | "receiptNumber"
  | "receiptToken"
  | "seller"
  | "revision"
> & {
  status: OrderStatus | "awaiting_payment" | "packed"
  closed?: boolean
  history?: Doc<"orders">["history"]
  checkoutId?: Id<"checkouts">
  payment?: {
    razorpayOrderId: string
    razorpayPaymentId?: string
    method?: string
    paidAt?: number
  }
  receiptNumber?: string
  receiptToken?: string
  seller?: Doc<"orders">["seller"]
  revision?: number
  expiredAt?: number
  idempotencyKey?: string
}

async function migrateOne(ctx: MutationCtx, order: LegacyOrder) {
  const base = {
    personId: order.personId,
    fulfilment: order.fulfilment,
    contact: order.contact,
    lines: order.lines,
    itemsPaise: order.itemsPaise,
    deliveryPaise: order.deliveryPaise,
    totalPaise: order.totalPaise,
    address: order.address,
    signature: `legacy:${order.reference}`,
    gatewayOrderId: order.payment?.razorpayOrderId,
    updatedAt: order.updatedAt ?? order.placedAt,
  }
  const payment = order.payment
  // Never paid: under ADR-0005 that is a checkout attempt, not an order.
  if (!payment?.razorpayPaymentId || order.status === "awaiting_payment") {
    await ctx.db.insert("checkouts", {
      ...base,
      status: order.status === "awaiting_payment" ? "open" : "replaced",
    })
    await ctx.db.delete(order._id)
    return "checkout" as const
  }

  const paidAt = payment.paidAt ?? order.placedAt
  const status: OrderStatus = order.status === "packed" ? "paid" : order.status
  const checkoutId = await ctx.db.insert("checkouts", {
    ...base,
    status: "paid",
    orderId: order._id,
  })
  const settings = await readSettings(ctx)
  const history: Doc<"orders">["history"] = [{ status: "paid", at: paidAt }]
  if (status !== "paid") history.push({ status, at: order.updatedAt ?? paidAt })
  await ctx.db.replace(order._id, {
    personId: order.personId,
    reference: order.reference,
    status,
    closed: CLOSED_STATUSES.has(status),
    history,
    fulfilment: order.fulfilment,
    contact: order.contact,
    lines: order.lines,
    itemsPaise: order.itemsPaise,
    deliveryPaise: order.deliveryPaise,
    totalPaise: order.totalPaise,
    address: order.address,
    courier: order.courier,
    checkoutId,
    payment: {
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      method: payment.method ?? "unknown",
      paidAt,
    },
    receiptNumber:
      order.receiptNumber ??
      (await nextReceipt(ctx, paidAt, settings.receiptPrefix)),
    receiptToken: order.receiptToken ?? newReceiptToken(),
    seller: order.seller ?? {
      legalName: settings.legalName,
      gstin: settings.gstin,
      address: settings.pickupAddress,
    },
    refundDueAt: order.refundDueAt,
    placedAt: order.placedAt,
    updatedAt: order.updatedAt,
    seenAt: order.seenAt,
    revision: order.revision ?? 0,
  })
  return "order" as const
}

/** Moves legacy orders to the v2 shape, 50 at a time, rescheduling itself. */
export const ordersToV2 = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("orders")
      .paginate({ numItems: 50, cursor: args.cursor ?? null })
    let moved = 0
    for (const row of page.page) {
      const order = row as unknown as LegacyOrder
      if (order.checkoutId && order.history) continue
      await migrateOne(ctx, order)
      moved++
    }
    console.log(`[migrations] ordersToV2: ${moved} moved`)
    if (!page.isDone)
      await ctx.scheduler.runAfter(0, internal.migrations.ordersToV2, {
        cursor: page.continueCursor,
      })
    return null
  },
})
