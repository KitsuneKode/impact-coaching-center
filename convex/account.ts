import { v } from "convex/values"

import { authComponent } from "./auth"
import { recordAudit } from "./audit"
import {
  forbidden,
  invalidInput,
  mutationResult,
  signedInWithin,
  viewerPerson,
  type Viewer,
} from "./authz"
import { components } from "./_generated/api"
import type { Doc } from "./_generated/dataModel"
import { mutation, type MutationCtx } from "./_generated/server"

/**
 * Orders that are still moving. Erasing the Person would leave staff with a
 * paid parcel and nobody to deliver it to, so deletion waits for these.
 */
const LIVE_ORDER: ReadonlySet<Doc<"orders">["status"]> = new Set([
  "paid",
  "packed",
  "shipped",
  "ready_for_collection",
])

/** Sent by the deletion dialog, and checked here, so a stray call cannot erase an account. */
const CONFIRMATION = "DELETE"

/** Deleting needs a WhatsApp code entered just before: a session this young. */
export const DELETE_CODE_MAX_AGE_MS = 10 * 60_000

/**
 * Erase the signed-in Person's account, as the privacy policy promises.
 * Clearing their activity text is the audit trail's one sanctioned edit
 * (AGENTS.md); who did what, and when, is kept.
 */
export async function eraseAccount(
  ctx: MutationCtx,
  viewer: Viewer,
  confirmation: string
) {
  if (viewer.role !== "student") return forbidden
  if (confirmation.trim() !== CONFIRMATION) return invalidInput("confirmation")

  const person = await ctx.db.get(viewer.id)
  if (!person) return invalidInput("person")

  const orders = await ctx.db
    .query("orders")
    .withIndex("by_personId_and_placedAt", (q) => q.eq("personId", person._id))
    .collect()
  if (orders.some((order) => LIVE_ORDER.has(order.status)))
    return invalidInput("orders-in-progress")

  const now = Date.now()

  // Orders stay for the books' sake; who and where they went do not. One
  // still awaiting payment is cancelled (not expired), so a payment that
  // arrives later is flagged for a refund instead of reviving it.
  for (const order of orders)
    await ctx.db.patch(order._id, {
      address: undefined,
      contact: { name: "", phone: "" },
      updatedAt: now,
      ...(order.status === "awaiting_payment"
        ? { status: "cancelled" as const, revision: (order.revision ?? 0) + 1 }
        : {}),
    })

  const cart = await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", person._id))
    .first()
  if (cart) await ctx.db.delete(cart._id)
  const opens = await ctx.db
    .query("resourceOpens")
    .withIndex("by_personId_and_resourceId", (q) =>
      q.eq("personId", person._id)
    )
    .collect()
  for (const open of opens) await ctx.db.delete(open._id)
  const undeliverable = await ctx.db
    .query("otpUndeliverable")
    .withIndex("by_phone", (q) => q.eq("phone", person.phone))
    .first()
  if (undeliverable) await ctx.db.delete(undeliverable._id)

  const activities = await ctx.db
    .query("activities")
    .withIndex("by_person", (q) => q.eq("personId", person._id))
    .collect()
  for (const row of activities)
    if (row.body || row.track || row.timing)
      await ctx.db.patch(row._id, {
        body: undefined,
        track: undefined,
        timing: undefined,
      })

  await ctx.db.replace(person._id, {
    // Unique per tombstone, never a valid E.164 number, so `by_phone` can
    // neither match it nor collide when the number signs up again.
    phone: `deleted:${person._id}`,
    name: "",
    role: "student",
    source: person.source,
    deletedAt: now,
    updatedAt: now,
    revision: (person.revision ?? 0) + 1,
  })
  const enquiries = await ctx.db
    .query("enquiries")
    .withIndex("by_person", (q) => q.eq("personId", person._id))
    .collect()
  for (const row of enquiries)
    if (row.referrer) await ctx.db.patch(row._id, { referrer: undefined })
  await recordAudit(
    ctx,
    { id: person._id },
    {
      action: "account_deleted",
      entity: "person",
      entityId: person._id,
      summary: "Account erased by its owner.",
    }
  )

  /* Collect rather than `unique()`: a duplicated lease must not throw and
     leave the erasure half-done - delete every row for the number. */
  const leases = await ctx.db
    .query("otpSendLeases")
    .withIndex("by_phone", (q) => q.eq("phone", person.phone))
    .collect()
  for (const lease of leases) await ctx.db.delete(lease._id)

  return { ok: true as const, phone: person.phone }
}

export const deleteOwnAccount = mutation({
  args: { confirmation: v.string() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    // A phone left unlocked must not be enough: the dialog asks for a fresh
    // WhatsApp code first, which starts a new session.
    if (!(await signedInWithin(ctx, DELETE_CODE_MAX_AGE_MS)))
      return invalidInput("code")

    const erased = await eraseAccount(ctx, viewer.value, args.confirmation)
    if (!erased.ok) return erased

    // The auth side lives in the Better Auth component, reached through its
    // adapter. Same transaction: if any of this throws, the erasure above is
    // rolled back with it rather than leaving a signed-in tombstone.
    const user = await authComponent.safeGetAuthUser(ctx)
    if (user) {
      for (const model of ["session", "account"] as const)
        await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
          input: {
            model,
            where: [{ field: "userId", value: user._id as string }],
          },
          paginationOpts: { numItems: 100, cursor: null },
        })
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: {
          model: "verification",
          where: [{ field: "identifier", value: erased.phone }],
        },
        paginationOpts: { numItems: 100, cursor: null },
      })
      await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: user._id as string }],
        },
      })
    }

    return { ok: true as const }
  },
})
