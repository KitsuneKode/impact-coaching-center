import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import {
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  ownerCount,
  requireOwner,
  revisionOf,
} from "./authz"
import { mutation, query } from "./_generated/server"

/**
 * Who may use the admin, and at what level. Owner only, both ways.
 *
 * Every function here re-checks authorization at the point of the write
 * rather than once at the top of a handler that then awaits. A role can be
 * revoked between the check and the write, and the runbook asks for an
 * "immediate authorization recheck on every protected operation".
 */

/** The fields the admin list needs. Never the whole Person document. */
const project = (person: {
  _id: string
  name: string
  phone: string
  role: "student" | "staff" | "owner"
  revision?: number
  verifiedAt?: number
}) => ({
  id: person._id,
  name: person.name,
  phone: person.phone,
  role: person.role,
  revision: revisionOf(person),
  verifiedAt: person.verifiedAt,
})

/**
 * Staff and owners, paginated.
 *
 * Only the people who already have access, not every Person ICT has ever
 * spoken to: this screen exists to review and revoke access, and listing
 * thousands of students to find four staff is the wrong shape. Granting
 * access starts from a phone number, which `grantStaff` looks up directly.
 */
export const listAdmins = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok)
      return { ...owner, page: [], isDone: true, continueCursor: "" }

    const staff = await ctx.db
      .query("persons")
      .withIndex("by_role", (q) => q.eq("role", "staff"))
      .paginate(args.paginationOpts)

    // Owners are always few and always wanted in full, so they are read
    // separately and prepended rather than paginated alongside staff.
    const owners = await ctx.db
      .query("persons")
      .withIndex("by_role", (q) => q.eq("role", "owner"))
      .collect()

    return {
      ok: true as const,
      ...staff,
      page: [...owners.map(project), ...staff.page.map(project)],
    }
  },
})

const ROLE = v.union(
  v.literal("student"),
  v.literal("staff"),
  v.literal("owner")
)

/**
 * Change somebody's role.
 *
 * Owner only, revision-checked, and refusing three things that would each be
 * a way to lock ICT out of their own product or to quietly escalate:
 *
 *  - demoting the last owner, so there is always somebody who can grant
 *  - an owner demoting themselves while they are the last one, same reason
 *  - promoting a Person who has never verified their number, because an
 *    unverified row is not yet proof that anybody controls that handset
 */
export const setRole = mutation({
  args: {
    personId: v.id("persons"),
    role: ROLE,
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner

    const person = await ctx.db.get(args.personId)
    if (!person) return missingRecord

    const conflict = checkRevision(person, args.expectedRevision)
    if (conflict) return conflict

    if (!person.verifiedAt && args.role !== "student")
      return invalidInput("verification")

    // Read inside this mutation, not before it: Convex runs mutations
    // transactionally, so two concurrent demotions cannot both observe two
    // owners and both proceed.
    if (person.role === "owner" && args.role !== "owner") {
      const owners = await ownerCount(ctx)
      if (owners <= 1) return forbidden
    }

    await ctx.db.patch(args.personId, {
      role: args.role,
      revision: revisionOf(person) + 1,
      updatedAt: Date.now(),
    })

    return { ok: true as const, revision: revisionOf(person) + 1 }
  },
})

/**
 * Grant staff access by phone number.
 *
 * Starts from the number rather than a list, because that is what an owner
 * actually has: the person is standing in front of them. The Person must
 * already exist and be verified - this grants access to somebody who has
 * proved they hold that handset, it never creates an account on their behalf.
 */
export const grantStaffByPhone = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner

    const phone = args.phone.trim()
    if (!phone.startsWith("+91")) return invalidInput("phone")

    const person = await ctx.db
      .query("persons")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique()

    if (!person) return missingRecord
    if (!person.verifiedAt) return invalidInput("verification")
    if (person.role !== "student") return invalidInput("role")

    await ctx.db.patch(person._id, {
      role: "staff",
      revision: revisionOf(person) + 1,
      updatedAt: Date.now(),
    })

    return { ok: true as const }
  },
})
