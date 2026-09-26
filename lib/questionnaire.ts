import { enquiryTimings, enquiryTracks } from "./leads"

/** The three questions asked after the first sign-in. */
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
