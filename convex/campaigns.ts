import { type Infer, v } from "convex/values"

import {
  checkCampaign,
  isLiveNow,
  matchesPath,
  type CampaignInput,
} from "../lib/campaigns"
import { IMAGE_MAX_BYTES } from "../lib/catalog"
import { recordAudit } from "./audit"
import { indiaDay } from "./contactTaps"
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
import { revalidateSite } from "./site"
import { PICTURE, pictureOf } from "./images"
import { CAMPAIGN_KIND, CAMPAIGN_STATUS, CAMPAIGN_WORDS } from "./schema"

/**
 * Promotions on the site, for the owner and staff with the promotions grant.
 * Every save carries the revision it was read at and leaves an audit row.
 * Nothing here deletes; pausing is how a campaign stops.
 */

const FIELDS = {
  name: v.string(),
  as: v.optional(CAMPAIGN_WORDS),
  kind: CAMPAIGN_KIND,
  tag: v.string(),
  headline: v.string(),
  body: v.string(),
  cta: v.string(),
  href: v.string(),
  coupon: v.string(),
  reelIds: v.array(v.string()),
  routes: v.array(v.string()),
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
  delaySeconds: v.number(),
  restDays: v.number(),
  priority: v.number(),
}

const ROW = v.object({
  ...FIELDS,
  id: v.id("campaigns"),
  status: CAMPAIGN_STATUS,
  image: v.union(
    v.object({ id: v.id("_storage"), picture: PICTURE }),
    v.null()
  ),
  revision: v.number(),
  updatedAt: v.number(),
})

/** What a visitor's browser gets: the words and the rules, nothing internal. */
const PUBLIC_ROW = v.object({
  id: v.id("campaigns"),
  kind: CAMPAIGN_KIND,
  tag: v.string(),
  headline: v.string(),
  body: v.string(),
  cta: v.string(),
  as: v.optional(CAMPAIGN_WORDS),
  href: v.string(),
  image: v.union(PICTURE, v.null()),
  coupon: v.string(),
  reelIds: v.array(v.string()),
  endsAt: v.optional(v.number()),
  delaySeconds: v.number(),
  restDays: v.number(),
  revision: v.number(),
})

const ADMIN_LIST_MAX = 100
/** A page shows at most this many at once. */
const LIVE_MAX = 6

const fieldsOf = (c: Doc<"campaigns">) => ({
  name: c.name,
  as: c.as,
  kind: c.kind,
  tag: c.tag,
  headline: c.headline,
  body: c.body,
  cta: c.cta,
  href: c.href,
  coupon: c.coupon,
  reelIds: c.reelIds,
  routes: c.routes,
  startsAt: c.startsAt,
  endsAt: c.endsAt,
  delaySeconds: c.delaySeconds,
  restDays: c.restDays,
  priority: c.priority,
})

export const canEditCampaigns = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireGrant(ctx, "promotions")).ok,
})

export const adminCampaigns = query({
  args: {},
  returns: v.object({ rows: v.array(ROW), truncated: v.boolean() }),
  handler: async (ctx) => {
    if (!(await requireGrant(ctx, "promotions")).ok)
      return { rows: [], truncated: false }
    const found = await ctx.db
      .query("campaigns")
      .order("desc")
      .take(ADMIN_LIST_MAX + 1)
    const rows = await Promise.all(
      found.slice(0, ADMIN_LIST_MAX).map(async (c) => {
        const picture = await pictureOf(ctx, c.image)
        return {
          ...fieldsOf(c),
          id: c._id,
          status: c.status,
          image: c.image && picture ? { id: c.image, picture } : null,
          revision: c.revision,
          updatedAt: c.updatedAt,
        }
      })
    )
    return { rows, truncated: found.length > ADMIN_LIST_MAX }
  },
})

/**
 * Campaigns that should show on a page right now. Queries never read the
 * clock, so the browser passes the time in, rounded to the minute.
 */
