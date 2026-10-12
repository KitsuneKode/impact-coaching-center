import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { mergeCartAs, setCartLineAs } from "./carts"
import { placeOrderAs } from "./checkout"
import { findVerifiedPerson } from "./persons"
import { DEFAULT_SETTINGS } from "./settings"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

/** Checkout and the server cart: the parts of an order that must not be forged. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>

async function viewer(
  t: T,
  phone: string,
  role: "student" | "staff" | "owner" = "student"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Buyer",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  return t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
}

/** A published bundle of one book, priced per language. */
async function bundle(
  t: T,
  slug: string,
  { en = 89900, as = 84900 }: { en?: number; as?: number } = {},
  {
    published = true,
    sample = false,
    asAvailable = true,
  }: { published?: boolean; sample?: boolean; asAvailable?: boolean } = {}
) {
  return t.run(async (ctx) => {
    const bookId = await ctx.db.insert("books", {
      slug: `${slug}-book`,
      exam: "APSC",
      contents: [],
      editions: {
        en: {
          title: `Book ${slug}`,
          edition: "2026",
          pages: 100,
          samplePages: [],
        },
        as: {
          title: `কিতাপ ${slug}`,
          edition: "২০২৬",
          pages: 100,
          samplePages: [],
        },
      },
      revision: 0,
      updatedAt: 0,
    })
    return ctx.db.insert("bundles", {
      slug,
      exam: "APSC",
      title: { en: `Set ${slug}`, as: `সংকলন ${slug}` },
      description: { en: "" },
      bookIds: [bookId],
      variants: {
        en: { pricePaise: en, available: true },
        as: { pricePaise: as, available: asAvailable },
      },
      soldCount: 0,
      sortOrder: 0,
      published,
      sample,
      revision: 0,
      updatedAt: 0,
    })
  })
}

type CartLine = {
  slug: string
  language: "en" | "as"
  quantity: number
  at: number
}

async function cart(t: T, personId: Id<"persons">, lines: CartLine[]) {
  const existing = await t.run(async (ctx) =>
    (await ctx.db.query("carts").collect()).find((c) => c.personId === personId)
  )
  if (existing)
    return t.run((ctx) =>
      ctx.db.patch(existing._id, { lines, updatedAt: Date.now() })
    )
  return t.run((ctx) =>
    ctx.db.insert("carts", { personId, lines, updatedAt: Date.now() })
  )
}

const ADDRESS = {
  line1: "House 12, GS Road",
  city: "Guwahati",
  pin: "781005",
}
const SHIPPING = DEFAULT_SETTINGS.shippingPaise
const ordersOf = (t: T) => t.run((ctx) => ctx.db.query("orders").collect())
const activitiesOf = (t: T) =>
  t.run(async (ctx) =>
    (await ctx.db.query("activities").collect()).filter(
      (a) => a.kind === "order_placed"
    )
  )
const cartLinesOf = (t: T, personId: Id<"persons">): Promise<CartLine[]> =>
  t.run(async (ctx) => {
    const row = (await ctx.db.query("carts").collect()).find(
      (c) => c.personId === personId
    )
    return row?.lines ?? []
  })

const line = (
  slug: string,
  language: "en" | "as" = "en",
  quantity = 1,
  at = 1
): CartLine => ({ slug, language, quantity, at })

