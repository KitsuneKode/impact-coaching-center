import { v } from "convex/values"

import { checkBook, checkResource } from "../lib/catalog"
import {
  checkRevision,
  invalidInput,
  missingRecord,
  mutationResult,
  requireOwner,
} from "./authz"
import { mutation, query } from "./_generated/server"
import { BOOK_TONE, RESOURCE_KIND } from "./schema"

/**
 * Owner-only catalogue editing (launch plan decision 6: the owner alone edits
 * catalogue). Every save carries the revision it was read at, so two tabs
 * cannot silently overwrite each other; nothing here deletes, it unpublishes.
 */

const BOOK_FIELDS = {
  slug: v.string(),
  title: v.string(),
  subtitle: v.string(),
  exam: v.string(),
  edition: v.string(),
  pages: v.number(),
  pricePaise: v.number(),
  tone: BOOK_TONE,
  description: v.string(),
  contents: v.array(v.string()),
}

const RESOURCE_FIELDS = {
  slug: v.string(),
  title: v.string(),
  exam: v.string(),
  kind: RESOURCE_KIND,
  description: v.string(),
}

const IMAGE = v.object({
  id: v.id("_storage"),
  url: v.union(v.string(), v.null()),
})

export const canEditCatalog = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireOwner(ctx)).ok,
})

/** A signed URL the browser posts one file to; the owner only. */
export const uploadUrl = mutation({
  args: {},
  returns: mutationResult({ url: v.string() }),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    return { ok: true as const, url: await ctx.storage.generateUploadUrl() }
  },
})

/* ----------------------------------- books ----------------------------------- */

export const adminBooks = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("books"),
      slug: v.string(),
      title: v.string(),
      exam: v.string(),
      pricePaise: v.number(),
      published: v.boolean(),
      sample: v.boolean(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    if (!(await requireOwner(ctx)).ok) return []
    const rows = await ctx.db.query("books").order("desc").take(500)
    return rows.map((b) => ({
      id: b._id,
      slug: b.slug,
      title: b.title,
      exam: b.exam,
      pricePaise: b.pricePaise,
      published: b.published,
      sample: b.sample ?? false,
      updatedAt: b.updatedAt,
    }))
  },
})

