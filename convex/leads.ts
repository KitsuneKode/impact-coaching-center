import { authComponent } from "./auth"
import { findVerifiedPerson } from "./persons"
import { query, type QueryCtx } from "./_generated/server"

/**
 * The signed-in Person, but only if they are staff.
 *
 * Authentication is not authorization (spec §21): a session proves who
 * somebody is and implies no permission at all. Every verified student holds
 * a perfectly valid session, so the check that keeps them out of the leads
 * inbox has to live here, in the query, and not in the page that renders it.
 * A page-level guard protects the page; it does not protect the data, which
 * is still one fetch away.
 *
 * Returns null rather than throwing, because the caller is a public route and
 * an anonymous visitor must get an empty screen, not a 500.
 */
export async function staffFromIdentity(
  ctx: Pick<QueryCtx, "db">,
  identity: Parameters<typeof findVerifiedPerson>[1]
) {
  const person = await findVerifiedPerson(ctx, identity)
  if (!person) return null
  return person.role === "staff" || person.role === "owner" ? person : null
}

/**
 * Takes the identity as an argument, like findVerifiedPerson, so the decision
 * is testable without standing up the Better Auth component. Fetching the
 * identity is the thin part; deciding what it may see is the part worth
 * covering, and every role has a test.
 */
async function staffPerson(ctx: QueryCtx) {
  return staffFromIdentity(ctx, await authComponent.safeGetAuthUser(ctx))
}

/** How many enquirers one screen shows before staff should filter instead. */
const PAGE_SIZE = 100

/**
 * Enquirers in follow-up order, most recently active first.
 *
 * Projected, never whole documents: a Person carries the synthetic
 * @person.ict.invalid address that ADR-0001 says must never be presented as
 * contactable, and staff notes live on `activities` precisely so an export of
 * this screen cannot leak them.
 */
export async function readInbox(
  ctx: Pick<QueryCtx, "db">,
  identity: Parameters<typeof findVerifiedPerson>[1]
) {
  const staff = await staffFromIdentity(ctx, identity)
  if (!staff) return { authorized: false as const, leads: [] }

  const rows = await ctx.db
    .query("persons")
    .withIndex("by_leadStatus")
    .order("desc")
    .take(PAGE_SIZE)

  return {
    authorized: true as const,
    leads: rows
      .filter((person) => person.leadStatus !== undefined)
      .map((person) => ({
        id: person._id,
        name: person.name,
        phone: person.phone,
        leadStatus: person.leadStatus,
        interestTrack: person.interestTrack,
        lastEnquiryAt: person.lastEnquiryAt,
        verifiedAt: person.verifiedAt,
      })),
  }
}

export const inbox = query({
  args: {},
  handler: async (ctx) =>
    readInbox(ctx, await authComponent.safeGetAuthUser(ctx)),
})

/**
 * Whether the viewer may see the inbox at all, for the page shell.
 *
 * Separate from `inbox` so the page can render a truthful "you do not have
 * access" without also asking for the rows and discarding them.
 */
export const canSeeInbox = query({
  args: {},
  handler: async (ctx) => (await staffPerson(ctx)) !== null,
})