export const liveCampaigns = query({
  args: { path: v.string(), now: v.number() },
  returns: v.array(PUBLIC_ROW),
  handler: async (ctx, args) => {
    const found = await ctx.db
      .query("campaigns")
      .withIndex("by_status_and_priority", (q) => q.eq("status", "live"))
      .order("desc")
      .take(30)
    const live = found
      .filter((c) => isLiveNow(c, args.now) && matchesPath(c.routes, args.path))
      .slice(0, LIVE_MAX)
    return Promise.all(
      live.map(async (c) => ({
        id: c._id,
        kind: c.kind,
        tag: c.tag,
        headline: c.headline,
        body: c.body,
        cta: c.cta,
        as: c.as,
        href: c.href,
        image: await pictureOf(ctx, c.image),
        coupon: c.coupon,
        reelIds: c.reelIds,
        endsAt: c.endsAt,
        delaySeconds: c.delaySeconds,
        restDays: c.restDays,
        revision: c.revision,
      }))
    )
  },
})

/**
 * Every announcement bar live right now, whatever page, with the pages it
 * targets: read on the server so the strip is in the first paint (the
 * browser picks the one for its page), never dropped in a second later.
 */
export const liveBars = query({
  args: { now: v.number() },
  returns: v.array(PUBLIC_ROW.extend({ routes: v.array(v.string()) })),
  handler: async (ctx, args) => {
    const found = await ctx.db
      .query("campaigns")
      .withIndex("by_status_and_priority", (q) => q.eq("status", "live"))
      .order("desc")
      .take(30)
    return found
      .filter((c) => c.kind === "bar" && isLiveNow(c, args.now))
      .slice(0, LIVE_MAX)
      .map((c) => ({
        id: c._id,
        kind: c.kind,
        tag: c.tag,
        headline: c.headline,
        body: c.body,
        cta: c.cta,
        as: c.as,
        href: c.href,
        image: null,
        coupon: c.coupon,
        reelIds: c.reelIds,
        endsAt: c.endsAt,
        delaySeconds: c.delaySeconds,
        restDays: c.restDays,
        revision: c.revision,
        routes: c.routes,
      }))
  },
})

const canEdit = (viewer: Viewer) => hasGrant(viewer, "promotions")

async function imageOk(ctx: MutationCtx, id: Id<"_storage"> | undefined) {
  if (!id) return true
  const file = await ctx.db.system.get("_storage", id)
  return Boolean(
    file?.contentType?.startsWith("image/") && file.size <= IMAGE_MAX_BYTES
  )
}

/** Create (a draft) or update a campaign. */
/**
 * A live promotion's start and end change what the pages show with nobody
 * editing anything, so the site is told to rebuild at those moments.
 */
async function rebuildAtWindow(
  ctx: MutationCtx,
  window: { startsAt?: number; endsAt?: number }
) {
  const now = Date.now()
  for (const at of [window.startsAt, window.endsAt])
    if (at !== undefined && at > now)
      await revalidateSite(ctx, ["campaigns"], at)
}

export const saveCampaign = mutation({
  args: {
    id: v.optional(v.id("campaigns")),
    expectedRevision: v.optional(v.number()),
    fields: v.object(FIELDS),
    image: v.optional(v.id("_storage")),
  },
  returns: mutationResult({ id: v.id("campaigns"), revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "promotions")
    if (!editor.ok) return editor
    return applySaveCampaign(ctx, editor.value, args)
  },
})

/** The save itself, split out so it can be tested without a session. */
export async function applySaveCampaign(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    id?: Id<"campaigns">
    expectedRevision?: number
    fields: Infer<ReturnType<typeof v.object<typeof FIELDS>>>
    image?: Id<"_storage">
  }
) {
  if (!canEdit(viewer)) return forbidden
  const checked = checkCampaign(args.fields as CampaignInput)
  if (!checked.ok) return invalidInput(checked.field)
  if (!(await imageOk(ctx, args.image))) return invalidInput("image")
  const now = Date.now()

  if (!args.id) {
    const id = await ctx.db.insert("campaigns", {
      ...checked.value,
      image: args.image,
      status: "draft",
      revision: 0,
      updatedAt: now,
    })
    await recordAudit(ctx, viewer, {
      action: "save",
      entity: "campaign",
      entityId: id,
      summary: `Added promotion “${checked.value.name}”.`,
    })
    return { ok: true as const, id, revision: 0 }
  }

  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision ?? -1)
  if (conflict) return conflict
  if (current.image && current.image !== args.image)
    await ctx.storage.delete(current.image)
  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    ...checked.value,
    image: args.image,
    revision,
    updatedAt: now,
  })
  await recordAudit(ctx, viewer, {
    action: "save",
    entity: "campaign",
    entityId: args.id,
    summary: `Edited promotion “${checked.value.name}”.`,
  })
  if (current.status === "live") await rebuildAtWindow(ctx, checked.value)
  return { ok: true as const, id: args.id, revision }
}

