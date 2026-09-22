import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { paginated, requireStaff, type Viewer } from "./authz"
import { LEAD_STATUS } from "./schema"
import { query, type QueryCtx } from "./_generated/server"

/** The inbox projection. Never the whole Person document. */
const INBOX_ROW = v.object({
  id: v.id("persons"),
  name: v.string(),
  phone: v.string(),
  leadStatus: v.optional(LEAD_STATUS),
  interestTrack: v.optional(v.string()),
  lastEnquiryAt: v.optional(v.number()),
  verifiedAt: v.optional(v.number()),
})

/**
 * The follow-up queue, paginated, as the shared contract requires.
 *
 * Access goes through `requireStaff`, not a local check: role is read from
 * the Person record and the session is re-verified against its age on every
 * call, so a demoted staff member or a stale staff session stops answering
 * on the very next request. A refusal returns an empty page rather than an
 * `authorized` flag, because `usePaginatedQuery` requires a plain
 * PaginationResult; `canSeeInbox` answers the access question on its own,
 * which is why the page can say "staff only" without fetching rows.
 *
 * Projected, never whole documents: a Person carries the synthetic
 * @person.ict.invalid address that ADR-0001 says must never be presented as
 * contactable, and staff notes live on `activities` precisely so an export
 * of this screen cannot leak them.
 *
 * `by_lastEnquiryAt` gives most-recently-active-first across every status -
 * `by_leadStatus` would group the queue by the status string, which sorts
 * "lost" ahead of "interested". Filtering inside the query lets Convex keep
 * filling each page instead of taking a page and then dropping rows.
 *
 * There is deliberately no total count. Counting would mean reading every
 * matching row on every page load, and a number derived from one page is
 * worse than no number: it looks authoritative and is wrong.
 */

/**
 * One page of the queue.
 *
 * Re-checks the role on whatever it is given rather than trusting that the
 * caller already did, so the function is safe under a future caller that
 * skipped `requireStaff`. The session-age cutoff is NOT repeated here - it
 * lives in `requireStaff`, which the public query above is the only caller
 * of.
 */
export async function readInboxPage(
  ctx: Pick<QueryCtx, "db">,
  staff: Viewer | null,
  paginationOpts: { numItems: number; cursor: string | null }
) {
  if (!staff || (staff.role !== "staff" && staff.role !== "owner"))
    return { page: [], isDone: true, continueCursor: "" }

  const result = await ctx.db
    .query("persons")
    .withIndex("by_lastEnquiryAt")
    .order("desc")
    .filter((q) => q.neq(q.field("leadStatus"), undefined))
    .paginate(paginationOpts)

  return {
    ...result,
    page: result.page.map((person) => ({
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

export const inboxPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginated(INBOX_ROW),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { page: [], isDone: true, continueCursor: "" }
    return readInboxPage(ctx, staff.value, args.paginationOpts)
  },
})

/**
 * Whether the viewer may see the inbox at all, for the page shell.
 *
 * Separate from `inboxPage` so the screen can render a truthful "you do not
 * have access" without also asking for the rows and discarding them.
 */
export const canSeeInbox = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireStaff(ctx)).ok,
})
