import { v } from "convex/values"

import {
  checkBook,
  checkResource,
  IMAGE_MAX_BYTES,
  RESOURCE_PAGES_MAX,
  SAMPLE_PAGES_MAX,
  type BookInput,
  type ResourceInput,
} from "../lib/catalog"
import {
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  requireOwner,
  type Viewer,
} from "./authz"
import type { Id } from "./_generated/dataModel"
import { mutation, type MutationCtx, query } from "./_generated/server"
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

type StorageId = Id<"_storage">

/** Every id is an uploaded image of a sensible size. */
async function allImages(ctx: MutationCtx, ids: readonly StorageId[]) {
  for (const id of ids) {
    const file = await ctx.db.system.get("_storage", id)
    if (!file?.contentType?.startsWith("image/")) return false
    if (file.size > IMAGE_MAX_BYTES) return false
  }
  return new Set(ids).size === ids.length
}

/**
 * Whether a record other than the one being saved still points at this file.
 * The editor uploads per field, so nothing shipped stops a console write or a
 * future caller attaching one image to two records - deleting it on one
 * record's save would 404 the other's cover with no error anywhere.
 */
async function referencedElsewhere(
  ctx: MutationCtx,
  id: StorageId,
  except?: { table: "books" | "resources"; id: string }
) {
  const skip = (table: string, docId: string) =>
    except?.table === table && except.id === docId
  for (const book of await ctx.db.query("books").collect())
    if (
      !skip("books", book._id) &&
      (book.cover === id || book.samplePages.includes(id))
    )
      return true
  for (const resource of await ctx.db.query("resources").collect())
    if (!skip("resources", resource._id) && resource.pageImages.includes(id))
      return true
  return false
}

/** Delete files a save stopped pointing at, so replaced images do not pile up. */
async function dropReplaced(
  ctx: MutationCtx,
  before: readonly StorageId[],
  after: readonly StorageId[],
  except: { table: "books" | "resources"; id: string }
) {
  const kept = new Set(after)
  for (const id of before)
    if (!kept.has(id) && !(await referencedElsewhere(ctx, id, except)))
      await ctx.storage.delete(id)
}

/**
 * The audit row a catalogue write leaves behind - same transaction, actor and
 * structured fields populated, like every other privileged write.
 */
async function recordCatalog(
  ctx: MutationCtx,
  actor: Viewer,
  entry: {
    kind: "catalog_save" | "catalog_publish"
    entity: "book" | "resource"
    entityId: Id<"books"> | Id<"resources">
    body: string
    fromStatus?: "draft" | "published"
    toStatus?: "draft" | "published"
  }
) {
  await ctx.db.insert("activities", {
    kind: entry.kind,
    body: entry.body,
    actorId: actor.id,
    entity: entry.entity,
    entityId: entry.entityId,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
  })
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

/**
 * Delete an upload no record points at - how the editor takes back an image
 * it uploaded but never saved. Files a record references are refused.
 */
export const discardUpload = mutation({
  args: { storageId: v.id("_storage") },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    if (await referencedElsewhere(ctx, args.storageId))
      return invalidInput("image")
    await ctx.storage.delete(args.storageId)
    return { ok: true as const }
  },
})

/* ----------------------------------- books ----------------------------------- */

/**
 * Lists are capped so a forgetful query cannot read the whole table. The 501st
 * row is the tell: it exists, the list is truncated, and the UI says so rather
 * than quietly dropping the newest records.
 */
const ADMIN_LIST_MAX = 500

export const adminBooks = query({
  args: {},
  returns: v.object({
    rows: v.array(
      v.object({
        id: v.id("books"),
        slug: v.string(),
        title: v.string(),
        exam: v.string(),
        pricePaise: v.number(),
        coverUrl: v.union(v.string(), v.null()),
        published: v.boolean(),
        sample: v.boolean(),
        revision: v.number(),
        updatedAt: v.number(),
      })
    ),
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    const empty = { rows: [], truncated: false }
    if (!(await requireOwner(ctx)).ok) return empty
    const found = await ctx.db
      .query("books")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    const truncated = found.length > ADMIN_LIST_MAX
    const rows = await Promise.all(
      found.slice(0, ADMIN_LIST_MAX).map(async (b) => ({
        id: b._id,
        slug: b.slug,
        title: b.title,
        exam: b.exam,
        pricePaise: b.pricePaise,
        coverUrl: b.cover ? await ctx.storage.getUrl(b.cover) : null,
        published: b.published,
        sample: b.sample ?? false,
        revision: b.revision,
        updatedAt: b.updatedAt,
      }))
    )
    return { rows, truncated }
  },
})

/** Takes the id from the URL as a string, so a mangled link is "not found". */
export const adminBook = query({
  args: { id: v.string() },
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
    const id = ctx.db.normalizeId("books", args.id)
    const b = id && (await ctx.db.get(id))
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
    return applySaveBook(ctx, owner.value, args)
  },
})

