import { paginationOptsValidator } from "convex/server"
import { type Infer, v } from "convex/values"

import {
  checkRevision,
  COUNT_CAP,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  paginated,
  requireStaff,
  revisionOf,
  type Viewer,
  viewerPerson,
} from "./authz"
import type { Id } from "./_generated/dataModel"
import {
  internalMutation,
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { ADDRESS, ORDER_LINE, ORDER_STATUS } from "./schema"
import { newOrderReference } from "../lib/order-reference"
import { readSettings } from "./settings"

/** Who carries the parcel. Shared by schema, args and projections. */
const COURIER = v.object({
  name: v.string(),
  trackingNumber: v.string(),
})

/**
 * A fresh reference that nothing else holds. The alphabet makes collisions
 * rare; this loop makes them survivable - it retries rather than reusing.
 */
export async function allocateOrderReference(
  ctx: MutationCtx
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const reference = newOrderReference()
    const taken = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .first()
    if (!taken) return reference
  }
  throw new Error("Could not allocate a fresh order reference; try again.")
}

/** What may follow what. */
const TRANSITIONS: Record<string, readonly string[]> = {
  awaiting_payment: ["paid", "cancelled"],
  paid: ["packed", "ready_for_collection", "cancelled", "refunded"],
  packed: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  ready_for_collection: ["collected", "cancelled", "refunded"],
  delivered: ["refunded"],
  collected: ["refunded"],
  cancelled: [],
  refunded: [],
}

/** Statuses a staff member may set from the admin. */
const STAFF_SETTABLE = new Set([
  "packed",
  "shipped",
  "delivered",
  "ready_for_collection",
  "collected",
  "cancelled",
])

/** Asserts money moved back. Owner-only until a provider can prove it. */
const OWNER_SETTABLE = new Set(["refunded"])

/**
 * Statuses that still need somebody to pack, send or hand over. An order
 * awaiting payment is the buyer's move, so it is counted on its own.
 */
const OPEN_STATUSES = new Set([
  "paid",
  "packed",
  "shipped",
  "ready_for_collection",
])

/** One page of orders for the fulfilment queue. */
/** The queue-row projection. Never the whole order or Person document. */
const ORDER_ROW = v.object({
  id: v.id("orders"),
  reference: v.string(),
  status: ORDER_STATUS,
  fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
  lines: v.array(ORDER_LINE),
  itemsPaise: v.number(),
  deliveryPaise: v.number(),
  totalPaise: v.number(),
  address: v.optional(ADDRESS),
  receiptNumber: v.optional(v.string()),
  placedAt: v.number(),
  seen: v.boolean(),
  revision: v.number(),
  courier: v.optional(COURIER),
  buyerName: v.string(),
  buyerPhone: v.string(),
  /** The buyer deleted their account: no name or number to show or dial. */
  buyerDeleted: v.boolean(),
})

export const adminOrdersPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginated(ORDER_ROW),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { page: [], isDone: true, continueCursor: "" }
    return readOrdersPage(ctx, staff.value, args.paginationOpts)
  },
})

/** One page of the queue for an already-resolved viewer. */
export async function readOrdersPage(
  ctx: QueryCtx,
  viewer: Viewer,
  paginationOpts: { numItems: number; cursor: string | null }
) {
  if (viewer.role !== "staff" && viewer.role !== "owner")
    return { page: [], isDone: true, continueCursor: "" }

  const result = await ctx.db
    .query("orders")
    .withIndex("by_placedAt")
    .order("desc")
    .paginate(paginationOpts)

  const page = await Promise.all(
    result.page.map(async (order) => {
      const person = await ctx.db.get(order.personId)
      const deleted = Boolean(person?.deletedAt)
      return {
        id: order._id,
        reference: order.reference,
        status: order.status,
        fulfilment: order.fulfilment,
        lines: order.lines,
        itemsPaise: order.itemsPaise,
        deliveryPaise: order.deliveryPaise,
        totalPaise: order.totalPaise,
        address: order.address,
        receiptNumber: order.receiptNumber,
        placedAt: order.placedAt,
        seen: Boolean(order.seenAt),
        revision: revisionOf(order),
        courier: order.courier,
        /* The buyer's name and number travel with the order - unless the
           account was erased, in which case the tombstone's `deleted:` phone
           is not a number and must not become a tappable link. */
        buyerName: deleted ? "" : order.contact.name,
        buyerPhone: deleted ? "" : order.contact.phone,
        buyerDeleted: deleted,
      }
    })
  )

  return { ...result, page }
}

/** Whether this caller may see the fulfilment queue at all. */
export const canSeeOrders = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireStaff(ctx)).ok,
})

