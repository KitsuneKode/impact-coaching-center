import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

import { CALENDAR_EXAMS, DATE_KINDS } from "../lib/calendar"
import { GRANTS } from "../lib/grants"

/** Interface and edition languages. */
export const LOCALE = v.union(v.literal("en"), v.literal("as"))

/** English always; Assamese when written. */
export const LOCALISED = v.object({
  en: v.string(),
  as: v.optional(v.string()),
})

export const RESOURCE_KIND = v.union(
  v.literal("Notes"),
  v.literal("Question paper"),
  v.literal("Current affairs"),
  v.literal("Practice set")
)

/** Who a Person is. `student` is the default, not a grant. */
export const PERSON_ROLE = v.union(
  v.literal("student"),
  v.literal("staff"),
  v.literal("owner")
)

/** Extra areas the owner can open to a staff member. The owner has all. */
export const GRANT = v.union(...GRANTS.map((grant) => v.literal(grant)))

export const LEAD_STATUS = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("interested"),
  v.literal("enrolled"),
  v.literal("lost")
)

/** A PDF in R2: its object key, page count, size and the name it was uploaded as. */
export const CAMPAIGN_WORDS = v.object({
  tag: v.string(),
  headline: v.string(),
  body: v.string(),
  cta: v.string(),
})

export const PDF_DOCUMENT = v.object({
  key: v.string(),
  pages: v.number(),
  bytes: v.number(),
  name: v.string(),
})

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

/** How an enquiry reached ICT. */
export const ENQUIRY_CHANNEL = v.union(
  v.literal("website"),
  v.literal("walk_in"),
  v.literal("phone_call"),
  v.literal("whatsapp"),
  v.literal("referral"),
  v.literal("other")
)

/** Things that happen to one Person, shown on their lead sheet. */
export const ACTIVITY_KIND = v.union(
  v.literal("enquiry"),
  v.literal("status_change"),
  v.literal("follow_up_change"),
  v.literal("note"),
  v.literal("call"),
  v.literal("whatsapp_handoff"),
  v.literal("resource_open"),
  v.literal("order_placed"),
  v.literal("order_status"),
  v.literal("courier_update")
)

/** Privileged changes, for "who did what" rather than a lead's story. */
export const AUDIT_ACTION = v.union(
  v.literal("role_change"),
  v.literal("grant_change"),
  v.literal("account_deleted"),
  v.literal("export"),
  v.literal("save"),
  v.literal("publish"),
  v.literal("unpublish"),
  v.literal("course_sync"),
  v.literal("settings_change"),
  v.literal("payment")
)

export const AUDIT_ENTITY = v.union(
  v.literal("person"),
  v.literal("book"),
  v.literal("bundle"),
  v.literal("resource"),
  v.literal("post"),
  v.literal("examDate"),
  v.literal("course"),
  v.literal("campaign"),
  v.literal("settings"),
  v.literal("order")
)

/** One language edition of a book. */
export const EDITION = v.object({
  title: v.string(),
  subtitle: v.optional(v.string()),
  edition: v.string(),
  pages: v.number(),
  cover: v.optional(v.id("_storage")),
  samplePages: v.array(v.id("_storage")),
})

/** One language of a bundle: its own price and its own on/off switch. */
export const VARIANT = v.object({
  pricePaise: v.number(),
  /** Struck-through price, when there is one. */
  comparePaise: v.optional(v.number()),
  available: v.boolean(),
})

/** What was bought, frozen at checkout so later edits cannot rewrite it. */
export const ORDER_LINE = v.object({
  bundleId: v.id("bundles"),
  slug: v.string(),
  title: v.string(),
  language: LOCALE,
  books: v.array(v.string()),
  quantity: v.number(),
  unitPaise: v.number(),
})

export const ADDRESS = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  district: v.optional(v.string()),
  pin: v.string(),
})

export const CAMPAIGN_KIND = v.union(
  v.literal("bar"),
  v.literal("banner"),
  v.literal("modal"),
  v.literal("reel")
)

/** "Scheduled" and "ended" are derived from the dates, never stored. */
export const CAMPAIGN_STATUS = v.union(
  v.literal("draft"),
  v.literal("live"),
  v.literal("paused")
)