/** The save itself, split out so it can be tested without a session. */
export async function applySaveBook(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    id?: Id<"books">
    expectedRevision?: number
    fields: BookInput
    cover?: StorageId | null
    samplePages?: StorageId[]
  }
) {
  if (viewer.role !== "owner") return forbidden
  const checked = checkBook(args.fields)
  if (!checked.ok) return invalidInput(checked.field)
  if (args.cover && !(await allImages(ctx, [args.cover])))
    return invalidInput("cover")
  if (
    args.samplePages &&
    (args.samplePages.length > SAMPLE_PAGES_MAX ||
      !(await allImages(ctx, args.samplePages)))
  )
    return invalidInput("sample pages")

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
    await recordCatalog(ctx, viewer, {
      kind: "catalog_save",
      entity: "book",
      entityId: id,
      body: `Added book “${checked.value.title}”.`,
    })
    return { ok: true as const, id, revision: 0 }
  }

  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision ?? -1)
  if (conflict) return conflict

  const except = { table: "books" as const, id: args.id }
  if (args.cover !== undefined)
    await dropReplaced(
      ctx,
      current.cover ? [current.cover] : [],
      args.cover ? [args.cover] : [],
      except
    )
  if (args.samplePages)
    await dropReplaced(ctx, current.samplePages, args.samplePages, except)

  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    ...checked.value,
    ...(args.cover !== undefined ? { cover: args.cover ?? undefined } : {}),
    ...(args.samplePages ? { samplePages: args.samplePages } : {}),
    sample: false,
    revision,
    updatedAt: now,
  })
  await recordCatalog(ctx, viewer, {
    kind: "catalog_save",
    entity: "book",
    entityId: args.id,
    body: `Edited book “${checked.value.title}”.`,
  })
  return { ok: true as const, id: args.id, revision }
}

/* --------------------------------- resources --------------------------------- */

export const adminResources = query({
  args: {},
  returns: v.object({
    rows: v.array(
      v.object({
        id: v.id("resources"),
        slug: v.string(),
        title: v.string(),
        exam: v.string(),
        kind: RESOURCE_KIND,
        pages: v.number(),
        published: v.boolean(),
        sample: v.boolean(),
        revision: v.number(),
        updatedAt: v.number(),
      })
    ),
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    const empty = { rows: [], truncated: false }
    if (!(await requireOwner(ctx)).ok) return empty
    const found = await ctx.db
      .query("resources")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    const truncated = found.length > ADMIN_LIST_MAX
    return {
      truncated,
      rows: found.slice(0, ADMIN_LIST_MAX).map((r) => ({
        id: r._id,
        slug: r.slug,
        title: r.title,
        exam: r.exam,
        kind: r.kind,
        pages: r.pageImages.length,
        published: r.published,
        sample: r.sample ?? false,
        revision: r.revision,
        updatedAt: r.updatedAt,
      })),
    }
  },
})

export const adminResource = query({
  args: { id: v.string() },
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
    const id = ctx.db.normalizeId("resources", args.id)
    const r = id && (await ctx.db.get(id))
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
    return applySaveResource(ctx, owner.value, args)
  },
})

export async function applySaveResource(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    id?: Id<"resources">
    expectedRevision?: number
    fields: ResourceInput
    pageImages?: StorageId[]
  }
) {
  if (viewer.role !== "owner") return forbidden
  const checked = checkResource(args.fields)
  if (!checked.ok) return invalidInput(checked.field)
  if (
    args.pageImages &&
    (args.pageImages.length > RESOURCE_PAGES_MAX ||
      !(await allImages(ctx, args.pageImages)))
  )
    return invalidInput("pages")

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
    await recordCatalog(ctx, viewer, {
      kind: "catalog_save",
      entity: "resource",
      entityId: id,
      body: `Added resource “${checked.value.title}”.`,
    })
    return { ok: true as const, id, revision: 0 }
  }

  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision ?? -1)
  if (conflict) return conflict
  if (args.pageImages)
    await dropReplaced(ctx, current.pageImages, args.pageImages, {
      table: "resources",
      id: args.id,
    })

  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    ...checked.value,
    ...(args.pageImages ? { pageImages: args.pageImages } : {}),
    sample: false,
    revision,
    updatedAt: now,
  })
  await recordCatalog(ctx, viewer, {
    kind: "catalog_save",
    entity: "resource",
    entityId: args.id,
    body: `Edited resource “${checked.value.title}”.`,
  })
  return { ok: true as const, id: args.id, revision }
}

/* ------------------------------- publishing ------------------------------- */

/**
 * The publish flip, shared by books and resources so the guard and the audit
 * row cannot drift apart. Split out so it can be tested without a session.
 */
export async function applyPublish(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    entity: "book" | "resource"
    id: string
    published: boolean
    expectedRevision: number
  }
) {
  if (viewer.role !== "owner") return forbidden
  /* Split so the id stays single-table typed for the record's entity field. */
  const id =
    args.entity === "book"
      ? ctx.db.normalizeId("books", args.id)
      : ctx.db.normalizeId("resources", args.id)
  const current = id ? await ctx.db.get(id) : null
  if (!id || !current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision)
  if (conflict) return conflict
  /*
   * A resource with no pages publishes an empty reader behind the login gate -
   * one wrong click turns into a public broken state. The server refuses it
   * rather than trusting the button to be disabled.
   */
  if (
    args.entity === "resource" &&
    args.published &&
    "pageImages" in current &&
    current.pageImages.length === 0
  )
    return invalidInput("pages")

  const revision = current.revision + 1
  await ctx.db.patch(id, {
    published: args.published,
    revision,
    updatedAt: Date.now(),
  })
  await recordCatalog(ctx, viewer, {
    kind: "catalog_publish",
    entity: args.entity,
    entityId: id,
    body: `${args.published ? "Published" : "Unpublished"} ${args.entity} “${current.title}”.`,
    fromStatus: current.published ? "published" : "draft",
    toStatus: args.published ? "published" : "draft",
  })
  return { ok: true as const, revision }
}

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
    return applyPublish(ctx, owner.value, { entity: "book", ...args })
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
    return applyPublish(ctx, owner.value, { entity: "resource", ...args })
  },
})
