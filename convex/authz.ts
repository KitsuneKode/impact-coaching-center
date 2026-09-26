import { v } from "convex/values"
import type { GenericValidator, PropertyValidators } from "convex/values"

import { authComponent } from "./auth"
import { findVerifiedPerson } from "./persons"
import { components } from "./_generated/api"
import type { MutationCtx, QueryCtx } from "./_generated/server"

/**
 * One place that answers "may this caller do this".
 *
 * Authentication is not authorization (spec §21). A session proves who
 * somebody is and implies no permission at all: every verified student holds a
 * perfectly valid one. So the decision lives here, in the backend, and never
 * in a page or a prop.
 *
 * ## Why a result rather than a throw
 *
 * Half the callers are public routes. `getAuthUser` throws for anonymous
 * visitors, which renders a 500 for everyone who is not signed in - a bug this
 * codebase has already been bitten by once. A refusal is a normal outcome
 * here, so it is returned as a value and the caller decides whether that is a
 * 401, an empty screen or a redirect.
 *
 * ## Why the categories are enumerated
 *
 * The execution runbook requires anonymous, forbidden, missing-record,
 * invalid-input and revision-conflict to be distinguishable. A single boolean
 * cannot tell a signed-out visitor ("log in, this will work") from a signed-in
 * student ("log in again and it still will not"), and showing the wrong one of
 * those two is how a product feels broken.
 */
export type Refusal =
  | { ok: false; reason: "anonymous" }
  | { ok: false; reason: "forbidden" }
  | { ok: false; reason: "missing-record" }
  | { ok: false; reason: "invalid-input"; field?: string }
  | { ok: false; reason: "revision-conflict"; current: number }

export type Allowed<T> = { ok: true; value: T }
export type Decision<T> = Allowed<T> | Refusal

export const allow = <T>(value: T): Allowed<T> => ({ ok: true, value })
export const anonymous: Refusal = { ok: false, reason: "anonymous" }
export const forbidden: Refusal = { ok: false, reason: "forbidden" }
export const missingRecord: Refusal = { ok: false, reason: "missing-record" }
export const invalidInput = (field?: string): Refusal => ({
  ok: false,
  reason: "invalid-input",
  field,
})
export const revisionConflict = (current: number): Refusal => ({
  ok: false,
  reason: "revision-conflict",
  current,
})

/**
 * The Refusal type as a returns validator, so a public mutation that
 * accidentally returns something else - or a future field riding along on a
 * projection - fails loudly at the boundary instead of reaching the client.
 */
export const REFUSAL = v.union(
  v.object({ ok: v.literal(false), reason: v.literal("anonymous") }),
  v.object({ ok: v.literal(false), reason: v.literal("forbidden") }),
  v.object({ ok: v.literal(false), reason: v.literal("missing-record") }),
  v.object({
    ok: v.literal(false),
    reason: v.literal("invalid-input"),
    field: v.optional(v.string()),
  }),
  v.object({
    ok: v.literal(false),
    reason: v.literal("revision-conflict"),
    current: v.number(),
  })
)

/** `{ page, isDone, continueCursor }`, the shape `usePaginatedQuery` needs. */
export const paginated = <V extends GenericValidator>(row: V) =>
  v.object({
    page: v.array(row),
    isDone: v.boolean(),
    continueCursor: v.string(),
  })

/** `{ ok: true, ...fields }` on success, a Refusal otherwise. */
export const mutationResult = <S extends PropertyValidators>(success: S) =>
  v.union(v.object({ ok: v.literal(true), ...success }), REFUSAL)

type Ctx = QueryCtx | MutationCtx
export type Viewer = NonNullable<Awaited<ReturnType<typeof findVerifiedPerson>>>

/**
 * The signed-in Person, or why not.
 *
 * `findVerifiedPerson` fails closed for anonymous, unverified and incompletely
 * linked identities, so an unverified session is `anonymous` here rather than
 * a half-privileged state. There is no partial verification (ADR-0001).
 */
export async function viewerPerson(ctx: Ctx): Promise<Decision<Viewer>> {
  const person = await findVerifiedPerson(
    ctx,
    await authComponent.safeGetAuthUser(ctx)
  )
  return person ? allow(person) : anonymous
}

/**
 * Staff or owner.
 *
 * Read from the Person record in the database, never from anything the caller
 * supplied. There is no code path that lets a role arrive from a public input,
 * and adding one is a STOP condition in the plan rather than a refactor.
 */
