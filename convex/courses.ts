import { type Infer, v } from "convex/values"

import {
  CLASSPLUS_HEADERS,
  type ClassplusCourse,
  classplusFeedUrl,
  classplusListUrl,
  courseFeatures,
  courseName,
  LIST_PAGE,
  parseClassplusFrontPage,
  parseClassplusList,
} from "../lib/classplus"
import { courseTrack } from "../lib/courses"
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
import { COURSE_CHANGE } from "./schema"
import { revalidateSite } from "./site"

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
  listed: v.optional(v.boolean()),
  classplusFeatured: v.optional(v.boolean()),
})

/** Covers larger than this are not a course card. */
const COVER_MAX_BYTES = 4 * 1024 * 1024
/** Poster downloads in flight at once during a sync. */
const COVER_DOWNLOADS_AT_ONCE = 6

/** Pages of the full list we will read; ICT has 27 courses in Oct 2026. */
const LIST_PAGES_MAX = 10

async function getJson(url: string) {
  const response = await fetch(url, { headers: CLASSPLUS_HEADERS })
  if (!response.ok) throw new Error(`ClassPlus returned ${response.status}.`)
  return (await response.json()) as unknown
}

/**
 * Every course ICT has on ClassPlus, read the way its own storefront reads
 * it: the full list a page at a time, then the front page to learn which of
 * them ICT is selling now (and which it features).
 */
async function readClassplus(): Promise<ClassplusCourse[]> {
  const byId = new Map<number, ClassplusCourse>()
  let total = Infinity
  for (let page = 0; page < LIST_PAGES_MAX && byId.size < total; page++) {
    const list = parseClassplusList(
      await getJson(classplusListUrl(page * LIST_PAGE))
    )
    total = list.total
    for (const course of list.courses) byId.set(course.classplusId, course)
    if (list.courses.length < LIST_PAGE) break
  }
  if (byId.size === 0) throw new Error("ClassPlus returned no courses.")
  const front = parseClassplusFrontPage(await getJson(classplusFeedUrl()))
  return [...byId.values()].map((course) => ({
    ...course,
    listed: front.listed.has(course.classplusId),
    classplusFeatured: front.featured.has(course.classplusId),
  }))
}

