import { paginationOptsValidator } from "convex/server"
import { type Infer, v } from "convex/values"

import {
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  paginated,
  requireStaff,
  revisionOf,
  type Viewer,
} from "./authz"
import type { Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { ORDER_STATUS } from "./schema"

/**
 * What may follow what.
 *
 * The status union says which states exist; this says which moves are legal.
 * Without it "cancel" is available on a delivered order, a refund can be
 * un-refunded, and a parcel can go back to being packed after it arrives -
 * each of which is a real button somebody eventually clicks at the end of a
 * long day.
 *
 * Terminal states have no exits. `delivered`, `collected`, `cancelled` and
 * `refunded` are endings: correcting one is a deliberate act with a paper
 * trail, not a dropdown. A staff member who needs to undo one has to say why
 * to somebody, which is the right amount of friction for a record that may
 * concern money.
 *
 * Delivery and collection diverge after `paid` and never rejoin. An order
 * being collected has no shipped state, and one being couriered has no
 * ready-for-collection state; offering both to both is how a queue ends up
 * with parcels marked "ready for collection" that are already in a van.
 */
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

/**
 * Statuses a staff member may set from the admin.
 *
 * `paid` is absent on purpose. Payment is established by a verified Razorpay
 * signature and nothing else - a person clicking "mark paid" in a browser is
 * not evidence that money moved, and allowing it would make the one fact the
 * whole order rests on settable by anyone with a staff login.
 *
 * `refunded` is absent for the mirror-image reason: it asserts money moved
 * *back*. Until a provider webhook can prove that, the closest honest thing
 * is the owner marking it themselves, so it is gated to the owner below
 * rather than offered to staff at all.
 */
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

/** Statuses that still need somebody to do something. */
const OPEN_STATUSES = new Set([
  "awaiting_payment",
  "paid",
  "packed",
  "shipped",
  "ready_for_collection",
])

/**
 * One page of orders for the fulfilment queue.
 *
 * Returns an empty page rather than an envelope with an `authorized` flag,
 * because `usePaginatedQuery` requires a plain PaginationResult. Access is
 * answered separately by `canSeeOrders`, so a screen can say "staff only"
 * without fetching a page of somebody's addresses to find out.
 *
 * Ordered newest first on `by_placedAt`. An earlier cut scanned `by_person`,
 * whose first key is the buyer: that reads the queue grouped by person, not
 * by time, and a new order could land mid-list. The index is on `placedAt`
 * rather than implicit creation order so a backdated or imported order still
 * sorts by when it was placed. `by_status` exists for status-scoped views;
 * the admin filters client-side across every status at once, which a
 * status-scoped cursor cannot answer.
 */
/** The queue-row projection. Never the whole order or Person document. */
const ORDER_ROW = v.object({
  id: v.id("orders"),
  reference: v.string(),
  status: ORDER_STATUS,
  fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
  items: v.array(
    v.object({
      title: v.string(),
      edition: v.optional(v.string()),
      quantity: v.number(),
      unitPaise: v.number(),
    })
  ),
  itemsPaise: v.number(),
  deliveryPaise: v.number(),
  totalPaise: v.number(),
  address: v.optional(
    v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      district: v.optional(v.string()),
      pin: v.string(),
    })
  ),
  placedAt: v.number(),
  seen: v.boolean(),
  revision: v.number(),
  buyerName: v.string(),
  buyerPhone: v.string(),
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

/**
 * One page of the queue for an already-resolved viewer.
 *
 * Re-checks the role on whatever it is given rather than trusting the caller
 * did, so the function is safe under a future caller that skipped
 * `requireStaff`. The session-age cutoff is NOT repeated here - it lives in
 * `requireStaff`, which is this page's only public door.
 */
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
      return {
        id: order._id,
        reference: order.reference,
        status: order.status,
        fulfilment: order.fulfilment,
        items: order.items,
        itemsPaise: order.itemsPaise,
        deliveryPaise: order.deliveryPaise,
        totalPaise: order.totalPaise,
        address: order.address,
        placedAt: order.placedAt,
        seen: Boolean(order.seenAt),
        revision: revisionOf(order),
        /*
         * The buyer's name and number travel with the order. Staff
         * fulfilling a parcel need to reach the person about it, and making
         * them open another screen to find a phone number is the kind of
         * friction that turns into "I'll do it later".
         */
        buyerName: person?.name ?? "",
        buyerPhone: person?.phone ?? "",
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

/**
 * How many orders still need somebody, and how many nobody has opened.
 *
 * This is the closest thing to a notification the product can honestly offer
 * today. A real alert needs a channel, and the only channel this system has
 * is WhatsApp, which is not implemented (KIT-46) - so rather than invent a
 * bell that does nothing, the count that staff actually act on is surfaced
 * where they already look.
 *
 * Counted with `.collect()` over the open statuses rather than the whole
 * table, which is correct while ICT's volume is what it is and is the wrong
 * shape at ten thousand orders. `@convex-dev/aggregate` is the answer then;
 * this is recorded rather than pretended about.
 */
export const orderCounts = query({
  args: {},
  returns: v.object({ open: v.number(), unseen: v.number() }),
  handler: async (ctx) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { open: 0, unseen: 0 }

    const open = await Promise.all(
      [...OPEN_STATUSES].map((status) =>
        ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", status as never))
          .collect()
      )
    )
    const rows = open.flat()
    return {
      open: rows.length,
      unseen: rows.filter((order) => !order.seenAt).length,
    }
  },
})

/**
 * Move an order to another status.
 *
 * Staff rather than owner: fulfilment is the daily work of whoever is at the
 * centre, and requiring the owner to mark every parcel shipped would mean the
 * queue is only worked when one person is free.
 *
 * Three refusals, each distinguishable by the caller so the screen can say
 * which happened: the record is gone, somebody else changed it since this
 * screen read it, or the move is not one this status allows.
 */
export const setOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: ORDER_STATUS,
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyStatusChange(ctx, staff.value, args)
  },
})

/**
 * The status move itself, given an already-resolved staff viewer.
 *
 * Re-checks the role on whatever it is given rather than trusting the caller
 * did, and returns the mutation's discriminated result - the public wrapper
 * is only the session check.
 */
export async function applyStatusChange(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    orderId: Id<"orders">
    status: Infer<typeof ORDER_STATUS>
    expectedRevision: number
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

  const revision = revisionOf(order) + 1
  await ctx.db.patch(args.orderId, {
    status: args.status,
    revision,
    updatedAt: Date.now(),
  })

  await ctx.db.insert("activities", {
    personId: order.personId,
    kind: "status_change",
    body: `Order ${order.reference}: ${order.status} → ${args.status}`,
    actorId: viewer.id,
    fromStatus: order.status,
    toStatus: args.status,
  })

  return { ok: true as const, revision }
}

/**
 * Mark an order as seen, so it stops counting as new.
 *
 * Separate from reading it: opening the queue should not silently clear every
 * badge, or the count means "orders nobody has scrolled past" rather than
 * "orders nobody has dealt with". The screen calls this when a staff member
 * opens one order.
 */
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
