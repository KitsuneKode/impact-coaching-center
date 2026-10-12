import { v } from "convex/values"

import { isDevelopmentDeployment } from "../lib/dev-deployment"
import { toE164 } from "../lib/leads"
import type { Id } from "./_generated/dataModel"
import { internalMutation } from "./_generated/server"
import { allocateOrderReference } from "./orders"
import {
  ADDRESS,
  LEAD_STATUS,
  LOCALE,
  LOCALISED,
  ORDER_STATUS,
  PERSON_ROLE,
  RESOURCE_KIND,
} from "./schema"

/** Development fixtures: Persons at each role, without a handset each. */

/** The same test the logger OTP transport applies. */
function assertLocalDeployment() {
  if (!isDevelopmentDeployment(process.env.CONVEX_SITE_URL)) {
    throw new Error(
      "devSeed refuses to run: this is not a local deployment, nor the hosted development deployment named in lib/dev-deployment.ts. Roles on a hosted deployment are granted by an owner, or bootstrapped by hand in the dashboard."
    )
  }
}

/** Everything this module writes is stamped, so it can all be taken back. */
const SEED_SOURCE = "dev-seed"

/** Enquiries, so the staff screens can be looked at with something in them. */
export const seedEnquiries = internalMutation({
  args: {
    enquiries: v.array(
      v.object({
        name: v.string(),
        phone: v.string(),
        leadStatus: LEAD_STATUS,
        /** Which Track they asked about. Free text, as on the Person. */
        interestTrack: v.optional(v.string()),
        /** How long ago they got in touch. Fractions are fine. */
        daysAgo: v.number(),
        /** Goes on the activity, not the Person - staff notes never sit on an exportable row. */
        note: v.optional(v.string()),
        verified: v.optional(v.boolean()),
      })
    ),
  },
  returns: v.object({ written: v.number() }),
  handler: async (ctx, args) => {
    assertLocalDeployment()

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    let written = 0

    for (const enquiry of args.enquiries) {
      const phone = toE164(enquiry.phone)
      if (!phone)
        throw new Error(`Not a valid Indian mobile number: ${enquiry.phone}`)

      const at = now - enquiry.daysAgo * day
      const existing = await ctx.db
        .query("persons")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first()

      const fields = {
        name: enquiry.name,
        leadStatus: enquiry.leadStatus,
        interestTrack: enquiry.interestTrack,
        lastEnquiryAt: at,
        updatedAt: at,
        ...(enquiry.verified ? { verifiedAt: at } : {}),
      }

      const personId = existing
        ? (await ctx.db.patch(existing._id, {
            ...fields,
            revision: (existing.revision ?? 0) + 1,
          }),
          existing._id)
        : await ctx.db.insert("persons", {
            phone,
            role: "student",
            source: SEED_SOURCE,
            revision: 0,
            ...fields,
          })

      await ctx.db.insert("enquiries", {
        personId,
        channel: "website",
        track: enquiry.interestTrack,
        page: "/",
      })
      await ctx.db.insert("activities", {
        personId,
        kind: "enquiry",
        body: enquiry.note,
        track: enquiry.interestTrack,
      })
      written += 1
    }

    return { written }
  },
})

