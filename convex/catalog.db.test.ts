import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import type { BookInput, BundleInput } from "../lib/catalog"
import { openResourceAs } from "./catalog"
import {
  applyDiscardUpload,
  applyPublish,
  applySaveBook,
  applySaveBundle,
  applySaveResource,
} from "./catalogAdmin"
import { findVerifiedPerson } from "./persons"
import { internal } from "./_generated/api"
import schema from "./schema"

/** The resource gate and the catalogue editors. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>

/** A Person as the session would resolve them, or null if it would not. */
async function viewer(
  t: T,
  phone: string,
  role: "student" | "staff" | "owner",
  { verified = true }: { verified?: boolean } = {}
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) =>
    ctx.db.patch(id, { role, ...(verified ? {} : { verifiedAt: undefined }) })
  )
  return t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
}

async function resource(t: T, published = true) {
  return t.run((ctx) =>
    ctx.db.insert("resources", {
      slug: "polity-notes",
      title: "Polity notes",
      exam: "APSC",
      kind: "Notes",
      description: "",
      pageImages: [],
      published,
      revision: 0,
      updatedAt: 0,
    })
  )
}

/**
 * A stored file with the content type a real upload records. convex-test's
 * `storage.store` leaves it out, so the fixture sets it.
 */
async function upload(t: T, type: string, body = "x") {
  return t.run(async (ctx) => {
    const id = await ctx.storage.store(new Blob([body], { type }))
    // oxlint-disable-next-line typescript/no-explicit-any -- test-only write to a system table
    await (ctx.db as any).patch(id, { contentType: type })
    return id
  })
}

const opensOf = (t: T) =>
  t.run((ctx) => ctx.db.query("resourceOpens").collect())
const readsOf = (t: T) =>
  t.run(async (ctx) =>
    (await ctx.db.query("activities").collect()).filter(
      (a) => a.kind === "resource_open"
    )
  )

describe("openResource", () => {
  test("an unverified Person is refused and nothing is recorded", async () => {
    const t = convexTest(schema, modules)
    await resource(t)
    const unverified = await viewer(t, "+919876543210", "student", {
      verified: false,
    })
    expect(unverified).toBeNull()

    const result = await t.run((ctx) =>
      openResourceAs(ctx, unverified, "polity-notes")
    )
    expect(result).toEqual({ ok: false, reason: "anonymous" })
    expect(await opensOf(t)).toHaveLength(0)
    expect(await readsOf(t)).toHaveLength(0)
  })

  test("a verified Person reads it, and the first open is recorded once", async () => {
    const t = convexTest(schema, modules)
    await resource(t)
    const student = await viewer(t, "+919876543210", "student")

    const first = await t.run((ctx) =>
      openResourceAs(ctx, student, "polity-notes")
    )
    const second = await t.run((ctx) =>
      openResourceAs(ctx, student, "polity-notes")
    )
    expect(first).toMatchObject({ ok: true, title: "Polity notes" })
    expect(second).toMatchObject({ ok: true })

    expect(await opensOf(t)).toHaveLength(1)
    const reads = await readsOf(t)
    expect(reads).toHaveLength(1)
    expect(reads[0]).toMatchObject({
      personId: student!.id,
      body: "Polity notes",
    })
  })

  test("reading does not make someone a lead", async () => {
    const t = convexTest(schema, modules)
    await resource(t)
    const student = await viewer(t, "+919876543210", "student")
    await t.run((ctx) => openResourceAs(ctx, student, "polity-notes"))
    const person = await t.run((ctx) => ctx.db.get(student!.id))
    expect(person?.leadStatus).toBeUndefined()
  })

  test("an unpublished resource is missing, even to a verified Person", async () => {
    const t = convexTest(schema, modules)
    await resource(t, false)
    const student = await viewer(t, "+919876543210", "student")
    expect(
      await t.run((ctx) => openResourceAs(ctx, student, "polity-notes"))
    ).toEqual({ ok: false, reason: "missing-record" })
    expect(await opensOf(t)).toHaveLength(0)
  })
})