describe("placeOrder", () => {
  test("prices each language from the bundle, freezes titles, clears the cart", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    const apsc = await bundle(t, "apsc-set", { en: 89900, as: 84900 })
    await cart(t, buyer.id, [line("apsc-set", "en", 2), line("apsc-set", "as")])

    const result = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "delivery",
        address: ADDRESS,
        idempotencyKey: "key-1",
      })
    )
    expect(result).toMatchObject({ ok: true })
    if (!result.ok) return
    expect(result.totalPaise).toBe(89900 * 2 + 84900 + SHIPPING)
    expect(result.reference).toMatch(/^ICT-[0-9A-HJKMNP-TV-Z]{5}$/)

    const [order] = await ordersOf(t)
    expect(order).toMatchObject({
      personId: buyer.id,
      reference: result.reference,
      status: "awaiting_payment",
      fulfilment: "delivery",
      contact: { name: "Test Buyer", phone: "+919876543210" },
      deliveryPaise: SHIPPING,
      totalPaise: result.totalPaise,
      idempotencyKey: "key-1",
      address: ADDRESS,
    })
    expect(order?.lines).toEqual([
      {
        bundleId: apsc,
        slug: "apsc-set",
        title: "Set apsc-set",
        language: "en",
        books: ["Book apsc-set"],
        quantity: 2,
        unitPaise: 89900,
      },
      {
        bundleId: apsc,
        slug: "apsc-set",
        title: "Set apsc-set",
        language: "as",
        books: ["কিতাপ apsc-set"],
        quantity: 1,
        unitPaise: 84900,
      },
    ])
    expect(order?.itemsPaise).toBe(89900 * 2 + 84900)

    // A placed order does not order twice.
    expect(await cartLinesOf(t, buyer.id)).toEqual([])

    const [activity] = await activitiesOf(t)
    expect(activity).toMatchObject({
      personId: buyer.id,
      actorId: buyer.id,
      kind: "order_placed",
    })
    expect(activity?.body).toContain(result.reference)
  })

  test("the owner's shipping charge is the one charged", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await t.run((ctx) =>
      ctx.db.insert("siteSettings", {
        ...DEFAULT_SETTINGS,
        shippingPaise: 9000,
        revision: 0,
      })
    )
    await cart(t, buyer.id, [line("apsc-set")])
    const result = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "delivery",
        address: ADDRESS,
        idempotencyKey: "key-1",
      })
    )
    expect(result).toMatchObject({ ok: true, totalPaise: 89900 + 9000 })
  })

  test("collection takes no delivery charge and no address", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])

    const result = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "collection",
        idempotencyKey: "key-1",
      })
    )
    expect(result).toMatchObject({ ok: true, totalPaise: 89900 })

    const [order] = await ordersOf(t)
    expect(order?.deliveryPaise).toBe(0)
    expect(order?.address).toBeUndefined()

    // An address on a collection is refused rather than quietly stored.
    await cart(t, buyer.id, [line("apsc-set", "en", 1, 2)])
    expect(
      await t.run((ctx) =>
        placeOrderAs(ctx, buyer, {
          fulfilment: "collection",
          address: ADDRESS,
          idempotencyKey: "key-2",
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "address" })
  })

  test("delivery requires a usable address", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])

    for (const address of [
      undefined,
      { ...ADDRESS, pin: "78100" },
      { ...ADDRESS, line1: "   " },
      { ...ADDRESS, city: "" },
    ]) {
      expect(
        await t.run((ctx) =>
          placeOrderAs(ctx, buyer, {
            fulfilment: "delivery",
            address,
            idempotencyKey: `key-${address?.pin ?? "none"}`,
          })
        )
      ).toEqual({ ok: false, reason: "invalid-input", field: "address" })
    }
    expect(await ordersOf(t)).toHaveLength(0)
  })

  test("unknown, unpublished, demo and switched-off sets cannot be ordered", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "unpublished", {}, { published: false })
    await bundle(t, "demo-only", {}, { sample: true })
    await bundle(t, "no-assamese", {}, { asAvailable: false })
    let key = 0

    for (const lines of [
      [line("never-existed")],
      [line("unpublished")],
      [line("demo-only")],
      [line("no-assamese", "as")],
    ]) {
      await cart(t, buyer.id, lines)
      expect(
        await t.run((ctx) =>
          placeOrderAs(ctx, buyer, {
            fulfilment: "collection",
            idempotencyKey: `key-${key++}`,
          })
        )
      ).toEqual({ ok: false, reason: "invalid-input", field: "items" })
      // A refused order must not eat the cart.
      expect((await cartLinesOf(t, buyer.id)).length).toBe(1)
    }
    expect(await ordersOf(t)).toHaveLength(0)
  })

  test("an empty cart is refused, and nothing is written", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!

    expect(
      await t.run((ctx) =>
        placeOrderAs(ctx, buyer, {
          fulfilment: "collection",
          idempotencyKey: "key-1",
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "cart" })
    expect(await ordersOf(t)).toHaveLength(0)
    expect(await activitiesOf(t)).toHaveLength(0)
  })

  test("the idempotency key makes a retry the same order, not a second", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    const other = (await viewer(t, "+919876543211"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])

    const first = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "collection",
        idempotencyKey: "shared-key",
      })
    )
    // The cart is gone; a replay must still answer with the same reference.
    const replay = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "collection",
        idempotencyKey: "shared-key",
      })
    )
    expect(first).toMatchObject({ ok: true })
    expect(replay).toEqual(first)
    expect(await ordersOf(t)).toHaveLength(1)

    // Somebody else quoting that key is refused - it is not theirs to see.
    expect(
      await t.run((ctx) =>
        placeOrderAs(ctx, other, {
          fulfilment: "collection",
          idempotencyKey: "shared-key",
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "idempotencyKey" })
    expect(await ordersOf(t)).toHaveLength(1)
  })

  test("more than ten orders an hour from one Person is refused", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")

    let key = 0
    const next = async () => {
      await cart(t, buyer.id, [line("apsc-set", "en", 1, key)])
      return t.run((ctx) =>
        placeOrderAs(ctx, buyer, {
          fulfilment: "collection",
          idempotencyKey: `key-${key++}`,
        })
      )
    }

    for (let i = 0; i < 10; i++)
      expect(await next()).toMatchObject({ ok: true })
    expect(await next()).toEqual({ ok: false, reason: "rate-limited" })
    expect(await ordersOf(t)).toHaveLength(10)
  })
})