/** Orders, priced from the seeded bundles exactly as checkout would. */
export const seedOrders = internalMutation({
  args: {
    orders: v.array(
      v.object({
        /* Fixtures may pin a reference; absent, one is allocated. */
        reference: v.optional(v.string()),
        phone: v.string(),
        name: v.string(),
        status: ORDER_STATUS,
        fulfilment: v.union(v.literal("delivery"), v.literal("collection")),
        courier: v.optional(
          v.object({ name: v.string(), trackingNumber: v.string() })
        ),
        daysAgo: v.number(),
        seen: v.optional(v.boolean()),
        lines: v.array(
          v.object({
            bundle: v.string(),
            language: LOCALE,
            quantity: v.number(),
          })
        ),
        address: v.optional(ADDRESS),
      })
    ),
  },
  returns: v.object({ written: v.number() }),
  handler: async (ctx, args) => {
    assertLocalDeployment()

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const shippingPaise = 60_00
    let written = 0

    for (const order of args.orders) {
      const phone = toE164(order.phone)
      if (!phone)
        throw new Error(`Not a valid Indian mobile number: ${order.phone}`)

      const existing = await ctx.db
        .query("persons")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first()

      const placedAt = now - order.daysAgo * day
      const personId =
        existing?._id ??
        (await ctx.db.insert("persons", {
          phone,
          name: order.name,
          role: "student",
          source: SEED_SOURCE,
          revision: 0,
          updatedAt: placedAt,
        }))

      const lines = []
      for (const line of order.lines) {
        const bundle = await ctx.db
          .query("bundles")
          .withIndex("by_slug", (q) => q.eq("slug", line.bundle))
          .first()
        if (!bundle) throw new Error(`Seed the catalogue first: ${line.bundle}`)
        const books = await Promise.all(
          bundle.bookIds.map((id) => ctx.db.get(id))
        )
        lines.push({
          bundleId: bundle._id,
          slug: bundle.slug,
          title: bundle.title.en,
          language: line.language,
          books: books.flatMap((book) => {
            const edition = book?.editions[line.language]
            return edition ? [edition.title] : []
          }),
          quantity: line.quantity,
          unitPaise: bundle.variants[line.language].pricePaise,
        })
      }
      const itemsPaise = lines.reduce(
        (sum, line) => sum + line.unitPaise * line.quantity,
        0
      )
      const deliveryPaise = order.fulfilment === "delivery" ? shippingPaise : 0

      /* Shipped parcels carry courier details, as the staff mutation insists. */
      const courier =
        order.courier ??
        (order.fulfilment === "delivery" &&
        (order.status === "shipped" || order.status === "delivered")
          ? {
              name: "Fixture Courier",
              trackingNumber: `SEED-${written + 1}`,
            }
          : undefined)

      await ctx.db.insert("orders", {
        personId,
        reference: order.reference ?? (await allocateOrderReference(ctx)),
        status: order.status,
        fulfilment: order.fulfilment,
        contact: { name: order.name, phone },
        courier,
        lines,
        itemsPaise,
        deliveryPaise,
        totalPaise: itemsPaise + deliveryPaise,
        address: order.address,
        placedAt,
        updatedAt: placedAt,
        seenAt: order.seen ? placedAt : undefined,
        revision: 0,
      })
      written += 1
    }

    return { written }
  },
})

const SEED_EDITION = v.object({
  title: v.string(),
  subtitle: v.optional(v.string()),
  edition: v.string(),
  pages: v.number(),
})

const SEED_VARIANT = v.object({
  /** Rupees in the fixture, paise in the database. */
  priceRupees: v.number(),
  compareRupees: v.optional(v.number()),
  available: v.boolean(),
})

const toPaise = (rupees: number) => Math.round(rupees * 100)

/**
 * Sample books, bundles and resources, published and marked `sample` so the
 * public pages say so. A record the owner has since edited is left alone.
 */
