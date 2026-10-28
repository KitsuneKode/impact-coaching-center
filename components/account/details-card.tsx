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

/** The details a Person can change about themselves, and the one they cannot. */
export function DetailsCard({ viewer }: { viewer: Viewer }) {
  const [editing, setEditing] = useState(false)

  if (!editing)
    return (
      <div className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]">
        <dl className="grid gap-5">
          <div>
            <dt className="text-sm text-muted-foreground">Name</dt>
            <dd className="mbs-1">
              {viewer.name.trim() || (
                <span className="text-muted-foreground">Not added</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Mobile number</dt>
            <dd className="tnum mbs-1">{formatPhone(viewer.phone)}</dd>
            <dd className="mbs-1 text-sm text-muted-foreground">
              To change your number, call or WhatsApp ICT.
            </dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          size="md"
          className="mbs-6"
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
  const nameId = useId()
  const [name, setName] = useState(viewer.name.trim())
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Enter your name.")
      return
    }
    setError(null)
    setPending(true)
    let result
    try {
      result = await setOwnName({
        name,
        expectedRevision: viewer.revision,
      })
    } catch {
      setError("Couldn't save. Check your connection and try again.")
      setPending(false)
      return
    }
    setPending(false)

    // Discriminate on the value: `Refusal` carries an `ok` key too, so
    // `"ok" in result` is true of both branches.
    if (!result.ok) {
      setError(
        result.reason === "revision-conflict"
          ? "This changed in another tab. Check your name and save again."
          : result.reason === "anonymous"
            ? "Your session expired. Log in again to save."
            : "Couldn't save your name. Check your connection and try again."
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
      className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
    >
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={nameId}>Your name</FieldLabel>
          <Input
            id={nameId}
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
