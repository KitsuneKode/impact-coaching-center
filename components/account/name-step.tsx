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

/** What the form needs, which is less than the whole Person. */
type Viewer = { name: string; revision: number }

/**
 * "What should ICT call you?" - asked once, immediately after verification.
 *
 * Better Auth creates the Person with an empty name, and until this existed
 * nothing ever filled it. The cost was visible everywhere: the account menu
 * printed a phone number where a name belongs, the avatar fell back to two
 * digits of it, and staff worked a follow-up queue of bare numbers - which is
 * most of what makes a lead uncallable.
 *
 * Asked here rather than later because this is the one moment it is cheap.
 * The person has just proved their number and is already filling in a form;
 * that momentum does not come back. Asking after they have what they came for
 * asks at the moment they leave.
 *
 * Required, and deliberately so - see
 * docs/plans/2026-09-22-commerce-and-account-surfaces.md. The questionnaire
 * that follows is skippable; a name is not, because a lead without one cannot
 * be acted on.
 *
 * Split in two so the form can be handed a Person that definitely exists.
 * Keeping it in one component meant the submit handler closed over a value
 * TypeScript could still see as null, and the honest fix for that is the
 * structure rather than an assertion.
 */
export function NameStep({ next }: { next: string }) {
  const router = useRouter()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const questionnaire = useQuery(api.profile.ownQuestionnaire)
  const [done, setDone] = useState(false)

  /*
   * `null` here does NOT mean "signed out", and treating it as if it did was a
   * real bug: verification had just succeeded, but the Convex client reports
   * no session for a beat before the new token propagates, so a freshly
   * verified Person was redirected past this screen and kept their empty name.
   * Observed against a real login, not theorised.
   *
   * So a settled answer is a Person. `null` is given the same grace as
   * `undefined`, and only becomes final once it has persisted - at which point
   * something genuinely went wrong with the session and sending them on is
   * better than trapping them on a form that cannot save.
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
  const asking =
    hasName && !done && questionnaire != null && questionnaire.answers === null

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
        <p className="font-medium">A little about you</p>
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

  const givenId = useId()
  const familyId = useId()
  const givenRef = useRef<HTMLInputElement>(null)

  const [given, setGiven] = useState("")
  const [family, setFamily] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  /*
   * Focused once the form is on screen, the same way the code step does it.
   * `autoFocus` moves focus on first paint wherever the element renders, which
   * is what the accessibility rule objects to; this component only mounts
   * after verification succeeded, which is a transition the person just asked
   * for.
   */
  useEffect(() => {
    givenRef.current?.focus()
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!given.trim()) {
      setError("Enter your first name.")
      return
    }
    setError(null)
    setPending(true)
    const result = await setOwnName({
      given,
      family,
      // The revision this screen read the Person at. KIT-55's convention: an
      // edit names the version it is editing, so a concurrent change refuses
      // rather than overwrites.
      expectedRevision: viewer.revision,
    })
    setPending(false)

    /*
     * `Refusal` is `{ ok: false, ... }`, so `"ok" in result` would be true of
     * both branches and narrow the error case to `never`. Discriminate on the
     * value, not the key - that exact mistake already shipped once here, and
     * typecheck was the only thing that caught it.
     */
    if (!result.ok) {
      setError(
        result.reason === "revision-conflict"
          ? "Your details changed somewhere else. Check the name below and try again."
          : result.reason === "anonymous"
            ? "Your session expired. Log in again and we will pick up here."
            : "That name could not be saved. Check it and try again."
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
          <FieldLabel htmlFor={givenId}>First name</FieldLabel>
          <Input
            id={givenId}
            ref={givenRef}
            name="given"
            autoComplete="given-name"
            required
            value={given}
            onChange={(event) => {
              setGiven(event.target.value)
              if (error) setError(null)
            }}
            aria-invalid={error ? true : undefined}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={familyId}>Last name</FieldLabel>
          <Input
            id={familyId}
            name="family"
            autoComplete="family-name"
            value={family}
            onChange={(event) => setFamily(event.target.value)}
          />
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              So ICT knows who they are speaking to. Only your first name is
              needed.
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
