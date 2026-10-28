import { v } from "convex/values"

import { checkPost, type PostInput } from "../lib/blog"
import { POST_LANGUAGE } from "./blog"
import { recordAudit } from "./audit"
import {
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  hasGrant,
  requireGrant,
  type Viewer,
} from "./authz"
import type { Id } from "./_generated/dataModel"
import { mutation, type MutationCtx, query } from "./_generated/server"
import { PICTURE, pictureOf } from "./images"
import { IMAGE_MAX_BYTES } from "../lib/catalog"
import { tracks } from "../lib/brand"

/**
 * Owner-only post editing, mirroring catalogAdmin: every save carries the
 * revision it was read at, the audit row lands in the same transaction, and
 * nothing here deletes - it unpublishes.
 */

const POST_FIELDS = {
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  body: v.string(),
  language: POST_LANGUAGE,
}

/**
 * The audit row a post write leaves behind - same transaction, actor and
 * structured fields populated, like every other privileged write.
 */
async function recordPost(
  ctx: MutationCtx,
  actor: Viewer,
  entry: {
    kind: "post_save" | "post_publish"
    entityId: Id<"posts">
    body: string
    fromStatus?: "draft" | "published"
    toStatus?: "draft" | "published"
  }
) {
  await recordAudit(ctx, actor, {
    action:
      entry.kind === "post_save"
        ? "save"
        : entry.toStatus === "published"
          ? "publish"
          : "unpublish",
    entity: "post",
    entityId: entry.entityId,
    summary: entry.body,
    from: entry.fromStatus,
    to: entry.toStatus,
  })
}

/** Same cap as the catalogue lists; the 501st row is the tell. */
const ADMIN_LIST_MAX = 500

export const list = query({
  args: {},
  returns: v.object({
    rows: v.array(
      v.object({
        id: v.id("posts"),
        slug: v.string(),
        title: v.string(),
        excerpt: v.string(),
        language: POST_LANGUAGE,
        published: v.boolean(),
        publishedAt: v.optional(v.number()),
        revision: v.number(),
        updatedAt: v.number(),
      })
    ),
    truncated: v.boolean(),
  }),
  handler: async (ctx) => {
    const empty = { rows: [], truncated: false }
    if (!(await requireGrant(ctx, "content")).ok) return empty
    const found = await ctx.db
      .query("posts")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    const truncated = found.length > ADMIN_LIST_MAX
    return {
      truncated,
      rows: found.slice(0, ADMIN_LIST_MAX).map((row) => ({
        id: row._id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        language: row.language ?? "en",
        published: row.published,
        publishedAt: row.publishedAt,
        revision: row.revision,
        updatedAt: row.updatedAt,
      })),
    }
  },
})