export default defineSchema({
  /** One row per mobile number: who they are and where they are as a lead. */
  persons: defineTable({
    /** E.164, the natural key. */
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    role: PERSON_ROLE,
    grants: v.optional(v.array(GRANT)),
    locale: v.optional(LOCALE),
    verifiedAt: v.optional(v.number()),
    /** When they ticked "I agree" to the Terms and Privacy Policy, and which
        version (lib/terms.ts) they agreed to. */
    termsAcceptedAt: v.optional(v.number()),
    termsVersion: v.optional(v.string()),
    /** First way we heard of them, e.g. "website" or "staff_walk_in". */
    source: v.string(),
    /** Absent until they show intent: a reader is not a lead. */
    leadStatus: v.optional(LEAD_STATUS),
    interestTrack: v.optional(v.string()),
    lastEnquiryAt: v.optional(v.number()),
    nextFollowUpAt: v.optional(v.number()),
    questionnaire: v.optional(
      v.object({
        targetExam: v.optional(v.string()),
        attempt: v.optional(v.union(v.literal("first"), v.literal("repeat"))),
        preferredBatch: v.optional(v.string()),
        answeredAt: v.optional(v.number()),
        skippedAt: v.optional(v.number()),
      })
    ),
    /** Erased accounts stay as tombstones with no personal data. */
    deletedAt: v.optional(v.number()),
    revision: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_phone", ["phone"])
    .index("by_leadStatus_and_lastEnquiryAt", ["leadStatus", "lastEnquiryAt"])
    .index("by_lastEnquiryAt", ["lastEnquiryAt"])
    .index("by_nextFollowUpAt", ["nextFollowUpAt"])
    .index("by_role", ["role"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["leadStatus", "interestTrack"],
    }),

  /** Every enquiry as it arrived, with where it came from. */
  enquiries: defineTable({
    personId: v.id("persons"),
    channel: ENQUIRY_CHANNEL,
    track: v.optional(v.string()),
    timing: v.optional(v.string()),
    /** Path the form was on, e.g. "/as/courses/lakhya-2027". */
    page: v.optional(v.string()),
    utm: v.optional(
      v.object({
        source: v.optional(v.string()),
        medium: v.optional(v.string()),
        campaign: v.optional(v.string()),
      })
    ),
    referrer: v.optional(v.string()),
    /** Staff member who entered a desk enquiry. */
    actorId: v.optional(v.id("persons")),
  }).index("by_person", ["personId"]),

  /** A Person's story for the lead sheet. Free text never sits on `persons`. */
  activities: defineTable({
    personId: v.id("persons"),
    kind: ACTIVITY_KIND,
    actorId: v.optional(v.id("persons")),
    body: v.optional(v.string()),
    track: v.optional(v.string()),
    timing: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  }).index("by_person", ["personId"]),

  auditLog: defineTable({
    actorId: v.optional(v.id("persons")),
    action: AUDIT_ACTION,
    entity: AUDIT_ENTITY,
    /** The changed record's id, as a string across tables. */
    entityId: v.optional(v.string()),
    summary: v.string(),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  })
    .index("by_action", ["action"])
    .index("by_entity_and_entityId", ["entity", "entityId"]),

  /** Width, height and a tiny placeholder for every uploaded image. */
  images: defineTable({
    storageId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    /** A few-hundred-byte data URL shown while the real image loads. */
    blurDataUrl: v.optional(v.string()),
  }).index("by_storageId", ["storageId"]),

  /** Courses mirrored from ClassPlus. ClassPlus owns everything in `source`. */
  courses: defineTable({
    classplusId: v.number(),
    slug: v.string(),
    source: v.object({
      name: v.string(),
      description: v.string(),
      pricePaise: v.number(),
      finalPricePaise: v.number(),
      free: v.boolean(),
      enrolled: v.number(),
      category: v.optional(v.string()),
      tags: v.array(v.string()),
      imageUrl: v.optional(v.string()),
      createdAt: v.optional(v.number()),
    }),
    /** Our copy of the ClassPlus cover, refreshed when `imageUrl` changes. */
    cover: v.optional(v.id("_storage")),
    /** Only what ClassPlus does not hold, set by ICT in the admin. */
    local: v.object({
      track: v.optional(v.string()),
      hidden: v.boolean(),
      sortOrder: v.optional(v.number()),
      batchStarts: v.optional(v.string()),
      timing: v.optional(v.string()),
      offlineFeePaise: v.optional(v.number()),
      /** Students at the centre ClassPlus does not count; added on the site. */
      offlineStudents: v.optional(v.number()),
    }),
    syncedAt: v.number(),
    /** Set when a sync no longer sees it; hidden from the site from then on. */
    missingSince: v.optional(v.number()),
    revision: v.number(),
  })
    .index("by_classplusId", ["classplusId"])
    .index("by_slug", ["slug"]),

  courseSyncs: defineTable({
    trigger: v.union(v.literal("schedule"), v.literal("owner")),
    status: v.union(v.literal("ok"), v.literal("failed")),
    seen: v.number(),
    added: v.number(),
    changed: v.number(),
    missing: v.number(),
    error: v.optional(v.string()),
  }),

  /** A title ICT prints, in up to two language editions. Sold only in bundles. */
  books: defineTable({
    slug: v.string(),
    exam: v.string(),
    editions: v.object({ en: v.optional(EDITION), as: v.optional(EDITION) }),
    description: v.optional(LOCALISED),
    contents: v.array(v.string()),
    sample: v.optional(v.boolean()),
    revision: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  /** What a visitor buys: a set of books, in an English or an Assamese set. */
  bundles: defineTable({
    slug: v.string(),
    exam: v.string(),
    title: LOCALISED,
    tagline: v.optional(LOCALISED),
    description: LOCALISED,
    /** In shelf order. Capped in lib/bundles.ts. */
    bookIds: v.array(v.id("books")),
    cover: v.optional(v.id("_storage")),
    variants: v.object({ en: VARIANT, as: VARIANT }),
    /** Paid copies across both languages, bumped when an order is paid. */
    soldCount: v.number(),
    /** Copies sold over the counter, entered by ICT; the site shows both. */
    soldOffline: v.optional(v.number()),
    sortOrder: v.number(),
    published: v.boolean(),
    sample: v.optional(v.boolean()),
    revision: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_and_sortOrder", ["published", "sortOrder"]),

  /** Free study material, read as page images (ADR-0003). */
  resources: defineTable({
    slug: v.string(),
    title: v.string(),
    exam: v.string(),
    kind: RESOURCE_KIND,
    language: v.optional(LOCALE),
    description: v.string(),
    pageImages: v.array(v.id("_storage")),
    /** The original PDF in R2 (convex/files.ts), read page by page in the browser. */
    pdf: v.optional(PDF_DOCUMENT),
    published: v.boolean(),
    sample: v.optional(v.boolean()),
    revision: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  /** First open per Person per resource, for staff to see. */
  resourceOpens: defineTable({
    personId: v.id("persons"),
    resourceId: v.id("resources"),
    at: v.number(),
  }).index("by_personId_and_resourceId", ["personId", "resourceId"]),

  posts: defineTable({
    slug: v.string(),
    language: v.optional(LOCALE),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    cover: v.optional(v.id("_storage")),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    authorId: v.optional(v.id("persons")),
    sample: v.optional(v.boolean()),
    revision: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_and_publishedAt", ["published", "publishedAt"]),

  /** Exam dates from official notices. Days are IST `yyyy-mm-dd`. */
  examDates: defineTable({
    exam: v.union(...CALENDAR_EXAMS.map((exam) => v.literal(exam))),
    kind: v.union(...DATE_KINDS.map((kind) => v.literal(kind))),
    title: v.string(),
    titleAs: v.optional(v.string()),
    starts: v.string(),
    ends: v.optional(v.string()),
    tentative: v.boolean(),
    source: v.string(),
    published: v.boolean(),
    revision: v.number(),
    updatedAt: v.number(),
  }).index("by_published_and_starts", ["published", "starts"]),

  /** Promotions the owner (or a granted staff member) runs on the site. */
  campaigns: defineTable({
    name: v.string(),
    kind: CAMPAIGN_KIND,
    status: CAMPAIGN_STATUS,
    tag: v.string(),
    headline: v.string(),
    body: v.string(),
    cta: v.string(),
    /** Assamese wording, shown on /as pages when set. */
    as: v.optional(CAMPAIGN_WORDS),
    href: v.string(),
    image: v.optional(v.id("_storage")),
    coupon: v.string(),
    /** YouTube ids for a reel. Capped in lib/campaigns.ts. */
    reelIds: v.array(v.string()),
    /** Paths it shows on; empty means everywhere. */
    routes: v.array(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    delaySeconds: v.number(),
    /** Days it stays away after a visitor closes it. */
    restDays: v.number(),
    priority: v.number(),
    revision: v.number(),
    updatedAt: v.number(),
  }).index("by_status_and_priority", ["status", "priority"]),

  /** Per promotion, per India day: how often it was seen, clicked, closed. */
  campaignStats: defineTable({
    campaignId: v.id("campaigns"),
    /** India date, e.g. "2026-10-14". */
    day: v.string(),
    views: v.number(),
    clicks: v.number(),
    closes: v.number(),
  }).index("by_campaignId_and_day", ["campaignId", "day"]),

  /** The signed-in shopper's cart; guests keep theirs in the browser. */
  carts: defineTable({
    personId: v.id("persons"),
    lines: v.array(
      v.object({
        slug: v.string(),
        language: LOCALE,
        quantity: v.number(),
        /** Write time, so a merge knows which copy is newer. */
        at: v.number(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_person", ["personId"]),

  orders: defineTable({
    personId: v.id("persons"),
    /** Short reference read out over the phone, e.g. ICT-7K3F9. */
    reference: v.string(),
    status: ORDER_STATUS,
    fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
    contact: v.object({ name: v.string(), phone: v.string() }),
    lines: v.array(ORDER_LINE),
    itemsPaise: v.number(),
    deliveryPaise: v.number(),
    totalPaise: v.number(),
    /** Where this parcel went; a Person who moves must not rewrite it. */
    address: v.optional(ADDRESS),
    courier: v.optional(
      v.object({ name: v.string(), trackingNumber: v.string() })
    ),
    payment: v.optional(
      v.object({
        razorpayOrderId: v.string(),
        razorpayPaymentId: v.optional(v.string()),
        method: v.optional(v.string()),
        paidAt: v.optional(v.number()),
      })
    ),
    /** Sequential per financial year, e.g. ICT/26-27/0001. Set when paid. */
    receiptNumber: v.optional(v.string()),
    placedAt: v.number(),
    updatedAt: v.optional(v.number()),
    /** First time a staff member opened it; drives the new-order badge. */
    seenAt: v.optional(v.number()),
    /** Set when the daily job cancelled it for going unpaid. */
    expiredAt: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
    revision: v.optional(v.number()),
  })
    .index("by_status_and_placedAt", ["status", "placedAt"])
    .index("by_personId_and_placedAt", ["personId", "placedAt"])
    .index("by_placedAt", ["placedAt"])
    .index("by_reference", ["reference"])
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_razorpayOrderId", ["payment.razorpayOrderId"]),

  /** Razorpay webhook events already handled, so a retry is a no-op. */
  paymentEvents: defineTable({
    eventId: v.string(),
    type: v.string(),
    orderId: v.optional(v.id("orders")),
  }).index("by_eventId", ["eventId"]),

  /**
   * Taps on WhatsApp and phone links, as daily totals per page and source.
   * No person, no number: just which pages and campaigns bring contact.
   */
  contactTaps: defineTable({
    /** India date, e.g. "2026-10-13". */
    day: v.string(),
    kind: v.union(v.literal("whatsapp"), v.literal("call")),
    page: v.string(),
    source: v.string(),
    count: v.number(),
  }).index("by_day_and_kind_and_page_and_source", [
    "day",
    "kind",
    "page",
    "source",
  ]),

  /** Named counters, e.g. receipt numbers per financial year. */
  counters: defineTable({
    name: v.string(),
    value: v.number(),
  }).index("by_name", ["name"]),

  /** One row of owner-editable shop and business details. */
  siteSettings: defineTable({
    shippingPaise: v.number(),
    pickupAddress: v.string(),
    legalName: v.string(),
    gstin: v.optional(v.string()),
    receiptPrefix: v.string(),
    revision: v.number(),
    updatedAt: v.number(),
  }),

  /** Fixed-window counters for public submission paths. */
  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_windowStart", ["windowStart"]),

  /** Numbers WhatsApp could not deliver a code to (not on WhatsApp), from
      Meta's status webhook; sends to them are refused for a while. */
  otpUndeliverable: defineTable({
    phone: v.string(),
    /** Meta's error code, e.g. 131026 "message undeliverable". */
    code: v.number(),
    at: v.number(),
  }).index("by_phone", ["phone"]),

  /** One in-flight send and one acceptable code per phone. */
  otpSendLeases: defineTable({
    phone: v.string(),
    generation: v.number(),
    /** Epoch ms. Zero means nobody is mid-send. */
    inflightUntil: v.number(),
    /** HMAC of the live code; absent once used, expired or aborted. */
    codeHash: v.optional(v.string()),
    codeExpiresAt: v.optional(v.number()),
    attempts: v.number(),
  }).index("by_phone", ["phone"]),
})
