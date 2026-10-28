import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { mergeCartAs, setCartLineAs } from "./carts"
import { beginCheckoutAs } from "./checkout"
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
  district: "Kamrup Metropolitan",
  pin: "781005",
}
const SHIPPING = DEFAULT_SETTINGS.shippingPaise
const ordersOf = (t: T) => t.run((ctx) => ctx.db.query("orders").collect())
const checkoutsOf = (t: T) =>
  t.run((ctx) => ctx.db.query("checkouts").collect())
type Buyer = NonNullable<Awaited<ReturnType<typeof viewer>>>
const begin = (
  t: T,
  buyer: Buyer,
  fulfilment: "delivery" | "collection",
  address?: typeof ADDRESS & { pin: string }
) => t.run((ctx) => beginCheckoutAs(ctx, buyer, { fulfilment, address }))
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

describe("beginCheckout", () => {
  test("prices each language from the bundle and freezes titles, leaving the cart", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    const apsc = await bundle(t, "apsc-set", { en: 89900, as: 84900 })
    await cart(t, buyer.id, [line("apsc-set", "en", 2), line("apsc-set", "as")])

    const result = await begin(t, buyer, "delivery", ADDRESS)
    expect(result).toMatchObject({ ok: true })
    if (!result.ok) return
    expect(result.totalPaise).toBe(89900 * 2 + 84900 + SHIPPING)

    const [checkout] = await checkoutsOf(t)
    expect(checkout).toMatchObject({
      _id: result.checkoutId,
      personId: buyer.id,
      status: "open",
      fulfilment: "delivery",
      contact: { name: "Test Buyer", phone: "+919876543210" },
      deliveryPaise: SHIPPING,
      totalPaise: result.totalPaise,
      address: ADDRESS,
    })
    expect(checkout?.lines).toEqual([
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
    expect(checkout?.itemsPaise).toBe(89900 * 2 + 84900)

    // Unpaid, nothing is an order and the cart is still the cart.
    expect(await ordersOf(t)).toHaveLength(0)
    expect(await cartLinesOf(t, buyer.id)).toHaveLength(2)
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
    expect(await begin(t, buyer, "delivery", ADDRESS)).toMatchObject({
      ok: true,
      totalPaise: 89900 + 9000,
    })
  })

  test("collection takes no delivery charge and no address", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])

    expect(await begin(t, buyer, "collection")).toMatchObject({
      ok: true,
      totalPaise: 89900,
    })
    const [checkout] = await checkoutsOf(t)
    expect(checkout?.deliveryPaise).toBe(0)
    expect(checkout?.address).toBeUndefined()

    // An address on a collection is refused rather than quietly stored.
    expect(await begin(t, buyer, "collection", ADDRESS)).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "address",
    })
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
      { ...ADDRESS, district: " " },
    ])
      expect(await begin(t, buyer, "delivery", address)).toEqual({
        ok: false,
        reason: "invalid-input",
        field: "address",
      })
    expect(await checkoutsOf(t)).toHaveLength(0)
  })

  test("a courier number must be a mobile; the account's own is not repeated", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])
    const run = (courierPhone: string) =>
      t.run((ctx) =>
        beginCheckoutAs(ctx, buyer, {
          fulfilment: "delivery",
          address: ADDRESS,
          courierPhone,
        })
      )

    expect(await run("12345")).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "courier-phone",
    })
    expect(await run("98765 43210")).toMatchObject({ ok: true })
    expect((await checkoutsOf(t))[0]!.contact.courierPhone).toBeUndefined()
    expect(await run("91234 56789")).toMatchObject({ ok: true })
    const latest = (await checkoutsOf(t)).find((c) => c.status === "open")!
    expect(latest.contact.courierPhone).toBe("+919123456789")
  })

  test("collection is at a centre with an address, the main one by default", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])
    const run = (centre?: string) =>
      t.run((ctx) =>
        beginCheckoutAs(ctx, buyer, { fulfilment: "collection", centre })
      )

    // Dhemaji has no address on file yet; nowhere is not a centre.
    for (const centre of ["dhemaji", "nowhere"])
      expect(await run(centre)).toEqual({
        ok: false,
        reason: "invalid-input",
        field: "centre",
      })
    expect(await run()).toMatchObject({ ok: true })
    expect((await checkoutsOf(t))[0]!.pickupCentre).toBe("north-lakhimpur")
  })

  test("the address is remembered only when asked", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])
    const saved = () =>
      t.run(async (ctx) => (await ctx.db.get(buyer.id))?.savedDelivery)

    await begin(t, buyer, "delivery", ADDRESS)
    expect(await saved()).toBeNull()
    await t.run((ctx) =>
      beginCheckoutAs(ctx, buyer, {
        fulfilment: "delivery",
        address: { ...ADDRESS, landmark: "Near the Namghar" },
        saveAddress: true,
      })
    )
    expect(await saved()).toEqual({
      address: { ...ADDRESS, landmark: "Near the Namghar" },
    })
  })

  test("unknown, unpublished, demo and switched-off sets cannot be bought", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "unpublished", {}, { published: false })
    await bundle(t, "demo-only", {}, { sample: true })
    await bundle(t, "no-assamese", {}, { asAvailable: false })

    for (const lines of [
      [line("never-existed")],
      [line("unpublished")],
      [line("demo-only")],
      [line("no-assamese", "as")],
    ]) {
      await cart(t, buyer.id, lines)
      expect(await begin(t, buyer, "collection")).toEqual({
        ok: false,
        reason: "invalid-input",
        field: "items",
      })
      expect((await cartLinesOf(t, buyer.id)).length).toBe(1)
    }
    expect(await checkoutsOf(t)).toHaveLength(0)
  })

  test("an empty cart is refused, and nothing is written", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    expect(await begin(t, buyer, "collection")).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "cart",
    })
    expect(await checkoutsOf(t)).toHaveLength(0)
  })

  test("Pay again on the same cart reuses the attempt; a changed cart replaces it", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])

    const first = await begin(t, buyer, "collection")
    const again = await begin(t, buyer, "collection")
    expect(again).toEqual(first)
    expect(await checkoutsOf(t)).toHaveLength(1)

    await cart(t, buyer.id, [line("apsc-set", "en", 2)])
    const changed = await begin(t, buyer, "collection")
    expect(changed).toMatchObject({ ok: true, totalPaise: 89900 * 2 })
    const rows = await checkoutsOf(t)
    expect(rows.map((row) => row.status).sort()).toEqual(["open", "replaced"])
  })

  test("more than twenty new attempts an hour from one Person is refused", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc-set")
    const next = async (n: number) => {
      // A different cart each time, so no attempt is reused.
      await cart(t, buyer.id, [
        line("apsc-set", n % 2 ? "as" : "en", (n % 4) + 1),
      ])
      await t.run(async (ctx) => {
        for (const row of await ctx.db.query("checkouts").collect())
          await ctx.db.patch(row._id, { signature: `old-${row._id}` })
      })
      return begin(t, buyer, "collection")
    }
    for (let i = 0; i < 20; i++)
      expect(await next(i)).toMatchObject({ ok: true })
    expect(await next(20)).toEqual({ ok: false, reason: "rate-limited" })
  })

  test("a buyer without a name is asked for one first", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await t.run((ctx) => ctx.db.patch(buyer.id, { name: "  " }))
    await bundle(t, "apsc-set")
    await cart(t, buyer.id, [line("apsc-set")])
    expect(await begin(t, buyer, "collection")).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "name",
    })
  })
})

