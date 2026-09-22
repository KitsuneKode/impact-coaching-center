import { v } from "convex/values"

import { toE164 } from "../lib/leads"
import { internalMutation } from "./_generated/server"

/**
 * Development fixtures: Persons at each role, without a handset each.
 *
 * Exercising staff and owner screens needs Persons who hold those roles, and
 * the only way to become one is for an owner to grant it - which needs an
 * owner to already exist. That circularity is what "bootstrap" means, and the
 * shared admin contract resolves it for real deployments by having whoever
 * holds dashboard access patch one row by hand: zero code, zero attack
 * surface, once in the life of the product.
 *
 * That procedure is unchanged. This is not a second way into production; it
 * is a way to populate a local database with the several Persons a developer
 * needs in order to see the screens at all, and it refuses to run anywhere
 * else.
 *
 * Three properties keep it honest:
 *
 * 1. `internalMutation`, so it is unreachable from any client. There is no
 *    HTTP route and no public API entry; it runs through the Convex CLI,
 *    which already requires deploy access - the same privilege as the
 *    dashboard patch it stands in for.
 * 2. It refuses a non-local deployment, mirroring `chooseTransport` in
 *    lib/otp-transport.ts, which refuses to log verification codes unless
 *    CONVEX_SITE_URL is local. The same guard, for the same reason: a
 *    development affordance must not be one environment variable away from
 *    being a production one.
 * 3. It never marks anyone verified by itself. Seeded Persons carry a role
 *    and nothing else; signing in as one still requires completing the real
 *    OTP flow against that number. `upsertPersonByPhone` sets role only on
 *    insert, so verifying later keeps the seeded role rather than demoting
 *    the account to student.
 */

/** The same locality test the logger OTP transport applies. */
function assertLocalDeployment() {
  const raw = process.env.CONVEX_SITE_URL
  const url = raw ? URL.parse(raw) : null
  if (
    !url ||
    url.protocol !== "http:" ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "devSeed refuses to run: this is not a local deployment. Roles on a hosted deployment are granted by an owner, or bootstrapped by hand in the dashboard."
    )
  }
}

/** Everything this module writes is stamped, so it can all be taken back. */
const SEED_SOURCE = "dev-seed"

const LEAD_STATUS = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("interested"),
  v.literal("enrolled"),
  v.literal("lost")
)

/**
 * Enquiries, so the staff screens can be looked at with something in them.
 *
 * An empty inbox is a real state and has its own panel, but it is not the
 * state anyone is designing for: spacing, column widths, status colours,
 * relative dates and the pagination boundary are all invisible until rows
 * exist. This produces those rows.
 *
 * Ages are given in days rather than timestamps, so a reseed always yields an
 * inbox that looks current instead of one frozen at whenever the fixture was
 * written. A queue whose newest enquiry is three months old reads as broken
 * even when it is only stale.
 *
 * Each enquiry also writes one `activity`, because a Person carrying a
 * `leadStatus` and no history is a shape the real product never produces -
 * `convex/leads.ts` records an activity on every enquiry - and screens built
 * against impossible data mislead.
 */
