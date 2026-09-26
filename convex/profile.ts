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

/** What a Person may change about themselves. */

/** Give this Person a name. */
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
 * been asked.
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

/** Save, change or skip the three onboarding questions. */
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
