import { type Infer, v } from "convex/values"

import {
  CLASSPLUS_HEADERS,
  classplusFeedUrl,
  courseFeatures,
  courseName,
  parseClassplusFeed,
} from "../lib/classplus"
import { enquiryTracks } from "../lib/leads"
import { recordAudit } from "./audit"
import {
  checkRevision,
  invalidInput,
  missingRecord,
  mutationResult,
  requireGrant,
} from "./authz"
import { internal } from "./_generated/api"
import type { Doc, Id } from "./_generated/dataModel"
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server"
import { PICTURE, pictureOf } from "./images"
import { consumeRateLimit } from "./persons"

/**
 * Courses are ClassPlus's: name, price, description and cover are mirrored
 * from ICT's public storefront feed and never edited here. ICT adds only what
 * ClassPlus does not hold (exam track, offline fee, batch date, order).
 */

const TRIGGER = v.union(v.literal("schedule"), v.literal("owner"))

const SOURCE = v.object({
  classplusId: v.number(),
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  pricePaise: v.number(),
  finalPricePaise: v.number(),
  free: v.boolean(),
  enrolled: v.number(),
  category: v.optional(v.string()),
  tags: v.array(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.optional(v.number()),
})

/** Covers larger than this are not a course card. */
const COVER_MAX_BYTES = 4 * 1024 * 1024

/** Fetch the feed, copy any new covers, then apply it in one transaction. */
export const sync = internalAction({
  args: { trigger: TRIGGER },
  returns: v.null(),
  handler: async (ctx, args) => {
    let rows: Infer<typeof SOURCE>[]
    try {
      const response = await fetch(classplusFeedUrl(), {
        headers: CLASSPLUS_HEADERS,
      })
      if (!response.ok)
        throw new Error(`ClassPlus returned ${response.status}.`)
      rows = parseClassplusFeed(await response.json())
    } catch (error) {
      await ctx.runMutation(internal.courses.recordFailure, {
        trigger: args.trigger,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }

    const known: Record<string, string> = await ctx.runQuery(
      internal.courses.coverSources,
      {}
    )
    const covers: { classplusId: number; cover: Id<"_storage"> }[] = []
    for (const row of rows) {
      if (!row.imageUrl || known[row.classplusId] === row.imageUrl) continue
      try {
        const image = await fetch(row.imageUrl)
        const type = image.headers.get("content-type") ?? ""
        if (!image.ok || !type.startsWith("image/")) continue
        const blob = await image.blob()
        if (blob.size > COVER_MAX_BYTES) continue
        covers.push({
          classplusId: row.classplusId,
          cover: await ctx.storage.store(blob),
        })
      } catch {
        // Keep the old cover; the next sync tries again.
      }
    }

    await ctx.runMutation(internal.courses.applySync, {
      trigger: args.trigger,
      rows,
      covers,
    })
    return null
  },
})

/** classplusId → the image URL our stored cover was copied from. */
export const coverSources = internalQuery({
  args: {},
  returns: v.record(v.string(), v.string()),
  handler: async (ctx) => {
    const sources: Record<string, string> = {}
    for await (const course of ctx.db.query("courses"))
      if (course.cover && course.source.imageUrl)
        sources[course.classplusId] = course.source.imageUrl
    return sources
  },
})

const sameSource = (a: Doc<"courses">["source"], b: Doc<"courses">["source"]) =>
  JSON.stringify(a) === JSON.stringify(b)

export const applySync = internalMutation({
  args: {
    trigger: TRIGGER,
    rows: v.array(SOURCE),
    covers: v.array(
      v.object({ classplusId: v.number(), cover: v.id("_storage") })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now()
    const covers = new Map(args.covers.map((c) => [c.classplusId, c.cover]))
    const seen = new Set<number>()
    let added = 0
    let changed = 0

    for (const { classplusId, slug, ...source } of args.rows) {
      seen.add(classplusId)
      const cover = covers.get(classplusId)
      const existing = await ctx.db
        .query("courses")
        .withIndex("by_classplusId", (q) => q.eq("classplusId", classplusId))
        .first()
      if (!existing) {
        await ctx.db.insert("courses", {
          classplusId,
          // A slug another course already holds gets the id appended.
          slug: (await slugFree(ctx, slug)) ? slug : `${slug}-${classplusId}`,
          source,
          cover,
          local: { hidden: false },
          syncedAt: now,
          revision: 0,
        })
        added += 1
        continue
      }
      if (cover && existing.cover) await ctx.storage.delete(existing.cover)
      const differs =
        !sameSource(existing.source, source) || cover !== undefined
      // The slug never changes once a page has been published under it.
      await ctx.db.patch(existing._id, {
        source,
        ...(cover ? { cover } : {}),
        syncedAt: now,
        missingSince: undefined,
        ...(differs ? { revision: existing.revision + 1 } : {}),
      })
      if (differs || existing.missingSince) changed += 1
    }

    let missing = 0
    for await (const course of ctx.db.query("courses")) {
      if (seen.has(course.classplusId) || course.missingSince) continue
      await ctx.db.patch(course._id, { missingSince: now })
      missing += 1
    }

    await ctx.db.insert("courseSyncs", {
      trigger: args.trigger,
      status: "ok",
      seen: seen.size,
      added,
      changed,
      missing,
    })
    if (added || changed || missing)
      await recordAudit(ctx, null, {
        action: "course_sync",
        entity: "course",
        summary: `ClassPlus sync: ${added} new, ${changed} changed, ${missing} gone.`,
      })
    return null
  },
})

async function slugFree(ctx: Pick<QueryCtx, "db">, slug: string) {
  return !(await ctx.db
    .query("courses")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first())
}

export const recordFailure = internalMutation({
  args: { trigger: TRIGGER, error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("courseSyncs", {
      trigger: args.trigger,
      status: "failed",
      seen: 0,
      added: 0,
      changed: 0,
      missing: 0,
      error: args.error.slice(0, 500),
    })
    return null
  },
})

/** "Sync now" from the admin, at most once a minute. */
export const syncNow = mutation({
  args: {},
  returns: mutationResult({}),
  handler: async (ctx) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    if (!(await consumeRateLimit(ctx, "courses:sync", 1, 60_000)))
      return { ok: false as const, reason: "rate-limited" as const }
    await ctx.scheduler.runAfter(0, internal.courses.sync, { trigger: "owner" })
    return { ok: true as const }
  },
})

/* --------------------------------- reading -------------------------------- */

const PUBLIC_COURSE = v.object({
  slug: v.string(),
  name: v.string(),
  short: v.string(),
  subtitle: v.string(),
  features: v.array(v.string()),
  pricePaise: v.number(),
  finalPricePaise: v.number(),
  free: v.boolean(),
  enrolled: v.number(),
  category: v.optional(v.string()),
  tags: v.array(v.string()),
  cover: v.union(PICTURE, v.null()),
  classplusId: v.number(),
  createdAt: v.optional(v.number()),
  track: v.optional(v.string()),
  batchStarts: v.optional(v.string()),
  timing: v.optional(v.string()),
  offlineFeePaise: v.optional(v.number()),
})

async function toPublic(ctx: QueryCtx, course: Doc<"courses">) {
  const { short, subtitle } = courseName(course.source.name)
  return {
    slug: course.slug,
    name: course.source.name,
    short,
    subtitle,
    features: courseFeatures(course.source.description),
    pricePaise: course.source.pricePaise,
    finalPricePaise: course.source.finalPricePaise,
    free: course.source.free,
    enrolled: course.source.enrolled,
    category: course.source.category,
    tags: course.source.tags,
    cover: await pictureOf(ctx, course.cover),
    classplusId: course.classplusId,
    createdAt: course.source.createdAt,
    track: course.local.track,
    batchStarts: course.local.batchStarts,
    timing: course.local.timing,
    offlineFeePaise: course.local.offlineFeePaise,
  }
}

const listed = (course: Doc<"courses">) =>
  !course.local.hidden && !course.missingSince

/** ClassPlus lists a few dozen courses at most. */
const COURSES_MAX = 100

/** Courses on the site: ICT's order first, then the newest. */
export const list = query({
  args: {},
  returns: v.array(PUBLIC_COURSE),
  handler: async (ctx) => {
    const rows = (await ctx.db.query("courses").take(COURSES_MAX)).filter(
      listed
    )
    rows.sort(
      (a, b) =>
        (a.local.sortOrder ?? Infinity) - (b.local.sortOrder ?? Infinity) ||
        (b.source.createdAt ?? 0) - (a.source.createdAt ?? 0) ||
        b.source.finalPricePaise - a.source.finalPricePaise
    )
    return Promise.all(rows.map((row) => toPublic(ctx, row)))
  },
})

export const bySlug = query({
  args: { slug: v.string() },
  returns: v.union(PUBLIC_COURSE, v.null()),
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
    return course && listed(course) ? toPublic(ctx, course) : null
  },
})

/* ---------------------------------- admin --------------------------------- */

const LOCAL = v.object({
  track: v.optional(v.string()),
  hidden: v.boolean(),
  sortOrder: v.optional(v.number()),
  batchStarts: v.optional(v.string()),
  timing: v.optional(v.string()),
  offlineFeePaise: v.optional(v.number()),
})

export const adminCourses = query({
  args: {},
  returns: v.union(
    v.object({
      rows: v.array(
        v.object({
          id: v.id("courses"),
          slug: v.string(),
          name: v.string(),
          finalPricePaise: v.number(),
          enrolled: v.number(),
          cover: v.union(PICTURE, v.null()),
          local: LOCAL,
          missingSince: v.optional(v.number()),
          revision: v.number(),
        })
      ),
      lastSync: v.union(
        v.object({
          at: v.number(),
          status: v.union(v.literal("ok"), v.literal("failed")),
          error: v.optional(v.string()),
        }),
        v.null()
      ),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    if (!(await requireGrant(ctx, "catalog")).ok) return null
    const courses = await ctx.db.query("courses").take(COURSES_MAX)
    const last = await ctx.db.query("courseSyncs").order("desc").first()
    return {
      rows: await Promise.all(
        courses.map(async (c) => ({
          id: c._id,
          slug: c.slug,
          name: c.source.name,
          finalPricePaise: c.source.finalPricePaise,
          enrolled: c.source.enrolled,
          cover: await pictureOf(ctx, c.cover),
          local: c.local,
          missingSince: c.missingSince,
          revision: c.revision,
        }))
      ),
      lastSync: last
        ? { at: last._creationTime, status: last.status, error: last.error }
        : null,
    }
  },
})

const DAY = /^\d{4}-\d{2}-\d{2}$/

/** ICT's own details for a course. ClassPlus fields are not editable here. */
export const saveLocal = mutation({
  args: {
    id: v.id("courses"),
    local: LOCAL,
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "catalog")
    if (!editor.ok) return editor
    const course = await ctx.db.get(args.id)
    if (!course) return missingRecord
    const conflict = checkRevision(course, args.expectedRevision)
    if (conflict) return conflict

    const local = {
      ...args.local,
      timing: args.local.timing?.trim() || undefined,
      batchStarts: args.local.batchStarts?.trim() || undefined,
    }
    if (
      local.track !== undefined &&
      !(enquiryTracks as readonly string[]).includes(local.track)
    )
      return invalidInput("track")
    if (local.batchStarts && !DAY.test(local.batchStarts))
      return invalidInput("batchStarts")
    if ((local.timing?.length ?? 0) > 80) return invalidInput("timing")
    if (
      local.offlineFeePaise !== undefined &&
      (!Number.isInteger(local.offlineFeePaise) || local.offlineFeePaise < 0)
    )
      return invalidInput("offlineFee")
    if (local.sortOrder !== undefined && !Number.isInteger(local.sortOrder))
      return invalidInput("order")

    const revision = course.revision + 1
    await ctx.db.patch(args.id, { local, revision })
    await recordAudit(ctx, editor.value, {
      action: "save",
      entity: "course",
      entityId: args.id,
      summary: `Edited ICT details for “${course.source.name}”.`,
    })
    return { ok: true as const, revision }
  },
})
