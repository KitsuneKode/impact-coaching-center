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
import { orderSummary, publicOrigin } from "../lib/order-messages"
import { formatPaise } from "../lib/money"
import { recordAudit } from "./audit"
import { REFUSAL, viewerPerson, type Refusal } from "./authz"
import { removePurchased } from "./checkout"
import { internal } from "./_generated/api"
import type { Doc, Id } from "./_generated/dataModel"
import {
  action,
  internalMutation,
  internalQuery,
  query,
  type MutationCtx,
} from "./_generated/server"
import { queueMessage } from "./messages"
import { allocateOrderReference, newReceiptToken } from "./orders"
import { readSettings } from "./settings"

/**
 * Taking the money for a checkout attempt (checkout.ts), and making the
 * order once it is captured (ADR-0005).
 *
 * 1. `startPayment` creates the Razorpay order for the attempt's total and
 *    hands Checkout what it needs. Pressing Pay again reuses it.
 * 2. Checkout returns a payment id and signature; `confirmPayment` checks the
 *    signature against our stored Razorpay order id and asks Razorpay's API
 *    for the payment's amount and state.
 * 3. The `/razorpay/webhook` route does the same if the browser never comes
 *    back. Whichever arrives first makes the order; the other finds it made.
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

/**
 * How the shop takes orders right now: online through the gateway, or on
 * WhatsApp while payments are off (no keys yet, or switched off).
 */
export const shopMode = query({
  args: {},
  returns: v.union(v.literal("online"), v.literal("whatsapp")),
  handler: async () => {
    const mode = provider()
    if (mode === "simulated") return "online" as const
    return mode === "razorpay" && razorpayAuth() ? "online" : "whatsapp"
  },
})

function razorpayAuth() {
  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!id || !secret) return null
  return { id, secret, header: `Basic ${btoa(`${id}:${secret}`)}` }
}

/* ------------------------------------------------------------ queries */

/**
 * What `checkoutForViewer` returns, spelled out: actions in this file call
 * functions in this file, and inferring that type makes TypeScript chase its
 * own tail through the generated `internal` (see the Convex guidelines).
 */
type ViewerCheckout =
  | {
      ok: true
      status: "open" | "paid" | "replaced"
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
    }
  | PaymentRefused
type Simulated =
  | { ok: true; paymentId: string; signature: string }
  | PaymentRefused
type Settled = { reference: string; receiptNumber: string }
type Confirmed = ({ ok: true } & Settled) | PaymentRefused

/** The viewer's own checkout attempt, with what payment needs. */
export const checkoutForViewer = internalQuery({
  args: { checkoutId: v.id("checkouts") },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      status: v.union(
        v.literal("open"),
        v.literal("paid"),
        v.literal("replaced")
      ),
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
    const checkout = await ctx.db.get(args.checkoutId)
    // Someone else's attempt reads as missing, not as forbidden.
    if (!checkout || checkout.personId !== viewer.value.id)
      return { ok: false as const, reason: "missing-record" as const }
    return {
      ok: true as const,
      status: checkout.status,
      totalPaise: checkout.totalPaise,
      gatewayOrderId: checkout.gatewayOrderId,
      name: checkout.contact.name,
      phone: checkout.contact.phone,
    }
  },
})

/** Remember the gateway order, unless one is already attached. */
export const attachGatewayOrder = internalMutation({
  args: { checkoutId: v.id("checkouts"), gatewayOrderId: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const checkout = await ctx.db.get(args.checkoutId)
    if (!checkout) throw new Error("checkout vanished")
    if (checkout.gatewayOrderId) return checkout.gatewayOrderId
    await ctx.db.patch(args.checkoutId, {
      gatewayOrderId: args.gatewayOrderId,
      updatedAt: Date.now(),
    })
    return args.gatewayOrderId
  },
})

/** The gateway said no; the attempt stays open to try again. */
export const noteDeclined = internalMutation({
  args: { gatewayOrderId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const checkout = await ctx.db
      .query("checkouts")
      .withIndex("by_gatewayOrderId", (q) =>
        q.eq("gatewayOrderId", args.gatewayOrderId)
      )
      .first()
    if (checkout?.status === "open")
      await ctx.db.patch(checkout._id, { declinedAt: Date.now() })
    return null
  },
})

