import { v } from "convex/values"

import { isDevelopmentDeployment } from "../lib/dev-deployment"
import { toE164 } from "../lib/leads"
import { internalMutation } from "./_generated/server"
import {
  BOOK_TONE,
  LEAD_STATUS,
  ORDER_STATUS,
  PERSON_ROLE,
  RESOURCE_KIND,
} from "./schema"
import { allocateOrderReference } from "./orders"

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

/** Orders, so the fulfilment queue can be designed against something. */
export const seedOrders = internalMutation({
  args: {
    orders: v.array(
      v.object({
        /* Fixtures may pin a reference for demos; absent, one is allocated
           the same collision-checked way a real order would get it. */
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
        items: v.array(
          v.object({
            title: v.string(),
            edition: v.optional(v.string()),
            quantity: v.number(),
            /** Rupees in the fixture, paise in the database. */
            unitRupees: v.number(),
          })
        ),
        deliveryRupees: v.number(),
        address: v.optional(
          v.object({
            line1: v.string(),
            line2: v.optional(v.string()),
            city: v.string(),
            district: v.optional(v.string()),
            pin: v.string(),
          })
        ),
      })
    ),
  },
  returns: v.object({ written: v.number() }),
  handler: async (ctx, args) => {
    assertLocalDeployment()

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
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

      // Rupees in the fixture because that is how a person writes a price;
      // paise in the database because that is the only way to add them up
      // without a rounding error turning into a wrong charge.
      const items = order.items.map((item) => ({
        title: item.title,
        edition: item.edition,
        quantity: item.quantity,
        unitPaise: Math.round(item.unitRupees * 100),
      }))
      const itemsPaise = items.reduce(
        (sum, item) => sum + item.unitPaise * item.quantity,
        0
      )
      const deliveryPaise = Math.round(order.deliveryRupees * 100)

      /* A shipped/delivered parcel order must carry courier details, same
         rule the staff mutation enforces. */
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
        courier,
        items,
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

/**
 * Sample books and resources, published and marked `sample` so the public
 * pages say so. A title the owner has since edited is real and left alone.
 */
export const seedCatalog = internalMutation({
  args: {
    books: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        subtitle: v.string(),
        exam: v.string(),
        edition: v.string(),
        pages: v.number(),
        /** Rupees in the fixture, paise in the database. */
        priceRupees: v.number(),
        tone: BOOK_TONE,
        description: v.string(),
        contents: v.array(v.string()),
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
  returns: v.object({ books: v.number(), resources: v.number() }),
  handler: async (ctx, args) => {
    assertLocalDeployment()
    const now = Date.now()
    let books = 0
    let resources = 0

    for (const { priceRupees, ...book } of args.books) {
      const existing = await ctx.db
        .query("books")
        .withIndex("by_slug", (q) => q.eq("slug", book.slug))
        .unique()
      if (existing && !existing.sample) continue
      const fields = {
        ...book,
        pricePaise: Math.round(priceRupees * 100),
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
        await ctx.db.insert("books", {
          ...fields,
          samplePages: [],
          revision: 0,
        })
      books += 1
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
      resources += 1
    }

    return { books, resources }
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
    for (const book of await ctx.db.query("books").collect()) {
      if (!book.sample) continue
      await ctx.db.delete(book._id)
      catalog += 1
    }
    for (const resource of await ctx.db.query("resources").collect()) {
      if (!resource.sample) continue
      const opens = await ctx.db
        .query("resourceOpens")
        .filter((q) => q.eq(q.field("resourceId"), resource._id))
        .collect()
      for (const open of opens) await ctx.db.delete(open._id)
      await ctx.db.delete(resource._id)
      catalog += 1
    }
    for (const post of await ctx.db.query("posts").collect()) {
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

      /* Orders go with the Person whether or not the Person survives. */
      const placed = await ctx.db
        .query("orders")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
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