/** How many orders still need somebody, and how many nobody has opened. */
export const orderCounts = query({
  args: {},
  returns: v.object({
    open: v.number(),
    unseen: v.number(),
    unpaid: v.number(),
    capped: v.boolean(),
  }),
  handler: async (ctx) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { open: 0, unseen: 0, unpaid: 0, capped: false }

    /* Bounded reads: one capped page per open status, never a full collect of
       a table that only ever grows. */
    const open = await Promise.all(
      [...OPEN_STATUSES].map((status) =>
        ctx.db
          .query("orders")
          .withIndex("by_status_and_placedAt", (q) =>
            q.eq("status", status as Infer<typeof ORDER_STATUS>)
          )
          .take(COUNT_CAP + 1)
      )
    )
    const rows = open.flat()
    const unpaid = await ctx.db
      .query("orders")
      .withIndex("by_status_and_placedAt", (q) =>
        q.eq("status", "awaiting_payment")
      )
      .take(COUNT_CAP + 1)
    return {
      unpaid: Math.min(unpaid.length, COUNT_CAP),
      open: Math.min(rows.length, COUNT_CAP),
      unseen: Math.min(rows.filter((order) => !order.seenAt).length, COUNT_CAP),
      capped: rows.length > COUNT_CAP,
    }
  },
})

/** Move an order to another status. */
export const setOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: ORDER_STATUS,
    expectedRevision: v.number(),
    courier: v.optional(COURIER),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyStatusChange(ctx, staff.value, args)
  },
})

/** The status move itself, given an already-resolved staff viewer. */
export async function applyStatusChange(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    orderId: Id<"orders">
    status: Infer<typeof ORDER_STATUS>
    expectedRevision: number
    courier?: { name: string; trackingNumber: string }
  }
) {
  if (viewer.role !== "staff" && viewer.role !== "owner") return forbidden

  const order = await ctx.db.get(args.orderId)
  if (!order) return missingRecord

  const conflict = checkRevision(order, args.expectedRevision)
  if (conflict) return conflict

  if (!STAFF_SETTABLE.has(args.status) && !OWNER_SETTABLE.has(args.status))
    return invalidInput("status")
  // Money back out is the owner's call until a provider proves it - and
  // a staff member asking is a role refusal, not a bad value.
  if (OWNER_SETTABLE.has(args.status) && viewer.role !== "owner")
    return forbidden

  const allowed = TRANSITIONS[order.status] ?? []
  if (!allowed.includes(args.status)) return invalidInput("transition")

  /*
   * A parcel move onto a collection order - or the other way round - is a
   * data error, not a state the queue can hold. Shipping is also the moment
   * the courier details become compulsory: "it is on its way" without a
   * tracking number is a promise nobody can answer a question about.
   */
  if (
    (args.status === "shipped" || args.status === "delivered") &&
    order.fulfilment !== "delivery"
  )
    return invalidInput("fulfilment")
  if (
    (args.status === "ready_for_collection" || args.status === "collected") &&
    order.fulfilment !== "collection"
  )
    return invalidInput("fulfilment")

  let courier = order.courier
  if (args.status === "shipped") {
    const name = args.courier?.name.trim()
    const trackingNumber = args.courier?.trackingNumber.trim()
    if (!name || !trackingNumber) return invalidInput("courier")
    courier = { name, trackingNumber }
  } else if (args.courier) {
    return invalidInput("courier")
  }

  const revision = revisionOf(order) + 1
  await ctx.db.patch(args.orderId, {
    status: args.status,
    courier,
    revision,
    updatedAt: Date.now(),
  })

  await ctx.db.insert("activities", {
    personId: order.personId,
    kind: "order_status",
    body: `Order ${order.reference}: ${order.status} → ${args.status}`,
    actorId: viewer.id,
    from: order.status,
    to: args.status,
  })

  return { ok: true as const, revision }
}

/**
 * Correct the courier on an order already on its way - a mistyped tracking
 * number is not a new status, and the audit trail should say it was fixed.
 */
export const setOrderCourier = mutation({
  args: {
    orderId: v.id("orders"),
    courier: COURIER,
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyCourierChange(ctx, staff.value, args)
  },
})

/** The courier correction itself, given an already-resolved staff viewer. */
export async function applyCourierChange(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    orderId: Id<"orders">
    courier: { name: string; trackingNumber: string }
    expectedRevision: number
  }
) {
  if (viewer.role !== "staff" && viewer.role !== "owner") return forbidden

  const order = await ctx.db.get(args.orderId)
  if (!order) return missingRecord

  const conflict = checkRevision(order, args.expectedRevision)
  if (conflict) return conflict

  if (order.status !== "shipped" && order.status !== "delivered")
    return invalidInput("status")

  const name = args.courier.name.trim()
  const trackingNumber = args.courier.trackingNumber.trim()
  if (!name || !trackingNumber) return invalidInput("courier")

  const revision = revisionOf(order) + 1
  await ctx.db.patch(args.orderId, {
    courier: { name, trackingNumber },
    revision,
    updatedAt: Date.now(),
  })
  await ctx.db.insert("activities", {
    personId: order.personId,
    kind: "courier_update",
    body: `Order ${order.reference}: courier set to ${name} · ${trackingNumber}`,
    actorId: viewer.id,
  })
  return { ok: true as const, revision }
}