/** Go live, pause, or move back to draft. */
export const setCampaignStatus = mutation({
  args: {
    id: v.id("campaigns"),
    expectedRevision: v.number(),
    status: CAMPAIGN_STATUS,
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, "promotions")
    if (!editor.ok) return editor
    return applySetCampaignStatus(ctx, editor.value, args)
  },
})

export async function applySetCampaignStatus(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    id: Id<"campaigns">
    expectedRevision: number
    status: Infer<typeof CAMPAIGN_STATUS>
  }
) {
  if (!canEdit(viewer)) return forbidden
  const current = await ctx.db.get(args.id)
  if (!current) return missingRecord
  const conflict = checkRevision(current, args.expectedRevision)
  if (conflict) return conflict
  if (current.status === args.status)
    return { ok: true as const, revision: current.revision }

  const revision = current.revision + 1
  await ctx.db.patch(args.id, {
    status: args.status,
    revision,
    updatedAt: Date.now(),
  })
  await recordAudit(ctx, viewer, {
    action: args.status === "live" ? "publish" : "unpublish",
    entity: "campaign",
    entityId: args.id,
    summary: `Set promotion “${current.name}” to ${args.status}.`,
    from: current.status,
    to: args.status,
  })
  if (args.status === "live") await rebuildAtWindow(ctx, current)
  return { ok: true as const, revision }
}

const EVENT = v.union(v.literal("view"), v.literal("click"), v.literal("close"))
const COUNTER = { view: "views", click: "clicks", close: "closes" } as const

/**
 * Count one view, click or close of a live promotion. Anonymous, like the
 * contact taps: it adds one to that day's total and nothing else. The
 * browser sends each view once per visit.
 */
export const track = mutation({
  args: { id: v.id("campaigns"), event: EVENT },
  returns: v.null(),
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id)
    if (!campaign || campaign.status !== "live") return null
    const day = indiaDay(Date.now())
    const field = COUNTER[args.event]
    const row = await ctx.db
      .query("campaignStats")
      .withIndex("by_campaignId_and_day", (q) =>
        q.eq("campaignId", args.id).eq("day", day)
      )
      .unique()
    if (row) await ctx.db.patch(row._id, { [field]: row[field] + 1 })
    else
      await ctx.db.insert("campaignStats", {
        campaignId: args.id,
        day,
        views: 0,
        clicks: 0,
        closes: 0,
        [field]: 1,
      })
    return null
  },
})

const STATS_DAYS = 30

/** Each promotion's last 30 days, for the admin list. The browser passes
    the time (queries never read the clock). */
export const adminCampaignStats = query({
  args: { now: v.number() },
  returns: v.array(
    v.object({
      id: v.id("campaigns"),
      views: v.number(),
      clicks: v.number(),
      closes: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const viewer = await requireGrant(ctx, "promotions")
    if (!viewer.ok) return []
    const since = indiaDay(args.now - (STATS_DAYS - 1) * 86_400_000)
    const campaigns = await ctx.db.query("campaigns").take(ADMIN_LIST_MAX)
    return Promise.all(
      campaigns.map(async (c) => {
        const days = await ctx.db
          .query("campaignStats")
          .withIndex("by_campaignId_and_day", (q) =>
            q.eq("campaignId", c._id).gte("day", since)
          )
          .take(STATS_DAYS)
        return days.reduce(
          (sum, d) => ({
            id: c._id,
            views: sum.views + d.views,
            clicks: sum.clicks + d.clicks,
            closes: sum.closes + d.closes,
          }),
          { id: c._id, views: 0, clicks: 0, closes: 0 }
        )
      })
    )
  },
})
