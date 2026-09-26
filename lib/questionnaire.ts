import { enquiryTimings, enquiryTracks } from "./leads"

/**
 * The three questions asked after the first sign-in.
 *
 * Each earns its place by changing what staff do on the call: which exam to
 * talk about, whether to talk about a first attempt or what went wrong last
 * time, and which batch to offer. Anything more is a survey
 * (docs/plans/2026-09-22-commerce-and-account-surfaces.md).
 *
 * Exam and batch reuse the enquiry form's lists, so a Person who enquired and
 * then signed in is described in the same words in both places, and adding a
 * Track adds it here too.
 */
export const questionnaireExams = enquiryTracks
export const questionnaireBatches = enquiryTimings

export const questionnaireAttempts = [
  { value: "first", label: "First attempt" },
  { value: "repeat", label: "I have tried before" },
] as const

export type QuestionnaireAttempt =
  (typeof questionnaireAttempts)[number]["value"]

export type QuestionnaireAnswers = {
  targetExam?: string
  attempt?: QuestionnaireAttempt
  preferredBatch?: string
}

/**
 * Answers with anything outside the lists dropped, or `null` if a value was
 * not recognised.
 *
 * Every question is optional, so an absent answer is valid. An unrecognised
 * one is not: it means the client and server disagree about the options, and
 * storing it would put a value in the lead sheet no filter can find.
 */
export function cleanAnswers(
  input: QuestionnaireAnswers
): QuestionnaireAnswers | null {
  const out: QuestionnaireAnswers = {}
  if (input.targetExam) {
    if (!(questionnaireExams as readonly string[]).includes(input.targetExam))
      return null
    out.targetExam = input.targetExam
  }
  if (input.attempt) {
    if (!questionnaireAttempts.some((a) => a.value === input.attempt))
      return null
    out.attempt = input.attempt
  }
  if (input.preferredBatch) {
    if (
      !(questionnaireBatches as readonly string[]).includes(
        input.preferredBatch
      )
    )
      return null
    out.preferredBatch = input.preferredBatch
  }
  return out
}

/** "First attempt", for display; the stored value is the short key. */
export const attemptLabel = (value: QuestionnaireAttempt) =>
  questionnaireAttempts.find((a) => a.value === value)?.label ?? value
