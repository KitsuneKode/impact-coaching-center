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
  }).index("by_phone", ["phone"]),

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
    course: v.optional(v.string()),
    timing: v.optional(v.string()),
  }).index("by_person", ["personId"]),
})