const fields: BookInput = {
  slug: "assam-gk-capsule",
  exam: "APSC",
  contents: [],
  editions: {
    en: { title: "Assam GK Capsule", edition: "2026", pages: 120 },
    as: { title: "অসমৰ সাধাৰণ জ্ঞান", edition: "২০২৬", pages: 120 },
  },
}
const noImages = {}

const booksIn = (t: T) => t.run((ctx) => ctx.db.query("books").collect())
const auditOf = (t: T, action: "save" | "publish") =>
  t.run(async (ctx) =>
    (await ctx.db.query("auditLog").collect()).filter(
      (row) => row.action === action
    )
  )

async function staffWith(t: T, phone: string, grants: "catalog"[]) {
  const who = await viewer(t, phone, "staff")
  await t.run((ctx) => ctx.db.patch(who!.id, { grants }))
  return { ...who!, grants }
}

describe("saveBook", () => {
  test("staff need the catalogue grant; students never edit", async () => {
    const t = convexTest(schema, modules)
    const staff = await viewer(t, "+919876543210", "staff")
    const student = await viewer(t, "+919876543211", "student")

    for (const who of [staff!, student!])
      expect(
        await t.run((ctx) =>
          applySaveBook(ctx, who, { fields, images: noImages })
        )
      ).toEqual({ ok: false, reason: "forbidden" })
    expect(await booksIn(t)).toHaveLength(0)

    const granted = await staffWith(t, "+919876543212", ["catalog"])
    expect(
      await t.run((ctx) =>
        applySaveBook(ctx, granted, { fields, images: noImages })
      )
    ).toMatchObject({ ok: true, revision: 0 })
  })

  test("an owner creates a book with both language editions", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const result = await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, images: noImages })
    )
    expect(result).toMatchObject({ ok: true, revision: 0 })
    const [book] = await booksIn(t)
    expect(book.editions.en?.title).toBe("Assam GK Capsule")
    expect(book.editions.as?.title).toBe("অসমৰ সাধাৰণ জ্ঞান")
  })

  test("a book needs at least one edition", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    expect(
      await t.run((ctx) =>
        applySaveBook(ctx, owner!, {
          fields: { ...fields, editions: {} },
          images: noImages,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "editions" })
  })

  test("a save from a stale revision is refused and changes nothing", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const created = await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, images: noImages })
    )
    if (!created.ok) throw new Error("create failed")
    const titled = (title: string): BookInput => ({
      ...fields,
      editions: { en: { ...fields.editions.en!, title } },
    })

    // Tab A saves first; tab B still holds revision 0.
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields: titled("Tab A"),
        images: noImages,
      })
    )
    const stale = await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields: titled("Tab B"),
        images: noImages,
      })
    )
    expect(stale).toEqual({
      ok: false,
      reason: "revision-conflict",
      current: 1,
    })
    const [book] = await booksIn(t)
    expect(book.editions.en?.title).toBe("Tab A")
  })

  test("a slug another book already has is refused", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, images: noImages })
    )
    const second = await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, images: noImages })
    )
    expect(second).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "slug-taken",
    })
    expect(await booksIn(t)).toHaveLength(1)
  })

  test("covers must be uploaded images, and only for an edition that exists", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const pdf = await upload(t, "application/pdf")
    const png = await upload(t, "image/png")
    expect(
      await t.run((ctx) =>
        applySaveBook(ctx, owner!, {
          fields,
          images: { en: { cover: pdf, samplePages: [] } },
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "en.images" })
    expect(
      await t.run((ctx) =>
        applySaveBook(ctx, owner!, {
          fields: { ...fields, editions: { en: fields.editions.en } },
          images: { as: { cover: png, samplePages: [] } },
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "as.images" })
    expect(
      await t.run((ctx) =>
        applySaveBook(ctx, owner!, {
          fields,
          images: { en: { cover: png, samplePages: [] } },
        })
      )
    ).toMatchObject({ ok: true })
  })

  test("replacing a cover deletes the old file and its size record", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const first = await upload(t, "image/png", "a")
    const second = await upload(t, "image/png", "b")
    await t.run((ctx) =>
      ctx.db.insert("images", { storageId: first, width: 600, height: 800 })
    )
    const created = await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        fields,
        images: { en: { cover: first, samplePages: [] } },
      })
    )
    if (!created.ok) throw new Error("create failed")
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields,
        images: { en: { cover: second, samplePages: [] } },
      })
    )
    expect(await t.run((ctx) => ctx.storage.getUrl(first))).toBeNull()
    expect(await t.run((ctx) => ctx.storage.getUrl(second))).not.toBeNull()
    expect(await t.run((ctx) => ctx.db.query("images").collect())).toHaveLength(
      0
    )
  })

  test("a cover a bundle still uses survives the replace", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const shared = await upload(t, "image/png", "a")
    const fresh = await upload(t, "image/png", "b")
    const created = await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        fields,
        images: { en: { cover: shared, samplePages: [] } },
      })
    )
    if (!created.ok) throw new Error("create failed")
    await t.run((ctx) =>
      applySaveBundle(ctx, owner!, {
        fields: bundleFields,
        bookIds: [created.id],
        cover: shared,
      })
    )
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields,
        images: { en: { cover: fresh, samplePages: [] } },
      })
    )
    expect(await t.run((ctx) => ctx.storage.getUrl(shared))).not.toBeNull()
  })
})