export const adminBook = query({
  args: { id: v.id("books") },
  returns: v.union(
    v.object({
      ...BOOK_FIELDS,
      id: v.id("books"),
      published: v.boolean(),
      revision: v.number(),
      cover: v.union(IMAGE, v.null()),
      samplePages: v.array(IMAGE),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (!(await requireOwner(ctx)).ok) return null
    const b = await ctx.db.get(args.id)
    if (!b) return null
    return {
      id: b._id,
      slug: b.slug,
      title: b.title,
      subtitle: b.subtitle,
      exam: b.exam,
      edition: b.edition,
      pages: b.pages,
      pricePaise: b.pricePaise,
      tone: b.tone,
      description: b.description,
      contents: b.contents,
      published: b.published,
      revision: b.revision,
      cover: b.cover
        ? { id: b.cover, url: await ctx.storage.getUrl(b.cover) }
        : null,
      samplePages: await Promise.all(
        b.samplePages.map(async (id) => ({
          id,
          url: await ctx.storage.getUrl(id),
        }))
      ),
    }
  },
})

/** Create (no id) or update (id + expectedRevision) a book. */
export const saveBook = mutation({
  args: {
    id: v.optional(v.id("books")),
    expectedRevision: v.optional(v.number()),
    fields: v.object(BOOK_FIELDS),
    cover: v.optional(v.union(v.id("_storage"), v.null())),
    samplePages: v.optional(v.array(v.id("_storage"))),
  },
  returns: mutationResult({ id: v.id("books"), revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    const checked = checkBook(args.fields)
    if (!checked.ok) return invalidInput(checked.field)

    const clash = await ctx.db
      .query("books")
      .withIndex("by_slug", (q) => q.eq("slug", checked.value.slug))
      .unique()
    if (clash && clash._id !== args.id) return invalidInput("slug-taken")

    const now = Date.now()
    if (!args.id) {
      const id = await ctx.db.insert("books", {
        ...checked.value,
        cover: args.cover ?? undefined,
        samplePages: args.samplePages ?? [],
        published: false,
        revision: 0,
        updatedAt: now,
      })
      return { ok: true as const, id, revision: 0 }
    }

    const current = await ctx.db.get(args.id)
    if (!current) return missingRecord
    const conflict = checkRevision(current, args.expectedRevision ?? -1)
    if (conflict) return conflict
    const revision = current.revision + 1
    await ctx.db.patch(args.id, {
      ...checked.value,
      ...(args.cover !== undefined ? { cover: args.cover ?? undefined } : {}),
      ...(args.samplePages ? { samplePages: args.samplePages } : {}),
      sample: false,
      revision,
      updatedAt: now,
    })
    return { ok: true as const, id: args.id, revision }
  },
})

export const setBookPublished = mutation({
  args: {
    id: v.id("books"),
    published: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    const current = await ctx.db.get(args.id)
    if (!current) return missingRecord
    const conflict = checkRevision(current, args.expectedRevision)
    if (conflict) return conflict
    const revision = current.revision + 1
    await ctx.db.patch(args.id, {
      published: args.published,
      revision,
      updatedAt: Date.now(),
    })
    return { ok: true as const, revision }
  },
})

/* --------------------------------- resources --------------------------------- */

export const adminResources = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("resources"),
      slug: v.string(),
      title: v.string(),
      exam: v.string(),
      kind: RESOURCE_KIND,
      pages: v.number(),
      published: v.boolean(),
      sample: v.boolean(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    if (!(await requireOwner(ctx)).ok) return []
    const rows = await ctx.db.query("resources").order("desc").take(500)
    return rows.map((r) => ({
      id: r._id,
      slug: r.slug,
      title: r.title,
      exam: r.exam,
      kind: r.kind,
      pages: r.pageImages.length,
      published: r.published,
      sample: r.sample ?? false,
      updatedAt: r.updatedAt,
    }))
  },
})

export const adminResource = query({
  args: { id: v.id("resources") },
  returns: v.union(
    v.object({
      ...RESOURCE_FIELDS,
      id: v.id("resources"),
      published: v.boolean(),
      revision: v.number(),
      pageImages: v.array(IMAGE),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (!(await requireOwner(ctx)).ok) return null
    const r = await ctx.db.get(args.id)
    if (!r) return null
    return {
      id: r._id,
      slug: r.slug,
      title: r.title,
      exam: r.exam,
      kind: r.kind,
      description: r.description,
      published: r.published,
      revision: r.revision,
      pageImages: await Promise.all(
        r.pageImages.map(async (id) => ({
          id,
          url: await ctx.storage.getUrl(id),
        }))
      ),
    }
  },
})

export const saveResource = mutation({
  args: {
    id: v.optional(v.id("resources")),
    expectedRevision: v.optional(v.number()),
    fields: v.object(RESOURCE_FIELDS),
    pageImages: v.optional(v.array(v.id("_storage"))),
  },
  returns: mutationResult({ id: v.id("resources"), revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    const checked = checkResource(args.fields)
    if (!checked.ok) return invalidInput(checked.field)

    const clash = await ctx.db
      .query("resources")
      .withIndex("by_slug", (q) => q.eq("slug", checked.value.slug))
      .unique()
    if (clash && clash._id !== args.id) return invalidInput("slug-taken")

    const now = Date.now()
    if (!args.id) {
      const id = await ctx.db.insert("resources", {
        ...checked.value,
        pageImages: args.pageImages ?? [],
        published: false,
        revision: 0,
        updatedAt: now,
      })
      return { ok: true as const, id, revision: 0 }
    }

    const current = await ctx.db.get(args.id)
    if (!current) return missingRecord
    const conflict = checkRevision(current, args.expectedRevision ?? -1)
    if (conflict) return conflict
    const revision = current.revision + 1
    await ctx.db.patch(args.id, {
      ...checked.value,
      ...(args.pageImages ? { pageImages: args.pageImages } : {}),
      sample: false,
      revision,
      updatedAt: now,
    })
    return { ok: true as const, id: args.id, revision }
  },
})

export const setResourcePublished = mutation({
  args: {
    id: v.id("resources"),
    published: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    const current = await ctx.db.get(args.id)
    if (!current) return missingRecord
    const conflict = checkRevision(current, args.expectedRevision)
    if (conflict) return conflict
    const revision = current.revision + 1
    await ctx.db.patch(args.id, {
      published: args.published,
      revision,
      updatedAt: Date.now(),
    })
    return { ok: true as const, revision }
  },
})
