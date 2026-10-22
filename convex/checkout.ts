import { v } from "convex/values"

import { invalidInput, REFUSAL, viewerPerson, type Viewer } from "./authz"
import { clearCart } from "./carts"
import { mutation, type MutationCtx } from "./_generated/server"
import { allocateOrderReference } from "./orders"
import { deliversTo, ORDER_SETS_MAX } from "../lib/catalog"
import { ADDRESS } from "./schema"
import { consumeRateLimit } from "./persons"
import { readSettings } from "./settings"

/**
 * Checkout. The server prices the order from published bundles, the shop
 * settings and the shopper's server-side cart; the browser sends neither
 * titles nor paise. An order lands as `awaiting_payment`; only a verified
 * Razorpay payment moves it to `paid`.
 */

/** A shopper checking out more often than this is not a shopper. */
const ORDERS_PER_PERSON_HOUR = 10
const HOUR = 60 * 60 * 1000

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
    .withIndex("by_idempotencyKey", (q) =>
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
  // Collection is open to anyone; parcels only go within Assam.
  if (address && !deliversTo(address.pin)) return invalidInput("pin-area")

  /* The cart on the server is the order; what the client displayed is
     advice, not evidence. */
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", viewer.id))
    .first()
  const cartLines = cart?.lines ?? []
  if (cartLines.length === 0) return invalidInput("cart")
  const sets = cartLines.reduce((n, line) => n + line.quantity, 0)
  if (sets > ORDER_SETS_MAX) return invalidInput("quantity")

  /* Every line's set and its books are read together; a line that cannot
     be sold comes back null and refuses the whole order. */
  const priced = await Promise.all(
    cartLines.map(async (line) => {
      const bundle = await ctx.db
        .query("bundles")
        .withIndex("by_slug", (q) => q.eq("slug", line.slug))
        .first()
      const variant = bundle?.variants[line.language]
      // Unpublished, switched off or demo-only bundles cannot be sold.
      if (!bundle || !bundle.published || bundle.sample || !variant?.available)
        return null
      const books = await Promise.all(
        bundle.bookIds.map((id) => ctx.db.get(id))
      )
      const titles = books.map((book) => book?.editions[line.language]?.title)
      // A set missing a book in this language is not the set on the page.
      if (titles.length === 0 || titles.some((title) => !title)) return null
      return {
        bundleId: bundle._id,
        slug: bundle.slug,
        title: bundle.title.en,
        language: line.language,
        books: titles as string[],
        quantity: line.quantity,
        unitPaise: variant.pricePaise,
      }
    })
  )
  if (priced.some((line) => line === null)) return invalidInput("items")
  const lines = priced.filter((line) => line !== null)
  const itemsPaise = lines.reduce(
    (sum, line) => sum + line.unitPaise * line.quantity,
    0
  )
  const settings = await readSettings(ctx)
  const deliveryPaise =
    args.fulfilment === "delivery" ? settings.shippingPaise : 0
  const totalPaise = itemsPaise + deliveryPaise

  const person = await ctx.db.get(viewer.id)
  if (!person?.name.trim()) return invalidInput("name")

  const reference = await allocateOrderReference(ctx)
  await ctx.db.insert("orders", {
    personId: viewer.id,
    reference,
    status: "awaiting_payment",
    fulfilment: args.fulfilment,
    contact: { name: person.name.trim(), phone: person.phone },
    lines,
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
    body: `Order ${reference} placed: ${lines.reduce((n, l) => n + l.quantity, 0)} set(s) · ₹${Math.round(totalPaise / 100)} · ${args.fulfilment}`,
    actorId: viewer.id,
  })

  await clearCart(ctx, viewer.id)
  return { ok: true as const, reference, totalPaise }
}