const bundleFields: BundleInput = {
  slug: "apsc-foundation-set",
  exam: "APSC",
  title: { en: "APSC Foundation Set", as: "APSC ভেটি সংকলন" },
  description: { en: "Three books for APSC." },
  variants: {
    en: { pricePaise: 89900, comparePaise: 104700, available: true },
    as: { pricePaise: 84900, available: true },
  },
  sortOrder: 1,
}

async function book(
  t: T,
  owner: NonNullable<Awaited<ReturnType<typeof viewer>>>
) {
  const created = await t.run((ctx) =>
    applySaveBook(ctx, owner, { fields, images: noImages })
  )
  if (!created.ok) throw new Error("book failed")
  return created.id
}

describe("bundles", () => {
  test("a bundle holds known books, once each", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const bookId = await book(t, owner!)
    expect(
      await t.run((ctx) =>
        applySaveBundle(ctx, owner!, {
          fields: bundleFields,
          bookIds: [bookId, bookId],
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "books" })
    expect(
      await t.run((ctx) =>
        applySaveBundle(ctx, owner!, {
          fields: bundleFields,
          bookIds: [bookId],
        })
      )
    ).toMatchObject({ ok: true, revision: 0 })
  })

  test("a struck price must be above the price", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const result = await t.run((ctx) =>
      applySaveBundle(ctx, owner!, {
        fields: {
          ...bundleFields,
          variants: {
            ...bundleFields.variants,
            as: { pricePaise: 84900, comparePaise: 80000, available: true },
          },
        },
        bookIds: [],
      })
    )
    expect(result).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "as.comparePrice",
    })
  })

  test("an empty bundle cannot be published", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const created = await t.run((ctx) =>
      applySaveBundle(ctx, owner!, { fields: bundleFields, bookIds: [] })
    )
    if (!created.ok) throw new Error("create failed")
    expect(
      await t.run((ctx) =>
        applyPublish(ctx, owner!, {
          entity: "bundle",
          id: created.id,
          published: true,
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "books" })
  })
})

