import { paginationOptsValidator } from "convex/server"
import { type Infer, v } from "convex/values"

import { toE164 } from "../lib/leads"
import { recordAudit } from "./audit"
import {
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  ownerCount,
  paginated,
  requireOwner,
  revisionOf,
  type Viewer,
} from "./authz"
import { GRANT, PERSON_ROLE } from "./schema"
import type { Id } from "./_generated/dataModel"
import { internalMutation, mutation, query } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"

/** Who may use the admin, and at what level. Owner only, both ways. */

/** The fields the admin list needs. Never the whole Person document. */
const project = (person: {
  _id: Id<"persons">
  name: string
  phone: string
  role: "student" | "staff" | "owner"
  grants?: Infer<typeof GRANT>[]
  revision?: number
  verifiedAt?: number
}) => ({
  id: person._id,
  name: person.name,
  phone: person.phone,
  role: person.role,
  grants: person.grants ?? [],
  revision: revisionOf(person),
  verifiedAt: person.verifiedAt,
})

/** The admin-list projection, as a returns validator. Never the whole doc. */
const ADMIN_ROW = v.object({
  id: v.id("persons"),
  name: v.string(),
  phone: v.string(),
  role: PERSON_ROLE,
  grants: v.array(GRANT),
  revision: v.number(),
  verifiedAt: v.optional(v.number()),
})

/** Staff and owners, paginated. */
/** Owners are a handful; the bound only keeps the read finite. */
const OWNERS_MAX = 20

export const listAdmins = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginated(ADMIN_ROW),
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
     * Owners are always few and always wanted in full, so they are read separately
     * and prepended rather than paginated alongside staff. They join the FIRST
     * page only:
     */
    if (args.paginationOpts.cursor !== null) {
      return { ...staff, page: staff.page.map(project) }
    }

    const owners = await ctx.db
      .query("persons")
      .withIndex("by_role", (q) => q.eq("role", "owner"))
      .take(OWNERS_MAX)

    return {
      ...staff,
      page: [...owners.map(project), ...staff.page.map(project)],
    }
  },
})

/** The audit record every role change leaves behind. */
async function recordRoleChange(
  ctx: MutationCtx,
  person: { _id: Viewer["id"]; role: Viewer["role"] },
  toRole: Viewer["role"],
  actorId?: Viewer["id"]
) {
  await recordAudit(ctx, actorId ? { id: actorId } : null, {
    action: "role_change",
    entity: "person",
    entityId: person._id,
    summary: `Role: ${person.role} → ${toRole}`,
    from: person.role,
    to: toRole,
  })
}

/** Change somebody's role. */
export const setRole = mutation({
  args: {
    personId: v.id("persons"),
    role: PERSON_ROLE,
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
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
      // Grants belong to the staff role; any role change starts them over.
      grants: undefined,
      revision,
      updatedAt: Date.now(),
    })
    await recordRoleChange(ctx, person, args.role, owner.value.id)

    return { ok: true as const, revision }
  },
})

/** Grant staff access by phone number. */
export const grantStaffByPhone = mutation({
  args: { phone: v.string() },
  returns: mutationResult({}),
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
      .first()

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

/** Open or close admin areas for a staff member. */
export const setGrants = mutation({
  args: {
    personId: v.id("persons"),
    grants: v.array(GRANT),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    return applySetGrants(ctx, owner.value, args)
  },
})

/** The grant change itself, split out so it can be tested without a session. */
export async function applySetGrants(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    personId: Id<"persons">
    grants: Infer<typeof GRANT>[]
    expectedRevision: number
  }
) {
  if (viewer.role !== "owner") return forbidden
  const person = await ctx.db.get(args.personId)
  if (!person) return missingRecord
  if (person.role !== "staff") return invalidInput("role")
  const conflict = checkRevision(person, args.expectedRevision)
  if (conflict) return conflict

  const grants = [...new Set(args.grants)].sort()
  const before = [...(person.grants ?? [])].sort()
  const revision = revisionOf(person) + 1
  await ctx.db.patch(person._id, { grants, revision, updatedAt: Date.now() })
  await recordAudit(ctx, viewer, {
    action: "grant_change",
    entity: "person",
    entityId: person._id,
    summary: `Access: ${before.join(", ") || "none"} → ${grants.join(", ") || "none"}`,
    from: before.join(","),
    to: grants.join(","),
  })
  return { ok: true as const, revision }
}

/** Make somebody the first owner, from the server side only. */
export const bootstrapOwner = internalMutation({
  args: { phone: v.string() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    if ((await ownerCount(ctx)) > 0) return forbidden

    const phone = toE164(args.phone)
    if (!phone) return invalidInput("phone")

    const person = await ctx.db
      .query("persons")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first()

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

/** Whether the viewer may manage access at all, for the page shell. */
export const canManagePeople = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireOwner(ctx)).ok,
})
