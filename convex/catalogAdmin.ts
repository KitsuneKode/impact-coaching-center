import { type Infer, v } from "convex/values"

import {
  BUNDLE_BOOKS_MAX,
  checkBook,
  checkBundle,
  checkResource,
  IMAGE_MAX_BYTES,
  LANGUAGES,
  RESOURCE_PAGES_MAX,
  SAMPLE_PAGES_MAX,
  type BookInput,
  type BundleInput,
  type ResourceInput,
} from "../lib/catalog"
import { recordAudit } from "./audit"
import {
  checkRevision,
  forbidden,
  hasGrant,
  invalidInput,
  missingRecord,
  mutationResult,
  requireGrant,
  type Viewer,
} from "./authz"
import type { Doc, Id } from "./_generated/dataModel"
import { mutation, type MutationCtx, query } from "./_generated/server"
import { PICTURE, pictureOf, picturesOf } from "./images"
import { PDF_MAX_BYTES, r2 } from "./files"
import {
  LOCALE,
  LOCALISED,
  PDF_DOCUMENT,
  RESOURCE_KIND,
  VARIANT,
} from "./schema"

/**
 * Catalogue editing for the owner and staff with the catalogue grant. Every
 * save carries the revision it was read at, so two tabs cannot silently
 * overwrite each other. Nothing here deletes; records are unpublished.
 */

type StorageId = Id<"_storage">

const EDITION_FIELDS = v.object({
  title: v.string(),
  subtitle: v.optional(v.string()),
  edition: v.string(),
  pages: v.number(),
})

const BOOK_FIELDS = v.object({
  slug: v.string(),
  exam: v.string(),
  description: v.optional(LOCALISED),
  contents: v.array(v.string()),
  editions: v.object({
    en: v.optional(EDITION_FIELDS),
    as: v.optional(EDITION_FIELDS),
  }),
})

/** Images per language, sent alongside the text fields. */
const EDITION_IMAGES = v.object({
  cover: v.optional(v.id("_storage")),
  samplePages: v.array(v.id("_storage")),
})
const BOOK_IMAGES = v.object({
  en: v.optional(EDITION_IMAGES),
  as: v.optional(EDITION_IMAGES),
})

const BUNDLE_FIELDS = v.object({
  slug: v.string(),
  exam: v.string(),
  title: LOCALISED,
  tagline: v.optional(LOCALISED),
  description: LOCALISED,
  variants: v.object({ en: VARIANT, as: VARIANT }),
  sortOrder: v.number(),
})

const RESOURCE_FIELDS = v.object({
  slug: v.string(),
  title: v.string(),
  exam: v.string(),
  kind: RESOURCE_KIND,
  language: v.optional(LOCALE),
  description: v.string(),
})

/**
 * A PDF the uploader says is in R2: the component's synced metadata must
 * agree it exists, is a PDF and is within the cap.
 */
async function pdfUploaded(ctx: MutationCtx, pdf: Infer<typeof PDF_DOCUMENT>) {
  if (pdf.pages < 1 || pdf.pages > 2000 || !pdf.name.trim()) return false
  const meta = await r2.getMetadata(ctx, pdf.key)
  if (!meta) return false
  if (meta.contentType && meta.contentType !== "application/pdf") return false
  return (meta.size ?? 0) > 0 && (meta.size ?? 0) <= PDF_MAX_BYTES
}

/** Every id is an uploaded image of a sensible size, and none repeats. */
async function allImages(ctx: MutationCtx, ids: readonly StorageId[]) {
  for (const id of ids) {
    const file = await ctx.db.system.get("_storage", id)
    if (!file?.contentType?.startsWith("image/")) return false
    if (file.size > IMAGE_MAX_BYTES) return false
  }
  return new Set(ids).size === ids.length
}

function bookFiles(book: Pick<Doc<"books">, "editions">): StorageId[] {
  return LANGUAGES.flatMap((language) => {
    const edition = book.editions[language]
    if (!edition) return []
    return [...(edition.cover ? [edition.cover] : []), ...edition.samplePages]
  })
}