/* ------------------------------------------------------------ actions */

/** Open payment for one of the viewer's checkout attempts. */
export const startPayment = action({
  args: { checkoutId: v.id("checkouts") },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      provider: v.union(v.literal("razorpay"), v.literal("simulated")),
      keyId: v.optional(v.string()),
      gatewayOrderId: v.string(),
      amountPaise: v.number(),
      name: v.string(),
      phone: v.string(),
    }),
    PAYMENT_REFUSAL
  ),
  handler: async (ctx, args): Promise<Started> => {
    const mode = provider()
    if (mode === "off") return refuse("payments-off")
    const checkout: ViewerCheckout = await ctx.runQuery(
      internal.payments.checkoutForViewer,
      args
    )
    if (!checkout.ok) return checkout
    if (checkout.status === "paid") return refuse("already-paid")
    // Replaced by a newer cart: paying this one would buy the old cart.
    if (checkout.status !== "open") return refuse("not-payable")

    let gatewayOrderId = checkout.gatewayOrderId
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
            amount: checkout.totalPaise,
            currency: "INR",
            // Razorpay's receipt field allows 40 characters; an id fits.
            receipt: args.checkoutId,
            notes: { checkout: args.checkoutId },
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
      { checkoutId: args.checkoutId, gatewayOrderId }
    )
    return {
      ok: true as const,
      provider: mode,
      keyId,
      gatewayOrderId: attached,
      amountPaise: checkout.totalPaise,
      name: checkout.name,
      phone: checkout.phone,
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
    checkoutId: v.id("checkouts"),
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
    const checkout: ViewerCheckout = await ctx.runQuery(
      internal.payments.checkoutForViewer,
      { checkoutId: args.checkoutId }
    )
    if (!checkout.ok) return checkout
    if (!checkout.gatewayOrderId) return refuse("not-payable")
    if (args.outcome === "failure") {
      await ctx.runMutation(internal.payments.noteDeclined, {
        gatewayOrderId: checkout.gatewayOrderId,
      })
      return refuse("declined")
    }
    const paymentId = `pay_SIM${crypto.randomUUID().replaceAll("-", "").slice(0, 14)}`
    const signature = await hmacHex(
      SIMULATED_SECRET,
      `${checkout.gatewayOrderId}|${paymentId}`
    )
    return { ok: true as const, paymentId, signature }
  },
})

/** Checkout's success handler lands here with the gateway's proof. */
export const confirmPayment = action({
  args: {
    checkoutId: v.id("checkouts"),
    paymentId: v.string(),
    signature: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      reference: v.string(),
      receiptNumber: v.string(),
    }),
    PAYMENT_REFUSAL
  ),
  handler: async (ctx, args): Promise<Confirmed> => {
    const mode = provider()
    if (mode === "off") return refuse("payments-off")
    const checkout: ViewerCheckout = await ctx.runQuery(
      internal.payments.checkoutForViewer,
      { checkoutId: args.checkoutId }
    )
    if (!checkout.ok) return checkout
    // Our stored gateway order id, never one the browser sends.
    if (!checkout.gatewayOrderId) return refuse("not-payable")

    const secret =
      mode === "razorpay" ? razorpayAuth()?.secret : SIMULATED_SECRET
    if (!secret) return refuse("payments-off")
    const valid = await checkoutSignatureValid({
      orderId: checkout.gatewayOrderId,
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
        payment.order_id !== checkout.gatewayOrderId ||
        payment.amount !== checkout.totalPaise
      )
        return refuse("declined")
      // The bank said yes but Razorpay has not captured it yet. The
      // `payment.captured` webhook makes the order when it does.
      if (paymentPending(payment.status ?? "")) return refuse("pending")
      if (!paymentSettled(payment.status ?? "")) return refuse("declined")
      method = payment.method ?? "razorpay"
    }

    const settled: Settled | null = await ctx.runMutation(
      internal.payments.settle,
      {
        gatewayOrderId: checkout.gatewayOrderId,
        paymentId: args.paymentId,
        method,
        amountPaise: checkout.totalPaise,
        source: "checkout",
      }
    )
    if (!settled) return refuse("not-payable")
    return { ok: true as const, ...settled }
  },
})

