"use client"

import { IconCheck, IconLoader2, IconPencil } from "@tabler/icons-react"
import { useMutation } from "convex/react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { formatPhone } from "@/lib/brand"

type Viewer = { name: string; phone: string; revision: number }

/** Split a stored single-field name back into the two the form edits. */
function parts(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return { given: "", family: "" }
  const words = trimmed.split(/\s+/)
  if (words.length === 1) return { given: words[0] ?? "", family: "" }
  return {
    given: words.slice(0, -1).join(" "),
    family: words.at(-1) ?? "",
  }
}

/**
 * The details a Person can change about themselves, and the one they cannot.
 *
 * Read mode by default. An account screen is mostly visited to check something
 * rather than to change it, and a page of live inputs invites an accidental
 * edit and makes the current values harder to read at a glance.
 *
 * The mobile number is deliberately not editable here. It is the natural key
 * (ADR-0001) and the thing verification proved, so changing it is a
 * staff-assisted, audited operation - the spec requires actor, previous
 * number, new number and reason. Rendering it as a disabled input would
 * suggest it is nearly editable; a plain value with a sentence explaining who
 * can change it is honest.
 */
export function DetailsCard({ viewer }: { viewer: Viewer }) {
  const [editing, setEditing] = useState(false)

  if (!editing)
    return (
      <div className="max-w-160 rounded-card border border-border p-6">
        <dl className="grid gap-5">
          <div>
            <dt className="text-sm text-muted-foreground">Name</dt>
            <dd className="mt-1">
              {viewer.name.trim() || (
                <span className="text-muted-foreground">Not given yet</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Mobile number</dt>
            <dd className="tnum mt-1">{formatPhone(viewer.phone)}</dd>
            <dd className="mt-1 text-sm text-muted-foreground">
              This is how ICT knows who you are, so changing it needs their
              staff. Call or message them and they will move your account
              across.
            </dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          size="md"
          className="mt-6"
          onClick={() => setEditing(true)}
        >
          <IconPencil stroke={1.75} />
          Change your name
        </Button>
      </div>
    )

  return (
    <NameEditor
      viewer={viewer}
      onDone={() => setEditing(false)}
      onCancel={() => setEditing(false)}
    />
  )
}

function NameEditor({
  viewer,
  onDone,
  onCancel,
}: {
  viewer: Viewer
  onDone: () => void
  onCancel: () => void
}) {
  const setOwnName = useMutation(api.profile.setOwnName)
  const givenId = useId()
  const familyId = useId()

  const initial = parts(viewer.name)
  const [given, setGiven] = useState(initial.given)
  const [family, setFamily] = useState(initial.family)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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
      expectedRevision: viewer.revision,
    })
    setPending(false)

    // Discriminate on the value: `Refusal` carries an `ok` key too, so
    // `"ok" in result` is true of both branches.
    if (!result.ok) {
      setError(
        result.reason === "revision-conflict"
          ? "Your details changed somewhere else. Check what is below and save again."
          : result.reason === "anonymous"
            ? "Your session expired. Log in again and we will pick up here."
            : "That name could not be saved. Check it and try again."
      )
      // What they typed stays on screen. A conflict is precisely when
      // discarding it is least forgivable.
      return
    }
    onDone()
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-160 rounded-card border border-border p-6"
    >
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={givenId}>First name</FieldLabel>
          <Input
            id={givenId}
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
            <FieldDescription>Only your first name is needed.</FieldDescription>
          )}
        </Field>

        <Field orientation="horizontal">
          <Button type="submit" size="md" disabled={pending}>
            {pending ? (
              <>
                <IconLoader2 className="animate-spin" stroke={1.75} />
                Saving
              </>
            ) : (
              <>
                <IconCheck stroke={1.75} />
                Save
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            disabled={pending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