describe("the server cart", () => {
  test("merge is a union by set and language, and the newer write wins", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await cart(t, buyer.id, [
      line("apsc", "en", 3, 100),
      line("adre", "as", 1, 50),
    ])

    // The browser carried an older apsc, a newer adre, and the other language.
    const incoming = [
      line("apsc", "en", 1, 10),
      line("adre", "as", 5, 200),
      line("apsc", "as", 2, 5),
    ]
    expect(await t.run((ctx) => mergeCartAs(ctx, buyer.id, incoming))).toEqual({
      ok: true,
    })
    const merged = [
      line("apsc", "en", 3, 100),
      line("adre", "as", 5, 200),
      line("apsc", "as", 2, 5),
    ]
    expect(await cartLinesOf(t, buyer.id)).toEqual(merged)

    // Replaying the same merge is a no-op.
    await t.run((ctx) => mergeCartAs(ctx, buyer.id, incoming))
    expect(await cartLinesOf(t, buyer.id)).toEqual(merged)
  })

  test("merge cleans: clamps, drops non-positive, caps the line count", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!

    expect(
      await t.run((ctx) =>
        mergeCartAs(ctx, buyer.id, [
          line("a", "en", 99, 1),
          line("b", "en", 0, 1),
          line("a", "en", 4, 2),
        ])
      )
    ).toEqual({ ok: true })
    expect(await cartLinesOf(t, buyer.id)).toEqual([line("a", "en", 4, 2)])

    const flood = Array.from({ length: 11 }, (_, i) => line(`set-${i}`))
    expect(await t.run((ctx) => mergeCartAs(ctx, buyer.id, flood))).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "lines",
    })
  })

  test("setCartLine sets the absolute quantity and removes at zero", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    const set = (slug: string, language: "en" | "as", quantity: number) =>
      t.run((ctx) => setCartLineAs(ctx, buyer.id, { slug, language, quantity }))

    await set("apsc", "en", 3)
    await set("apsc", "as", 1)
    let lines = await cartLinesOf(t, buyer.id)
    expect(lines.map((l) => [l.language, l.quantity]).sort()).toEqual([
      ["as", 1],
      ["en", 3],
    ])

    // Fractional quantities are refused; oversized ones clamp to five.
    expect(await set("apsc", "en", 1.5)).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "quantity",
    })
    await set("apsc", "en", 55)
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.find((l) => l.language === "en")?.quantity).toBe(5)

    await set("apsc", "en", 0)
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.map((l) => l.language)).toEqual(["as"])
  })
})
