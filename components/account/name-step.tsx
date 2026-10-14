"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { QuestionnaireForm } from "@/components/account/questionnaire-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useStalled } from "@/components/ui/use-stalled"
import { api } from "@/convex/_generated/api"
import { identify, track } from "@/lib/analytics"
import { TERMS_VERSION } from "@/lib/terms"

/** What the form needs, which is less than the whole Person. */
type Viewer = { name: string; revision: number; role?: string }

/** "What should ICT call you?" - asked once, immediately after verification. */
export function NameStep({ next }: { next: string }) {
  const router = useRouter()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const questionnaire = useQuery(api.profile.ownQuestionnaire)
  const [done, setDone] = useState(false)
  const acceptTerms = useMutation(api.profile.acceptTerms)
  const recorded = useRef(false)

  // They ticked "I agree" to get here; record it on the account once the
  // session is live (a returning Person keeps the first acceptance).
  useEffect(() => {
    if (!viewer || recorded.current) return
    recorded.current = true
    identify(viewer.id)
    track({ name: "signed_in" })
    void acceptTerms({ version: TERMS_VERSION }).catch((error) =>
      console.error("[terms] not recorded", error)
    )
  }, [viewer, acceptTerms])

  /*
   * `null` here does NOT mean "signed out", and treating it as if it did was a
   * real bug:
   */
  const settled = viewer ?? null
  const waiting = settled === null
  const giveUp = useStalled(waiting, 8000)

  const hasName = !!settled?.name.trim()
  /*
   * The questionnaire follows the name, once, for someone never asked.
   * `answers === null` means never asked; skipped or answered is an object.
   * A returning Person passes straight through both steps.
   */
  // Students only: the questions are about preparing for an exam, and staff
  // signing in to work the queue should land on it, not on a survey.
  const asking =
    hasName &&
    !done &&
    settled?.role === "student" &&
    questionnaire != null &&
    questionnaire.answers === null

  /*
   * In an effect rather than during render, because it navigates. A Person
   * who already has a name passes straight through, so this never becomes a
   * toll gate on every sign-in.
   */
  useEffect(() => {
    if (waiting && !giveUp) return
    if (settled === null) {
      router.push(next)
      router.refresh()
      return
    }
    if (!hasName) return
    // Still loading the answers: wait rather than skip the question.
    if (questionnaire === undefined && !done) return
    if (asking) return
    router.push(next)
    router.refresh()
  }, [
    settled,
    waiting,
    giveUp,
    hasName,
    questionnaire,
    asking,
    done,
    next,
    router,
  ])

  if (settled !== null && !hasName) return <NameForm viewer={settled} />

  if (asking && questionnaire)
    return (
      <div className="grid gap-4">
        <p className="font-medium">Tell us about your preparation</p>
        <QuestionnaireForm
          initial={null}
          revision={questionnaire.revision}
          mode="onboarding"
          onDone={() => setDone(true)}
        />
      </div>
    )

  return (
    <div className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
      <Spinner />
      Signing you in…
    </div>
  )
}

function NameForm({ viewer }: { viewer: Viewer }) {
  const setOwnName = useMutation(api.profile.setOwnName)

  const nameId = useId()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  /* Focused once the form is on screen, the same way the code step does it. */
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Please enter your name.")
      return
    }
    setError(null)
    setPending(true)
    let result
    try {
      result = await setOwnName({
        name,
        // The revision this screen read the Person at. KIT-55's convention: an
        // edit names the version it is editing, so a concurrent change refuses
        // rather than overwrites.
        expectedRevision: viewer.revision,
      })
    } catch {
      setError("Couldn't save. Check your connection and try again.")
      setPending(false)
      return
    }
    setPending(false)

    /*
     * `Refusal` is `{ ok: false, ... }`, so `"ok" in result` would be true of both
     * branches and narrow the error case to `never`.
     */
    if (!result.ok) {
      setError(
        result.reason === "revision-conflict"
          ? "This changed in another tab. Check your name and save again."
          : result.reason === "anonymous"
            ? "Your session expired. Please log in again."
            : "Couldn't save your name. Please try again."
      )
      // Input is deliberately not cleared. The runbook makes preserving what
      // somebody typed an acceptance gate, and a conflict is exactly when
      // discarding it is least forgivable.
      return
    }

    // Nothing to do: the Person query updates live, and NameStep moves on to
    // the questionnaire or the destination once the name arrives.
  }

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={nameId}>Your name</FieldLabel>
          <Input
            id={nameId}
            ref={nameRef}
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={120}
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (error) setError(null)
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${nameId}-error` : `${nameId}-hint`}
          />
          {error ? (
            <FieldError id={`${nameId}-error`}>{error}</FieldError>
          ) : (
            <FieldDescription id={`${nameId}-hint`}>
              As you&rsquo;d like ICT to address you.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit" size="md" disabled={pending}>
            {pending ? (
              <>
                <IconLoader2 className="animate-spin" stroke={1.75} />
                Saving
              </>
            ) : (
              <>
                Continue
                <IconArrowRight stroke={1.75} />
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
