import { authComponent } from "./auth"
import { findVerifiedPerson } from "./persons"
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
  return role === "staff" || role === "owner" ? viewer : forbidden
}

/** Owner only. Every write that changes who may do what goes through this. */
export async function requireOwner(ctx: Ctx): Promise<Decision<Viewer>> {
  const viewer = await viewerPerson(ctx)
  if (!viewer.ok) return viewer
  return viewer.value.role === "owner" ? viewer : forbidden
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