export const seedCatalog = internalMutation({
  args: {
    books: v.array(
      v.object({
        slug: v.string(),
        exam: v.string(),
        description: v.optional(LOCALISED),
        contents: v.array(v.string()),
        editions: v.object({
          en: v.optional(SEED_EDITION),
          as: v.optional(SEED_EDITION),
        }),
      })
    ),
    bundles: v.array(
      v.object({
        slug: v.string(),
        exam: v.string(),
        title: LOCALISED,
        tagline: v.optional(LOCALISED),
        description: LOCALISED,
        books: v.array(v.string()),
        variants: v.object({ en: SEED_VARIANT, as: SEED_VARIANT }),
        sortOrder: v.number(),
        soldCount: v.number(),
      })
    ),
    resources: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        exam: v.string(),
        kind: RESOURCE_KIND,
        description: v.string(),
      })
    ),
  },
  returns: v.object({
    books: v.number(),
    bundles: v.number(),
    resources: v.number(),
  }),
  handler: async (ctx, args) => {
    assertLocalDeployment()
    const now = Date.now()
    const counts = { books: 0, bundles: 0, resources: 0 }
    const bookIds = new Map<string, Id<"books">>()

    for (const book of args.books) {
      const existing = await ctx.db
        .query("books")
        .withIndex("by_slug", (q) => q.eq("slug", book.slug))
        .unique()
      if (existing) {
        bookIds.set(book.slug, existing._id)
        if (!existing.sample) continue
      }
      const editions = {
        en: book.editions.en && { ...book.editions.en, samplePages: [] },
        as: book.editions.as && { ...book.editions.as, samplePages: [] },
      }
      const fields = { ...book, editions, sample: true, updatedAt: now }
      if (existing)
        await ctx.db.replace(existing._id, {
          ...fields,
          revision: existing.revision + 1,
        })
      else
        bookIds.set(
          book.slug,
          await ctx.db.insert("books", { ...fields, revision: 0 })
        )
      counts.books += 1
    }

    for (const { books, variants, ...bundle } of args.bundles) {
      const existing = await ctx.db
        .query("bundles")
        .withIndex("by_slug", (q) => q.eq("slug", bundle.slug))
        .unique()
      if (existing && !existing.sample) continue
      const variant = (seed: typeof variants.en) => ({
        pricePaise: toPaise(seed.priceRupees),
        comparePaise:
          seed.compareRupees === undefined
            ? undefined
            : toPaise(seed.compareRupees),
        available: seed.available,
      })
      const fields = {
        ...bundle,
        bookIds: books.map((slug) => {
          const id = bookIds.get(slug)
          if (!id)
            throw new Error(`Bundle ${bundle.slug} names unknown book ${slug}`)
          return id
        }),
        variants: { en: variant(variants.en), as: variant(variants.as) },
        published: true,
        sample: true,
        updatedAt: now,
      }
      if (existing)
        await ctx.db.replace(existing._id, {
          ...fields,
          revision: existing.revision + 1,
        })
      else await ctx.db.insert("bundles", { ...fields, revision: 0 })
      counts.bundles += 1
    }

    for (const resource of args.resources) {
      const existing = await ctx.db
        .query("resources")
        .withIndex("by_slug", (q) => q.eq("slug", resource.slug))
        .unique()
      if (existing && !existing.sample) continue
      const fields = {
        ...resource,
        published: true,
        sample: true,
        updatedAt: now,
      }
      if (existing)
        await ctx.db.patch(existing._id, {
          ...fields,
          revision: existing.revision + 1,
        })
      else
        await ctx.db.insert("resources", {
          ...fields,
          pageImages: [],
          revision: 0,
        })
      counts.resources += 1
    }

    return counts
  },
})

/**
 * Sample posts for /blog, published and marked `sample` like the catalogue.
 * A post the owner has since touched is real and left alone.
 */
export const seedPosts = internalMutation({
  args: {
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        excerpt: v.string(),
        body: v.string(),
        /** How long ago the post went live. Fractions are fine. */
        daysAgo: v.number(),
      })
    ),
  },
  returns: v.object({ posts: v.number() }),
  handler: async (ctx, args) => {
    assertLocalDeployment()
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    let posts = 0

    for (const { daysAgo, ...post } of args.posts) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", post.slug))
        .unique()
      if (existing && !existing.sample) continue
      const fields = {
        ...post,
        published: true,
        publishedAt: existing?.publishedAt ?? now - daysAgo * day,
        sample: true,
        updatedAt: now,
      }
      if (existing)
        await ctx.db.patch(existing._id, {
          ...fields,
          revision: existing.revision + 1,
        })
      else await ctx.db.insert("posts", { ...fields, revision: 0 })
      posts += 1
    }

    return { posts }
  },
})

