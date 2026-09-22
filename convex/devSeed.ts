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
          name: person.name,
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
        source: "dev-seed",
        updatedAt: now,
        revision: 0,
        ...(verifiedAt ? { verifiedAt } : {}),
      })
      results.push({ phone, role: person.role, created: true })
    }
    return results
  },
})
