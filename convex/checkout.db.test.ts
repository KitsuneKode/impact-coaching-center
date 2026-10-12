import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { mergeCartAs, setCartLineAs } from "./carts"
import { placeOrderAs } from "./checkout"
import { DELIVERY_CHARGE_PAISE } from "../lib/checkout"
import { findVerifiedPerson } from "./persons"
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

async function book(
  t: T,
  slug: string,
  pricePaise: number,
  {
    published = true,
    sample = false,
  }: { published?: boolean; sample?: boolean } = {}
) {
  return t.run((ctx) =>
    ctx.db.insert("books", {
      slug,
      title: `Book ${slug}`,
      subtitle: "",
      exam: "APSC",
      edition: "2026",
      pages: 100,
      pricePaise,
      tone: "muted",
      description: "",
      contents: [],
      samplePages: [],
      published,
      sample,
      revision: 0,
      updatedAt: 0,
    })
  )
}

async function cart(
  t: T,
  personId: Id<"persons">,
  lines: { slug: string; quantity: number; at: number }[]
) {
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
const ordersOf = (t: T) => t.run((ctx) => ctx.db.query("orders").collect())
const activitiesOf = (t: T) =>
  t.run(async (ctx) =>
    (await ctx.db.query("activities").collect()).filter(
      (a) => a.kind === "order_placed"
    )
  )
type CartLine = { slug: string; quantity: number; at: number }
const cartLinesOf = (t: T, personId: Id<"persons">): Promise<CartLine[]> =>
  t.run(async (ctx) => {
    const row = (await ctx.db.query("carts").collect()).find(
      (c) => c.personId === personId
    )
    return row?.lines ?? []
  })

describe("placeOrder", () => {
  test("prices from the books table, writes the snapshot, clears the cart", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await book(t, "assam-gk", 19900)
    await book(t, "polity-notes", 24900)
    await cart(t, buyer.id, [
      { slug: "assam-gk", quantity: 2, at: 1 },
      { slug: "polity-notes", quantity: 1, at: 2 },
    ])

    const result = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "delivery",
        address: ADDRESS,
        idempotencyKey: "key-1",
      })
    )
    expect(result).toMatchObject({ ok: true })
    if (!result.ok) return
    expect(result.totalPaise).toBe(19900 * 2 + 24900 + DELIVERY_CHARGE_PAISE)
    expect(result.reference).toMatch(/^ICT-[0-9A-HJKMNP-TV-Z]{5}$/)

    const [order] = await ordersOf(t)
    expect(order).toMatchObject({
      personId: buyer.id,
      reference: result.reference,
      status: "awaiting_payment",
      fulfilment: "delivery",
      deliveryPaise: DELIVERY_CHARGE_PAISE,
      totalPaise: result.totalPaise,
      idempotencyKey: "key-1",
      address: ADDRESS,
    })
    // Prices on the order are the stored ones, line by line.
    expect(order?.items).toEqual([
      {
        title: "Book assam-gk",
        edition: "2026",
        quantity: 2,
        unitPaise: 19900,
      },
      {
        title: "Book polity-notes",
        edition: "2026",
        quantity: 1,
        unitPaise: 24900,
      },
    ])
    expect(order?.itemsPaise).toBe(19900 * 2 + 24900)

    // The cart is empty afterwards: a placed order does not order twice.
    expect(await cartLinesOf(t, buyer.id)).toEqual([])

    const [activity] = await activitiesOf(t)
    expect(activity).toMatchObject({
      personId: buyer.id,
      actorId: buyer.id,
      kind: "order_placed",
    })
    expect(activity?.body).toContain(result.reference)
  })

  test("collection takes no delivery charge and no address", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await book(t, "assam-gk", 19900)
    await cart(t, buyer.id, [{ slug: "assam-gk", quantity: 1, at: 1 }])

    const result = await t.run((ctx) =>
      placeOrderAs(ctx, buyer, {
        fulfilment: "collection",
        idempotencyKey: "key-1",
      })
    )
    expect(result).toMatchObject({ ok: true, totalPaise: 19900 })

    const [order] = await ordersOf(t)
    expect(order?.deliveryPaise).toBe(0)
    expect(order?.address).toBeUndefined()

    // An address on a collection is refused rather than quietly stored.
    await cart(t, buyer.id, [{ slug: "assam-gk", quantity: 1, at: 2 }])
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
    await book(t, "assam-gk", 19900)
    await cart(t, buyer.id, [{ slug: "assam-gk", quantity: 1, at: 1 }])

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

  test("unavailable, unpublished and demo books cannot be ordered", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await book(t, "unpublished", 10000, { published: false })
    await book(t, "demo-only", 10000, { sample: true })
    let key = 0

    for (const lines of [
      [{ slug: "never-existed", quantity: 1, at: 1 }],
      [{ slug: "unpublished", quantity: 1, at: 1 }],
      [{ slug: "demo-only", quantity: 1, at: 1 }],
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
      // A refused order must not eat the cart - the shopper still owns it.
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
    await book(t, "assam-gk", 19900)
    await cart(t, buyer.id, [{ slug: "assam-gk", quantity: 1, at: 1 }])

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
    await book(t, "assam-gk", 19900)

    let key = 0
    const next = async () => {
      await cart(t, buyer.id, [{ slug: "assam-gk", quantity: 1, at: key }])
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
  test("merge is a union by slug, and the newer write wins", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!
    await cart(t, buyer.id, [
      { slug: "assam-gk", quantity: 3, at: 100 },
      { slug: "polity", quantity: 1, at: 50 },
    ])

    // Browser carried an older assam-gk and a newer polity plus a new title.
    const result = await t.run((ctx) =>
      mergeCartAs(ctx, buyer.id, [
        { slug: "assam-gk", quantity: 1, at: 10 },
        { slug: "polity", quantity: 5, at: 200 },
        { slug: "history", quantity: 2, at: 5 },
      ])
    )
    expect(result).toEqual({ ok: true })
    expect(await cartLinesOf(t, buyer.id)).toEqual([
      { slug: "assam-gk", quantity: 3, at: 100 },
      { slug: "polity", quantity: 5, at: 200 },
      { slug: "history", quantity: 2, at: 5 },
    ])

    // Replaying the same merge is a no-op.
    await t.run((ctx) =>
      mergeCartAs(ctx, buyer.id, [
        { slug: "assam-gk", quantity: 1, at: 10 },
        { slug: "polity", quantity: 5, at: 200 },
        { slug: "history", quantity: 2, at: 5 },
      ])
    )
    expect(await cartLinesOf(t, buyer.id)).toEqual([
      { slug: "assam-gk", quantity: 3, at: 100 },
      { slug: "polity", quantity: 5, at: 200 },
      { slug: "history", quantity: 2, at: 5 },
    ])
  })

  test("merge cleans: clamps, drops non-positive, caps the line count", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!

    expect(
      await t.run((ctx) =>
        mergeCartAs(ctx, buyer.id, [
          { slug: "a", quantity: 99, at: 1 },
          { slug: "b", quantity: 0, at: 1 },
          { slug: "a", quantity: 4, at: 2 },
        ])
      )
    ).toEqual({ ok: true })
    // Clamped to the cap, newest duplicate wins, zeros never stored.
    expect(await cartLinesOf(t, buyer.id)).toEqual([
      { slug: "a", quantity: 4, at: 2 },
    ])

    // A cart bigger than a shelf is a client bug, not a shopper.
    const flood = Array.from({ length: 51 }, (_, i) => ({
      slug: `book-${i}`,
      quantity: 1,
      at: 1,
    }))
    expect(await t.run((ctx) => mergeCartAs(ctx, buyer.id, flood))).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "lines",
    })
  })

  test("setCartLine sets the absolute quantity and removes at zero", async () => {
    const t = convexTest(schema, modules)
    const buyer = (await viewer(t, "+919876543210"))!

    await t.run((ctx) => setCartLineAs(ctx, buyer.id, "assam-gk", 3))
    await t.run((ctx) => setCartLineAs(ctx, buyer.id, "polity", 1))
    let lines = await cartLinesOf(t, buyer.id)
    expect(lines.map((l) => [l.slug, l.quantity]).sort()).toEqual([
      ["assam-gk", 3],
      ["polity", 1],
    ])

    // Fractional and oversized quantities are rejected/clamped, not trusted.
    expect(
      await t.run((ctx) => setCartLineAs(ctx, buyer.id, "assam-gk", 1.5))
    ).toEqual({ ok: false, reason: "invalid-input", field: "quantity" })
    await t.run((ctx) => setCartLineAs(ctx, buyer.id, "assam-gk", 55))
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.find((l) => l.slug === "assam-gk")?.quantity).toBe(10)

    await t.run((ctx) => setCartLineAs(ctx, buyer.id, "assam-gk", 0))
    lines = await cartLinesOf(t, buyer.id)
    expect(lines.map((l) => l.slug)).toEqual(["polity"])
  })
})