/** Takes the id from the URL as a string, so a mangled link is "not found". */
export const get = query({
  args: { id: v.string() },
  returns: v.union(
    v.object({
      ...POST_FIELDS,
      id: v.id("posts"),
      published: v.boolean(),
      publishedAt: v.optional(v.number()),
      revision: v.number(),
      updatedAt: v.number(),
      cover: v.optional(v.id("_storage")),
      coverPicture: v.union(PICTURE, v.null()),
      exam: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (!(await requireGrant(ctx, "content")).ok) return null
    const id = ctx.db.normalizeId("posts", args.id)
    const row = id && (await ctx.db.get(id))
    if (!row) return null
    return {
      id: row._id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      language: row.language ?? "en",
      exam: row.exam,
      published: row.published,
      publishedAt: row.publishedAt,
      revision: row.revision,
      updatedAt: row.updatedAt,
      cover: row.cover,
      coverPicture: await pictureOf(ctx, row.cover),
    }
  },
})

/** Create (no id) or update (id + expectedRevision) a post. */
export const save = mutation({
  args: {
    id: v.optional(v.id("posts")),
    expectedRevision: v.optional(v.number()),
    ...POST_FIELDS,
    /* Optional so an editor from before the field keeps saving. */
    language: v.optional(POST_LANGUAGE),
    /** Absent removes the cover. */
    cover: v.optional(v.id("_storage")),
    /** The exam it is about; absent is a general post. */
    exam: v.optional(v.string()),
  },
  returns: mutationResult({ id: v.id("posts"), revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireGrant(ctx, "content")
    if (!owner.ok) return owner
    return applySavePost(ctx, owner.value, args)
  },
})

/** The save itself, split out so it can be tested without a session. */
export async function applySavePost(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    id?: Id<"posts">
    expectedRevision?: number
    slug: string
    title: string
    excerpt: string
    body: string
    /** Absent keeps the post's current language; a new post is English. */
    language?: PostInput["language"]
    cover?: Id<"_storage">
    exam?: string
  }
) {
  if (!hasGrant(viewer, "content")) return forbidden
  const kept = args.id ? (await ctx.db.get(args.id))?.language : undefined
  const fields: PostInput = {
    slug: args.slug,
    title: args.title,
    excerpt: args.excerpt,
    body: args.body,
    language: args.language ?? kept ?? "en",
  }
  const checked = checkPost(fields)
  if (!checked.ok) return invalidInput(checked.field)
  if (args.cover && !(await isImage(ctx, args.cover)))
    return invalidInput("cover")
  if (args.exam !== undefined && !tracks.some((t) => t.exam === args.exam))
    return invalidInput("exam")

  /* Same rule as saveBook: collect, and a clash is a *different* row. */
  const clash = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", checked.value.slug))
    .collect()
  if (clash.some((row) => row._id !== args.id))
    return invalidInput("slug-taken")

  const now = Date.now()
  if (!args.id) {
    const id = await ctx.db.insert("posts", {
      ...checked.value,
      cover: args.cover,
      exam: args.exam,
      authorId: viewer.id,
      published: false,
      revision: 0,
      updatedAt: now,
    })
    await recordPost(ctx, viewer, {
      kind: "post_save",
      entityId: id,
      body: `Added post “${checked.value.title}”.`,
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
    cover: args.cover,
    exam: args.exam,
    // An edited fixture is real: the dev reseed must not overwrite it,
    // exactly as books and resources do.
    sample: false,
    revision,
    updatedAt: now,
  })
  await recordPost(ctx, viewer, {
    kind: "post_save",
    entityId: args.id,
    body: `Edited post “${checked.value.title}”.`,
  })
  return { ok: true as const, id: args.id, revision }
}

async function isImage(ctx: MutationCtx, id: Id<"_storage">) {
  const file = await ctx.db.system.get("_storage", id)
  return Boolean(
    file?.contentType?.startsWith("image/") && file.size <= IMAGE_MAX_BYTES
  )
}

/**
 * The address of an image uploaded for a post's body, to put in its
 * Markdown. The body names the file, so it counts as used and is never
 * cleaned away (catalogAdmin's referencedElsewhere).
 */
export const imageLink = mutation({
  args: { storageId: v.id("_storage") },
  returns: mutationResult({ url: v.string() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "content")
    if (!editor.ok) return editor
    if (!(await isImage(ctx, args.storageId))) return invalidInput("image")
    const url = await ctx.storage.getUrl(args.storageId)
    if (!url) return missingRecord
    // The file's id rides in the fragment (browsers never send it), so the
    // body names the file and cleanup can tell it is in use.
    return { ok: true as const, url: `${url}#${args.storageId}` }
  },
})

/** Flip a post between draft and live, first publish timestamping it. */
export const setPublished = mutation({
  args: {
    id: v.id("posts"),
    published: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireGrant(ctx, "content")
    if (!owner.ok) return owner
    return applyPostPublished(ctx, owner.value, args)
  },
})

/** The flip itself, split out so it can be tested without a session. */
export async function applyPostPublished(
  ctx: MutationCtx,
  viewer: Viewer,
  args: { id: Id<"posts">; published: boolean; expectedRevision: number },
  now = Date.now()
) {
  if (!hasGrant(viewer, "content")) return forbidden
  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision)
  if (conflict) return conflict

  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    published: args.published,
    /* The date a post first went public. Kept across unpublishes - it is
       when readers first saw it, not when it was last toggled. */
    publishedAt: args.published
      ? (current.publishedAt ?? now)
      : current.publishedAt,
    revision,
    updatedAt: now,
  })
  await recordPost(ctx, viewer, {
    kind: "post_publish",
    entityId: args.id,
    body: `${args.published ? "Published" : "Unpublished"} post “${current.title}”.`,
    fromStatus: current.published ? "published" : "draft",
    toStatus: args.published ? "published" : "draft",
  })
  return { ok: true as const, revision }
}
