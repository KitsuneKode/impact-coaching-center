import { v } from "convex/values"

import { recordAudit } from "./audit"
import {
  checkRevision,
  invalidInput,
  mutationResult,
  requireOwner,
} from "./authz"
import type { Doc } from "./_generated/dataModel"
import { mutation, query, type QueryCtx } from "./_generated/server"

type Settings = Omit<Doc<"siteSettings">, "_id" | "_creationTime">

/** Used until the owner saves real values; the shop says so where it shows them. */
export const DEFAULT_SETTINGS: Settings = {
  shippingPaise: 60_00,
  pickupAddress: "Impact Career Tutorials, North Lakhimpur, Assam",
  legalName: "Impact Career Tutorials",
  receiptPrefix: "ICT",
  revision: -1,
  updatedAt: 0,
}

/** The one settings row, or the defaults. */
export async function readSettings(
  ctx: Pick<QueryCtx, "db">
): Promise<Settings & { _id?: Doc<"siteSettings">["_id"] }> {
  return (await ctx.db.query("siteSettings").first()) ?? DEFAULT_SETTINGS
}

/** What the shop shows to visitors. */
export const shop = query({
  args: {},
  returns: v.object({
    shippingPaise: v.number(),
    pickupAddress: v.string(),
  }),
  handler: async (ctx) => {
    const settings = await readSettings(ctx)
    return {
      shippingPaise: settings.shippingPaise,
      pickupAddress: settings.pickupAddress,
    }
  },
})

const FIELDS = {
  shippingPaise: v.number(),
  pickupAddress: v.string(),
  legalName: v.string(),
  gstin: v.optional(v.string()),
  receiptPrefix: v.string(),
}

export const adminSettings = query({
  args: {},
  returns: v.union(v.object({ ...FIELDS, revision: v.number() }), v.null()),
  handler: async (ctx) => {
    if (!(await requireOwner(ctx)).ok) return null
    const s = await readSettings(ctx)
    return {
      shippingPaise: s.shippingPaise,
      pickupAddress: s.pickupAddress,
      legalName: s.legalName,
      gstin: s.gstin,
      receiptPrefix: s.receiptPrefix,
      revision: s.revision,
    }
  },
})

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/

export const saveSettings = mutation({
  args: { ...FIELDS, expectedRevision: v.number() },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    const { expectedRevision, ...input } = args
    if (!Number.isInteger(input.shippingPaise) || input.shippingPaise < 0)
      return invalidInput("shipping")
    const pickupAddress = input.pickupAddress.trim()
    const legalName = input.legalName.trim()
    const receiptPrefix = input.receiptPrefix.trim().toUpperCase()
    const gstin = input.gstin?.trim().toUpperCase() || undefined
    if (!pickupAddress || pickupAddress.length > 300)
      return invalidInput("pickupAddress")
    if (!legalName || legalName.length > 120) return invalidInput("legalName")
    if (!/^[A-Z]{2,8}$/.test(receiptPrefix))
      return invalidInput("receiptPrefix")
    if (gstin && !GSTIN.test(gstin)) return invalidInput("gstin")

    const current = await readSettings(ctx)
    const conflict = checkRevision(current, expectedRevision)
    if (conflict) return conflict
    const next = {
      shippingPaise: input.shippingPaise,
      pickupAddress,
      legalName,
      gstin,
      receiptPrefix,
      revision: current.revision + 1,
      updatedAt: Date.now(),
    }
    if (current._id) await ctx.db.replace(current._id, next)
    else await ctx.db.insert("siteSettings", next)
    await recordAudit(ctx, owner.value, {
      action: "settings_change",
      entity: "settings",
      summary: "Shop settings saved.",
    })
    return { ok: true as const, revision: next.revision }
  },
})
