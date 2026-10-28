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
import type { Doc, Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { courierSite } from "../lib/couriers"
import { publicOrigin } from "../lib/order-messages"
import {
  isOrderReference,
  newOrderReference,
  normaliseReference,
} from "../lib/order-reference"
import {
  CLOSED_STATUSES,
  ORDER_TABS,
  ROUTE_OF,
  TRANSITIONS,
  type OrderTab,
} from "../lib/order-status"
import { queueMessage } from "./messages"
import { countSales } from "./payments"
import {
  ADDRESS,
  COURIER,
  ORDER_LINE,
  ORDER_STATUS,
  ORDER_STEP,
} from "./schema"
import { readSettings } from "./settings"

/**
 * Orders after payment (ADR-0005): the staff queue, status moves with their
 * history, the buyer's view and the receipt. Orders are never deleted; they
 * are financial records.
 */

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

/** 24 URL-safe characters (~143 bits): the receipt link's only secret. */
export function newReceiptToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
}

/** Longer than any courier's name or consignment number. */
const COURIER_NAME_MAX = 60
const TRACKING_NUMBER_MAX = 40

/** Courier details trimmed and bounded, or null when they will not do. */
function cleanCourier(courier?: { name: string; trackingNumber: string }) {
  const name = courier?.name.trim()
  const trackingNumber = courier?.trackingNumber.trim()
  if (!name || !trackingNumber) return null
  if (name.length > COURIER_NAME_MAX) return null
  if (trackingNumber.length > TRACKING_NUMBER_MAX) return null
  return { name, trackingNumber }
}

/* ------------------------------------------------------------ staff reads */

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
  receiptNumber: v.string(),
  placedAt: v.number(),
  seen: v.boolean(),
  revision: v.number(),
  courier: v.optional(COURIER),
  buyerName: v.string(),
  buyerPhone: v.string(),
  /** The number the courier rings, when not the buyer's own. */
  courierPhone: v.optional(v.string()),
  /** For collection: which centre (lib/brand.ts `centres`). */
  pickupCentre: v.optional(v.string()),
  /** The buyer deleted their account: no name or number to show or dial. */
  buyerDeleted: v.boolean(),
  /** Paid, then cancelled: the owner owes a refund in Razorpay. */
  refundDue: v.boolean(),
})

async function toRow(ctx: QueryCtx, order: Doc<"orders">) {
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
       account was erased, in which case there is nobody to show or dial. */
    buyerName: deleted ? "" : order.contact.name,
    buyerPhone: deleted ? "" : order.contact.phone,
    courierPhone: deleted ? undefined : order.contact.courierPhone,
    pickupCentre: order.pickupCentre,
    buyerDeleted: deleted,
    refundDue: order.refundDueAt !== undefined,
  }
}

const ORDER_TAB = v.union(...ORDER_TABS.map((tab) => v.literal(tab)))

/** The query behind one queue tab: every filter runs here, on an index. */
function tabQuery(ctx: QueryCtx, tab: OrderTab) {
  switch (tab) {
    case "to_send":
      return ctx.db
        .query("orders")
        .withIndex("by_status_and_placedAt", (q) => q.eq("status", "paid"))
        .order("asc")
    case "on_the_way":
      return ctx.db
        .query("orders")
        .withIndex("by_status_and_placedAt", (q) => q.eq("status", "shipped"))
        .order("asc")
    case "to_collect":
      return ctx.db
        .query("orders")
        .withIndex("by_status_and_placedAt", (q) =>
          q.eq("status", "ready_for_collection")
        )
        .order("asc")
    case "refund_due":
      return ctx.db
        .query("orders")
        .withIndex("by_refundDueAt", (q) => q.gt("refundDueAt", 0))
        .order("asc")
    case "done":
      return ctx.db
        .query("orders")
        .withIndex("by_closed_and_placedAt", (q) => q.eq("closed", true))
        .order("desc")
  }
}

/** One page of one queue tab. Open work is oldest first; done, newest. */
export const adminOrdersPage = query({
  args: { tab: ORDER_TAB, paginationOpts: paginationOptsValidator },
  returns: paginated(ORDER_ROW),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { page: [], isDone: true, continueCursor: "" }
    return readOrdersPage(ctx, staff.value, args.tab, args.paginationOpts)
  },
})

