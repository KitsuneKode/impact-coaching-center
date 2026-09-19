import type { Id } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"

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
 * retries, then finds the row the first wrote.
 */
export async function upsertPersonByPhone(
  ctx: MutationCtx,
  args: { phone: string; name: string; source: string }
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