/** Fetch ClassPlus, copy any new covers, then apply it in one transaction. */
export const sync = internalAction({
  args: { trigger: TRIGGER },
  returns: v.null(),
  handler: async (ctx, args) => {
    let rows: Infer<typeof SOURCE>[]
    try {
      rows = await readClassplus()
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
    /* New or changed posters only, a few downloads at a time: in parallel
       the sync takes as long as its slowest batch, not the sum of them. */
    const wanted = rows.filter(
      (row) => row.imageUrl && known[row.classplusId] !== row.imageUrl
    )
    const covers: { classplusId: number; cover: Id<"_storage"> }[] = []
    for (let i = 0; i < wanted.length; i += COVER_DOWNLOADS_AT_ONCE) {
      const batch = await Promise.all(
        wanted.slice(i, i + COVER_DOWNLOADS_AT_ONCE).map(async (row) => {
          try {
            const image = await fetch(row.imageUrl!)
            const type = image.headers.get("content-type") ?? ""
            if (!image.ok || !type.startsWith("image/")) return null
            const blob = await image.blob()
            if (blob.size > COVER_MAX_BYTES) return null
            return {
              classplusId: row.classplusId,
              cover: await ctx.storage.store(blob),
            }
          } catch {
            // Keep the old cover; the next sync tries again.
            return null
          }
        })
      )
      for (const cover of batch) if (cover) covers.push(cover)
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

/** What changed between two copies of a course, in words ICT reads. */
function changedFields(
  a: Doc<"courses">["source"],
  b: Doc<"courses">["source"]
) {
  const fields: string[] = []
  if (a.finalPricePaise !== b.finalPricePaise || a.pricePaise !== b.pricePaise)
    fields.push("price")
  if (a.name !== b.name) fields.push("name")
  if (a.imageUrl !== b.imageUrl) fields.push("poster")
  if (a.description !== b.description) fields.push("description")
  if (a.listed !== b.listed) fields.push(b.listed ? "listed" : "unlisted")
  if (a.classplusFeatured !== b.classplusFeatured) fields.push("featured")
  if (a.category !== b.category) fields.push("category")
  return fields
}

/** Enrolment counts move daily; they update quietly without a rebuild. */
const quietOnly = (a: Doc<"courses">["source"], b: Doc<"courses">["source"]) =>
  JSON.stringify({ ...a, enrolled: 0 }) ===
  JSON.stringify({ ...b, enrolled: 0 })

/** A diff longer than this is cut; the counts stay exact. */
const CHANGES_MAX = 100

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
    const changes: Infer<typeof COURSE_CHANGE>[] = []
    let added = 0
    let changed = 0

    /* The mirror is a few dozen rows: one scan answers "do we have it?",
       "is this slug taken?" and "which went missing?", where a lookup per
       course read the table once per row and then again at the end. */
    // Streamed whole, not capped: a course left unread would be inserted
    // twice or marked gone. The mirror is ClassPlus's few dozen courses.
    const all: Doc<"courses">[] = []
    for await (const course of ctx.db.query("courses")) all.push(course)
    const byId = new Map(all.map((course) => [course.classplusId, course]))
    const slugs = new Set(all.map((course) => course.slug))
    const writes: Promise<unknown>[] = []

    for (const { classplusId, slug, ...source } of args.rows) {
      seen.add(classplusId)
      const cover = covers.get(classplusId)
      const existing = byId.get(classplusId)
      if (!existing) {
        // A slug another course already holds gets the id appended; taken
        // here, so two new courses in one sync cannot both claim it.
        const free = slugs.has(slug) ? `${slug}-${classplusId}` : slug
        slugs.add(free)
        writes.push(
          ctx.db.insert("courses", {
            classplusId,
            slug: free,
            source,
            cover,
            // Older batches ICT no longer shows on its storefront arrive kept
            // but off the site; the admin can show any of them.
            local: { hidden: source.listed === false },
            syncedAt: now,
            revision: 0,
          })
        )
        added += 1
        changes.push({ classplusId, name: source.name, kind: "added" })
        continue
      }
      if (cover && existing.cover)
        writes.push(ctx.storage.delete(existing.cover))
      const fields = changedFields(existing.source, source)
      const differs = !quietOnly(existing.source, source) || cover !== undefined
      // The slug never changes once a page has been published under it.
      writes.push(
        ctx.db.patch(existing._id, {
          source,
          ...(cover ? { cover } : {}),
          syncedAt: now,
          missingSince: undefined,
          ...(differs ? { revision: existing.revision + 1 } : {}),
        })
      )
      if (existing.missingSince) {
        changed += 1
        changes.push({ classplusId, name: source.name, kind: "back" })
      } else if (differs) {
        changed += 1
        changes.push({
          classplusId,
          name: source.name,
          kind: "changed",
          fields: fields.length ? fields : ["poster"],
        })
      }
    }

    let missing = 0
    for (const course of all) {
      if (seen.has(course.classplusId) || course.missingSince) continue
      writes.push(ctx.db.patch(course._id, { missingSince: now }))
      missing += 1
      changes.push({
        classplusId: course.classplusId,
        name: course.source.name,
        kind: "gone",
      })
    }
    await Promise.all(writes)

    await ctx.db.insert("courseSyncs", {
      trigger: args.trigger,
      status: "ok",
      seen: seen.size,
      added,
      changed,
      missing,
      changes: changes.slice(0, CHANGES_MAX),
    })
    if (changes.length) {
      await recordAudit(ctx, null, {
        action: "course_sync",
        entity: "course",
        summary: `ClassPlus sync: ${added} new, ${changed} changed, ${missing} gone.`,
      })
      // Only now do the course pages need rebuilding.
      await revalidateSite(ctx, ["courses"])
    }
    return null
  },
})

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
  featured: v.boolean(),
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
    enrolled: course.source.enrolled + (course.local.offlineStudents ?? 0),
    category: course.source.category,
    tags: course.source.tags,
    cover: await pictureOf(ctx, course.cover),
    classplusId: course.classplusId,
    createdAt: course.source.createdAt,
    track: course.local.track,
    batchStarts: course.local.batchStarts,
    timing: course.local.timing,
    offlineFeePaise: course.local.offlineFeePaise,
    featured: course.local.featured === true,
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
  offlineStudents: v.optional(v.number()),
  featured: v.optional(v.boolean()),
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
          listed: v.optional(v.boolean()),
          classplusFeatured: v.optional(v.boolean()),
          createdAt: v.optional(v.number()),
          /** The exam the site files it under when ICT has not chosen one. */
          autoTrack: v.optional(v.string()),
        })
      ),
      lastSync: v.union(
        v.object({
          at: v.number(),
          status: v.union(v.literal("ok"), v.literal("failed")),
          error: v.optional(v.string()),
          seen: v.number(),
          changes: v.array(COURSE_CHANGE),
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
          listed: c.source.listed,
          classplusFeatured: c.source.classplusFeatured,
          createdAt: c.source.createdAt,
          autoTrack: courseTrack({
            name: c.source.name,
            category: c.source.category,
          }),
        }))
      ),
      lastSync: last
        ? {
            at: last._creationTime,
            status: last.status,
            error: last.error,
            seen: last.seen,
            changes: last.changes ?? [],
          }
        : null,
    }
  },
})

const DAY = /^\d{4}-\d{2}-\d{2}$/
/** A typo guard for counts ICT types in, not a business limit. */
const COUNT_MAX = 100_000

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
    if (
      local.offlineStudents !== undefined &&
      (!Number.isInteger(local.offlineStudents) ||
        local.offlineStudents < 0 ||
        local.offlineStudents > COUNT_MAX)
    )
      return invalidInput("offlineStudents")

    const exam = courseTrack({
      track: local.track,
      name: course.source.name,
      category: course.source.category,
    })
    if (local.featured && !exam) return invalidInput("featured")
    const revision = course.revision + 1
    await ctx.db.patch(args.id, { local, revision })
    // One lead course per exam: featuring this one stands the others down.
    if (local.featured) {
      const others: Doc<"courses">[] = []
      for await (const other of ctx.db.query("courses"))
        if (
          other._id !== course._id &&
          other.local.track === local.track &&
          other.local.featured
        )
          others.push(other)
      await Promise.all(
        others.map((other) =>
          ctx.db.patch(other._id, {
            local: { ...other.local, featured: undefined },
            revision: other.revision + 1,
          })
        )
      )
    }
    await recordAudit(ctx, editor.value, {
      action: "save",
      entity: "course",
      entityId: args.id,
      summary: `Edited ICT details for “${course.source.name}”.`,
    })
    return { ok: true as const, revision }
  },
})