/** One page of one tab for an already-resolved viewer. */
export async function readOrdersPage(
  ctx: QueryCtx,
  viewer: Viewer,
  tab: OrderTab,
  paginationOpts: { numItems: number; cursor: string | null }
) {
  if (viewer.role !== "staff" && viewer.role !== "owner")
    return { page: [], isDone: true, continueCursor: "" }
  const result = await tabQuery(ctx, tab).paginate(paginationOpts)
  const page = await Promise.all(result.page.map((o) => toRow(ctx, o)))
  return { ...result, page }
}

/** Whether this caller may see the fulfilment queue at all. */
export const canSeeOrders = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireStaff(ctx)).ok,
})

/** How many orders wait in each open tab, and how many nobody has opened. */
export const orderCounts = query({
  args: {},
  returns: v.object({
    to_send: v.number(),
    on_the_way: v.number(),
    to_collect: v.number(),
    refund_due: v.number(),
    open: v.number(),
    unseen: v.number(),
    capped: v.boolean(),
  }),
  handler: async (ctx) => {
    const empty = {
      to_send: 0,
      on_the_way: 0,
      to_collect: 0,
      refund_due: 0,
      open: 0,
      unseen: 0,
      capped: false,
    }
    const staff = await requireStaff(ctx)
    if (!staff.ok) return empty
    /* Bounded reads: one capped page per tab, never a full collect of a
       table that only ever grows. */
    const tabs = ["to_send", "on_the_way", "to_collect", "refund_due"] as const
    const [toSend, onTheWay, toCollect, refundDue] = await Promise.all(
      tabs.map((tab) => tabQuery(ctx, tab).take(COUNT_CAP + 1))
    )
    const open = [...toSend, ...toCollect]
    const n = (rows: unknown[]) => Math.min(rows.length, COUNT_CAP)
    return {
      to_send: n(toSend),
      on_the_way: n(onTheWay),
      to_collect: n(toCollect),
      refund_due: n(refundDue),
      // Waiting on ICT, not on a courier.
      open: n(open),
      unseen: n(open.filter((order) => !order.seenAt)),
      capped: [toSend, onTheWay, toCollect, refundDue].some(
        (rows) => rows.length > COUNT_CAP
      ),
    }
  },
})

const MESSAGE_STATE = v.object({
  label: v.string(),
  status: v.union(v.literal("queued"), v.literal("sent"), v.literal("failed")),
})

/** One order for its own admin page: the row, its history and messages. */
export const adminOrder = query({
  args: { reference: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      row: ORDER_ROW,
      history: v.array(
        v.object({
          status: ORDER_STATUS,
          at: v.number(),
          by: v.optional(v.string()),
        })
      ),
      messages: v.array(MESSAGE_STATE),
      paymentId: v.string(),
      method: v.string(),
      receiptToken: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return null
    const reference = normaliseReference(args.reference)
    if (!isOrderReference(reference)) return null
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .first()
    if (!order) return null
    const history = await Promise.all(
      order.history.map(async (step) => ({
        status: step.status,
        at: step.at,
        by: step.by ? (await ctx.db.get(step.by))?.name : undefined,
      }))
    )
    const labels: [string, string][] = [
      [`${reference}:paid:buyer`, "Payment receipt to the buyer"],
      [`${reference}:paid:desk`, "New-order alert to the desk"],
      [`${reference}:shipped:buyer`, "Shipped, to the buyer"],
      [`${reference}:ready:buyer`, "Ready to collect, to the buyer"],
    ]
    const messages = (
      await Promise.all(
        labels.map(async ([key, label]) => {
          const message = await ctx.db
            .query("messages")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first()
          return message ? [{ label, status: message.status }] : []
        })
      )
    ).flat()
    return {
      row: await toRow(ctx, order),
      history,
      messages,
      paymentId: order.payment.razorpayPaymentId,
      method: order.payment.method,
      receiptToken: order.receiptToken,
    }
  },
})