describe("order rules ICT set", () => {
  test("parcels go anywhere in India, priced by zone; collection is open to anyone", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc")
    await t.run((ctx) =>
      ctx.db.insert("siteSettings", {
        ...DEFAULT_SETTINGS,
        shippingPaise: 6000,
        shippingIndiaPaise: 12000,
        revision: 0,
      })
    )
    await cart(t, buyer.id, [line("apsc")])
    // Not an Indian PIN (9 is the Army Post Office).
    expect(
      await begin(t, buyer, "delivery", { ...ADDRESS, pin: "900001" })
    ).toEqual({ ok: false, reason: "invalid-input", field: "pin-area" })
    const assam = await begin(t, buyer, "delivery", {
      ...ADDRESS,
      pin: "787001",
    })
    const delhi = await begin(t, buyer, "delivery", {
      ...ADDRESS,
      pin: "110001",
    })
    // The North East has no rate of its own here: it charges Assam's.
    const shillong = await begin(t, buyer, "delivery", {
      ...ADDRESS,
      pin: "793001",
    })
    expect(assam).toMatchObject({ ok: true })
    expect(delhi).toMatchObject({ ok: true })
    expect(shillong).toMatchObject({ ok: true })
    if (!assam.ok || !delhi.ok || !shillong.ok) return
    expect(delhi.totalPaise - assam.totalPaise).toBe(6000)
    expect(shillong.totalPaise).toBe(assam.totalPaise)
    expect(await begin(t, buyer, "collection")).toMatchObject({ ok: true })
  })

  test("an order has no set cap: twenty sets across two lines check out", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await bundle(t, "apsc")
    await bundle(t, "adre")
    await cart(t, buyer.id, [line("apsc", "en", 12), line("adre", "as", 8)])
    expect(await begin(t, buyer, "collection")).toMatchObject({ ok: true })
  })
})

