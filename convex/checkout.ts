import { v } from "convex/values"

import { invalidInput, REFUSAL, viewerPerson, type Viewer } from "./authz"
import type { Id } from "./_generated/dataModel"
import { mutation, type MutationCtx, query } from "./_generated/server"
import { deliversTo, ORDER_SETS_MAX } from "../lib/catalog"
import { ADDRESS } from "./schema"
import { consumeRateLimit } from "./persons"
import { readSettings } from "./settings"

/**
 * Checkout (ADR-0005). "Pay" freezes the server cart at today's prices into
 * a checkout attempt; Razorpay then takes the money for it, and only a
 * captured payment turns it into an order (payments.ts). Nothing here
 * empties the cart or shows staff anything: an unpaid attempt is invisible.
 */

/** A shopper starting more payments than this is not a shopper. */
const ATTEMPTS_PER_PERSON_HOUR = 20
const HOUR = 60 * 60 * 1000
/** An attempt older than this is priced afresh rather than reused. */
const REUSE_FOR_MS = 24 * HOUR

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
  if ((address.line2?.trim().length ?? 0) > 200) return null
  if ((address.district?.trim().length ?? 0) > 100) return null
  const line1 = cleanAddressField(address.line1, 200)
  const city = cleanAddressField(address.city, 100)
  const line2 = cleanAddressField(address.line2, 200) ?? undefined
  const district = cleanAddressField(address.district, 100) ?? undefined
  const pin = address.pin.trim()
  if (!line1 || !city) return null
  if (!/^\d{6}$/.test(pin)) return null
  return { line1, line2, city, district, pin }
}

export const beginCheckout = mutation({
  args: {
    fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
    address: v.optional(ADDRESS),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      checkoutId: v.id("checkouts"),
      totalPaise: v.number(),
    }),
    REFUSAL
  ),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return beginCheckoutAs(ctx, viewer.value, args)
  },
})

/** The mutation body, split out so it can be tested without a session. */
export async function beginCheckoutAs(
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
  }
) {
  if (args.fulfilment === "collection" && args.address !== undefined)
    return invalidInput("address")
  const address =
    args.fulfilment === "delivery" && args.address
      ? (validateAddress(args.address) ?? undefined)
      : undefined
  if (args.fulfilment === "delivery" && !address) return invalidInput("address")
  // Collection is open to anyone; parcels only go within Assam.
  if (address && !deliversTo(address.pin)) return invalidInput("pin-area")

  /* The cart on the server is what gets paid for; what the browser showed
     is advice, not evidence. */
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", viewer.id))
    .first()
  const cartLines = cart?.lines ?? []
  if (cartLines.length === 0) return invalidInput("cart")
  const sets = cartLines.reduce((n, line) => n + line.quantity, 0)
  if (sets > ORDER_SETS_MAX) return invalidInput("quantity")

  const person = await ctx.db.get(viewer.id)
  if (!person?.name.trim()) return invalidInput("name")

  /* Every line's set and its books are read together; a line that cannot
     be sold comes back null and refuses the whole attempt. */
  const priced = await Promise.all(
    cartLines.map(async (line) => {
      const bundle = await ctx.db
        .query("bundles")
        .withIndex("by_slug", (q) => q.eq("slug", line.slug))
        .first()
      const variant = bundle?.variants[line.language]
      // Unpublished, switched off or demo-only sets cannot be sold.
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
  const contact = { name: person.name.trim(), phone: person.phone }
  const signature = JSON.stringify([
    args.fulfilment,
    address ?? null,
    contact,
    lines.map((l) => [l.bundleId, l.language, l.quantity, l.unitPaise]),
    deliveryPaise,
  ])

  /* Pressing Pay again on the same cart (a closed window, a declined card,
     a second tab) reuses the attempt and its Razorpay order, whose amount
     cannot change. Anything else replaces it. */
  const now = Date.now()
  const open = await ctx.db
    .query("checkouts")
    .withIndex("by_personId_and_status", (q) =>
      q.eq("personId", viewer.id).eq("status", "open")
    )
    .take(10)
  const reusable = open.find(
    (row) => row.signature === signature && now - row.updatedAt < REUSE_FOR_MS
  )
  if (reusable) {
    await ctx.db.patch(reusable._id, { updatedAt: now })
    return { ok: true as const, checkoutId: reusable._id, totalPaise }
  }

  /* Spent only on a new attempt that is well formed: a mistyped PIN is
     fixed and resent, and a retry of the same cart is free. */
  const allowed = await consumeRateLimit(
    ctx,
    `checkout:person:${viewer.id}`,
    ATTEMPTS_PER_PERSON_HOUR,
    HOUR
  )
  if (!allowed) return { ok: false as const, reason: "rate-limited" as const }

  // Kept, not deleted: a payment already under way on one still counts.
  await Promise.all(
    open.map((row) =>
      ctx.db.patch(row._id, { status: "replaced", updatedAt: now })
    )
  )
  const checkoutId = await ctx.db.insert("checkouts", {
    personId: viewer.id,
    status: "open",
    fulfilment: args.fulfilment,
    contact,
    lines,
    itemsPaise,
    deliveryPaise,
    totalPaise,
    address,
    signature,
    updatedAt: now,
  })
  return { ok: true as const, checkoutId, totalPaise }
}

/**
 * Where one of the viewer's attempts stands, live: the page waiting on a
 * bank's approval turns into the thank-you as soon as the webhook lands.
 */
export const checkoutStatus = query({
  args: { checkoutId: v.id("checkouts") },
  returns: v.union(
    v.null(),
    v.object({
      status: v.union(
        v.literal("open"),
        v.literal("paid"),
        v.literal("replaced")
      ),
      reference: v.optional(v.string()),
      receiptNumber: v.optional(v.string()),
      totalPaise: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return null
    const checkout = await ctx.db.get(args.checkoutId)
    if (!checkout || checkout.personId !== viewer.value.id) return null
    const order = checkout.orderId ? await ctx.db.get(checkout.orderId) : null
    return {
      status: checkout.status,
      reference: order?.reference,
      receiptNumber: order?.receiptNumber,
      totalPaise: checkout.totalPaise,
    }
  },
})

/** Take what was bought out of the cart; anything added since stays. */
export async function removePurchased(
  ctx: MutationCtx,
  personId: Id<"persons">,
  bought: { slug: string; language: "en" | "as"; quantity: number }[]
) {
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_person", (q) => q.eq("personId", personId))
    .first()
  if (!cart || cart.lines.length === 0) return
  const lines = cart.lines.flatMap((line) => {
    const paid = bought
      .filter((b) => b.slug === line.slug && b.language === line.language)
      .reduce((n, b) => n + b.quantity, 0)
    const quantity = line.quantity - paid
    return quantity > 0 ? [{ ...line, quantity }] : []
  })
  await ctx.db.patch(cart._id, { lines, updatedAt: Date.now() })
}
