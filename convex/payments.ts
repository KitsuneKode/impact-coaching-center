import { type Infer, v } from "convex/values"

import {
  checkoutSignatureValid,
  choosePaymentProvider,
  financialYear,
  hmacHex,
  paymentPending,
  paymentSettled,
  receiptNumber,
  SIMULATED_SECRET,
} from "../lib/payments"
import { recordAudit } from "./audit"
import { REFUSAL, viewerPerson, type Refusal } from "./authz"
import { internal } from "./_generated/api"
import type { Doc, Id } from "./_generated/dataModel"
import {
  action,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server"
import { readSettings } from "./settings"

/**
 * Taking payment for an order the server has already priced (checkout.ts).
 *
 * 1. `startPayment` creates the gateway order for the order's total and
 *    hands Checkout what it needs. Retrying reuses the same gateway order.
 * 2. Checkout returns a payment id and signature; `confirmPayment` checks the
 *    signature against our stored gateway order id and, on Razorpay, asks the
 *    API for the payment's amount and state before settling.
 * 3. The `/razorpay/webhook` route settles the same way if the browser never
 *    came back. `settle` is idempotent, so either path, or both, is fine.
 *
 * Settling marks the order paid, numbers its receipt for the financial year,
 * counts the sets sold and writes the lead's timeline.
 */

/** Payment refusals beyond the shared ones, worded for the checkout UI. */
const PAYMENT_REFUSAL = v.union(
  REFUSAL,
  v.object({
    ok: v.literal(false),
    reason: v.union(
      v.literal("payments-off"),
      v.literal("already-paid"),
      v.literal("not-payable"),
      v.literal("declined"),
      v.literal("gateway"),
      v.literal("pending")
    ),
  })
)

type PaymentRefusal =
  | "payments-off"
  | "already-paid"
  | "not-payable"
  | "declined"
  | "gateway"
  | "pending"
const refuse = (reason: PaymentRefusal) => ({ ok: false as const, reason })

function provider() {
  return choosePaymentProvider(
    process.env.PAYMENT_PROVIDER,
    process.env.CONVEX_SITE_URL
  )
}

function razorpayAuth() {
  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!id || !secret) return null
  return { id, secret, header: `Basic ${btoa(`${id}:${secret}`)}` }
}

/* ------------------------------------------------------------ queries */

/**
 * What `orderForViewer` returns, spelled out: actions in this file call
 * functions in this file, and inferring that type makes TypeScript chase its
 * own tail through the generated `internal` (see the Convex guidelines).
 */
type ViewerOrder =
  | {
      ok: true
      id: Id<"orders">
      reference: string
      status: string
      totalPaise: number
      gatewayOrderId?: string
      name: string
      phone: string
    }
  | Refusal

type PaymentRefused = Refusal | { ok: false; reason: PaymentRefusal }
type Started =
  | {
      ok: true
      provider: "razorpay" | "simulated"
      keyId?: string
      gatewayOrderId: string
      amountPaise: number
      name: string
      phone: string
      reference: string
    }
  | PaymentRefused
type Simulated =
  | { ok: true; paymentId: string; signature: string }
  | PaymentRefused
type Confirmed = { ok: true; receiptNumber: string } | PaymentRefused

/** The viewer's own order, with what payment needs. */
export const orderForViewer = internalQuery({
  args: { reference: v.string() },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      id: v.id("orders"),
      reference: v.string(),
      status: v.string(),
      totalPaise: v.number(),
      gatewayOrderId: v.optional(v.string()),
      name: v.string(),
      phone: v.string(),
    }),
    REFUSAL
  ),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    // Someone else's reference reads as missing, not as forbidden.
    if (!order || order.personId !== viewer.value.id)
      return { ok: false as const, reason: "missing-record" as const }
    return {
      ok: true as const,
      id: order._id,
      reference: order.reference,
      status: order.status,
      totalPaise: order.totalPaise,
      gatewayOrderId: order.payment?.razorpayOrderId,
      name: order.contact.name,
      phone: order.contact.phone,
    }
  },
})