export const seedEnquiries = internalMutation({
  args: {
    enquiries: v.array(
      v.object({
        name: v.string(),
        phone: v.string(),
        leadStatus: LEAD_STATUS,
        /** Which Track they asked about. Free text, as on the Person. */
        interestTrack: v.optional(v.string()),
        /** How long ago they got in touch. Fractions are fine. */
        daysAgo: v.number(),
        /** Goes on the activity, not the Person - staff notes never sit on an exportable row. */
        note: v.optional(v.string()),
        verified: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    assertLocalDeployment()

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    let written = 0

    for (const enquiry of args.enquiries) {
      const phone = toE164(enquiry.phone)
      if (!phone)
        throw new Error(`Not a valid Indian mobile number: ${enquiry.phone}`)

      const at = now - enquiry.daysAgo * day
      const existing = await ctx.db
        .query("persons")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .unique()

      const fields = {
        name: enquiry.name,
        leadStatus: enquiry.leadStatus,
        interestTrack: enquiry.interestTrack,
        lastEnquiryAt: at,
        updatedAt: at,
        ...(enquiry.verified ? { verifiedAt: at } : {}),
      }

      const personId = existing
        ? (await ctx.db.patch(existing._id, {
            ...fields,
            revision: (existing.revision ?? 0) + 1,
          }),
          existing._id)
        : await ctx.db.insert("persons", {
            phone,
            role: "student",
            source: SEED_SOURCE,
            revision: 0,
            ...fields,
          })

      await ctx.db.insert("activities", {
        personId,
        kind: "enquiry",
        body: enquiry.note,
        track: enquiry.interestTrack,
      })
      written += 1
    }

    return { written }
  },
})

/**
 * Take back what this module wrote, without destroying what a person earned.
 *
 * Seeding has to be repeatable to be useful - a fixture you can only apply
 * once is one you stop trusting after the first edit. Only rows stamped with
 * this module's own source are touched, so a Person created by a real
 * enquiry or verification is never swept up by a developer resetting fixtures.
 *
 * **A verified seeded Person is kept.** The first version deleted every
 * seeded row, and it immediately ate the owner account: the row had been
 * seeded, but somebody had since completed a real OTP flow against it and
 * given it a name, and a reseed silently returned the admin area to
 * unreachable. Verification is the one thing in this system that cannot be
 * re-created by writing a row - it requires the handset - so it is the one
 * thing a fixture reset must not undo.
 *
 * Such a Person keeps their account, role, name and verification, and loses
 * only the fixture's own contribution: the lead fields and the seeded
 * activities. Everyone else is removed outright.
 *
 * Activities go first in both branches: an activity whose person no longer
 * exists is an orphan, and deleting the Person first is how you make one.
 */
export const clearSeed = internalMutation({
  args: {},
  handler: async (ctx) => {
    assertLocalDeployment()

    const seeded = await ctx.db
      .query("persons")
      .filter((q) => q.eq(q.field("source"), SEED_SOURCE))
      .collect()

    let removed = 0
    let kept = 0
    let activities = 0

    for (const person of seeded) {
      const owned = await ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .collect()
      for (const activity of owned) {
        await ctx.db.delete(activity._id)
        activities += 1
      }

      if (person.verifiedAt) {
        await ctx.db.patch(person._id, {
          leadStatus: undefined,
          interestTrack: undefined,
          lastEnquiryAt: undefined,
          updatedAt: Date.now(),
        })
        kept += 1
        continue
      }

      await ctx.db.delete(person._id)
      removed += 1
    }

    return { removed, keptVerified: kept, activities }
  },
})

export const seedPeople = internalMutation({
  args: {
    people: v.array(
      v.object({
        phone: v.string(),
        name: v.string(),
        role: v.union(
          v.literal("student"),
          v.literal("staff"),
          v.literal("owner")
        ),
        /**
         * Whether to stamp `verifiedAt`.
         *
         * Off by default. A verified stamp is a claim that somebody proved
         * they hold that handset, and inventing one is exactly the kind of
         * fiction the rest of this codebase refuses. Pass it only when the
         * screen under test needs a verified Person and the OTP flow is not
         * what is being tested - an unverified Person cannot be promoted
         * past student by `setRole`, which is deliberate.
         */
        verified: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    assertLocalDeployment()

    const results = []
    for (const person of args.people) {
      const phone = toE164(person.phone)
      if (!phone)
        throw new Error(`Not a valid Indian mobile number: ${person.phone}`)

      const existing = await ctx.db
        .query("persons")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .unique()

      const now = Date.now()
      const verifiedAt = person.verified ? now : undefined

      if (existing) {
        await ctx.db.patch(existing._id, {
          /*
           * An empty name in the fixture means "do not set one", not "erase
           * the one they have". Treating it as the latter wiped a name a
           * person had entered through the real name step, which is the same
           * class of mistake as deleting a verified account on reset.
           */
          name: person.name.trim() || existing.name,
          role: person.role,
          revision: (existing.revision ?? 0) + 1,
          updatedAt: now,
          ...(verifiedAt ? { verifiedAt } : {}),
        })
        results.push({ phone, role: person.role, created: false })
        continue
      }

      await ctx.db.insert("persons", {
        phone,
        name: person.name,
        role: person.role,
        source: SEED_SOURCE,
        updatedAt: now,
        revision: 0,
        ...(verifiedAt ? { verifiedAt } : {}),
      })
      results.push({ phone, role: person.role, created: true })
    }
    return results
  },
})
