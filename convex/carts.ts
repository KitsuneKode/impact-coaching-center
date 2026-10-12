import { v } from "convex/values"

import { invalidInput, mutationResult, viewerPerson } from "./authz"
import type { Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"

/*
 * The signed-in shopper's cart. Guests keep theirs in localStorage and merge
 * here at sign-in; after that the server copy is the truth and the browser
 * mirrors it. Quantities are clamped the same way the local store caps them.
 */

/** Mirrors MAX_QUANTITY in lib/cart-store.ts. */
const MAX_LINE_QUANTITY = 10
/** A cart longer than this is a client bug, not a big shopper. */
const MAX_LINES = 50

const CART_LINE = v.object({
  slug: v.string(),
  quantity: v.number(),
  at: v.number(),
})

type Line = { slug: string; quantity: number; at: number }

/** Clamp, dedupe and reject caller lines until the shape is cart-safe. */
function cleanLines(lines: Line[]): Line[] | null {
  if (lines.length > MAX_LINES) return null
  const bySlug = new Map<string, Line>()
  for (const line of lines) {
    if (!line.slug || line.slug.length > 120) return null
    if (!Number.isInteger(line.quantity)) return null
    if (!Number.isFinite(line.at)) return null
    const quantity = Math.min(MAX_LINE_QUANTITY, line.quantity)
    if (quantity <= 0) continue
    // Same slug twice: keep the newer, identical to the sign-in merge rule.
    const kept = bySlug.get(line.slug)
    if (!kept || line.at >= kept.at)
      bySlug.set(line.slug, { ...line, quantity })
  }
  return [...bySlug.values()]
}

/** The caller's cart row, if one exists yet. */
async function readCart(ctx: QueryCtx | MutationCtx, personId: Id<"persons">) {
  return await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", personId))
    .first()
}

/** The signed-in shopper's cart; null when signed out. */
export const myCart = query({
  args: {},
  returns: v.union(v.null(), v.object({ lines: v.array(CART_LINE) })),
  handler: async (ctx) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return null
    const cart = await readCart(ctx, viewer.value.id)
    return { lines: cart?.lines ?? [] }
  },
})

/**
 * Sign-in merge: union by slug, keeping whichever copy of a line is newer.
 * Replaying the same merge is a no-op, so a retried call cannot duplicate.
 */
export const mergeCart = mutation({
  args: { lines: v.array(CART_LINE) },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return mergeCartAs(ctx, viewer.value.id, args.lines)
  },
})

/** The merge body, split out so it can be tested without a session. */
export async function mergeCartAs(
  ctx: MutationCtx,
  personId: Id<"persons">,
  rawLines: Line[]
) {
  const incoming = cleanLines(rawLines)
  if (!incoming) return invalidInput("lines")

  const cart = await readCart(ctx, personId)
  const merged = new Map<string, Line>()
  for (const line of cart?.lines ?? []) merged.set(line.slug, line)
  for (const line of incoming) {
    const kept = merged.get(line.slug)
    if (!kept || line.at >= kept.at) merged.set(line.slug, line)
  }
  const lines = [...merged.values()]

  if (cart) await ctx.db.patch(cart._id, { lines, updatedAt: Date.now() })
  else
    await ctx.db.insert("carts", {
      personId,
      lines,
      updatedAt: Date.now(),
    })
  return { ok: true as const }
}

/**
 * One line's absolute quantity, stamped by the server so ordering between
 * devices is total rather than argued about. quantity <= 0 removes the line.
 */
export const setCartLine = mutation({
  args: { slug: v.string(), quantity: v.number() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return setCartLineAs(ctx, viewer.value.id, args.slug, args.quantity)
  },
})

/** The line write, split out so it can be tested without a session. */
export async function setCartLineAs(
  ctx: MutationCtx,
  personId: Id<"persons">,
  slug: string,
  quantity: number
) {
  if (!Number.isInteger(quantity)) return invalidInput("quantity")
  if (!slug || slug.length > 120) return invalidInput("slug")

  const cart = await readCart(ctx, personId)
  const at = Date.now()
  const rest = (cart?.lines ?? []).filter((line) => line.slug !== slug)
  /* The cap guards additions; a removal must always go through, or a cart
     at the ceiling could never be emptied. */
  if (quantity > 0 && rest.length >= MAX_LINES) return invalidInput("lines")
  const lines =
    quantity > 0
      ? [...rest, { slug, quantity: Math.min(MAX_LINE_QUANTITY, quantity), at }]
      : rest

  if (cart) await ctx.db.patch(cart._id, { lines, updatedAt: at })
  else if (lines.length > 0)
    await ctx.db.insert("carts", { personId, lines, updatedAt: at })
  return { ok: true as const }
}

/** Empty the caller's cart - an order has taken it over. */
export async function clearCart(ctx: MutationCtx, personId: Id<"persons">) {
  const cart = await readCart(ctx, personId)
  if (cart && cart.lines.length > 0)
    await ctx.db.patch(cart._id, { lines: [], updatedAt: Date.now() })
}
