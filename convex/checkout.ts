import { v } from "convex/values"

import { invalidInput, REFUSAL, viewerPerson, type Viewer } from "./authz"
import { clearCart } from "./carts"
import { mutation, type MutationCtx } from "./_generated/server"
import { allocateOrderReference } from "./orders"
import { consumeRateLimit } from "./persons"
import { DELIVERY_CHARGE_PAISE } from "../lib/checkout"

/**
 * Checkout. The server prices the order from the `books` table and from the
 * shopper's server-side cart - the browser sends neither titles nor paise, so
 * a forged price is impossible by construction rather than by validation.
 *
 * Payment is still a prototype: an order lands as `awaiting_payment` and a
 * provider signature (KIT-60) is what may move it to `paid`, not a click.
 */

/* The flat charge lives in lib/checkout.ts (provisional, shared with the
   checkout UI so the page shows the number the server will charge). */

/** A shopper checking out more often than this is not a shopper. */
const ORDERS_PER_PERSON_HOUR = 10
const HOUR = 60 * 60 * 1000

const ADDRESS = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  district: v.optional(v.string()),
  pin: v.string(),
})

/** Trimmed, non-empty, short enough for a courier label. */
function cleanAddressField(value: string | undefined, max: number) {
  const clean = value?.trim()
  if (!clean || clean.length > max) return null
  return clean
}

function validateAddress(address: {
  line1: string
  line2?: string
  city: string
  district?: string
  pin: string
}) {
  const line1 = cleanAddressField(address.line1, 200)
  const city = cleanAddressField(address.city, 100)
  const line2 = address.line2?.trim() || undefined
  const district = address.district?.trim() || undefined
  const pin = address.pin.trim()
  if (!line1 || !city) return null
  if (!/^\d{6}$/.test(pin)) return null
  return { line1, line2, city, district, pin }
}

export const placeOrder = mutation({
  args: {
    fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
    address: v.optional(ADDRESS),
    /**
     * Generated once per checkout attempt client-side, so a double-click or
     * a retried request acknowledges the same order instead of minting two.
     */
    idempotencyKey: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      reference: v.string(),
      totalPaise: v.number(),
    }),
    REFUSAL
  ),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return placeOrderAs(ctx, viewer.value, args)
  },
})

/** The mutation body, split out so it can be tested without a session. */
export async function placeOrderAs(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    fulfilment: "delivery" | "collection"
    address?: {
      line1: string
      line2?: string
      city: string
      district?: string
      pin: string
    }
    idempotencyKey: string
  }
) {
  if (!args.idempotencyKey || args.idempotencyKey.length > 80)
    return invalidInput("idempotencyKey")
  /*
   * Idempotency before the rate limit: a retry is not a new order, so it
   * must not spend from the new-orders budget - it would turn "did that go
   * through?" into a rate-limit refusal when the order exists. Distinct
   * keys still hit the ceiling below, so a flood of real attempts costs.
   */
  const prior = await ctx.db
    .query("orders")
    .withIndex("by_idempotency", (q) =>
      q.eq("idempotencyKey", args.idempotencyKey)
    )
    .first()
  if (prior) {
    /* The key belongs to somebody else's order: refuse rather than hand
       back a reference that is not theirs to see. */
    if (prior.personId !== viewer.id) return invalidInput("idempotencyKey")
    return {
      ok: true as const,
      reference: prior.reference,
      totalPaise: prior.totalPaise,
    }
  }

  const allowed = await consumeRateLimit(
    ctx,
    `order:person:${viewer.id}`,
    ORDERS_PER_PERSON_HOUR,
    HOUR
  )
  if (!allowed) return { ok: false as const, reason: "rate-limited" as const }

  if (args.fulfilment === "collection" && args.address !== undefined)
    return invalidInput("address")
  const address =
    args.fulfilment === "delivery" && args.address
      ? (validateAddress(args.address) ?? undefined)
      : undefined
  if (args.fulfilment === "delivery" && !address) return invalidInput("address")

  /* The cart on the server is the order. What the client happened to
     display is advice, not evidence. */
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", viewer.id))
    .first()
  const lines = cart?.lines ?? []
  if (lines.length === 0) return invalidInput("cart")

  const books = await Promise.all(
    lines.map((line) =>
      ctx.db
        .query("books")
        .withIndex("by_slug", (q) => q.eq("slug", line.slug))
        .first()
    )
  )
  /* Unpublished, unknown or demo-only titles cannot be sold; say which
     cart broke so the client can drop it rather than refuse blankly. */
  const missing = books.some((book) => !book || !book.published || book.sample)
  if (missing) return invalidInput("items")

  const items = books.map((book, i) => ({
    title: book!.title,
    edition: book!.edition,
    quantity: lines[i]!.quantity,
    unitPaise: book!.pricePaise,
  }))
  const itemsPaise = items.reduce(
    (sum, item) => sum + item.unitPaise * item.quantity,
    0
  )
  const deliveryPaise =
    args.fulfilment === "delivery" ? DELIVERY_CHARGE_PAISE : 0
  const totalPaise = itemsPaise + deliveryPaise

  const reference = await allocateOrderReference(ctx)
  await ctx.db.insert("orders", {
    personId: viewer.id,
    reference,
    status: "awaiting_payment",
    fulfilment: args.fulfilment,
    items,
    itemsPaise,
    deliveryPaise,
    totalPaise,
    address,
    idempotencyKey: args.idempotencyKey,
    placedAt: Date.now(),
    revision: 0,
  })

  await ctx.db.insert("activities", {
    personId: viewer.id,
    kind: "order_placed",
    body: `Order ${reference} placed: ${items.reduce((n, i) => n + i.quantity, 0)} item(s) · ₹${Math.round(totalPaise / 100)} · ${args.fulfilment}`,
    actorId: viewer.id,
  })

  await clearCart(ctx, viewer.id)
  return { ok: true as const, reference, totalPaise }
}
