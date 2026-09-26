import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

/** How a book cover is coloured until it has a photographed cover. */
export const BOOK_TONE = v.union(
  v.literal("primary"),
  v.literal("highlight"),
  v.literal("muted")
)

export const RESOURCE_KIND = v.union(
  v.literal("Notes"),
  v.literal("Question paper"),
  v.literal("Current affairs"),
  v.literal("Practice set")
)

/** Who a Person is, as a closed set. `student` is the default, not a grant. */
export const PERSON_ROLE = v.union(
  v.literal("student"),
  v.literal("staff"),
  v.literal("owner")
)

/**
 * Where a lead is in the follow-up queue, as a closed set - same reasoning
 * as ORDER_STATUS: an open string is a state nobody can exhaustively render.
 */
export const LEAD_STATUS = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("interested"),
  v.literal("enrolled"),
  v.literal("lost")
)

/** Where an order can be, as a closed set. */
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

/** One record per mobile number. */
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
    role: PERSON_ROLE,
    /**
     * Optimistic-concurrency counter, the convention the execution runbook
     * asks every editable record to share.
     */
    revision: v.optional(v.number()),
    /**
     * Absent until the Person shows intent. Reading a Resource creates a
     * Person but not a lead, or staff drown in casual readers and stop
     * trusting the queue.
     */
    leadStatus: v.optional(LEAD_STATUS),
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
    /**
     * The three onboarding answers (lib/questionnaire.ts). Absent until the
     * Person is asked; `skippedAt` and `answeredAt` keep "skipped" and "not yet
     * seen" distinguishable, which the resumption banner depends on.
     */
    questionnaire: v.optional(
      v.object({
        targetExam: v.optional(v.string()),
        attempt: v.optional(v.union(v.literal("first"), v.literal("repeat"))),
        preferredBatch: v.optional(v.string()),
        answeredAt: v.optional(v.number()),
        skippedAt: v.optional(v.number()),
      })
    ),
    /**
     * Set when the Person erased their account (convex/account.ts). The row
     * stays as a tombstone so orders and the audit trail still point at
     * something, but it holds no name, number or answers.
     */
    deletedAt: v.optional(v.number()),
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
    // Follow-ups due, for the admin home and the queue's "due" view.
    .index("by_nextFollowUpAt", ["nextFollowUpAt"])
    /* Staff and owners, for the admin surface and for last-owner protection. */
    .index("by_role", ["role"]),

  /**
   * Status changes, notes and handoffs. Free text lives here and never on the
   * Person, so an export of persons cannot leak staff notes.
   */
  activities: defineTable({
    /**
     * Who the row is about. Absent on catalogue rows: a price change is about
     * a book, not a person, and `actorId` already names who did it.
     */
    personId: v.optional(v.id("persons")),
    kind: v.union(
      v.literal("status_change"),
      v.literal("role_change"),
      v.literal("note"),
      v.literal("call"),
      v.literal("enquiry"),
      v.literal("whatsapp_handoff"),
      v.literal("account_deleted"),
      v.literal("export"),
      v.literal("courier_update"),
      v.literal("resource_open"),
      v.literal("catalog_save"),
      v.literal("catalog_publish")
    ),
    body: v.optional(v.string()),
    actorId: v.optional(v.id("persons")),
    track: v.optional(v.string()),
    timing: v.optional(v.string()),
    /** Which catalogue record a catalog_* row changed. */
    entity: v.optional(v.union(v.literal("book"), v.literal("resource"))),
    entityId: v.optional(v.union(v.id("books"), v.id("resources"))),
    /*
     * The structured half of an audit row. `body` is for reading; these are for
     * asking questions - "every role change this owner made" cannot be answered
     * from a sentence.
     */
    fromRole: v.optional(
      v.union(v.literal("student"), v.literal("staff"), v.literal("owner"))
    ),
    toRole: v.optional(
      v.union(v.literal("student"), v.literal("staff"), v.literal("owner"))
    ),
    fromStatus: v.optional(v.string()),
    toStatus: v.optional(v.string()),
  })
    .index("by_person", ["personId"])
    /* "Every catalogue change", "every publish" - questions with no Person. */
    .index("by_kind", ["kind"]),

  /** Fixed-window counters for public submission paths. */
  /** Book orders, and the fulfilment trail staff work from. */
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
    /**
     * Who is carrying the parcel, written when the order ships. A tracking
     * number is the only "where is my book" answer that survives a phone
     * call, so `shipped` refuses to apply without it (convex/orders.ts).
     */
    courier: v.optional(
      v.object({
        name: v.string(),
        trackingNumber: v.string(),
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
    /* The queue order. */
    .index("by_placedAt", ["placedAt"])
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

  /** One in-flight send and one acceptable code per phone. */
  otpSendLeases: defineTable({
    /** E.164. One row per number. */
    phone: v.string(),
    generation: v.number(),
    /** Epoch ms. Zero means nobody is mid-send. */
    inflightUntil: v.number(),
    /** HMAC of the live code. Absent once the code is used, expired or aborted. */
    codeHash: v.optional(v.string()),
    codeExpiresAt: v.optional(v.number()),
    attempts: v.number(),
  }).index("by_phone", ["phone"]),

  /**
   * Books ICT sells. Prices are integer paise and are read by the server when
   * an order is priced, never taken from the browser. `sample` marks the
   * placeholder titles seeded for demos so a page can say so.
   */
  books: defineTable({
    slug: v.string(),
    title: v.string(),
    subtitle: v.string(),
    exam: v.string(),
    edition: v.string(),
    pages: v.number(),
    pricePaise: v.number(),
    tone: BOOK_TONE,
    description: v.string(),
    contents: v.array(v.string()),
    cover: v.optional(v.id("_storage")),
    samplePages: v.array(v.id("_storage")),
    published: v.boolean(),
    sample: v.optional(v.boolean()),
    revision: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  /**
   * Free study material. Pages are images uploaded by staff (ADR-0003: the
   * reader serves page images, never the PDF).
   */
  resources: defineTable({
    slug: v.string(),
    title: v.string(),
    exam: v.string(),
    kind: RESOURCE_KIND,
    description: v.string(),
    pageImages: v.array(v.id("_storage")),
    published: v.boolean(),
    sample: v.optional(v.boolean()),
    revision: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  /** One row per Person per resource: the first open, for staff to see. */
  resourceOpens: defineTable({
    personId: v.id("persons"),
    resourceId: v.id("resources"),
    at: v.number(),
  }).index("by_person_resource", ["personId", "resourceId"]),
})
