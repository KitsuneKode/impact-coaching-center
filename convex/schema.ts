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
    // The follow-up queue: a lead status, then most recently active first.
    .index("by_leadStatus", ["leadStatus", "lastEnquiryAt"])
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
})
