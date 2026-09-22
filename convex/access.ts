import { ConvexError } from "convex/values"
import type { QueryCtx } from "./_generated/server"
import { authComponent } from "./auth"
import { findVerifiedPerson } from "./persons"

export type DomainIdentity = Parameters<typeof findVerifiedPerson>[1]
export async function readAccess(ctx: Pick<QueryCtx, "db">, identity: DomainIdentity) {
  const person = await findVerifiedPerson(ctx, identity)
  return person && (person.role === "staff" || person.role === "owner") ? person : null
}
export async function requireAccess(ctx: Pick<QueryCtx, "db">, identity: DomainIdentity, write = false) {
  const person = await readAccess(ctx, identity)
  if (!person || (write && person.role !== "owner")) throw new ConvexError({code: "FORBIDDEN", message: "You do not have permission for this action."})
  return person
}
export async function requireOwner(ctx: QueryCtx) {
  return requireAccess(ctx, await authComponent.safeGetAuthUser(ctx), true)
}
export function requireRevision(actual: number, expected: number) {
  if (!Number.isSafeInteger(expected) || actual !== expected) throw new ConvexError({code: "CONFLICT", message: "This record changed. Reload it before saving again."})
}