/** The signed-in buyer's own orders, newest first. */
const MY_ORDER = v.object({
  id: v.id("orders"),
  reference: v.string(),
  status: ORDER_STATUS,
  fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
  lines: v.array(ORDER_LINE),
  deliveryPaise: v.number(),
  totalPaise: v.number(),
  placedAt: v.number(),
  courier: v.optional(COURIER),
  receiptNumber: v.optional(v.string()),
  paidAt: v.optional(v.number()),
})

export const myOrders = query({
  args: {},
  returns: v.union(v.null(), v.array(MY_ORDER)),
  handler: async (ctx) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return null
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_personId_and_placedAt", (q) =>
        q.eq("personId", viewer.value.id)
      )
      .order("desc")
      .take(50)
    return orders.map((order) => ({
      id: order._id,
      reference: order.reference,
      status: order.status,
      fulfilment: order.fulfilment,
      lines: order.lines,
      deliveryPaise: order.deliveryPaise,
      totalPaise: order.totalPaise,
      placedAt: order.placedAt,
      courier: order.courier,
      receiptNumber: order.receiptNumber,
      paidAt: order.payment?.paidAt,
    }))
  },
})

/**
 * One paid order as a receipt: what was bought, for how much, when and how,
 * and who sold it (legal name and GSTIN from the shop settings). Only the
 * buyer, or staff who can see orders, may read it.
 */
export const myReceipt = query({
  args: { reference: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      reference: v.string(),
      receiptNumber: v.string(),
      paidAt: v.number(),
      method: v.optional(v.string()),
      paymentId: v.optional(v.string()),
      buyer: v.object({ name: v.string(), phone: v.string() }),
      fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
      address: v.optional(ADDRESS),
      lines: v.array(ORDER_LINE),
      itemsPaise: v.number(),
      deliveryPaise: v.number(),
      totalPaise: v.number(),
      seller: v.object({
        legalName: v.string(),
        gstin: v.optional(v.string()),
        address: v.string(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return null
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!order?.receiptNumber || !order.payment?.paidAt) return null
    const staff = viewer.value.role === "owner" || viewer.value.role === "staff"
    if (order.personId !== viewer.value.id && !staff) return null
    const settings = await readSettings(ctx)
    return {
      reference: order.reference,
      receiptNumber: order.receiptNumber,
      paidAt: order.payment.paidAt,
      method: order.payment.method,
      paymentId: order.payment.razorpayPaymentId,
      buyer: order.contact,
      fulfilment: order.fulfilment,
      address: order.address,
      lines: order.lines,
      itemsPaise: order.itemsPaise,
      deliveryPaise: order.deliveryPaise,
      totalPaise: order.totalPaise,
      seller: {
        legalName: settings.legalName,
        gstin: settings.gstin,
        address: settings.pickupAddress,
      },
    }
  },
})

/** Mark an order as seen, so it stops counting as new. */
export const markOrderSeen = mutation({
  args: { orderId: v.id("orders") },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff

    const order = await ctx.db.get(args.orderId)
    if (!order) return missingRecord
    if (order.seenAt) return { ok: true as const }

    await ctx.db.patch(args.orderId, { seenAt: Date.now() })
    return { ok: true as const }
  },
})

/** How long an order may wait for payment before the daily job cancels it. */
export const UNPAID_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000

/**
 * Cancel orders left unpaid for three days, oldest first, a batch at a
 * time. They are marked `expiredAt`, so a payment that still arrives
 * revives the order (payments.settle) instead of being lost.
 */
export const expireUnpaid = internalMutation({
  args: { now: v.optional(v.number()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now()
    const stale = await ctx.db
      .query("orders")
      .withIndex("by_status_and_placedAt", (q) =>
        q
          .eq("status", "awaiting_payment")
          .lt("placedAt", now - UNPAID_EXPIRY_MS)
      )
      .take(100)
    for (const order of stale) {
      await ctx.db.patch(order._id, {
        status: "cancelled",
        expiredAt: now,
        updatedAt: now,
        revision: (order.revision ?? 0) + 1,
      })
      await ctx.db.insert("activities", {
        personId: order.personId,
        kind: "order_status",
        body: `Order ${order.reference} expired unpaid after three days.`,
        from: "awaiting_payment",
        to: "cancelled",
      })
    }
    return stale.length
  },
})
