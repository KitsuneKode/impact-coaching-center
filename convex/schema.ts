import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

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
    // The follow-up queue: a lead status, then most recently active first.
    .index("by_leadStatus", ["leadStatus", "lastEnquiryAt"]),

  /**
   * Status changes, notes and handoffs. Free text lives here and never on the
   * Person, so an export of persons cannot leak staff notes.
   */
  activities: defineTable({
    personId: v.id("persons"),
    kind: v.union(
      v.literal("status_change"),
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

  /**
   * One in-flight send and one acceptable code per phone.
   *
   * Better Auth's Convex adapter sets `transaction: false`, so deleting a
   * verification row and inserting the next one are separate mutations.
   * This row is the acceptance record: a send may proceed only while it
   * holds `generation`, and verify accepts only `codeHash`. See convex/otp.ts.
   */
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
})