export async function requireStaff(ctx: Ctx): Promise<Decision<Viewer>> {
  const viewer = await viewerPerson(ctx)
  if (!viewer.ok) return viewer
  const { role } = viewer.value
  if (role !== "staff" && role !== "owner") return forbidden
  if (!(await privilegedSessionFresh(ctx))) return anonymous
  return viewer
}

/** Owner only. Every write that changes who may do what goes through this. */
export async function requireOwner(ctx: Ctx): Promise<Decision<Viewer>> {
  const viewer = await viewerPerson(ctx)
  if (!viewer.ok) return viewer
  if (viewer.value.role !== "owner") return forbidden
  if (!(await privilegedSessionFresh(ctx))) return anonymous
  return viewer
}

/**
 * Seven days, hard-capped from sign-in, for anyone touching staff data.
 *
 * Spec §10 asks for 7-day staff sessions against a 90-day student session.
 * Better Auth cannot express the split - `session.expiresIn` is global, and
 * shortening a staff row's expiry is silently undone by the next sliding
 * refresh - so the boundary lives here instead, in the check every
 * privileged call already makes. A stale session answers `anonymous`, which
 * is the refusal that sends somebody through verification again, minting a
 * fresh session. That is what "expired" is supposed to mean.
 *
 * Hard-capped on `createdAt`, not sliding on `updatedAt`: a cap that
 * refreshes with activity is a cap a daily user never meets, which is a
 * 7-day lifetime in name only.
 */
export const STAFF_SESSION_MAX_MS = 7 * 24 * 60 * 60 * 1000

/** Pure comparison, split out so the boundary is testable. */
export function sessionStale(createdAt: number, now: number): boolean {
  return now - createdAt > STAFF_SESSION_MAX_MS
}

/**
 * Whether the caller's session is young enough for staff work.
 *
 * The session row is read through the component's adapter - the same
 * `findOne` lookup `safeGetAuthUser` performs - because the Convex identity
 * carries only the session id, not its age. A session that cannot be found
 * is not fresh: the check fails closed.
 */
async function privilegedSessionFresh(ctx: Ctx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity?.sessionId) return false
  const session = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "session",
    where: [{ field: "_id", value: identity.sessionId as string }],
  })) as { createdAt?: number } | null
  if (!session?.createdAt) return false
  return !sessionStale(session.createdAt, Date.now())
}

/**
 * How many owners exist.
 *
 * Used for last-owner protection. Counted rather than cached: the count is
 * read inside the same mutation that would change it, so two concurrent
 * demotions cannot each see two owners and both proceed.
 */
export async function ownerCount(ctx: Ctx): Promise<number> {
  const owners = await ctx.db
    .query("persons")
    .withIndex("by_role", (q) => q.eq("role", "owner"))
    .collect()
  return owners.length
}

/**
 * The shape every admin mutation returns.
 *
 * A refusal keeps its category so the UI can be specific, and a
 * revision-conflict carries the current revision so the client can re-present
 * the caller's own input against the newer record rather than discarding what
 * they typed.
 */
export function refusalMessage(refusal: Refusal): string {
  switch (refusal.reason) {
    case "anonymous":
      return "Log in to continue."
    case "forbidden":
      return "Your account does not have access to this."
    case "missing-record":
      return "That record no longer exists."
    case "invalid-input":
      return refusal.field
        ? `Check the ${refusal.field} field.`
        : "Check the details and try again."
    case "revision-conflict":
      return "Somebody else changed this while you were editing. Your changes are still here - review them against the current version."
  }
}

/**
 * A record's current revision, treating absent as 0.
 *
 * Rows written before the convention existed have no `revision`, and
 * backfilling them would be a migration for no benefit: the first edit writes
 * 1 either way, and a caller holding 0 for an untouched record is holding the
 * truth.
 */
export function revisionOf(doc: { revision?: number }): number {
  return doc.revision ?? 0
}

/**
 * Check the caller's expected revision against the stored one.
 *
 * Returned rather than thrown, and carrying the current value, so the UI can
 * show the caller their own input against the newer record instead of
 * discarding what they typed. The runbook makes preserving input on conflict
 * an acceptance gate.
 */
export function checkRevision(
  doc: { revision?: number },
  expected: number
): Refusal | null {
  const current = revisionOf(doc)
  return current === expected ? null : revisionConflict(current)
}
