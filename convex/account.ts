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

/** Rows of one kind an erasure rewrites in its one transaction. */
const ERASE_ROWS_MAX = 2000

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

  // Everything that names this Person, read together.
  const [orders, cart, opens, activities, enquiries, leases, undeliverable] =
    await Promise.all([
      ctx.db
        .query("orders")
        .withIndex("by_personId_and_placedAt", (q) =>
          q.eq("personId", person._id)
        )
        .collect(),
      ctx.db
        .query("carts")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .first(),
      ctx.db
        .query("resourceOpens")
        .withIndex("by_personId_and_resourceId", (q) =>
          q.eq("personId", person._id)
        )
        .take(ERASE_ROWS_MAX + 1),
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .take(ERASE_ROWS_MAX + 1),
      ctx.db
        .query("enquiries")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .take(ERASE_ROWS_MAX + 1),
      /* Collect rather than `unique()`: a duplicated lease must not throw
         and leave the erasure half-done - delete every row for the number. */
      ctx.db
        .query("otpSendLeases")
        .withIndex("by_phone", (q) => q.eq("phone", person.phone))
        .collect(),
      ctx.db
        .query("otpUndeliverable")
        .withIndex("by_phone", (q) => q.eq("phone", person.phone))
        .first(),
    ])
  if (orders.some((order) => LIVE_ORDER.has(order.status)))
    return invalidInput("orders-in-progress")
  /* One transaction has a write ceiling. A history this long is refused
     whole, saying so, rather than failing the same way on every retry;
     staff erase it with the owner's help. */
  if (
    [opens, activities, enquiries].some((rows) => rows.length > ERASE_ROWS_MAX)
  )
    return invalidInput("history-too-long")

  const now = Date.now()
  await Promise.all([
    // Orders stay for the books' sake; who and where they went do not. One
    // still awaiting payment is cancelled (not expired), so a payment that
    // arrives later is flagged for a refund instead of reviving it.
    ...orders.map((order) =>
      ctx.db.patch(order._id, {
        address: undefined,
        contact: { name: "", phone: "" },
        updatedAt: now,
        ...(order.status === "awaiting_payment"
          ? {
              status: "cancelled" as const,
              revision: (order.revision ?? 0) + 1,
            }
          : {}),
      })
    ),
    // Free text and names go; who did what, and when, stays.
    ...activities
      .filter((row) => row.body || row.track || row.timing)
      .map((row) =>
        ctx.db.patch(row._id, {
          body: undefined,
          track: undefined,
          timing: undefined,
        })
      ),
    ...enquiries
      .filter((row) => row.referrer || row.name)
      .map((row) =>
        ctx.db.patch(row._id, { referrer: undefined, name: undefined })
      ),
    ...(cart ? [ctx.db.delete(cart._id)] : []),
    ...opens.map((open) => ctx.db.delete(open._id)),
    ...leases.map((lease) => ctx.db.delete(lease._id)),
    ...(undeliverable ? [ctx.db.delete(undeliverable._id)] : []),
    ctx.db.replace(person._id, {
      // Unique per tombstone, never a valid E.164 number, so `by_phone` can
      // neither match it nor collide when the number signs up again.
      phone: `deleted:${person._id}`,
      name: "",
      role: "student",
      source: person.source,
      deletedAt: now,
      updatedAt: now,
      revision: (person.revision ?? 0) + 1,
    }),
  ])
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

  return { ok: true as const, phone: person.phone }
}

/** Pages a single erasure walks through per model before giving up. */
const AUTH_DELETE_PAGES = 20

/**
 * Every Better Auth row of one model for this person, not just the first
 * page: deleteMany answers 100 at a time with a cursor to the rest, and a
 * person with more sessions than that must not keep the remainder.
 */
async function deleteAllAuthRows(
  ctx: MutationCtx,
  model: "session" | "account" | "verification",
  field: "userId" | "identifier",
  value: string
) {
  let cursor: string | null = null
  for (let page = 0; page < AUTH_DELETE_PAGES; page++) {
    const result = (await ctx.runMutation(
      components.betterAuth.adapter.deleteMany,
      {
        // The component's input is a union per model; this is one of them.
        input: { model, where: [{ field, value }] } as never,
        paginationOpts: { numItems: 100, cursor },
      }
    )) as { isDone?: boolean; continueCursor?: string }
    if (result.isDone !== false || !result.continueCursor) return
    cursor = result.continueCursor
  }
  throw new Error(`Too many ${model} rows to erase in one go.`)
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
      const userId = user._id as string
      await deleteAllAuthRows(ctx, "session", "userId", userId)
      await deleteAllAuthRows(ctx, "account", "userId", userId)
      await deleteAllAuthRows(ctx, "verification", "identifier", erased.phone)
      await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: userId }],
        },
      })
    }

    return { ok: true as const }
  },
})