describe("catalogue audit trail", () => {
  test("saving a book writes an audit row naming the editor", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const created = await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, images: noImages })
    )
    if (!created.ok) throw new Error("create failed")

    const rows = await auditOf(t, "save")
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      actorId: owner!.id,
      entity: "book",
      entityId: created.id,
      summary: "Added book “Assam GK Capsule”.",
    })
  })

  test("publishing a bundle writes the flip", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const bookId = await book(t, owner!)
    const created = await t.run((ctx) =>
      applySaveBundle(ctx, owner!, { fields: bundleFields, bookIds: [bookId] })
    )
    if (!created.ok) throw new Error("create failed")

    await t.run((ctx) =>
      applyPublish(ctx, owner!, {
        entity: "bundle",
        id: created.id,
        published: true,
        expectedRevision: 0,
      })
    )
    const rows = await auditOf(t, "publish")
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      actorId: owner!.id,
      entity: "bundle",
      entityId: created.id,
      from: "draft",
      to: "published",
    })
  })

  test("a resource with no pages refuses to publish", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const id = await resource(t, false)

    const result = await t.run((ctx) =>
      applyPublish(ctx, owner!, {
        entity: "resource",
        id,
        published: true,
        expectedRevision: 0,
      })
    )
    expect(result).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "pages",
    })
    const doc = await t.run((ctx) => ctx.db.get(id))
    expect(doc?.published).toBe(false)
  })

  test("emptying a published resource's pages is refused, not saved", async () => {
    /* The other door into an empty reader: publish is guarded, but a save
       used to be able to strip every page off a live resource. */
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const image = await upload(t, "image/webp")
    const id = await t.run((ctx) =>
      ctx.db.insert("resources", {
        slug: "polity-notes",
        title: "Polity notes",
        exam: "APSC",
        kind: "Notes",
        description: "",
        pageImages: [image],
        published: true,
        revision: 0,
        updatedAt: 0,
      })
    )

    const result = await t.run((ctx) =>
      applySaveResource(ctx, owner!, {
        id,
        expectedRevision: 0,
        fields: {
          slug: "polity-notes",
          title: "Polity notes",
          exam: "APSC",
          kind: "Notes",
          description: "",
        },
        pageImages: [],
      })
    )
    expect(result).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "pages",
    })
    // The live copy is untouched: still published, still holding its page.
    const doc = await t.run((ctx) => ctx.db.get(id))
    expect(doc?.published).toBe(true)
    expect(doc?.pageImages).toEqual([image])

    // The same save on an unpublished draft is fine - drafts can be empty.
    const draft = await resource(t, false)
    expect(
      await t.run((ctx) =>
        applySaveResource(ctx, owner!, {
          id: draft,
          expectedRevision: 0,
          fields: {
            slug: "polity-notes-draft",
            title: "Draft",
            exam: "APSC",
            kind: "Notes",
            description: "",
          },
          pageImages: [],
        })
      )
    ).toMatchObject({ ok: true })
  })
})

describe("discardUpload", () => {
  test("an upload nothing uses is deleted", async () => {
    const t = convexTest(schema, modules)
    const orphan = await upload(t, "image/png")
    const result = await t.run((ctx) => applyDiscardUpload(ctx, orphan))
    expect(result.ok).toBe(true)
    expect(
      await t.run((ctx) => ctx.db.system.get("_storage", orphan))
    ).toBeNull()
  })

  test("a file a promotion, a course or a post uses is refused and kept", async () => {
    const t = convexTest(schema, modules)
    const promo = await upload(t, "image/png")
    const course = await upload(t, "image/png")
    const post = await upload(t, "image/png")
    await t.run(async (ctx) => {
      await ctx.db.insert("campaigns", {
        name: "Free workshop",
        kind: "modal",
        tag: "",
        headline: "Start with a free workshop.",
        body: "Two days, on the app.",
        cta: "Join",
        href: "/contact",
        coupon: "",
        reelIds: [],
        routes: [],
        delaySeconds: 0,
        restDays: 7,
        priority: 10,
        image: promo,
        status: "live",
        revision: 0,
        updatedAt: 0,
      })
      await ctx.db.insert("courses", {
        classplusId: 1,
        slug: "lakhya-2027",
        source: {
          name: "Lakhya 2027",
          description: "",
          pricePaise: 0,
          finalPricePaise: 0,
          free: false,
          enrolled: 0,
          tags: [],
        },
        cover: course,
        local: { hidden: false },
        syncedAt: 0,
        revision: 0,
      })
      await ctx.db.insert("posts", {
        slug: "notice",
        title: "Notice",
        excerpt: "",
        body: "Text.",
        cover: post,
        published: true,
        publishedAt: 1,
        revision: 0,
        updatedAt: 1,
      })
    })
    for (const id of [promo, course, post]) {
      const result = await t.run((ctx) => applyDiscardUpload(ctx, id))
      expect(result).toMatchObject({ ok: false, reason: "invalid-input" })
      expect(
        await t.run((ctx) => ctx.db.system.get("_storage", id))
      ).not.toBeNull()
    }
  })
})
