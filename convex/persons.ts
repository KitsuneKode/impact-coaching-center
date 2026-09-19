import { v } from "convex/values"

import { type E164, toE164 } from "../lib/leads"
import type { Id } from "./_generated/dataModel"
import { internalMutation, type MutationCtx } from "./_generated/server"

/**
 * A Person's name is whatever we learned first.
 *
 * A later enquiry often carries a worse name - an initial, a nickname typed
 * in a hurry - and must not overwrite a good one. An empty stored name should
 * still be filled, which is the case this exists to get right.
 */
export function mergePersonName(stored: string, incoming: string): string {
  if (stored.trim().length > 0) return stored
  return incoming.trim()
}

/**
 * Find the Person with this mobile number, or create them.
 *
 * Phone is the natural key, so every entry point - an enquiry, a verification,
 * a book order - lands on the same record. Convex mutations are serializable,
 * so two concurrent callers cannot both insert: the second conflicts and
 * retries, then finds the row the first wrote. That holds because the read
 * and the write are in the same mutation; splitting the lookup into a query
 * and the insert into a separate mutation would silently break it.
 *
 * `.unique()` throws if duplicates already exist, and Convex has no unique
 * index to prevent them. A duplicate introduced by hand in the dashboard
 * would therefore make every later upsert for that number throw until it is
 * reconciled - loudly, which is the right failure for a natural key.
 */
export async function upsertPersonByPhone(
  ctx: MutationCtx,
  args: { phone: E164; name: string; source: string }
): Promise<Id<"persons">> {
  const existing = await ctx.db
    .query("persons")
    .withIndex("by_phone", (q) => q.eq("phone", args.phone))
    .unique()

  if (existing) {
    const name = mergePersonName(existing.name, args.name)
    if (name !== existing.name) await ctx.db.patch(existing._id, { name })
    return existing._id
  }

  return await ctx.db.insert("persons", {
    phone: args.phone,
    name: args.name.trim(),
    role: "student",
    source: args.source,
  })
}

/**
 * Attach a verified phone number to a Person.
 *
 * Called from the Phone Number plugin's verification callback, which is the
 * only place a number is known to belong to the person holding the handset.
 * Internal: nothing public may mark a Person verified.
 */
export const recordVerifiedPerson = internalMutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) {
      // Unreachable while phoneNumberValidator guards the endpoint, which is
      // exactly why this throws rather than storing an unnormalised key.
      throw new Error("Refusing to record a Person under an invalid number.")
    }

    const personId = await upsertPersonByPhone(ctx, {
      phone,
      name: args.name ?? "",
      source: "verification",
    })
    await ctx.db.patch(personId, { verifiedAt: Date.now() })
    return personId
  },
})