/** Addresses for printing parcel labels; delivery orders only. */
export const labelsFor = query({
  args: { references: v.array(v.string()) },
  returns: v.array(
    v.object({
      reference: v.string(),
      name: v.string(),
      phone: v.string(),
      address: ADDRESS,
      sets: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return []
    const orders = await Promise.all(
      args.references.slice(0, 60).map((reference) =>
        ctx.db
          .query("orders")
          .withIndex("by_reference", (q) => q.eq("reference", reference))
          .first()
      )
    )
    return orders.flatMap((order) =>
      order?.address && order.contact.phone
        ? [
            {
              reference: order.reference,
              name: order.contact.name,
              // The courier rings whoever the buyer named for the door.
              phone: order.contact.courierPhone ?? order.contact.phone,
              address: order.address,
              sets: order.lines.reduce((n, line) => n + line.quantity, 0),
            },
          ]
        : []
    )
  },
})

/* ------------------------------------------------------------ status moves */

const MOVE = {
  orderId: v.id("orders"),
  status: ORDER_STATUS,
  expectedRevision: v.number(),
  courier: v.optional(COURIER),
}

/** Move an order to another status. */
export const setOrderStatus = mutation({
  args: MOVE,
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyStatusChange(ctx, staff.value, args)
  },
})

/** A batch from the queue, at most a day's packing; each order on its own. */
const BULK_MAX = 50

export const setOrderStatuses = mutation({
  args: { moves: v.array(v.object(MOVE)) },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      results: v.array(
        v.object({
          orderId: v.id("orders"),
          ok: v.boolean(),
          reason: v.optional(v.string()),
        })
      ),
    }),
    v.object({ ok: v.literal(false), reason: v.string() })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { ok: false as const, reason: staff.reason }
    if (args.moves.length === 0 || args.moves.length > BULK_MAX)
      return { ok: false as const, reason: "invalid-input" }
    return {
      ok: true as const,
      results: await applyStatusChanges(ctx, staff.value, args.moves),
    }
  },
})

/** A batch of moves, each refused or applied on its own. */
export async function applyStatusChanges(
  ctx: MutationCtx,
  viewer: Viewer,
  moves: Parameters<typeof applyStatusChange>[2][]
) {
  const results = []
  // One after another: two moves of one order must see each other.
  for (const move of moves) {
    const result = await applyStatusChange(ctx, viewer, move)
    results.push(
      result.ok
        ? { orderId: move.orderId, ok: true }
        : {
            orderId: move.orderId,
            ok: false,
            reason:
              result.reason === "invalid-input"
                ? (result.field ?? result.reason)
                : result.reason,
          }
    )
  }
  return results
}

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

  if (!TRANSITIONS[order.status].includes(args.status))
    return invalidInput("transition")
  /* Money ICT holds changes the rules: cancelling a paid order owes a
     refund, and saying the refund happened, are the owner's calls. A
     staff member asking is a role refusal, not a bad value. */
  if (
    (args.status === "cancelled" || args.status === "refunded") &&
    viewer.role !== "owner"
  )
    return forbidden
  if (args.status === "refunded" && order.refundDueAt === undefined)
    return invalidInput("transition")

  // A parcel move on a collection order, or the reverse, is a data error.
  const route = ROUTE_OF[args.status]
  if (route && route !== order.fulfilment) return invalidInput("fulfilment")

  /* Shipping is when the courier details become compulsory: "it is on its
     way" without a tracking number is a promise nobody can answer for. */
  let courier = order.courier
  if (args.status === "shipped") {
    const cleaned = cleanCourier(args.courier)
    if (!cleaned) return invalidInput("courier")
    courier = cleaned
  } else if (args.courier) {
    return invalidInput("courier")
  }

  const now = Date.now()
  const revision = revisionOf(order) + 1
  await ctx.db.patch(args.orderId, {
    status: args.status,
    closed: CLOSED_STATUSES.has(args.status),
    history: [
      ...order.history,
      { status: args.status, at: now, by: viewer.id },
    ],
    courier,
    revision,
    updatedAt: now,
    seenAt: order.seenAt ?? now,
    ...(args.status === "cancelled" ? { refundDueAt: now } : {}),
    ...(args.status === "refunded" ? { refundDueAt: undefined } : {}),
  })
  // Undone once, when cancelled; refunding a cancelled order changes nothing.
  if (args.status === "cancelled") await countSales(ctx, order, -1)

  await ctx.db.insert("activities", {
    personId: order.personId,
    kind: "order_status",
    body: `Order ${order.reference}: ${order.status} → ${args.status}`,
    actorId: viewer.id,
    from: order.status,
    to: args.status,
  })
  await tellBuyer(ctx, { ...order, courier }, args.status)

  return { ok: true as const, revision }
}

