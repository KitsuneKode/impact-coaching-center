import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import type { BookInput } from "../lib/catalog"
import { openResourceAs } from "./catalog"
import { applyPublish, applySaveBook, applySaveResource } from "./catalogAdmin"
import { findVerifiedPerson } from "./persons"
import { internal } from "./_generated/api"
import schema from "./schema"

/** The resource gate and the owner's book editor. */
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
  title: "Assam GK Capsule",
  subtitle: "",
  exam: "APSC",
  edition: "2026",
  pages: 120,
  pricePaise: 19900,
  tone: "muted",
  description: "",
  contents: [],
}

const booksIn = (t: T) => t.run((ctx) => ctx.db.query("books").collect())

describe("saveBook", () => {
  test("only an owner can save", async () => {
    const t = convexTest(schema, modules)
    const staff = await viewer(t, "+919876543210", "staff")
    const student = await viewer(t, "+919876543211", "student")

    for (const who of [staff!, student!])
      expect(await t.run((ctx) => applySaveBook(ctx, who, { fields }))).toEqual(
        { ok: false, reason: "forbidden" }
      )
    expect(await booksIn(t)).toHaveLength(0)
  })

  test("an owner creates an unpublished book at revision 0", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const result = await t.run((ctx) => applySaveBook(ctx, owner!, { fields }))
    expect(result).toMatchObject({ ok: true, revision: 0 })
    const [book] = await booksIn(t)
    expect(book).toMatchObject({ published: false, pricePaise: 19900 })
  })

  test("a save from a stale revision is refused and changes nothing", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const created = await t.run((ctx) => applySaveBook(ctx, owner!, { fields }))
    if (!created.ok) throw new Error("create failed")

    // Tab A saves first; tab B still holds revision 0.
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields: { ...fields, title: "Tab A" },
      })
    )
    const stale = await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields: { ...fields, title: "Tab B" },
      })
    )
    expect(stale).toEqual({
      ok: false,
      reason: "revision-conflict",
      current: 1,
    })
    const [book] = await booksIn(t)
    expect(book.title).toBe("Tab A")
  })

  test("a slug another book already has is refused", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    await t.run((ctx) => applySaveBook(ctx, owner!, { fields }))
    const second = await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        fields: { ...fields, title: "Another book" },
      })
    )
    expect(second).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "slug-taken",
    })
    expect(await booksIn(t)).toHaveLength(1)
  })

  test("a cover must be an uploaded image", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const pdf = await upload(t, "application/pdf")
    const png = await upload(t, "image/png")
    expect(
      await t.run((ctx) => applySaveBook(ctx, owner!, { fields, cover: pdf }))
    ).toEqual({ ok: false, reason: "invalid-input", field: "cover" })
    expect(
      await t.run((ctx) => applySaveBook(ctx, owner!, { fields, cover: png }))
    ).toMatchObject({ ok: true })
  })

  test("replacing a cover deletes the old file", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const first = await upload(t, "image/png", "a")
    const second = await upload(t, "image/png", "b")
    const created = await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, cover: first })
    )
    if (!created.ok) throw new Error("create failed")
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields,
        cover: second,
      })
    )
    expect(await t.run((ctx) => ctx.storage.getUrl(first))).toBeNull()
    expect(await t.run((ctx) => ctx.storage.getUrl(second))).not.toBeNull()
  })

  test("a cover another book still uses survives the replace", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const shared = await upload(t, "image/png", "a")
    const fresh = await upload(t, "image/png", "b")
    const created = await t.run((ctx) =>
      applySaveBook(ctx, owner!, { fields, cover: shared })
    )
    if (!created.ok) throw new Error("create failed")
    /* A console write or future caller pointed a second book at the file. */
    await t.run((ctx) =>
      ctx.db.insert("books", {
        ...fields,
        slug: "other-title",
        cover: shared,
        samplePages: [],
        published: false,
        revision: 0,
        updatedAt: 0,
      })
    )
    await t.run((ctx) =>
      applySaveBook(ctx, owner!, {
        id: created.id,
        expectedRevision: 0,
        fields,
        cover: fresh,
      })
    )
    expect(await t.run((ctx) => ctx.storage.getUrl(shared))).not.toBeNull()
  })
})

describe("catalogue audit trail", () => {
  test("saving a book writes a catalog_save row naming the owner", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const created = await t.run((ctx) => applySaveBook(ctx, owner!, { fields }))
    if (!created.ok) throw new Error("create failed")

    const rows = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_kind", (q) => q.eq("kind", "catalog_save"))
        .collect()
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      actorId: owner!.id,
      entity: "book",
      entityId: created.id,
      body: "Added book “Assam GK Capsule”.",
    })
    /* Catalogue rows are about a record, not a Person. */
    expect(rows[0].personId).toBeUndefined()
  })

  test("publishing a book writes a catalog_publish row with the flip", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876543210", "owner")
    const created = await t.run((ctx) => applySaveBook(ctx, owner!, { fields }))
    if (!created.ok) throw new Error("create failed")

    await t.run((ctx) =>
      applyPublish(ctx, owner!, {
        entity: "book",
        id: created.id,
        published: true,
        expectedRevision: 0,
      })
    )
    const rows = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_kind", (q) => q.eq("kind", "catalog_publish"))
        .collect()
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      actorId: owner!.id,
      entity: "book",
      entityId: created.id,
      fromStatus: "draft",
      toStatus: "published",
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
