import { v } from "convex/values"

import {
  checkRevision,
  invalidInput,
  mutationResult,
  revisionOf,
  viewerPerson,
  type Viewer,
} from "./authz"
import { cleanName } from "../lib/person-name"
import { cleanAnswers, type QuestionnaireAnswers } from "../lib/questionnaire"
import { mutation, query, type MutationCtx } from "./_generated/server"

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
 * One field: names in Assam do not reliably split into first and last, and
 * `persons.name` is one string. `cleanName` (lib/person-name.ts) tidies it and
 * refuses what is not a name.
 *
 * Revision-checked like every other edit. A conflict returns the current
 * revision rather than throwing, so the screen can re-present what the person
 * typed instead of discarding it.
 */
export const setOwnName = mutation({
  args: {
    name: v.string(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number(), name: v.string() }),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer

    const name = cleanName(args.name)
    if (!name) return invalidInput("name")

    // Re-read inside the mutation rather than trusting the viewer snapshot:
    // the revision must be checked against the row as it is at the moment of
    // the write.
    const person = await ctx.db.get(viewer.value.id)
    if (!person) return invalidInput("person")

    const conflict = checkRevision(person, args.expectedRevision)
    if (conflict) return conflict

    const revision = revisionOf(person) + 1
    await ctx.db.patch(person._id, { name, revision, updatedAt: Date.now() })

    return { ok: true as const, revision, name }
  },
})

const QUESTIONNAIRE = v.object({
  targetExam: v.optional(v.string()),
  attempt: v.optional(v.union(v.literal("first"), v.literal("repeat"))),
  preferredBatch: v.optional(v.string()),
  answeredAt: v.optional(v.number()),
  skippedAt: v.optional(v.number()),
})

/**
 * The signed-in Person's onboarding answers, or `null` when they have never
 * been asked. `undefined` from the hook means loading, `null` means "ask", and
 * an object with only `skippedAt` means "asked, and they chose not to" - three
 * states the onboarding step and the account page both need to tell apart.
 */
export const ownQuestionnaire = query({
  args: {},
  returns: v.union(
    v.object({
      revision: v.number(),
      answers: v.union(QUESTIONNAIRE, v.null()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return null
    const person = await ctx.db.get(viewer.value.id)
    if (!person) return null
    return {
      revision: revisionOf(person),
      answers: person.questionnaire ?? null,
    }
  },
})

/**
 * Save, change or skip the three onboarding questions.
 *
 * Every answer is optional, so a partial save is a save. `skip` records that
 * the Person was asked and declined, without discarding answers given earlier:
 * skipping from the account page must not erase what they told us last week.
 * Values are checked against the same lists the form renders
 * (lib/questionnaire.ts); an unknown value is refused rather than stored where
 * no filter can find it.
 */
export async function applyQuestionnaire(
  ctx: MutationCtx,
  viewer: Viewer,
  args: QuestionnaireAnswers & { skip: boolean; expectedRevision: number }
) {
  const person = await ctx.db.get(viewer.id)
  if (!person) return invalidInput("person")
  const conflict = checkRevision(person, args.expectedRevision)
  if (conflict) return conflict

  const now = Date.now()
  let questionnaire
  if (args.skip) {
    questionnaire = { ...person.questionnaire, skippedAt: now }
  } else {
    const answers = cleanAnswers(args)
    if (!answers) return invalidInput("answers")
    questionnaire = { ...answers, answeredAt: now }
  }

  const revision = revisionOf(person) + 1
  await ctx.db.patch(person._id, { questionnaire, revision, updatedAt: now })
  return { ok: true as const, revision }
}

export const setOwnQuestionnaire = mutation({
  args: {
    targetExam: v.optional(v.string()),
    attempt: v.optional(v.union(v.literal("first"), v.literal("repeat"))),
    preferredBatch: v.optional(v.string()),
    skip: v.boolean(),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    if (!viewer.ok) return viewer
    return applyQuestionnaire(ctx, viewer.value, args)
  },
})