type Owner = { table: "books" | "bundles" | "resources"; id: string }

/**
 * Whether a record other than `except` still points at this file. Admin-only
 * and over small tables, so the scan streams rather than collecting.
 */
async function referencedElsewhere(
  ctx: MutationCtx,
  id: StorageId,
  except?: Owner
) {
  const skip = (table: Owner["table"], docId: string) =>
    except?.table === table && except.id === docId
  for await (const book of ctx.db.query("books"))
    if (!skip("books", book._id) && bookFiles(book).includes(id)) return true
  for await (const bundle of ctx.db.query("bundles"))
    if (!skip("bundles", bundle._id) && bundle.cover === id) return true
  for await (const resource of ctx.db.query("resources"))
    if (!skip("resources", resource._id) && resource.pageImages.includes(id))
      return true
  /* Files other areas own: never this module's to delete. */
  for await (const course of ctx.db.query("courses"))
    if (course.cover === id) return true
  for await (const post of ctx.db.query("posts"))
    if (post.cover === id || post.body.includes(id)) return true
  for await (const campaign of ctx.db.query("campaigns"))
    if (campaign.image === id) return true
  return false
}

/** Delete a file and its size record. */
async function deleteFile(ctx: MutationCtx, id: StorageId) {
  const meta = await ctx.db
    .query("images")
    .withIndex("by_storageId", (q) => q.eq("storageId", id))
    .first()
  if (meta) await ctx.db.delete(meta._id)
  await ctx.storage.delete(id)
}

/** Delete files a save stopped pointing at, unless another record uses them. */
async function dropReplaced(
  ctx: MutationCtx,
  before: readonly StorageId[],
  after: readonly StorageId[],
  except: Owner
) {
  const kept = new Set(after)
  for (const id of before)
    if (!kept.has(id) && !(await referencedElsewhere(ctx, id, except)))
      await deleteFile(ctx, id)
}

/** A slug is taken only when a different row holds it. */
async function slugTaken(
  ctx: MutationCtx,
  table: "books" | "bundles" | "resources",
  slug: string,
  self?: string
) {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .take(2)
  return rows.some((row) => row._id !== self)
}

const canEdit = (viewer: Viewer) => hasGrant(viewer, "catalog")

export const canEditCatalog = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireGrant(ctx, "catalog")).ok,
})

/** Anyone whose edits show on the public pages, so may refresh them. */
export const canRefreshSite = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireGrant(ctx, ["catalog", "content"])).ok,
})

/** A signed URL the browser posts one file to. */
/** Anyone who edits something with pictures: the shop, promotions, the blog. */
const UPLOAD_GRANTS = ["catalog", "promotions", "content"] as const

export const uploadUrl = mutation({
  args: {},
  returns: mutationResult({ url: v.string() }),
  handler: async (ctx) => {
    const editor = await requireGrant(ctx, UPLOAD_GRANTS)
    if (!editor.ok) return editor
    return { ok: true as const, url: await ctx.storage.generateUploadUrl() }
  },
})

/** Take back an upload that was never saved. Referenced files are refused. */
export const discardUpload = mutation({
  args: { storageId: v.id("_storage") },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, UPLOAD_GRANTS)
    if (!editor.ok) return editor
    return applyDiscardUpload(ctx, args.storageId)
  },
})

/** The discard itself, split out so it can be tested without a session. */
export async function applyDiscardUpload(ctx: MutationCtx, id: StorageId) {
  if (await referencedElsewhere(ctx, id)) return invalidInput("image")
  await deleteFile(ctx, id)
  return { ok: true as const }
}

/** Lists stop here; the extra row tells the UI the list is truncated. */
const ADMIN_LIST_MAX = 500

/* ----------------------------------- books ----------------------------------- */