/** Remember the gateway order, unless one is already attached. */
export const attachGatewayOrder = internalMutation({
  args: { orderId: v.id("orders"), gatewayOrderId: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId)
    if (!order) throw new Error("order vanished")
    if (order.payment?.razorpayOrderId) return order.payment.razorpayOrderId
    await ctx.db.patch(args.orderId, {
      payment: { razorpayOrderId: args.gatewayOrderId },
      updatedAt: Date.now(),
    })
    return args.gatewayOrderId
  },
})

/* ------------------------------------------------------------ actions */

/** Open payment for one of the viewer's unpaid orders. */
export const startPayment = action({
  args: { reference: v.string() },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      provider: v.union(v.literal("razorpay"), v.literal("simulated")),
      keyId: v.optional(v.string()),
      gatewayOrderId: v.string(),
      amountPaise: v.number(),
      name: v.string(),
      phone: v.string(),
      reference: v.string(),
    }),
    PAYMENT_REFUSAL
  ),
  handler: async (ctx, args): Promise<Started> => {
    const mode = provider()
    if (mode === "off") return refuse("payments-off")
    const order: ViewerOrder = await ctx.runQuery(
      internal.payments.orderForViewer,
      args
    )
    if (!order.ok) return order
    if (order.status === "paid" || order.status !== "awaiting_payment")
      return refuse(order.status === "paid" ? "already-paid" : "not-payable")

    let gatewayOrderId = order.gatewayOrderId
    let keyId: string | undefined
    if (mode === "razorpay") {
      const auth = razorpayAuth()
      if (!auth) return refuse("payments-off")
      keyId = auth.id
      if (!gatewayOrderId) {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            authorization: auth.header,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            amount: order.totalPaise,
            currency: "INR",
            receipt: order.reference,
            notes: { reference: order.reference },
          }),
        })
        if (!response.ok) return refuse("gateway")
        const created = (await response.json()) as { id?: unknown }
        if (typeof created.id !== "string") return refuse("gateway")
        gatewayOrderId = created.id
      }
    } else {
      gatewayOrderId ??= `order_SIM${crypto.randomUUID().replaceAll("-", "").slice(0, 14)}`
    }
    const attached: string = await ctx.runMutation(
      internal.payments.attachGatewayOrder,
      { orderId: order.id, gatewayOrderId }
    )
    gatewayOrderId = attached
    return {
      ok: true as const,
      provider: mode,
      keyId,
      gatewayOrderId,
      amountPaise: order.totalPaise,
      name: order.name,
      phone: order.phone,
      reference: order.reference,
    }
  },
})

/**
 * The fake gateway's pay button, for local and the dev deployment only: it
 * signs a payment exactly as Razorpay would, so `confirmPayment` is the same
 * code either way.
 */
export const simulatePayment = action({
  args: {
    reference: v.string(),
    outcome: v.union(v.literal("success"), v.literal("failure")),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      paymentId: v.string(),
      signature: v.string(),
    }),
    PAYMENT_REFUSAL
  ),
  handler: async (ctx, args): Promise<Simulated> => {
    if (provider() !== "simulated") return refuse("payments-off")
    const order: ViewerOrder = await ctx.runQuery(
      internal.payments.orderForViewer,
      { reference: args.reference }
    )
    if (!order.ok) return order
    if (!order.gatewayOrderId) return refuse("not-payable")
    if (args.outcome === "failure") return refuse("declined")
    const paymentId = `pay_SIM${crypto.randomUUID().replaceAll("-", "").slice(0, 14)}`
    const signature = await hmacHex(
      SIMULATED_SECRET,
      `${order.gatewayOrderId}|${paymentId}`
    )
    return { ok: true as const, paymentId, signature }
  },
})

