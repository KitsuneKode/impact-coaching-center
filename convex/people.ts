import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { toE164 } from "../lib/leads"
import {
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  ownerCount,
  requireOwner,
  revisionOf,
  type Viewer,
} from "./authz"
import { internalMutation, mutation, query } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"

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
    // A plain PaginationResult, because `usePaginatedQuery` requires that
    // shape. `canManagePeople` answers access on its own, the same split the
    // leads inbox uses, so a non-owner costs one boolean rather than a read
    // of who has access to what.
    const owner = await requireOwner(ctx)
    if (!owner.ok) return { page: [], isDone: true, continueCursor: "" }

    const staff = await ctx.db
      .query("persons")
      .withIndex("by_role", (q) => q.eq("role", "staff"))
      .paginate(args.paginationOpts)

    /*
     * Owners are always few and always wanted in full, so they are read
     * separately and prepended rather than paginated alongside staff. They
     * join the FIRST page only: `usePaginatedQuery` concatenates `page`
     * across loads, and owners prepended to every page would repeat in the
     * rendered table. The first request carries `cursor: null`, which is
     * the only signal a Convex paginated query gives for "page one".
     */
    if (args.paginationOpts.cursor !== null) {
      return { ...staff, page: staff.page.map(project) }
    }

    const owners = await ctx.db
      .query("persons")
      .withIndex("by_role", (q) => q.eq("role", "owner"))
      .collect()

    return {
      ...staff,
      page: [...owners.map(project), ...staff.page.map(project)],
    }
  },
})

/**
 * The audit record every role change leaves behind.
 *
 * `activities` is where status changes, notes and handoffs already live;
 * a role change is the most consequential of all of them, so it lands here
 * too - who changed, on whom, from what to what. `actorId` is absent only
 * for `bootstrapOwner`, whose actor is the deployment operator rather than
 * a Person in the system.
 */
async function recordRoleChange(
  ctx: MutationCtx,
  person: { _id: Viewer["id"]; role: Viewer["role"] },
  toRole: Viewer["role"],
  actorId?: Viewer["id"]
) {
  await ctx.db.insert("activities", {
    personId: person._id,
    kind: "role_change",
    body: `Role: ${person.role} → ${toRole}`,
    ...(actorId ? { actorId } : {}),
  })
}

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

    const revision = revisionOf(person) + 1
    await ctx.db.patch(args.personId, {
      role: args.role,
      revision,
      updatedAt: Date.now(),
    })
    await recordRoleChange(ctx, person, args.role, owner.value.id)

    return { ok: true as const, revision }
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

    // The same canonical shape every other phone input takes: a "+91"
    // prefix check would accept "+91junk" and refuse "98765 43210", while
    // the index this looks up is keyed on the normalised form.
    const phone = toE164(args.phone)
    if (!phone) return invalidInput("phone")

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
    await recordRoleChange(ctx, person, "staff", owner.value.id)

    return { ok: true as const }
  },
})

/**
 * Make somebody the first owner, from the server side only.
 *
 * The chicken-and-egg the contract resolves: only an owner may grant roles,
 * and on day one there is no owner. This is the audited path - run once via
 * `npx convex run` or the dashboard function runner, both of which already
 * require deploy access. The dashboard row-edit remains documented as the
 * break-glass fallback.
 *
 * Three refusals keep it honest: it only works while no owner exists, so it
 * can never demote or race an established one; it never creates a Person,
 * because granting access to a number nobody has verified would be a way
 * to claim a handset that might belong to somebody else; and it refuses
 * anything that is not an Indian mobile, the only shape `by_phone` stores.
 */
export const bootstrapOwner = internalMutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    if ((await ownerCount(ctx)) > 0) return forbidden

    const phone = toE164(args.phone)
    if (!phone) return invalidInput("phone")

    const person = await ctx.db
      .query("persons")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique()

    if (!person) return missingRecord
    if (!person.verifiedAt) return invalidInput("verification")
    if (person.role === "owner") return { ok: true as const }

    await ctx.db.patch(person._id, {
      role: "owner",
      revision: revisionOf(person) + 1,
      updatedAt: Date.now(),
    })
    await recordRoleChange(ctx, person, "owner")

    return { ok: true as const }
  },
})

/**
 * Whether the viewer may manage access at all, for the page shell.
 *
 * Separate from `listAdmins` so the screen can say "owner only" truthfully
 * without also reading the list of who has access and discarding it.
 */
export const canManagePeople = query({
  args: {},
  handler: async (ctx) => (await requireOwner(ctx)).ok,
})
