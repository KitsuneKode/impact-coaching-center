import { v } from "convex/values"

import {
  checkRevision,
  invalidInput,
  mutationResult,
  revisionOf,
  viewerPerson,
} from "./authz"
import { mutation } from "./_generated/server"

/**
 * Long enough for real names, short enough to refuse an essay.
 *
 * Assamese and Bengali names routinely run longer than English ones, so this
 * is generous on purpose; it exists to bound storage, not to police what a
 * person is called.
 */
const MAX_PART = 60

/**
 * What a Person may change about themselves.
 *
 * Their own record, and only the parts that are theirs to set. Role,
 * verification and lead status are all absent by design: a Person must never
 * be able to promote themselves, mark their own number verified, or edit where
 * staff have got to with them. `viewerPerson` resolves identity from the
 * session, so there is no personId argument to tamper with.
 */

/**
 * Give this Person a name.
 *
 * Better Auth creates the Person with `getTempName: () => ""`, and until now
 * nothing ever asked for a real one. The consequence was visible on every
 * page: the account menu showed a phone number where a name belongs, and the
 * avatar fell back to two digits of it. An empty name also means staff work a
 * queue of bare numbers, which is most of what makes a lead uncallable.
 *
 * Two arguments, one stored field. `persons.name` is a single string today,
 * and splitting it into given and family columns is a schema change that
 * belongs with the Convex lane's profile work. Taking the parts separately
 * here means that change is invisible to the interface when it lands: the
 * caller already sends them apart.
 *
 * Revision-checked like every other edit. A conflict returns the current
 * revision rather than throwing, so the screen can re-present what the person
 * typed instead of discarding it.
 */
export const setOwnName = mutation({
  args: {
    given: v.string(),
    family: v.string(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number(), name: v.string() }),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer

    const given = args.given.trim()
    const family = args.family.trim()

    // Given name is required; family name is not. A single-name person is not
    // a validation error, and refusing them would be a bug that only shows up
    // for the people least able to work around it.
    if (!given) return invalidInput("given")
    if (given.length > MAX_PART) return invalidInput("given")
    if (family.length > MAX_PART) return invalidInput("family")

    // Re-read inside the mutation rather than trusting the viewer snapshot:
    // the revision must be checked against the row as it is at the moment of
    // the write.
    const person = await ctx.db.get(viewer.value.id)
    if (!person) return invalidInput("person")

    const conflict = checkRevision(person, args.expectedRevision)
    if (conflict) return conflict

    const name = [given, family].filter(Boolean).join(" ")
    const revision = revisionOf(person) + 1
    await ctx.db.patch(person._id, { name, revision, updatedAt: Date.now() })

    return { ok: true as const, revision, name }
  },
})
