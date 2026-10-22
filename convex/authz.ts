import { paginationResultValidator } from "convex/server"
import { v } from "convex/values"
import type { Infer, PropertyValidators, Validator, Value } from "convex/values"

import { authComponent } from "./auth"
import { findVerifiedPerson } from "./persons"
import { components } from "./_generated/api"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { GRANT } from "./schema"
import { hasGrant } from "../lib/grants"

/** One place that answers "may this caller do this". */
export type Refusal =
  | { ok: false; reason: "anonymous" }
  | { ok: false; reason: "forbidden" }
  | { ok: false; reason: "missing-record" }
  | { ok: false; reason: "invalid-input"; field?: string }
  | { ok: false; reason: "revision-conflict"; current: number }
  | { ok: false; reason: "rate-limited" }

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
  }),
  v.object({ ok: v.literal(false), reason: v.literal("rate-limited") })
)

/** The shape `.paginate()` returns, for a returns validator. */
export const paginated = <V extends Validator<Value, "required", string>>(
  row: V
) => paginationResultValidator(row)

/** `{ ok: true, ...fields }` on success, a Refusal otherwise. */
export const mutationResult = <S extends PropertyValidators>(success: S) =>
  v.union(v.object({ ok: v.literal(true), ...success }), REFUSAL)

type Ctx = QueryCtx | MutationCtx
export type Viewer = NonNullable<Awaited<ReturnType<typeof findVerifiedPerson>>>

/** The signed-in Person, or why not. */
export async function viewerPerson(ctx: Ctx): Promise<Decision<Viewer>> {
  const person = await findVerifiedPerson(
    ctx,
    await authComponent.safeGetAuthUser(ctx)
  )
  return person ? allow(person) : anonymous
}

/** Staff or owner. The role is read from the database, never from caller input. */
export async function requireStaff(ctx: Ctx): Promise<Decision<Viewer>> {
  const viewer = await viewerPerson(ctx)
  if (!viewer.ok) return viewer
  const { role } = viewer.value
  if (role !== "staff" && role !== "owner") return forbidden
  if (!(await privilegedSessionFresh(ctx))) return anonymous
  return viewer
}

type Grant = Infer<typeof GRANT>

export { hasGrant }

/** Owner, or staff holding `grant` (or, given a list, any one of them). */
export async function requireGrant(
  ctx: Ctx,
  grant: Grant | readonly Grant[]
): Promise<Decision<Viewer>> {
  const viewer = await requireStaff(ctx)
  if (!viewer.ok) return viewer
  const wanted: readonly Grant[] = typeof grant === "string" ? [grant] : grant
  return wanted.some((g) => hasGrant(viewer.value, g)) ? viewer : forbidden
}

/** Owner only. Every write that changes who may do what goes through this. */
export async function requireOwner(ctx: Ctx): Promise<Decision<Viewer>> {
  const viewer = await viewerPerson(ctx)
  if (!viewer.ok) return viewer
  if (viewer.value.role !== "owner") return forbidden
  if (!(await privilegedSessionFresh(ctx))) return anonymous
  return viewer
}

/** Counts stop here: past this, "99+" is the honest answer on a home screen. */
export const COUNT_CAP = 99

/** Seven days, hard-capped from sign-in, for anyone touching staff data. */
export const STAFF_SESSION_MAX_MS = 7 * 24 * 60 * 60 * 1000

/** Pure comparison, split out so the boundary is testable. */
export function sessionStale(createdAt: number, now: number): boolean {
  return now - createdAt > STAFF_SESSION_MAX_MS
}

/** Whether the caller signed in (with a WhatsApp code) within `maxAgeMs`. */
export async function signedInWithin(ctx: Ctx, maxAgeMs: number) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity?.sessionId) return false
  const session = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "session",
    where: [{ field: "_id", value: identity.sessionId as string }],
  })) as { createdAt?: number } | null
  return Boolean(
    session?.createdAt && Date.now() - session.createdAt <= maxAgeMs
  )
}

/** Whether the caller's session is young enough for staff work. */
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

/** How many owners exist, counted to two. */
export async function ownerCount(ctx: Ctx): Promise<number> {
  // Only "none", "one" or "more than one" is ever asked: two rows answer it.
  const owners = await ctx.db
    .query("persons")
    .withIndex("by_role", (q) => q.eq("role", "owner"))
    .take(2)
  return owners.length
}

/** The shape every admin mutation returns. */
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
    case "rate-limited":
      return "Too many attempts just now - wait a little and try again."
  }
}

/** A record's current revision, treating absent as 0. */
export function revisionOf(doc: { revision?: number }): number {
  return doc.revision ?? 0
}

/** Check the caller's expected revision against the stored one. */
export function checkRevision(
  doc: { revision?: number },
  expected: number
): Refusal | null {
  const current = revisionOf(doc)
  return current === expected ? null : revisionConflict(current)
}