describe("the server cart", () => {
  test("a merge keeps every set: no order cap trims the older lines", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await cart(t, buyer.id, [line("apsc", "en", 3, 100)])
    await t.run((ctx) =>
      mergeCartAs(ctx, buyer.id, [line("adre", "as", 14, 200)])
    )
    expect(await cartLinesOf(t, buyer.id)).toEqual([
      line("apsc", "en", 3, 100),
      line("adre", "as", 14, 200),
    ])
  })

  test("merge is a union by set and language, and the newer write wins", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await cart(t, buyer.id, [
      line("apsc", "en", 2, 100),
      line("adre", "as", 1, 50),
    ])

    // The browser carried an older apsc, a newer adre, and the other language.
    const incoming = [
      line("apsc", "en", 1, 10),
      line("adre", "as", 2, 200),
      line("apsc", "as", 1, 5),
    ]
    expect(await t.run((ctx) => mergeCartAs(ctx, buyer.id, incoming))).toEqual({
      ok: true,
    })
    const merged = [
      line("apsc", "en", 2, 100),
      line("adre", "as", 2, 200),
      line("apsc", "as", 1, 5),
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
          line("a", "en", 4, 1),
          line("b", "en", 0, 1),
          line("a", "en", 500, 2),
        ])
      )
    ).toEqual({ ok: true })
    // 500 is a typo, not a buyer: the line stops at the guard.
    expect(await cartLinesOf(t, buyer.id)).toEqual([line("a", "en", 99, 2)])

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

    // Fractional quantities are refused. Large ones go in whole - there is
    // no order cap - up to the per-line typo guard.
    expect(await set("apsc", "en", 1.5)).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "quantity",
    })
    await set("apsc", "en", 55)
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.find((l) => l.language === "en")?.quantity).toBe(55)
    await set("apsc", "en", 1000)
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.find((l) => l.language === "en")?.quantity).toBe(99)

    // Another set still goes in beside a large line.
    expect(await set("adre", "en", 6)).toEqual({ ok: true })
    await set("adre", "en", 0)

    // Changing a line keeps it where it was in the cart.
    expect(lines.map((l) => l.language)).toEqual(["en", "as"])

    await set("apsc", "en", 0)
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.map((l) => l.language)).toEqual(["as"])
  })
})
