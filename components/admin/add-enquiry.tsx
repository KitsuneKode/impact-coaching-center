"use client"

import { IconPlus } from "@tabler/icons-react"
import { useMutation } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { enquiryTracks, toE164 } from "@/lib/leads"

/** How the person reached the desk; stored as `staff_<key>` on the Person. */
const SOURCES = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone_call", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
] as const

type Source = (typeof SOURCES)[number]["value"]

/** The exam field's "not asked" option; a Select item cannot be empty. */
const NO_TRACK = "no-track"

const TRACK_ITEMS = [
  { value: NO_TRACK, label: "Not asked" },
  ...enquiryTracks.map((track) => ({ value: track, label: track })),
]

const REFUSALS: Record<string, string> = {
  anonymous:
    "Your session has ended. Log in again; what you typed is still here.",
  forbidden: "Your account can no longer add enquiries.",
  "missing-record": "That record no longer exists.",
  "revision-conflict": "Something changed while this was open. Try again.",
}

/** The server's field names, as the form's messages. */
function fieldMessage(field: string | undefined) {
  switch (field) {
    case "name":
      return "Give their name."
    case "phone":
      return "A 10 digit mobile number."
    case "track":
      return "Pick one of the listed exams."
    case "note":
      return "Keep the note under 1000 characters."
    default:
      return "Check the details and try again."
  }
}

/**
 * The desk's door into the queue: a walk-in or a caller becomes an enquiry
 * without ever filling the public form.
 */
export function AddEnquiry({
  onCreated,
}: {
  onCreated?: (personId: Id<"persons">) => void
}) {
  const create = useMutation(api.leads.createLead)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [track, setTrack] = useState(NO_TRACK)
  const [source, setSource] = useState<Source>("walk_in")
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setFormError(null)

    const checked: Record<string, string> = {}
    if (name.trim().length === 0) checked.name = fieldMessage("name")
    if (!toE164(phone)) checked.phone = fieldMessage("phone")
    if (Object.keys(checked).length > 0) {
      setErrors(checked)
      return
    }

    setBusy(true)
    try {
      const result = await create({
        name,
        phone,
        source,
        ...(track !== NO_TRACK ? { track } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      })
      if (!result.ok) {
        if (result.reason === "invalid-input")
          setErrors({ [result.field ?? "phone"]: fieldMessage(result.field) })
        else setFormError(REFUSALS[result.reason] ?? "Not added.")
        return
      }
      toast.success("Enquiry added")
      setOpen(false)
      setName("")
      setPhone("")
      setTrack(NO_TRACK)
      setSource("walk_in")
      setNote("")
      onCreated?.(result.personId)
    } catch {
      setFormError("Could not reach the server. What you typed is still here.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        <IconPlus stroke={1.75} aria-hidden />
        Add enquiry
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add an enquiry</DialogTitle>
            <DialogDescription>
              For someone who walked in or called - their number is how the
              queue recognises them next time.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} noValidate id="add-enquiry">
            <FieldGroup>
              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="enquiry-name">Name</FieldLabel>
                <Input
                  id="enquiry-name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field data-invalid={errors.phone ? true : undefined}>
                <FieldLabel htmlFor="enquiry-phone">Mobile</FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="pl-3.5">
                    <InputGroupText className="tnum border-r border-border pr-3 text-[0.9375rem] text-foreground">
                      +91
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="enquiry-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={errors.phone ? true : undefined}
                    className="tnum"
                  />
                </InputGroup>
                <FieldError>{errors.phone}</FieldError>
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={errors.track ? true : undefined}>
                  <FieldLabel htmlFor="enquiry-track">Exam</FieldLabel>
                  <Select
                    value={track}
                    onValueChange={(v) => setTrack(v ?? NO_TRACK)}
                    items={TRACK_ITEMS}
                  >
                    <SelectTrigger id="enquiry-track" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRACK_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.track}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="enquiry-source">
                    How they reached us
                  </FieldLabel>
                  <Select
                    value={source}
                    onValueChange={(v) => v && setSource(v as Source)}
                    items={SOURCES}
                  >
                    <SelectTrigger id="enquiry-source" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field data-invalid={errors.note ? true : undefined}>
                <FieldLabel htmlFor="enquiry-note">Note</FieldLabel>
                <Textarea
                  id="enquiry-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  aria-invalid={errors.note ? true : undefined}
                />
                {errors.note ? (
                  <FieldError>{errors.note}</FieldError>
                ) : (
                  <FieldDescription>
                    Optional. Seen by staff, never by the person.
                  </FieldDescription>
                )}
              </Field>
              {formError ? <FieldError>{formError}</FieldError> : null}
            </FieldGroup>
          </form>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" form="add-enquiry" disabled={busy}>
              {busy ? <Spinner /> : null}
              Add enquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
