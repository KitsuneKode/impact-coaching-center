import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { readPublishedPost, readPublishedPosts } from "./blog"
import { applyPostPublished, applySavePost } from "./blogAdmin"
import { internal } from "./_generated/api"
import { findVerifiedPerson } from "./persons"
import schema from "./schema"

/** The owner-edited blog and its public face. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>

/** A Person as the session would resolve them. */
async function viewer(
  t: T,
  phone: string,
  role: "student" | "staff" | "owner"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  return t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
}

const fields = {
  slug: "prelims-dates",
  title: "Prelims dates to remember",
  excerpt: "The dates the 2027 cycle turns on.",
  body: "The commission publishes its calendar in January.\n\n## What changes\n\nEverything after the notification.",
  language: "en" as const,
}

describe("editing posts", () => {
  test("only the owner saves a post; staff and students are refused", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const staff = await viewer(t, "+919876700002", "staff")
    const student = await viewer(t, "+919876700003", "student")
    expect(await t.run((ctx) => applySavePost(ctx, owner!, fields))).toEqual(
      expect.objectContaining({ ok: true, revision: 0 })
    )
    expect(
      await t.run((ctx) =>
        applySavePost(ctx, staff!, { ...fields, slug: "other" })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
    expect(
      await t.run((ctx) =>
        applySavePost(ctx, student!, { ...fields, slug: "third" })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
  })

  test("a second post cannot take a slug already in use", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const first = await t.run((ctx) => applySavePost(ctx, owner!, fields))
    if (!first.ok) throw new Error("expected a saved post")
    const clash = await t.run((ctx) =>
      applySavePost(ctx, owner!, { ...fields, title: "Another post" })
    )
    expect(clash).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "slug-taken",
    })
    // Saving the same row under its own slug is not a clash.
    const again = await t.run((ctx) =>
      applySavePost(ctx, owner!, {
        id: first.id,
        expectedRevision: 0,
        ...fields,
      })
    )
    expect(again).toEqual({ ok: true, id: first.id, revision: 1 })
  })

  test("a stale edit is refused with the current revision", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const created = await t.run((ctx) => applySavePost(ctx, owner!, fields))
    if (!created.ok) throw new Error("expected a saved post")
    const stale = await t.run((ctx) =>
      applySavePost(ctx, owner!, {
        id: created.id,
        expectedRevision: 4,
        ...fields,
        title: "Edited elsewhere",
      })
    )
    expect(stale).toEqual({
      ok: false,
      reason: "revision-conflict",
      current: 0,
    })
  })

  test("saves and publishes write the audit row", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const created = await t.run((ctx) => applySavePost(ctx, owner!, fields))
    if (!created.ok) throw new Error("expected a saved post")
    await t.run((ctx) =>
      applyPostPublished(ctx, owner!, {
        id: created.id,
        published: true,
        expectedRevision: 0,
      })
    )
    const rows = await t.run((ctx) =>
      ctx.db
        .query("auditLog")
        .withIndex("by_action", (q) => q.eq("action", "publish"))
        .collect()
    )
    expect(rows[0]).toMatchObject({
      actorId: owner!.id,
      entity: "post",
      entityId: created.id,
      from: "draft",
      to: "published",
    })
  })
})

describe("the public read", () => {
  test("drafts are invisible to the list and the page", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    await t.run((ctx) => applySavePost(ctx, owner!, fields))
    expect(await t.run((ctx) => readPublishedPosts(ctx))).toEqual([])
    expect(await t.run((ctx) => readPublishedPost(ctx, fields.slug))).toBeNull()
  })

  test("publishing sets publishedAt once, and the post appears", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const created = await t.run((ctx) => applySavePost(ctx, owner!, fields))
    if (!created.ok) throw new Error("expected a saved post")

    const first = await t.run((ctx) =>
      applyPostPublished(
        ctx,
        owner!,
        { id: created.id, published: true, expectedRevision: 0 },
        1000
      )
    )
    expect(first).toEqual({ ok: true, revision: 1 })
    let row = await t.run((ctx) => ctx.db.get(created.id))
    expect(row?.publishedAt).toBe(1000)

    // Unpublish and publish again: the first-published date stays.
    await t.run((ctx) =>
      applyPostPublished(
        ctx,
        owner!,
        { id: created.id, published: false, expectedRevision: 1 },
        2000
      )
    )
    await t.run((ctx) =>
      applyPostPublished(
        ctx,
        owner!,
        { id: created.id, published: true, expectedRevision: 2 },
        3000
      )
    )
    row = await t.run((ctx) => ctx.db.get(created.id))
    expect(row?.publishedAt).toBe(1000)

    const cards = await t.run((ctx) => readPublishedPosts(ctx))
    expect(cards.map((c) => c.slug)).toEqual([fields.slug])
    expect(JSON.stringify(cards[0])).not.toContain("commission publishes")
    const post = await t.run((ctx) => readPublishedPost(ctx, fields.slug))
    expect(post?.body).toContain("commission publishes")
  })
})

describe("post language", () => {
  test("a post saved in Assamese reads back as Assamese", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const created = await t.run((ctx) =>
      applySavePost(ctx, owner!, { ...fields, language: "as" })
    )
    if (!created.ok) throw new Error("expected a saved post")
    await t.run((ctx) =>
      applyPostPublished(ctx, owner!, {
        id: created.id,
        published: true,
        expectedRevision: 0,
      })
    )
    const [card] = await t.run((ctx) => readPublishedPosts(ctx))
    expect(card.language).toBe("as")
  })

  test("a post from before the field existed reads as English", async () => {
    const t = convexTest(schema, modules)
    await t.run((ctx) =>
      ctx.db.insert("posts", {
        slug: "older",
        title: "Older post",
        excerpt: "",
        body: "Text.",
        published: true,
        publishedAt: 1,
        revision: 0,
        updatedAt: 1,
      })
    )
    const post = await t.run((ctx) => readPublishedPost(ctx, "older"))
    expect(post?.language).toBe("en")
  })

  test("a save without a language keeps the post's current one", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const created = await t.run((ctx) =>
      applySavePost(ctx, owner!, { ...fields, language: "as" })
    )
    if (!created.ok) throw new Error("expected a saved post")
    const { language: _, ...older } = fields
    await t.run((ctx) =>
      applySavePost(ctx, owner!, {
        ...older,
        id: created.id,
        expectedRevision: 0,
        title: "Edited by an older editor",
      })
    )
    const row = await t.run((ctx) => ctx.db.get(created.id))
    expect(row?.language).toBe("as")
  })
})
