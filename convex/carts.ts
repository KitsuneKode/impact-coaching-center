import { type Infer, v } from "convex/values"

import { BUNDLE_QUANTITY_MAX } from "../lib/catalog"
import { invalidInput, mutationResult, viewerPerson } from "./authz"
import type { Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { LOCALE } from "./schema"

/*
 * The signed-in shopper's cart. Guests keep theirs in localStorage and merge
 * here at sign-in; after that the server copy is the truth and the browser
 * mirrors it. A line is one bundle in one language.
 */

/** A cart longer than this is a client bug, not a big shopper. */
const MAX_LINES = 10

const CART_LINE = v.object({
  slug: v.string(),
  language: LOCALE,
  quantity: v.number(),
  at: v.number(),
})

type Line = Infer<typeof CART_LINE>

const keyOf = (line: Pick<Line, "slug" | "language">) =>
  `${line.slug}:${line.language}`

/** Clamp, dedupe and reject caller lines until the shape is cart-safe. */
function cleanLines(lines: Line[]): Line[] | null {
  if (lines.length > MAX_LINES) return null
  const byKey = new Map<string, Line>()
  for (const line of lines) {
    if (!line.slug || line.slug.length > 120) return null
    if (!Number.isInteger(line.quantity)) return null
    if (!Number.isFinite(line.at)) return null
    const quantity = Math.min(BUNDLE_QUANTITY_MAX, line.quantity)
    if (quantity <= 0) continue
    // Same line twice: keep the newer, identical to the sign-in merge rule.
    const kept = byKey.get(keyOf(line))
    if (!kept || line.at >= kept.at)
      byKey.set(keyOf(line), { ...line, quantity })
  }
  return [...byKey.values()]
}

async function readCart(ctx: QueryCtx | MutationCtx, personId: Id<"persons">) {
  return await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", personId))
    .first()
}

async function writeCart(
  ctx: MutationCtx,
  personId: Id<"persons">,
  lines: Line[],
  at = Date.now()
) {
  const cart = await readCart(ctx, personId)
  if (cart) await ctx.db.patch(cart._id, { lines, updatedAt: at })
  else if (lines.length > 0)
    await ctx.db.insert("carts", { personId, lines, updatedAt: at })
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

/** Sign-in merge: union by line, keeping the newer copy. Replays are no-ops. */
export const mergeCart = mutation({
  args: { lines: v.array(CART_LINE) },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return mergeCartAs(ctx, viewer.value.id, args.lines)
  },
})

export async function mergeCartAs(
  ctx: MutationCtx,
  personId: Id<"persons">,
  rawLines: Line[]
) {
  const incoming = cleanLines(rawLines)
  if (!incoming) return invalidInput("lines")
  const cart = await readCart(ctx, personId)
  const merged = new Map<string, Line>()
  for (const line of cart?.lines ?? []) merged.set(keyOf(line), line)
  for (const line of incoming) {
    const kept = merged.get(keyOf(line))
    if (!kept || line.at >= kept.at) merged.set(keyOf(line), line)
  }
  const lines = [...merged.values()].slice(0, MAX_LINES)
  await writeCart(ctx, personId, lines)
  return { ok: true as const }
}

/** One line's absolute quantity; zero or less removes it. */
export const setCartLine = mutation({
  args: { slug: v.string(), language: LOCALE, quantity: v.number() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return setCartLineAs(ctx, viewer.value.id, args)
  },
})

export async function setCartLineAs(
  ctx: MutationCtx,
  personId: Id<"persons">,
  args: { slug: string; language: Line["language"]; quantity: number }
) {
  if (!Number.isInteger(args.quantity)) return invalidInput("quantity")
  if (!args.slug || args.slug.length > 120) return invalidInput("slug")

  const cart = await readCart(ctx, personId)
  const at = Date.now()
  const rest = (cart?.lines ?? []).filter((line) => keyOf(line) !== keyOf(args))
  // The cap guards additions; a removal always goes through.
  if (args.quantity > 0 && rest.length >= MAX_LINES)
    return invalidInput("lines")
  const lines =
    args.quantity > 0
      ? [
          ...rest,
          {
            slug: args.slug,
            language: args.language,
            quantity: Math.min(BUNDLE_QUANTITY_MAX, args.quantity),
            at,
          },
        ]
      : rest
  await writeCart(ctx, personId, lines, at)
  return { ok: true as const }
}

/** Empty the caller's cart - an order has taken it over. */
export async function clearCart(ctx: MutationCtx, personId: Id<"persons">) {
  const cart = await readCart(ctx, personId)
  if (cart && cart.lines.length > 0)
    await ctx.db.patch(cart._id, { lines: [], updatedAt: Date.now() })
}
