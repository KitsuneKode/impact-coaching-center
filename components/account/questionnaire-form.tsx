"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { useMutation } from "convex/react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { api } from "@/convex/_generated/api"
import {
  questionnaireAttempts,
  questionnaireBatches,
  questionnaireExams,
  type QuestionnaireAnswers,
  type QuestionnaireAttempt,
} from "@/lib/questionnaire"

/**
 * One question as a set of native radios styled as options.
 *
 * Native inputs rather than a toggle group: a radio group is what this is,
 * and the browser gives arrow-key movement, a single tab stop and the right
 * announcement for free. Each option is a full-width label, so the target is
 * the whole row on a phone, not a small circle.
 */
function Choice<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: readonly { value: T; label: string }[]
  value: T | undefined
  onChange: (value: T) => void
}) {
  return (
    <FieldSet>
      <FieldLegend>{legend}</FieldLegend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border border-border px-3.5 py-2.5 text-[0.9375rem] transition-[border-color,background-color] has-checked:border-foreground has-checked:bg-muted has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-foreground"
            />
            {option.label}
          </label>
        ))}
      </div>
    </FieldSet>
  )
}

const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }))

/**
 * The three onboarding questions: exam, attempt, batch.
 *
 * Every question is optional and the whole form is skippable. "Skip for now"
 * is recorded, not just dismissed, so the account page can offer it again
 * without nagging and staff can tell "declined" from "never asked".
 *
 * Used twice: straight after the first sign-in (`onboarding`), and on the
 * account page to answer or change later (`account`).
 */
export function QuestionnaireForm({
  initial,
  revision,
  mode,
  onDone,
}: {
  initial: QuestionnaireAnswers | null
  revision: number
  mode: "onboarding" | "account"
  onDone: () => void
}) {
  const save = useMutation(api.profile.setOwnQuestionnaire)
  const id = useId()

  const [targetExam, setTargetExam] = useState(initial?.targetExam)
  const [attempt, setAttempt] = useState<QuestionnaireAttempt | undefined>(
    initial?.attempt
  )
  const [preferredBatch, setPreferredBatch] = useState(initial?.preferredBatch)
  const [pending, setPending] = useState<"save" | "skip" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(skip: boolean) {
    setPending(skip ? "skip" : "save")
    setError(null)
    try {
      const result = await save({
        targetExam,
        attempt,
        preferredBatch,
        skip,
        expectedRevision: revision,
      })
      if (!result.ok) {
        // Answers are kept on screen whatever went wrong.
        setError(
          result.reason === "revision-conflict"
            ? "This changed in another tab. Check your answers and save again."
            : result.reason === "anonymous"
              ? "Your session expired. Please log in again."
              : "Couldn't save your answers. Please try again."
        )
        return
      }
      onDone()
    } catch {
      setError("Couldn't save. Check your connection and try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void submit(false)
      }}
      aria-describedby={`${id}-why`}
      noValidate
    >
      <FieldGroup>
        <FieldDescription id={`${id}-why`}>
          Three quick questions, all optional. They help us suggest the right
          batch.
        </FieldDescription>

        <Choice
          legend="Which exam are you preparing for?"
          name={`${id}-exam`}
          options={asOptions(questionnaireExams)}
          value={targetExam}
          onChange={setTargetExam}
        />
        <Choice
          legend="Is this your first attempt?"
          name={`${id}-attempt`}
          options={questionnaireAttempts}
          value={attempt}
          onChange={setAttempt}
        />
        <Choice
          legend="Which batch suits you best?"
          name={`${id}-batch`}
          options={asOptions(questionnaireBatches)}
          value={preferredBatch}
          onChange={setPreferredBatch}
        />

        {error ? <FieldError>{error}</FieldError> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="md"
            disabled={pending !== null}
            onClick={() =>
              mode === "onboarding" ? void submit(true) : onDone()
            }
          >
            {pending === "skip" ? (
              <IconLoader2 className="animate-spin" />
            ) : null}
            {mode === "onboarding" ? "Skip for now" : "Cancel"}
          </Button>
          <Button type="submit" size="md" disabled={pending !== null}>
            {pending === "save" ? (
              <>
                <IconLoader2 className="animate-spin" stroke={1.75} />
                Saving
              </>
            ) : (
              <>
                {mode === "onboarding" ? "Continue" : "Save answers"}
                {mode === "onboarding" ? (
                  <IconArrowRight stroke={1.75} />
                ) : null}
              </>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