const ADMIN_EDITION = v.object({
  title: v.string(),
  subtitle: v.optional(v.string()),
  edition: v.string(),
  pages: v.number(),
  cover: v.union(
    v.object({ id: v.id("_storage"), picture: PICTURE }),
    v.null()
  ),
  samplePages: v.array(v.object({ id: v.id("_storage"), picture: PICTURE })),
})

export const adminBooks = query({
  args: {},
  returns: v.object({
    rows: v.array(
      v.object({
        id: v.id("books"),
        slug: v.string(),
        exam: v.string(),
        titles: v.object({
          en: v.optional(v.string()),
          as: v.optional(v.string()),
        }),
        cover: v.union(PICTURE, v.null()),
        sample: v.boolean(),
        revision: v.number(),
        updatedAt: v.number(),
      })
    ),
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    if (!(await requireGrant(ctx, "catalog")).ok)
      return { rows: [], truncated: false }
    const found = await ctx.db
      .query("books")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    const rows = await Promise.all(
      found.slice(0, ADMIN_LIST_MAX).map(async (b) => ({
        id: b._id,
        slug: b.slug,
        exam: b.exam,
        titles: { en: b.editions.en?.title, as: b.editions.as?.title },
        cover: await pictureOf(ctx, (b.editions.en ?? b.editions.as)?.cover),
        sample: b.sample ?? false,
        revision: b.revision,
        updatedAt: b.updatedAt,
      }))
    )
    return { rows, truncated: found.length > ADMIN_LIST_MAX }
  },
})

/** Takes the id from the URL as a string, so a mangled link is "not found". */
export const adminBook = query({
  args: { id: v.string() },
  returns: v.union(
    v.object({
      id: v.id("books"),
      slug: v.string(),
      exam: v.string(),
      description: v.optional(LOCALISED),
      contents: v.array(v.string()),
      editions: v.object({
        en: v.optional(ADMIN_EDITION),
        as: v.optional(ADMIN_EDITION),
      }),
      revision: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (!(await requireGrant(ctx, "catalog")).ok) return null
    const id = ctx.db.normalizeId("books", args.id)
    const book = id && (await ctx.db.get(id))
    if (!book) return null
    const withIds = async (ids: readonly StorageId[]) =>
      (
        await Promise.all(
          ids.map(async (id) => {
            const picture = await pictureOf(ctx, id)
            return picture ? { id, picture } : null
          })
        )
      ).filter((row) => row !== null)
    const editions: Record<string, Infer<typeof ADMIN_EDITION>> = {}
    for (const language of LANGUAGES) {
      const edition = book.editions[language]
      if (!edition) continue
      editions[language] = {
        title: edition.title,
        subtitle: edition.subtitle,
        edition: edition.edition,
        pages: edition.pages,
        cover: (await withIds(edition.cover ? [edition.cover] : []))[0] ?? null,
        samplePages: await withIds(edition.samplePages),
      }
    }
    return {
      id: book._id,
      slug: book.slug,
      exam: book.exam,
      description: book.description,
      contents: book.contents,
      editions,
      revision: book.revision,
    }
  },
})

export const saveBook = mutation({
  args: {
    id: v.optional(v.id("books")),
    expectedRevision: v.optional(v.number()),
    fields: BOOK_FIELDS,
    images: BOOK_IMAGES,
  },
  returns: mutationResult({ id: v.id("books"), revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    return applySaveBook(ctx, editor.value, args)
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
    images: Infer<typeof BOOK_IMAGES>
  }
) {
  if (!canEdit(viewer)) return forbidden
  const checked = checkBook(args.fields)
  if (!checked.ok) return invalidInput(checked.field)

  const editions: Doc<"books">["editions"] = {}
  for (const language of LANGUAGES) {
    const text = checked.value.editions[language]
    const images = args.images[language] ?? { samplePages: [] }
    if (!text) {
      if (images.cover || images.samplePages.length)
        return invalidInput(`${language}.images`)
      continue
    }
    if (images.samplePages.length > SAMPLE_PAGES_MAX)
      return invalidInput(`${language}.samplePages`)
    const files = [
      ...(images.cover ? [images.cover] : []),
      ...images.samplePages,
    ]
    if (!(await allImages(ctx, files)))
      return invalidInput(`${language}.images`)
    editions[language] = {
      ...text,
      cover: images.cover,
      samplePages: images.samplePages,
    }
  }
  if (await slugTaken(ctx, "books", checked.value.slug, args.id))
    return invalidInput("slug-taken")

  const record = {
    slug: checked.value.slug,
    exam: checked.value.exam,
    description: checked.value.description,
    contents: checked.value.contents,
    editions,
  }
  const now = Date.now()
  if (!args.id) {
    const id = await ctx.db.insert("books", {
      ...record,
      revision: 0,
      updatedAt: now,
    })
    await recordAudit(ctx, viewer, {
      action: "save",
      entity: "book",
      entityId: id,
      summary: `Added book “${titleOf(record)}”.`,
    })
    return { ok: true as const, id, revision: 0 }
  }

  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision ?? -1)
  if (conflict) return conflict

  await dropReplaced(ctx, bookFiles(current), bookFiles(record), {
    table: "books",
    id: args.id,
  })
  const revision = current.revision + 1
  await ctx.db.replace(args.id, {
    ...record,
    sample: false,
    revision,
    updatedAt: now,
  })
  await recordAudit(ctx, viewer, {
    action: "save",
    entity: "book",
    entityId: args.id,
    summary: `Edited book “${titleOf(record)}”.`,
  })
  return { ok: true as const, id: args.id, revision }
}

const titleOf = (book: Pick<Doc<"books">, "editions">) =>
  book.editions.en?.title ?? book.editions.as?.title ?? ""

/* ---------------------------------- bundles ---------------------------------- */

export const adminBundles = query({
  args: {},
  returns: v.object({
    rows: v.array(
      v.object({
        id: v.id("bundles"),
        slug: v.string(),
        exam: v.string(),
        title: LOCALISED,
        cover: v.union(PICTURE, v.null()),
        variants: v.object({ en: VARIANT, as: VARIANT }),
        books: v.number(),
        soldCount: v.number(),
        soldOffline: v.optional(v.number()),
        sortOrder: v.number(),
        published: v.boolean(),
        sample: v.boolean(),
        revision: v.number(),
        updatedAt: v.number(),
      })
    ),
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    if (!(await requireGrant(ctx, "catalog")).ok)
      return { rows: [], truncated: false }
    const found = await ctx.db.query("bundles").take(ADMIN_LIST_MAX + 1)
    const rows = await Promise.all(
      found.slice(0, ADMIN_LIST_MAX).map(async (b) => ({
        id: b._id,
        slug: b.slug,
        exam: b.exam,
        title: b.title,
        cover: await pictureOf(ctx, b.cover),
        variants: b.variants,
        books: b.bookIds.length,
        soldCount: b.soldCount,
        soldOffline: b.soldOffline,
        sortOrder: b.sortOrder,
        published: b.published,
        sample: b.sample ?? false,
        revision: b.revision,
        updatedAt: b.updatedAt,
      }))
    )
    rows.sort((a, b) => a.sortOrder - b.sortOrder)
    return { rows, truncated: found.length > ADMIN_LIST_MAX }
  },
})

export const adminBundle = query({
  args: { id: v.string() },
  returns: v.union(
    v.object({
      id: v.id("bundles"),
      slug: v.string(),
      exam: v.string(),
      title: LOCALISED,
      tagline: v.optional(LOCALISED),
      description: LOCALISED,
      variants: v.object({ en: VARIANT, as: VARIANT }),
      sortOrder: v.number(),
      cover: v.union(
        v.object({ id: v.id("_storage"), picture: PICTURE }),
        v.null()
      ),
      bookIds: v.array(v.id("books")),
      published: v.boolean(),
      soldCount: v.number(),
      soldOffline: v.optional(v.number()),
      revision: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (!(await requireGrant(ctx, "catalog")).ok) return null
    const id = ctx.db.normalizeId("bundles", args.id)
    const b = id && (await ctx.db.get(id))
    if (!b) return null
    const cover = b.cover ? await pictureOf(ctx, b.cover) : null
    return {
      id: b._id,
      slug: b.slug,
      exam: b.exam,
      title: b.title,
      tagline: b.tagline,
      description: b.description,
      variants: b.variants,
      sortOrder: b.sortOrder,
      cover: b.cover && cover ? { id: b.cover, picture: cover } : null,
      bookIds: b.bookIds,
      published: b.published,
      soldCount: b.soldCount,
      soldOffline: b.soldOffline,
      revision: b.revision,
    }
  },
})

export const saveBundle = mutation({
  args: {
    id: v.optional(v.id("bundles")),
    expectedRevision: v.optional(v.number()),
    fields: BUNDLE_FIELDS,
    bookIds: v.array(v.id("books")),
    cover: v.optional(v.id("_storage")),
  },
  returns: mutationResult({ id: v.id("bundles"), revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    return applySaveBundle(ctx, editor.value, args)
  },
})

export async function applySaveBundle(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    id?: Id<"bundles">
    expectedRevision?: number
    fields: BundleInput
    bookIds: Id<"books">[]
    cover?: StorageId
  }
) {
  if (!canEdit(viewer)) return forbidden
  const checked = checkBundle(args.fields)
  if (!checked.ok) return invalidInput(checked.field)
  if (
    args.bookIds.length > BUNDLE_BOOKS_MAX ||
    new Set(args.bookIds).size !== args.bookIds.length
  )
    return invalidInput("books")
  for (const bookId of args.bookIds)
    if (!(await ctx.db.get(bookId))) return invalidInput("books")
  if (args.cover && !(await allImages(ctx, [args.cover])))
    return invalidInput("cover")
  if (await slugTaken(ctx, "bundles", checked.value.slug, args.id))
    return invalidInput("slug-taken")

  const record = { ...checked.value, bookIds: args.bookIds, cover: args.cover }
  const now = Date.now()
  if (!args.id) {
    const id = await ctx.db.insert("bundles", {
      ...record,
      soldCount: 0,
      published: false,
      revision: 0,
      updatedAt: now,
    })
    await recordAudit(ctx, viewer, {
      action: "save",
      entity: "bundle",
      entityId: id,
      summary: `Added bundle “${record.title.en}”.`,
    })
    return { ok: true as const, id, revision: 0 }
  }

  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision ?? -1)
  if (conflict) return conflict
  // A live bundle with nothing in it is a broken product page.
  if (current.published && record.bookIds.length === 0)
    return invalidInput("books")

  await dropReplaced(
    ctx,
    current.cover ? [current.cover] : [],
    record.cover ? [record.cover] : [],
    { table: "bundles", id: args.id }
  )
  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    ...record,
    sample: false,
    revision,
    updatedAt: now,
  })
  await recordAudit(ctx, viewer, {
    action: "save",
    entity: "bundle",
    entityId: args.id,
    summary: `Edited bundle “${record.title.en}”.`,
  })
  return { ok: true as const, id: args.id, revision }
}

/**
 * Flip one language on or off without opening the editor: the everyday
 * "out of print" switch.
 */
export const setVariantAvailable = mutation({
  args: {
    id: v.id("bundles"),
    language: LOCALE,
    available: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    const current = await ctx.db.get(args.id)
    if (!current) return missingRecord
    const conflict = checkRevision(current, args.expectedRevision)
    if (conflict) return conflict
    const revision = current.revision + 1
    await ctx.db.patch(args.id, {
      variants: {
        ...current.variants,
        [args.language]: {
          ...current.variants[args.language],
          available: args.available,
        },
      },
      revision,
      updatedAt: Date.now(),
    })
    await recordAudit(ctx, editor.value, {
      action: "save",
      entity: "bundle",
      entityId: args.id,
      summary: `${args.language === "as" ? "Assamese" : "English"} set of “${current.title.en}” ${args.available ? "available" : "unavailable"}.`,
    })
    return { ok: true as const, revision }
  },
})

/**
 * Copies sold at the centre, which no online order records. A counter like
 * soldCount, so it does not bump the editor's revision.
 */
export const setBundleSoldOffline = mutation({
  args: { id: v.id("bundles"), soldOffline: v.number() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    if (
      !Number.isInteger(args.soldOffline) ||
      args.soldOffline < 0 ||
      args.soldOffline > 100_000
    )
      return invalidInput("soldOffline")
    const current = await ctx.db.get(args.id)
    if (!current) return missingRecord
    await ctx.db.patch(args.id, { soldOffline: args.soldOffline })
    await recordAudit(ctx, editor.value, {
      action: "save",
      entity: "bundle",
      entityId: args.id,
      summary: `Copies of “${current.title.en}” sold at the centre set to ${args.soldOffline}.`,
    })
    return { ok: true as const }
  },
})

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
        language: v.optional(LOCALE),
        pages: v.number(),
        pdf: v.boolean(),
        published: v.boolean(),
        sample: v.boolean(),
        revision: v.number(),
        updatedAt: v.number(),
      })
    ),
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    if (!(await requireGrant(ctx, "catalog")).ok)
      return { rows: [], truncated: false }
    const found = await ctx.db
      .query("resources")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    return {
      truncated: found.length > ADMIN_LIST_MAX,
      rows: found.slice(0, ADMIN_LIST_MAX).map((r) => ({
        id: r._id,
        slug: r.slug,
        title: r.title,
        exam: r.exam,
        kind: r.kind,
        language: r.language,
        pages: r.pdf?.pages ?? r.pageImages.length,
        pdf: Boolean(r.pdf),
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
      id: v.id("resources"),
      slug: v.string(),
      title: v.string(),
      exam: v.string(),
      kind: RESOURCE_KIND,
      language: v.optional(LOCALE),
      description: v.string(),
      published: v.boolean(),
      revision: v.number(),
      pageImages: v.array(v.object({ id: v.id("_storage"), picture: PICTURE })),
      pdf: v.optional(PDF_DOCUMENT),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (!(await requireGrant(ctx, "catalog")).ok) return null
    const id = ctx.db.normalizeId("resources", args.id)
    const r = id && (await ctx.db.get(id))
    if (!r) return null
    const pictures = await picturesOf(ctx, r.pageImages)
    return {
      id: r._id,
      slug: r.slug,
      title: r.title,
      exam: r.exam,
      kind: r.kind,
      language: r.language,
      description: r.description,
      published: r.published,
      revision: r.revision,
      // picturesOf drops missing files, so pair by position only when whole.
      pageImages:
        pictures.length === r.pageImages.length
          ? r.pageImages.map((id, i) => ({ id, picture: pictures[i]! }))
          : [],
      pdf: r.pdf,
    }
  },
})

export const saveResource = mutation({
  args: {
    id: v.optional(v.id("resources")),
    expectedRevision: v.optional(v.number()),
    fields: RESOURCE_FIELDS,
    pageImages: v.optional(v.array(v.id("_storage"))),
    /** A PDF uploaded to R2, or null to remove the current one. */
    pdf: v.optional(v.union(PDF_DOCUMENT, v.null())),
  },
  returns: mutationResult({ id: v.id("resources"), revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    return applySaveResource(ctx, editor.value, args)
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
    pdf?: Infer<typeof PDF_DOCUMENT> | null
  }
) {
  if (!canEdit(viewer)) return forbidden
  const checked = checkResource(args.fields)
  if (!checked.ok) return invalidInput(checked.field)
  if (
    args.pageImages &&
    (args.pageImages.length > RESOURCE_PAGES_MAX ||
      !(await allImages(ctx, args.pageImages)))
  )
    return invalidInput("pages")
  if (args.pdf && !(await pdfUploaded(ctx, args.pdf)))
    return invalidInput("pdf")
  if (await slugTaken(ctx, "resources", checked.value.slug, args.id))
    return invalidInput("slug-taken")

  const now = Date.now()
  if (!args.id) {
    const id = await ctx.db.insert("resources", {
      ...checked.value,
      pageImages: args.pageImages ?? [],
      ...(args.pdf ? { pdf: args.pdf } : {}),
      published: false,
      revision: 0,
      updatedAt: now,
    })
    await recordAudit(ctx, viewer, {
      action: "save",
      entity: "resource",
      entityId: id,
      summary: `Added resource “${checked.value.title}”.`,
    })
    return { ok: true as const, id, revision: 0 }
  }

  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision ?? -1)
  if (conflict) return conflict
  // Refused before old pages are dropped, so the live copy stays intact.
  const nextPages = args.pageImages ?? current.pageImages
  const nextPdf = args.pdf === undefined ? current.pdf : args.pdf
  if (current.published && nextPages.length === 0 && !nextPdf)
    return invalidInput("pages")
  // A replaced or removed PDF is deleted from R2 once nothing points at it.
  if (
    args.pdf !== undefined &&
    current.pdf &&
    current.pdf.key !== args.pdf?.key
  )
    await r2.deleteObject(ctx, current.pdf.key)
  if (args.pageImages)
    await dropReplaced(ctx, current.pageImages, args.pageImages, {
      table: "resources",
      id: args.id,
    })

  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    ...checked.value,
    ...(args.pageImages ? { pageImages: args.pageImages } : {}),
    ...(args.pdf !== undefined ? { pdf: args.pdf ?? undefined } : {}),
    sample: false,
    revision,
    updatedAt: now,
  })
  await recordAudit(ctx, viewer, {
    action: "save",
    entity: "resource",
    entityId: args.id,
    summary: `Edited resource “${checked.value.title}”.`,
  })
  return { ok: true as const, id: args.id, revision }
}

/* ------------------------------- publishing ------------------------------- */

/** The publish flip for bundles and resources, with one guard and one audit row. */
export async function applyPublish(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    entity: "bundle" | "resource"
    id: string
    published: boolean
    expectedRevision: number
  }
) {
  if (!canEdit(viewer)) return forbidden
  const id =
    args.entity === "bundle"
      ? ctx.db.normalizeId("bundles", args.id)
      : ctx.db.normalizeId("resources", args.id)
  const current = id ? await ctx.db.get(id) : null
  if (!id || !current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision)
  if (conflict) return conflict
  // Publishing an empty bundle or reader is a public broken page.
  if (args.published) {
    if ("bookIds" in current && current.bookIds.length === 0)
      return invalidInput("books")
    if (
      "pageImages" in current &&
      current.pageImages.length === 0 &&
      !current.pdf
    )
      return invalidInput("pages")
  }

  const revision = current.revision + 1
  await ctx.db.patch(id, {
    published: args.published,
    revision,
    updatedAt: Date.now(),
  })
  const name =
    "title" in current && typeof current.title === "object"
      ? current.title.en
      : (current as Doc<"resources">).title
  await recordAudit(ctx, viewer, {
    action: args.published ? "publish" : "unpublish",
    entity: args.entity,
    entityId: id,
    summary: `${args.published ? "Published" : "Unpublished"} ${args.entity} “${name}”.`,
    from: current.published ? "published" : "draft",
    to: args.published ? "published" : "draft",
  })
  return { ok: true as const, revision }
}

export const setBundlePublished = mutation({
  args: {
    id: v.id("bundles"),
    published: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    return applyPublish(ctx, editor.value, { entity: "bundle", ...args })
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
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    return applyPublish(ctx, editor.value, { entity: "resource", ...args })
  },
})