/* ------------------------------------------------------------ settling */

/** Next receipt number for the year, from the counters table. */
export async function nextReceipt(
  ctx: MutationCtx,
  at: number,
  prefix: string
) {
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
  order: Pick<Doc<"orders">, "lines">,
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
 * Captured money becomes an order. Idempotent: a checkout already turned
 * into an order returns it and changes nothing. A payment for a different
 * amount, or for an attempt we never made, makes nothing (null) and is
 * logged for the owner to refund.
 */
export async function settleCheckout(
  ctx: MutationCtx,
  args: SettleArgs
): Promise<Settled | null> {
  // Made already (the other path got here first): hand it back.
  const made = await ctx.db
    .query("orders")
    .withIndex("by_razorpayOrderId", (q) =>
      q.eq("payment.razorpayOrderId", args.gatewayOrderId)
    )
    .first()
  if (made)
    return { reference: made.reference, receiptNumber: made.receiptNumber }
  const checkout = await ctx.db
    .query("checkouts")
    .withIndex("by_gatewayOrderId", (q) =>
      q.eq("gatewayOrderId", args.gatewayOrderId)
    )
    .first()
  if (!checkout || args.amountPaise !== checkout.totalPaise) {
    await recordAudit(ctx, null, {
      action: "payment",
      entity: "order",
      summary: `Payment ${args.paymentId} (${formatPaise(args.amountPaise)}) matches no checkout for ${args.gatewayOrderId}. Refund it in Razorpay.`,
    })
    return null
  }

  /* A replaced attempt still becomes an order: the money arrived for what
     it froze, and keeping money without an order is the one wrong answer. */
  const now = Date.now()
  const settings = await readSettings(ctx)
  const receipt = await nextReceipt(ctx, now, settings.receiptPrefix)
  const reference = await allocateOrderReference(ctx)
  const orderId = await ctx.db.insert("orders", {
    personId: checkout.personId,
    reference,
    status: "paid",
    closed: false,
    history: [{ status: "paid", at: now }],
    fulfilment: checkout.fulfilment,
    contact: checkout.contact,
    lines: checkout.lines,
    itemsPaise: checkout.itemsPaise,
    deliveryPaise: checkout.deliveryPaise,
    totalPaise: checkout.totalPaise,
    address: checkout.address,
    checkoutId: checkout._id,
    payment: {
      razorpayOrderId: args.gatewayOrderId,
      razorpayPaymentId: args.paymentId,
      method: args.method,
      paidAt: now,
    },
    receiptNumber: receipt,
    receiptToken: newReceiptToken(),
    // The receipt names the seller as they were when the money arrived; a
    // later settings edit must not rewrite an issued receipt.
    seller: {
      legalName: settings.legalName,
      gstin: settings.gstin,
      address: settings.pickupAddress,
    },
    placedAt: now,
    updatedAt: now,
    revision: 0,
  })
  await ctx.db.patch(checkout._id, {
    status: "paid",
    orderId,
    updatedAt: now,
  })
  // A second open attempt for the same cart would buy it twice.
  const others = await ctx.db
    .query("checkouts")
    .withIndex("by_personId_and_status", (q) =>
      q.eq("personId", checkout.personId).eq("status", "open")
    )
    .take(10)
  await Promise.all(
    others.map((row) =>
      ctx.db.patch(row._id, { status: "replaced", updatedAt: now })
    )
  )
  await countSales(ctx, checkout)
  await removePurchased(ctx, checkout.personId, checkout.lines)
  await ctx.db.insert("activities", {
    personId: checkout.personId,
    kind: "order_placed",
    body: `Order ${reference} paid: ${orderSummary(checkout)} · receipt ${receipt}`,
    to: "paid",
  })
  await recordAudit(ctx, null, {
    action: "payment",
    entity: "order",
    entityId: orderId,
    summary: `Order ${reference} paid (${args.source}, ${args.method}).`,
    to: "paid",
  })

  const person = await ctx.db.get(checkout.personId)
  const origin = publicOrigin(process.env.SITE_URL)
  if (origin) {
    const order = (await ctx.db.get(orderId))!
    await queueMessage(ctx, {
      key: `${reference}:paid:buyer`,
      to: checkout.contact.phone,
      template: "order_paid",
      language: person?.locale ?? "en",
      params: [
        reference,
        formatPaise(checkout.totalPaise),
        `${origin}/receipt/${order.receiptToken}`,
      ],
    })
    if (settings.deskPhone)
      await queueMessage(ctx, {
        key: `${reference}:paid:desk`,
        to: settings.deskPhone,
        template: "desk_new_order",
        language: "en",
        params: [
          reference,
          orderSummary(checkout),
          `${origin}/admin/orders/${reference}`,
        ],
      })
  }
  return { reference, receiptNumber: receipt }
}

export const settle = internalMutation({
  args: SETTLE_ARGS,
  returns: v.union(
    v.null(),
    v.object({ reference: v.string(), receiptNumber: v.string() })
  ),
  handler: (ctx, args) => settleCheckout(ctx, args),
})

/**
 * Razorpay says money went back. A full refund closes the order as
 * refunded (and stops counting it as sold); a part refund is noted only.
 */
export async function recordRefund(
  ctx: MutationCtx,
  args: { gatewayOrderId: string; refundId: string; amountPaise: number }
) {
  const order = await ctx.db
    .query("orders")
    .withIndex("by_razorpayOrderId", (q) =>
      q.eq("payment.razorpayOrderId", args.gatewayOrderId)
    )
    .first()
  if (!order || order.status === "refunded") return
  const now = Date.now()
  const full = args.amountPaise >= order.totalPaise
  if (full) {
    await ctx.db.patch(order._id, {
      status: "refunded",
      closed: true,
      history: [...order.history, { status: "refunded", at: now }],
      refundDueAt: undefined,
      updatedAt: now,
      revision: order.revision + 1,
    })
    // A cancelled order was already taken off the sold count.
    if (order.status !== "cancelled") await countSales(ctx, order, -1)
  }
  await ctx.db.insert("activities", {
    personId: order.personId,
    kind: "order_status",
    body: `Razorpay refunded ${formatPaise(args.amountPaise)} on order ${order.reference} (${args.refundId})${full ? "" : ", part of the total"}.`,
    from: order.status,
    to: full ? "refunded" : order.status,
  })
  await recordAudit(ctx, null, {
    action: "payment",
    entity: "order",
    entityId: order._id,
    summary: `Refund ${args.refundId} of ${formatPaise(args.amountPaise)} on ${order.reference}.`,
    from: order.status,
    to: full ? "refunded" : order.status,
  })
}

/** Webhook events that mean the money is captured. */
const SETTLING_EVENTS = new Set(["order.paid", "payment.captured"])

/**
 * One webhook event, once, in one transaction: the event is recorded and the
 * order made together, so a failure rolls both back and Razorpay's retry
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
    refundId: v.optional(v.string()),
    refundPaise: v.optional(v.number()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const seen = await ctx.db
      .query("paymentEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first()
    if (seen) return false
    const { gatewayOrderId, paymentId, amountPaise } = args
    if (
      SETTLING_EVENTS.has(args.type) &&
      gatewayOrderId &&
      paymentId &&
      amountPaise !== undefined
    )
      await settleCheckout(ctx, {
        gatewayOrderId,
        paymentId,
        method: args.method ?? "razorpay",
        amountPaise,
        source: "webhook",
      })
    if (args.type === "payment.failed" && gatewayOrderId) {
      const checkout = await ctx.db
        .query("checkouts")
        .withIndex("by_gatewayOrderId", (q) =>
          q.eq("gatewayOrderId", gatewayOrderId)
        )
        .first()
      if (checkout?.status === "open")
        await ctx.db.patch(checkout._id, { declinedAt: Date.now() })
    }
    if (
      args.type === "refund.processed" &&
      gatewayOrderId &&
      args.refundId &&
      args.refundPaise !== undefined
    )
      await recordRefund(ctx, {
        gatewayOrderId,
        refundId: args.refundId,
        amountPaise: args.refundPaise,
      })
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
    return true
  },
})
