"use client"

import { IconPencil } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useState } from "react"

import { QuestionnaireForm } from "@/components/account/questionnaire-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { attemptLabel } from "@/lib/questionnaire"

/**
 * The onboarding answers, readable and changeable.
 *
 * This is where a Person who skipped the questions after signing in can answer
 * them later, and where anyone can correct them. Read mode by default, like
 * the details card above it.
 */
export function AboutYouCard() {
  const data = useQuery(api.profile.ownQuestionnaire)
  const [editing, setEditing] = useState(false)

  if (data === undefined)
    return <Skeleton className="h-40 max-w-160 rounded-card" />
  if (data === null) return null

  const answers = data.answers
  const any =
    !!answers?.targetExam || !!answers?.attempt || !!answers?.preferredBatch

  return (
    <section
      aria-labelledby="about-you"
      className="max-w-160 rounded-card border border-border p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="about-you" className="font-medium">
            Your preparation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional. Helps us suggest the right batch.
          </p>
        </div>
        {!editing && any ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <IconPencil stroke={1.75} />
            Change
          </Button>
        ) : null}
      </div>

      <div className="mt-5">
        {editing ? (
          <QuestionnaireForm
            initial={answers}
            revision={data.revision}
            mode="account"
            onDone={() => setEditing(false)}
          />
        ) : any ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Preparing for</dt>
              <dd className="mt-1">{answers?.targetExam ?? "Not answered"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Attempt</dt>
              <dd className="mt-1">
                {answers?.attempt
                  ? attemptLabel(answers.attempt)
                  : "Not answered"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Batch</dt>
              <dd className="mt-1">
                {answers?.preferredBatch ?? "Not answered"}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-muted-foreground">
              {answers?.skippedAt ? "Not answered yet." : "Not answered yet."}
            </p>
            <Button size="md" onClick={() => setEditing(true)}>
              Add answers
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