/** Checkout's success handler lands here with the gateway's proof. */
export const confirmPayment = action({
  args: {
    reference: v.string(),
    paymentId: v.string(),
    signature: v.string(),
  },
  returns: v.union(
    v.object({ ok: v.literal(true), receiptNumber: v.string() }),
    PAYMENT_REFUSAL
  ),
  handler: async (ctx, args): Promise<Confirmed> => {
    const mode = provider()
    if (mode === "off") return refuse("payments-off")
    const order: ViewerOrder = await ctx.runQuery(
      internal.payments.orderForViewer,
      { reference: args.reference }
    )
    if (!order.ok) return order
    // Our stored gateway order id, never one the browser sends.
    if (!order.gatewayOrderId) return refuse("not-payable")

    const secret =
      mode === "razorpay" ? razorpayAuth()?.secret : SIMULATED_SECRET
    if (!secret) return refuse("payments-off")
    const valid = await checkoutSignatureValid({
      orderId: order.gatewayOrderId,
      paymentId: args.paymentId,
      signature: args.signature,
      secret,
    })
    if (!valid) return refuse("declined")

    let method = "simulated"
    if (mode === "razorpay") {
      // The signature proves Razorpay sent it; the API proves it is for the
      // whole amount and has gone through.
      const auth = razorpayAuth()!
      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(args.paymentId)}`,
        { headers: { authorization: auth.header } }
      )
      if (!response.ok) return refuse("gateway")
      const payment = (await response.json()) as {
        order_id?: string
        amount?: number
        status?: string
        method?: string
      }
      if (
        payment.order_id !== order.gatewayOrderId ||
        payment.amount !== order.totalPaise
      )
        return refuse("declined")
      // The bank said yes but Razorpay has not captured it yet. The
      // `payment.captured` webhook settles the order when it does.
      if (paymentPending(payment.status ?? "")) return refuse("pending")
      if (!paymentSettled(payment.status ?? "")) return refuse("declined")
      method = payment.method ?? "razorpay"
    }

    const settled: string | null = await ctx.runMutation(
      internal.payments.settle,
      {
        gatewayOrderId: order.gatewayOrderId,
        paymentId: args.paymentId,
        method,
        amountPaise: order.totalPaise,
        source: "checkout",
      }
    )
    if (!settled) return refuse("not-payable")
    return { ok: true as const, receiptNumber: settled }
  },
})

/* ------------------------------------------------------------ settling */

/** Next receipt number for the year, from the counters table. */
async function nextReceipt(ctx: MutationCtx, at: number, prefix: string) {
  const year = financialYear(at)
  const name = `receipt:${year}`
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first()
  const value = (counter?.value ?? 0) + 1
  if (counter) await ctx.db.patch(counter._id, { value })
  else await ctx.db.insert("counters", { name, value })
  return receiptNumber(prefix, year, value)
}

/**
 * Move each set's sold count by `sign` copies per line: +1 when an order is
 * paid, -1 when a paid order is cancelled or refunded. Never below zero.
 */
export async function countSales(
  ctx: MutationCtx,
  order: Doc<"orders">,
  sign: 1 | -1 = 1
) {
  /* One set can sit on two lines (English and Assamese). Summed per set
     first: two parallel read-then-writes of one row would each read the
     same count and the second would overwrite the first. */
  const copies = new Map<Id<"bundles">, number>()
  for (const line of order.lines)
    copies.set(line.bundleId, (copies.get(line.bundleId) ?? 0) + line.quantity)
  await Promise.all(
    [...copies].map(async ([bundleId, quantity]) => {
      const bundle = await ctx.db.get(bundleId)
      if (bundle)
        await ctx.db.patch(bundle._id, {
          soldCount: Math.max(0, bundle.soldCount + sign * quantity),
        })
    })
  )
}

const SETTLE_ARGS = {
  gatewayOrderId: v.string(),
  paymentId: v.string(),
  method: v.string(),
  amountPaise: v.number(),
  source: v.union(v.literal("checkout"), v.literal("webhook")),
}
const SETTLE = v.object(SETTLE_ARGS)
type SettleArgs = Infer<typeof SETTLE>

/**
 * Mark the order behind a gateway order paid. Idempotent: an order already
 * paid returns its receipt and changes nothing. A payment for a different
 * amount, or for an order no longer awaiting payment, is refused (null).
 */
export async function settleOrder(ctx: MutationCtx, args: SettleArgs) {
  const order = await ctx.db
    .query("orders")
    .withIndex("by_razorpayOrderId", (q) =>
      q.eq("payment.razorpayOrderId", args.gatewayOrderId)
    )
    .first()
  if (!order) return null
  if (order.receiptNumber) return order.receiptNumber
  if (args.amountPaise !== order.totalPaise) return null
  // An order expired for going unpaid is revived by a payment that still
  // arrives (Razorpay can capture late). One a person cancelled is not:
  // the money is flagged for the owner to refund instead of silently kept.
  const revived = order.status === "cancelled" && order.expiredAt !== undefined
  if (order.status !== "awaiting_payment" && !revived) {
    if (order.status === "cancelled" && !order.refundDueAt) {
      const now = Date.now()
      await ctx.db.patch(order._id, {
        refundDueAt: now,
        payment: {
          razorpayOrderId: args.gatewayOrderId,
          razorpayPaymentId: args.paymentId,
          method: args.method,
        },
        updatedAt: now,
        revision: (order.revision ?? 0) + 1,
      })
      await ctx.db.insert("activities", {
        personId: order.personId,
        kind: "order_status",
        body: `Payment ${args.paymentId} received for cancelled order ${order.reference}. Refund it in Razorpay.`,
        from: "cancelled",
        to: "cancelled",
      })
      await recordAudit(ctx, null, {
        action: "payment",
        entity: "order",
        entityId: order._id,
        summary: `Payment ${args.paymentId} arrived for cancelled order ${order.reference}; refund needed.`,
      })
    }
    return null
  }
  const from = order.status

  const now = Date.now()
  const settings = await readSettings(ctx)
  const receipt = await nextReceipt(ctx, now, settings.receiptPrefix)
  await ctx.db.patch(order._id, {
    status: "paid",
    payment: {
      razorpayOrderId: args.gatewayOrderId,
      razorpayPaymentId: args.paymentId,
      method: args.method,
      paidAt: now,
    },
    receiptNumber: receipt,
    // The receipt names the seller as they were when the money arrived; a
    // later settings edit must not rewrite an issued receipt.
    seller: {
      legalName: settings.legalName,
      gstin: settings.gstin,
      address: settings.pickupAddress,
    },
    expiredAt: undefined,
    updatedAt: now,
    revision: (order.revision ?? 0) + 1,
  })
  await countSales(ctx, order)
  await ctx.db.insert("activities", {
    personId: order.personId,
    kind: "order_status",
    body: `Order ${order.reference} paid · ₹${Math.round(order.totalPaise / 100)} · receipt ${receipt}${revived ? " (after it had expired)" : ""}`,
    from,
    to: "paid",
  })
  await recordAudit(ctx, null, {
    action: "payment",
    entity: "order",
    entityId: order._id,
    summary: `Order ${order.reference} paid (${args.source}, ${args.method})${revived ? " after it had expired" : ""}.`,
    from,
    to: "paid",
  })
  return receipt
}

export const settle = internalMutation({
  args: SETTLE_ARGS,
  returns: v.union(v.string(), v.null()),
  handler: (ctx, args) => settleOrder(ctx, args),
})

/** Webhook events that mean the money is captured. */
const SETTLING_EVENTS = new Set(["order.paid", "payment.captured"])

/**
 * One webhook event, once, in one transaction: the event is recorded and the
 * order settled together, so a failure rolls both back and Razorpay's retry
 * finds the event unseen and tries again. Returns false for a repeat.
 */
export const handleWebhook = internalMutation({
  args: {
    eventId: v.string(),
    type: v.string(),
    gatewayOrderId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    method: v.optional(v.string()),
    amountPaise: v.optional(v.number()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const seen = await ctx.db
      .query("paymentEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first()
    if (seen) return false
    const { gatewayOrderId, paymentId, amountPaise } = args
    const order = gatewayOrderId
      ? await ctx.db
          .query("orders")
          .withIndex("by_razorpayOrderId", (q) =>
            q.eq("payment.razorpayOrderId", gatewayOrderId)
          )
          .first()
      : null
    await ctx.db.insert("paymentEvents", {
      eventId: args.eventId,
      type: args.type,
      orderId: order?._id,
    })
    if (
      SETTLING_EVENTS.has(args.type) &&
      gatewayOrderId &&
      paymentId &&
      amountPaise !== undefined
    )
      await settleOrder(ctx, {
        gatewayOrderId,
        paymentId,
        method: args.method ?? "razorpay",
        amountPaise,
        source: "webhook",
      })
    return true
  },
})
