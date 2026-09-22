import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Where an order can be, as a closed set.
 *
 * Deliberately not a free string. A status that can hold any value is a
 * status nobody can exhaustively handle: the badge falls through to a
 * default, the filter misses a case, and a typo in one mutation creates a
 * state no screen renders. The permitted moves between these live in
 * `convex/orders.ts` - the union says what exists, the machine says what may
 * follow what.
 *
 * `awaiting_payment` rather than a boolean `paid`, because an order can also
 * be cancelled before payment, and two booleans would make that a state of
 * "not paid, not cancelled, but also not live" that means nothing.
 */
export const ORDER_STATUS = v.union(
  v.literal("awaiting_payment"),
  v.literal("paid"),
  v.literal("packed"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("ready_for_collection"),
  v.literal("collected"),
  v.literal("cancelled"),
  v.literal("refunded")
)

/**
 * One record per mobile number.
 *
 * See docs/adr/0001 and CONTEXT.md: an anonymous enquirer and a verified
 * account holder are the same Person, separated by verifiedAt rather than by
 * living in different tables. Two tables would force every staff screen to
 * answer "is this enquiry the same human as this account?", which is the
 * duplication this model exists to remove.
 */
export default defineSchema({
  persons: defineTable({
    /** E.164. The natural key, and the only phone shape stored. */
    phone: v.string(),
    name: v.string(),
    /** A real address, never the synthetic one Better Auth requires. */
    email: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    lastEnquiryAt: v.optional(v.number()),
    lastEnquiryKey: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("staff"), v.literal("owner")),
    /**
     * Optimistic-concurrency counter, the convention the execution runbook
     * asks every editable record to share.
     *
     * Optional because rows already exist without it; `revisionOf` treats
     * absent as 0 rather than backfilling, so no migration is needed and an
     * untouched Person still participates in the first edit correctly.
     */
    revision: v.optional(v.number()),
    /**
     * Absent until the Person shows intent. Reading a Resource creates a
     * Person but not a lead, or staff drown in casual readers and stop
     * trusting the queue.
     */
    leadStatus: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("interested"),
        v.literal("enrolled"),
        v.literal("lost")
      )
    ),
    assigneeId: v.optional(v.id("persons")),
    nextFollowUpAt: v.optional(v.number()),
    source: v.string(),
    campaignId: v.optional(v.string()),
    /** Which Track the Person asked about, from their latest enquiry. */
    interestTrack: v.optional(v.string()),
    consent: v.optional(
      v.object({
        granted: v.boolean(),
        at: v.number(),
        /** Which wording they agreed to, so consent stays auditable. */
        wordingVersion: v.string(),
      })
    ),
    /** When WhatsApp's free 24-hour reply window closes. */
    waWindowExpiresAt: v.optional(v.number()),
  })
    .index("by_phone", ["phone"])
    // Status, then time within that status. Not the inbox order: the status
    // string would put "lost" ahead of "interested".
    .index("by_leadStatus", ["leadStatus", "lastEnquiryAt"])
    /*
     * The inbox order: most recently active first, across every status.
     * Persons with no enquiry carry no lastEnquiryAt and sort to the end of
     * a descending scan; the query filters them out regardless.
     */
    .index("by_lastEnquiryAt", ["lastEnquiryAt"])
    /*
     * Staff and owners, for the admin surface and for last-owner protection.
     *
     * Indexed rather than filtered because the count is read inside the same
     * mutation that would change it: two concurrent demotions must not both
     * see two owners and both proceed, and a table scan under contention is
     * how that goes wrong.
     */
    .index("by_role", ["role"]),

  /**
   * Status changes, notes and handoffs. Free text lives here and never on the
   * Person, so an export of persons cannot leak staff notes.
   */
  activities: defineTable({
    personId: v.id("persons"),
    kind: v.union(
      v.literal("status_change"),
      v.literal("role_change"),
      v.literal("note"),
      v.literal("call"),
      v.literal("enquiry"),
      v.literal("whatsapp_handoff")
    ),
    body: v.optional(v.string()),
    actorId: v.optional(v.id("persons")),
    track: v.optional(v.string()),
    timing: v.optional(v.string()),
  }).index("by_person", ["personId"]),

  /**
   * Fixed-window counters for public submission paths.
   *
   * `key` is scoped by its own caller, e.g. `enquiry:ip:203.0.113.4` or
   * `enquiry:phone:+919876543210`, so one bucket cannot consume another's
   * allowance. Rows are rewritten in place when a window rolls over.
   */
  /**
   * Book orders, and the fulfilment trail staff work from.
   *
   * **Items are snapshots, not references.** A line carries the title,
   * edition and the price in paise as they were when the order was placed,
   * rather than pointing at a Book whose price the owner may edit next week.
   * ADR-0002 and the Razorpay integration both require an immutable order
   * snapshot persisted before payment opens: what the buyer agreed to pay is
   * a historical fact, and a receipt that silently re-prices itself is not a
   * receipt. It also means orders do not wait on a books table to exist.
   *
   * **Money is integer paise.** Never a float and never rupees: 0.1 + 0.2 is
   * not 0.3 in binary floating point, and a rounding error in a total is a
   * rounding error in somebody's bank account.
   *
   * Payment identifiers stay separate from our own order id, because one
   * order can have several attempts - a failed card, then a UPI that works -
   * and collapsing them loses the trail when a payment has to be reconciled.
   */
  orders: defineTable({
    personId: v.id("persons"),
    /** Short human-readable reference, spoken over the phone. */
    reference: v.string(),
    status: ORDER_STATUS,
    fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
    items: v.array(
      v.object({
        title: v.string(),
        edition: v.optional(v.string()),
        quantity: v.number(),
        /** Paise, at the moment of ordering. */
        unitPaise: v.number(),
      })
    ),
    itemsPaise: v.number(),
    deliveryPaise: v.number(),
    totalPaise: v.number(),
    /**
     * Absent for collection. Kept on the order rather than the Person because
     * an address is where *this parcel* went, and a Person who moves must not
     * silently rewrite where last month's order was delivered.
     */
    address: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        district: v.optional(v.string()),
        pin: v.string(),
      })
    ),
    /** Provider identifiers. Ours is `reference`; these are Razorpay's. */
    paymentOrderId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    placedAt: v.number(),
    updatedAt: v.optional(v.number()),
    /** Cleared when a staff member first opens it. Drives the new-order badge. */
    seenAt: v.optional(v.number()),
    revision: v.optional(v.number()),
  })
    /*
     * The fulfilment queue: status first, then oldest-first within it, because
     * the question staff ask is "what is waiting to be packed" and the answer
     * should start with whoever has waited longest.
     */
    .index("by_status", ["status", "placedAt"])
    .index("by_person", ["personId", "placedAt"])
    .index("by_reference", ["reference"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  })
    .index("by_key", ["key"])
    // Counters are disposable once their window has passed. Without a way to
    // find the stale ones this table only ever grows, one row per bucket ever
    // seen.
    .index("by_window", ["windowStart"]),
})
