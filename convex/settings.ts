import { v } from "convex/values"

import { recordAudit } from "./audit"
import {
  checkRevision,
  invalidInput,
  mutationResult,
  requireOwner,
} from "./authz"
import { brand, place } from "../lib/brand"
import { toE164 } from "../lib/leads"
import { lowestShipping, type ShippingRates } from "../lib/shipping"
import type { Doc } from "./_generated/dataModel"
import { mutation, query, type QueryCtx } from "./_generated/server"

type Settings = Omit<Doc<"siteSettings">, "_id" | "_creationTime">

/** Used until the owner saves real values; the shop says so where it shows them. */
export const DEFAULT_SETTINGS: Settings = {
  shippingPaise: 60_00,
  // The main centre is where books are collected.
  pickupAddress: `${brand.legalName}, ${place.street}, ${place.city}, ${place.region} ${place.pin}`,
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

/** The delivery rate per zone, as lib/shipping.ts reads them. */
export function ratesOf(settings: Settings): ShippingRates {
  return {
    assam: settings.shippingPaise,
    northeast: settings.shippingNortheastPaise,
    india: settings.shippingIndiaPaise,
  }
}

/** What the shop shows to visitors. */
export const shop = query({
  args: {},
  returns: v.object({
    /** The lowest delivery charge, for "from ₹60" before a PIN is typed. */
    shippingPaise: v.number(),
    rates: v.object({
      assam: v.number(),
      northeast: v.optional(v.number()),
      india: v.optional(v.number()),
    }),
    pickupAddress: v.string(),
  }),
  handler: async (ctx) => {
    const settings = await readSettings(ctx)
    const rates = ratesOf(settings)
    return {
      shippingPaise: lowestShipping(rates),
      rates,
      pickupAddress: settings.pickupAddress,
    }
  },
})

const FIELDS = {
  shippingPaise: v.number(),
  shippingNortheastPaise: v.optional(v.number()),
  shippingIndiaPaise: v.optional(v.number()),
  pickupAddress: v.string(),
  legalName: v.string(),
  gstin: v.optional(v.string()),
  receiptPrefix: v.string(),
  deskPhone: v.optional(v.string()),
}

export const adminSettings = query({
  args: {},
  returns: v.union(v.object({ ...FIELDS, revision: v.number() }), v.null()),
  handler: async (ctx) => {
    if (!(await requireOwner(ctx)).ok) return null
    const s = await readSettings(ctx)
    return {
      shippingPaise: s.shippingPaise,
      shippingNortheastPaise: s.shippingNortheastPaise,
      shippingIndiaPaise: s.shippingIndiaPaise,
      pickupAddress: s.pickupAddress,
      legalName: s.legalName,
      gstin: s.gstin,
      receiptPrefix: s.receiptPrefix,
      deskPhone: s.deskPhone,
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
    const rate = (paise: number | undefined) =>
      paise === undefined || (Number.isInteger(paise) && paise >= 0)
    if (
      !Number.isInteger(input.shippingPaise) ||
      input.shippingPaise < 0 ||
      !rate(input.shippingNortheastPaise) ||
      !rate(input.shippingIndiaPaise)
    )
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
    const deskPhone = input.deskPhone?.trim()
      ? (toE164(input.deskPhone) ?? null)
      : undefined
    if (deskPhone === null) return invalidInput("deskPhone")

    const current = await readSettings(ctx)
    const conflict = checkRevision(current, expectedRevision)
    if (conflict) return conflict
    const next = {
      shippingPaise: input.shippingPaise,
      shippingNortheastPaise: input.shippingNortheastPaise,
      shippingIndiaPaise: input.shippingIndiaPaise,
      pickupAddress,
      legalName,
      gstin,
      receiptPrefix,
      deskPhone,
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