/** Take back what this module wrote, without destroying what a person earned. */
export const clearSeed = internalMutation({
  args: {},
  returns: v.object({
    removed: v.number(),
    keptVerified: v.number(),
    activities: v.number(),
    orders: v.number(),
    catalog: v.number(),
  }),
  handler: async (ctx) => {
    assertLocalDeployment()

    /* Sample titles, and who opened the sample resources. */
    let catalog = 0
    for await (const bundle of ctx.db.query("bundles")) {
      if (!bundle.sample) continue
      await ctx.db.delete(bundle._id)
      catalog += 1
    }
    for await (const book of ctx.db.query("books")) {
      if (!book.sample) continue
      await ctx.db.delete(book._id)
      catalog += 1
    }
    const sampleResources = new Set<string>()
    for await (const resource of ctx.db.query("resources")) {
      if (!resource.sample) continue
      sampleResources.add(resource._id)
      await ctx.db.delete(resource._id)
      catalog += 1
    }
    for await (const open of ctx.db.query("resourceOpens"))
      if (sampleResources.has(open.resourceId)) await ctx.db.delete(open._id)
    for await (const post of ctx.db.query("posts")) {
      if (!post.sample) continue
      await ctx.db.delete(post._id)
      catalog += 1
    }

    const seeded = await ctx.db
      .query("persons")
      .filter((q) => q.eq(q.field("source"), SEED_SOURCE))
      .collect()

    let removed = 0
    let kept = 0
    let activities = 0
    let orders = 0

    for (const person of seeded) {
      const owned = await ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .collect()
      for (const activity of owned) {
        await ctx.db.delete(activity._id)
        activities += 1
      }
      const enquiries = await ctx.db
        .query("enquiries")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .collect()
      for (const enquiry of enquiries) await ctx.db.delete(enquiry._id)

      /* Orders go with the Person whether or not the Person survives. */
      const placed = await ctx.db
        .query("orders")
        .withIndex("by_personId_and_placedAt", (q) =>
          q.eq("personId", person._id)
        )
        .collect()
      for (const order of placed) {
        await ctx.db.delete(order._id)
        orders += 1
      }

      if (person.verifiedAt) {
        await ctx.db.patch(person._id, {
          leadStatus: undefined,
          interestTrack: undefined,
          lastEnquiryAt: undefined,
          updatedAt: Date.now(),
        })
        kept += 1
        continue
      }

      await ctx.db.delete(person._id)
      removed += 1
    }

    return { removed, keptVerified: kept, activities, orders, catalog }
  },
})

export const seedPeople = internalMutation({
  args: {
    people: v.array(
      v.object({
        phone: v.string(),
        name: v.string(),
        role: PERSON_ROLE,
        /** Whether to stamp `verifiedAt`. */
        verified: v.optional(v.boolean()),
      })
    ),
  },
  returns: v.array(
    v.object({
      phone: v.string(),
      role: PERSON_ROLE,
      created: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    assertLocalDeployment()

    const results = []
    for (const person of args.people) {
      const phone = toE164(person.phone)
      if (!phone)
        throw new Error(`Not a valid Indian mobile number: ${person.phone}`)

      const existing = await ctx.db
        .query("persons")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first()

      const now = Date.now()
      const verifiedAt = person.verified ? now : undefined

      if (existing) {
        await ctx.db.patch(existing._id, {
          /*
           * An empty name in the fixture means "do not set one", not "erase the one they
           * have".
           */
          name: person.name.trim() || existing.name,
          role: person.role,
          revision: (existing.revision ?? 0) + 1,
          updatedAt: now,
          ...(verifiedAt ? { verifiedAt } : {}),
        })
        results.push({ phone, role: person.role, created: false })
        continue
      }

      await ctx.db.insert("persons", {
        phone,
        name: person.name,
        role: person.role,
        source: SEED_SOURCE,
        updatedAt: now,
        revision: 0,
        ...(verifiedAt ? { verifiedAt } : {}),
      })
      results.push({ phone, role: person.role, created: true })
    }
    return results
  },
})
