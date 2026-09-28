import { v } from "convex/values"

import { checkExamDate, type ExamDateInput } from "../lib/calendar"
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
import schema from "./schema"

/**
 * Owner-only calendar editing, the same shape as blogAdmin: saves carry the
 * revision they were read at, the audit row lands in the same transaction,
 * and a wrong date is unpublished rather than deleted.
 */

const FIELDS = schema.tables.examDates.validator.pick(
  "exam",
  "kind",
  "title",
  "starts",
  "tentative",
  "source"
).fields

/** The editor sends empty strings; storage keeps them absent. */
const EDIT_FIELDS = { ...FIELDS, titleAs: v.string(), ends: v.string() }

async function recordDate(
  ctx: MutationCtx,
  actor: Viewer,
  entry: {
    kind: "date_save" | "date_publish"
    entityId: Id<"examDates">
    body: string
    fromStatus?: "draft" | "published"
    toStatus?: "draft" | "published"
  }
) {
  await ctx.db.insert("activities", {
    kind: entry.kind,
    body: entry.body,
    actorId: actor.id,
    entity: "examDate",
    entityId: entry.entityId,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
  })
}

const ADMIN_LIST_MAX = 500

const ROW = v.object({
  ...EDIT_FIELDS,
  id: v.id("examDates"),
  published: v.boolean(),
  revision: v.number(),
  updatedAt: v.number(),
})

function toRow(row: {
  _id: Id<"examDates">
  exam: ExamDateInput["exam"]
  kind: ExamDateInput["kind"]
  title: string
  titleAs?: string
  starts: string
  ends?: string
  tentative: boolean
  source: string
  published: boolean
  revision: number
  updatedAt: number
}) {
  return {
    id: row._id,
    exam: row.exam,
    kind: row.kind,
    title: row.title,
    titleAs: row.titleAs ?? "",
    starts: row.starts,
    ends: row.ends ?? "",
    tentative: row.tentative,
    source: row.source,
    published: row.published,
    revision: row.revision,
    updatedAt: row.updatedAt,
  }
}

/** Every date, latest first - the owner mostly edits what is coming. */
export const list = query({
  args: {},
  returns: v.object({ rows: v.array(ROW), truncated: v.boolean() }),
  handler: async (ctx) => {
    if (!(await requireOwner(ctx)).ok) return { rows: [], truncated: false }
    const found = await ctx.db
      .query("examDates")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    return {
      truncated: found.length > ADMIN_LIST_MAX,
      rows: found
        .slice(0, ADMIN_LIST_MAX)
        .map(toRow)
        .sort((a, b) => b.starts.localeCompare(a.starts)),
    }
  },
})

/** Takes the id from the URL as a string, so a mangled link is "not found". */
export const get = query({
  args: { id: v.string() },
  returns: v.union(ROW, v.null()),
  handler: async (ctx, args) => {
    if (!(await requireOwner(ctx)).ok) return null
    const id = ctx.db.normalizeId("examDates", args.id)
    const row = id && (await ctx.db.get(id))
    return row ? toRow(row) : null
  },
})

/** Create (no id) or update (id + expectedRevision) a date. */
export const save = mutation({
  args: {
    id: v.optional(v.id("examDates")),
    expectedRevision: v.optional(v.number()),
    ...EDIT_FIELDS,
  },
  returns: mutationResult({ id: v.id("examDates"), revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    return applySaveDate(ctx, owner.value, args)
  },
})

/** The save itself, split out so it can be tested without a session. */
export async function applySaveDate(
  ctx: MutationCtx,
  viewer: Viewer,
  args: ExamDateInput & {
    id?: Id<"examDates">
    expectedRevision?: number
  }
) {
  if (viewer.role !== "owner") return forbidden
  const { id, expectedRevision, ...input } = args
  const checked = checkExamDate(input)
  if (!checked.ok) return invalidInput(checked.field)
  const { titleAs, ends, ...rest } = checked.value
  const fields = {
    ...rest,
    titleAs: titleAs || undefined,
    ends: ends || undefined,
  }

  const now = Date.now()
  if (!id) {
    const created = await ctx.db.insert("examDates", {
      ...fields,
      published: false,
      revision: 0,
      updatedAt: now,
    })
    await recordDate(ctx, viewer, {
      kind: "date_save",
      entityId: created,
      body: `Added date “${fields.title}” (${fields.starts}).`,
    })
    return { ok: true as const, id: created, revision: 0 }
  }

  const current = await ctx.db.get(id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, expectedRevision ?? -1)
  if (conflict) return conflict

  const revision = current.revision + 1
  await ctx.db.patch(id, { ...fields, revision, updatedAt: now })
  await recordDate(ctx, viewer, {
    kind: "date_save",
    entityId: id,
    body: `Edited date “${fields.title}” (${fields.starts}).`,
  })
  return { ok: true as const, id, revision }
}

export const setPublished = mutation({
  args: {
    id: v.id("examDates"),
    published: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    return applyDatePublished(ctx, owner.value, args)
  },
})

/** The flip itself, split out so it can be tested without a session. */
export async function applyDatePublished(
  ctx: MutationCtx,
  viewer: Viewer,
  args: { id: Id<"examDates">; published: boolean; expectedRevision: number }
) {
  if (viewer.role !== "owner") return forbidden
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
  await recordDate(ctx, viewer, {
    kind: "date_publish",
    entityId: args.id,
    body: `${args.published ? "Published" : "Unpublished"} date “${current.title}”.`,
    fromStatus: current.published ? "published" : "draft",
    toStatus: args.published ? "published" : "draft",
  })
  return { ok: true as const, revision }
}