/** The buyer hears about the two moves they wait for. */
async function tellBuyer(
  ctx: MutationCtx,
  order: Doc<"orders">,
  status: Infer<typeof ORDER_STATUS>
) {
  if (status !== "shipped" && status !== "ready_for_collection") return
  const person = await ctx.db.get(order.personId)
  if (!person || person.deletedAt) return
  const language = person.locale ?? "en"
  if (status === "shipped" && order.courier) {
    const origin = publicOrigin(process.env.SITE_URL)
    await queueMessage(ctx, {
      key: `${order.reference}:shipped:buyer`,
      to: order.contact.phone,
      template: "order_shipped",
      language,
      params: [
        order.reference,
        order.courier.name,
        order.courier.trackingNumber,
        courierSite(order.courier.name) ??
          (origin ? `${origin}/account` : "your ICT account"),
      ],
    })
  }
  if (status === "ready_for_collection") {
    const settings = await readSettings(ctx)
    await queueMessage(ctx, {
      key: `${order.reference}:ready:buyer`,
      to: order.contact.phone,
      template: "order_ready",
      language,
      params: [order.reference, settings.pickupAddress],
    })
  }
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

  const courier = cleanCourier(args.courier)
  if (!courier) return invalidInput("courier")
  const { name, trackingNumber } = courier

  const revision = revisionOf(order) + 1
  await ctx.db.patch(args.orderId, {
    courier,
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

/* ------------------------------------------------------------ the buyer */

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
  receiptNumber: v.string(),
  history: v.array(ORDER_STEP.omit("by")),
})

/** The signed-in buyer's own orders, newest first. */
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
      // Who moved it is staff business; when is the buyer's.
      history: order.history.map(({ status, at }) => ({ status, at })),
    }))
  },
})

const RECEIPT = v.object({
  reference: v.string(),
  receiptNumber: v.string(),
  paidAt: v.number(),
  method: v.string(),
  paymentId: v.string(),
  buyer: v.object({ name: v.string(), phone: v.string() }),
  fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
  address: v.optional(ADDRESS),
  lines: v.array(ORDER_LINE),
  itemsPaise: v.number(),
  deliveryPaise: v.number(),
  totalPaise: v.number(),
  status: ORDER_STATUS,
  seller: v.object({
    legalName: v.string(),
    gstin: v.optional(v.string()),
    address: v.string(),
  }),
})

function receiptOf(order: Doc<"orders">) {
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
    status: order.status,
    seller: order.seller,
  }
}

/**
 * One order as a receipt. Only the buyer, or staff who can see orders, may
 * read it signed in; the link in WhatsApp uses `receiptByToken`.
 */
export const myReceipt = query({
  args: { reference: v.string() },
  returns: v.union(v.null(), RECEIPT),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return null
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!order) return null
    /* Someone else's receipt carries their number and address: staff may
       read it only on a session young enough for staff work. */
    if (order.personId !== viewer.value.id && !(await requireStaff(ctx)).ok)
      return null
    return receiptOf(order)
  },
})

/** "+91 98••• ••210": enough to recognise, not enough to call. */
function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10)
  if (digits.length < 10) return ""
  return `+91 ${digits.slice(0, 2)}••• ••${digits.slice(7)}`
}

/**
 * The receipt behind a WhatsApp link, without signing in. The token is the
 * secret; even so the phone is masked and the street left off, so a
 * forwarded link shows what was bought, not where somebody lives.
 */
export const receiptByToken = query({
  args: { token: v.string() },
  returns: v.union(v.null(), RECEIPT),
  handler: async (ctx, args) => {
    if (!/^[\w-]{24}$/.test(args.token)) return null
    const order = await ctx.db
      .query("orders")
      .withIndex("by_receiptToken", (q) => q.eq("receiptToken", args.token))
      .first()
    if (!order) return null
    const receipt = receiptOf(order)
    return {
      ...receipt,
      buyer: {
        name: order.contact.name,
        phone: maskPhone(order.contact.phone),
      },
      address: order.address
        ? {
            line1: "",
            city: order.address.city,
            district: order.address.district,
            pin: order.address.pin,
          }
        : undefined,
    }
  },
})
