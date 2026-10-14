"use client"

import { IconArrowUpRight, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { refreshSite } from "@/app/admin/refresh-site"
import { PublishState } from "@/components/admin/catalog-fields"
import { OwnerOnly } from "@/components/admin/post-editor"
import { Button, ButtonLink } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  CALENDAR_EXAMS,
  checkExamDate,
  DATE_KINDS,
  type CalendarExam,
  type DateKind,
  type ExamDateInput,
} from "@/lib/calendar"
import { examBySlug } from "@/lib/exams"

/** What each kind is called in the admin; the public page has its own words. */
export const KIND_LABELS: Record<DateKind, string> = {
  notification: "Notification",
  applications: "Applications",
  "admit-card": "Admit card",
  exam: "Exam day",
  "answer-key": "Answer key",
  result: "Result",
  interview: "Interview",
}

export const examLabel = (exam: CalendarExam) =>
  examBySlug(exam)?.name.en ?? exam

const EXAM_ITEMS = CALENDAR_EXAMS.map((value) => ({
  value,
  label: examLabel(value),
}))
const KIND_ITEMS = DATE_KINDS.map((value) => ({
  value,
  label: KIND_LABELS[value],
}))

const EMPTY: ExamDateInput = {
  exam: "apsc",
  kind: "exam",
  title: "",
  titleAs: "",
  starts: "",
  ends: "",
  tentative: false,
  source: "",
}

const snapshot = (draft: ExamDateInput) => JSON.stringify(draft)

const REFUSALS: Record<string, string> = {
  anonymous: "Your session has ended. Log in again; your changes are kept.",
  forbidden: "Only an owner can edit the calendar.",
  "missing-record": "This date no longer exists.",
  "revision-conflict":
    "This was changed in another tab. Reload to see that version, then make your change again.",
}

const MESSAGES: Record<string, string> = {
  exam: "Pick the exam.",
  kind: "Pick what the date is for.",
  title: "Name it the way the notice does, up to 120 characters.",
  titleAs: "Keep the Assamese title under 120 characters.",
  starts: "Pick the day.",
  ends: "The closing day cannot be before the opening day.",
  source:
    "Paste the official page or PDF address, starting with https:// or http://",
}

/** Owner-only: add a date, or edit the one at `id`. */
export function DateEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const row = useQuery(api.calendarAdmin.get, id ? { id } : "skip")

  if (allowed === undefined || (id && row === undefined))
    return (
      <Shell title="Date.">
        <ListSkeleton rows={6} />
      </Shell>
    )
  if (!allowed) return <OwnerOnly />
  if (id && !row)
    return (
      <Shell title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No date at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/calendar" size="md">
              All dates
            </ButtonLink>
          }
        />
      </Shell>
    )

  if (!row) return <DateForm key="new" initial={EMPTY} />
  const { id: rowId, revision, published, updatedAt: _, ...initial } = row
  return (
    <DateForm
      key={rowId}
      id={rowId}
      revision={revision}
      published={published}
      initial={initial}
    />
  )
}

function DateForm({
  id,
  initial,
  revision: loadedRevision = 0,
  published = false,
}: {
  id?: Id<"examDates">
  initial: ExamDateInput
  revision?: number
  published?: boolean
}) {
  const router = useRouter()
  const save = useMutation(api.calendarAdmin.save)
  const setPublished = useMutation(api.calendarAdmin.setPublished)

  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(() => snapshot(initial))
  const [revision, setRevision] = useState(loadedRevision)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const dirty = snapshot(draft) !== saved
  const set = <K extends keyof ExamDateInput>(
    key: K,
    value: ExamDateInput[K]
  ) => setDraft((d) => ({ ...d, [key]: value }))

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setFormError(null)
    const checked = checkExamDate(draft)
    if (!checked.ok) {
      setErrors({ [checked.field]: MESSAGES[checked.field] })
      return
    }
    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        ...checked.value,
      })
      if (!result.ok) {
        if (result.reason === "invalid-input" && result.field)
          setErrors({ [result.field]: MESSAGES[result.field] })
        else setFormError(REFUSALS[result.reason] ?? "Not saved.")
        return
      }
      setRevision(result.revision)
      setDraft(checked.value)
      setSaved(snapshot(checked.value))
      if (!id) {
        toast.success("Saved as a draft")
        router.replace(`/admin/calendar/${result.id}`)
      } else toast.success("Saved")
      if (published) void refreshSite("calendar")
    } catch {
      setFormError("Could not reach the server. Your changes are still here.")
    } finally {
      setBusy(false)
    }
  }

  async function onPublish() {
    if (!id) return
    setBusy(true)
    try {
      const result = await setPublished({
        id,
        published: !published,
        expectedRevision: revision,
      })
      if (!result.ok) {
        setFormError(REFUSALS[result.reason] ?? "Not changed.")
        return
      }
      setRevision(result.revision)
      toast.success(published ? "Unpublished" : "Published on the calendar")
      void refreshSite("calendar")
    } catch {
      setFormError("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const invalid = (name: string) => ({
    "data-invalid": errors[name] ? true : undefined,
  })
  const hint = (name: string, text: ReactNode) =>
    errors[name] ? (
      <FieldError>{errors[name]}</FieldError>
    ) : (
      <FieldDescription>{text}</FieldDescription>
    )

  return (
    <Shell title={id ? `${initial.title}.` : "New date."}>
      <form
        onSubmit={onSave}
        noValidate
        className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <FieldGroup className="max-w-2xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field {...invalid("exam")}>
              <FieldLabel htmlFor="date-exam">Exam</FieldLabel>
              <Select
                value={draft.exam}
                onValueChange={(next) =>
                  next && set("exam", next as CalendarExam)
                }
                items={EXAM_ITEMS}
              >
                <SelectTrigger id="date-exam" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field {...invalid("kind")}>
              <FieldLabel htmlFor="date-kind">What happens</FieldLabel>
              <Select
                value={draft.kind}
                onValueChange={(next) => next && set("kind", next as DateKind)}
                items={KIND_ITEMS}
              >
                <SelectTrigger id="date-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field {...invalid("title")}>
            <FieldLabel htmlFor="date-title">Title</FieldLabel>
            <Input
              id="date-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors.title}
              autoComplete="off"
              placeholder="CCE Prelims 2026"
            />
            {hint("title", "As the notice names it.")}
          </Field>
          <Field {...invalid("titleAs")}>
            <FieldLabel htmlFor="date-title-as">Title in Assamese</FieldLabel>
            <Input
              id="date-title-as"
              lang="as"
              value={draft.titleAs}
              onChange={(e) => set("titleAs", e.target.value)}
              aria-invalid={!!errors.titleAs}
              autoComplete="off"
            />
            {hint(
              "titleAs",
              "Optional. Left empty, /as shows the English title."
            )}
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field {...invalid("starts")}>
              <FieldLabel htmlFor="date-starts">Day</FieldLabel>
              <Input
                id="date-starts"
                type="date"
                value={draft.starts}
                onChange={(e) => set("starts", e.target.value)}
                aria-invalid={!!errors.starts}
              />
              {hint("starts", "The day it happens, or a window opens.")}
            </Field>
            <Field {...invalid("ends")}>
              <FieldLabel htmlFor="date-ends">Closes</FieldLabel>
              <Input
                id="date-ends"
                type="date"
                min={draft.starts || undefined}
                value={draft.ends}
                onChange={(e) => set("ends", e.target.value)}
                aria-invalid={!!errors.ends}
              />
              {hint("ends", "Only for a window, like applications.")}
            </Field>
          </div>

          <Field orientation="horizontal">
            <Checkbox
              id="date-tentative"
              checked={draft.tentative}
              onCheckedChange={(checked) => set("tentative", checked === true)}
            />
            <FieldLabel htmlFor="date-tentative" className="font-normal">
              The notice calls this date tentative
            </FieldLabel>
          </Field>

          <Field {...invalid("source")}>
            <FieldLabel htmlFor="date-source">Official source</FieldLabel>
            <Input
              id="date-source"
              type="url"
              inputMode="url"
              value={draft.source}
              onChange={(e) => set("source", e.target.value)}
              aria-invalid={!!errors.source}
              autoComplete="off"
              spellCheck={false}
              placeholder="https://apsc.nic.in/…"
            />
            {hint(
              "source",
              "The commission's page or PDF this date is from. Students see the link."
            )}
          </Field>
        </FieldGroup>

        <aside className="grid content-start gap-6 lg:sticky lg:inset-bs-6">
          <div className="grid gap-4 rounded-card border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Status</span>
              <PublishState published={published} />
            </div>
            <Button type="submit" size="md" disabled={busy || (!!id && !dirty)}>
              {busy ? <Spinner /> : null}
              {id ? (dirty ? "Save changes" : "Saved") : "Save as draft"}
            </Button>
            {id ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={busy || dirty}
                onClick={onPublish}
              >
                {published ? "Unpublish" : "Publish"}
              </Button>
            ) : null}
            {formError ? (
              <FieldError>{formError}</FieldError>
            ) : id && dirty ? (
              <p className="text-xs text-muted-foreground">
                Save your changes before publishing.
              </p>
            ) : null}
            {id && published && !dirty ? (
              <Link
                href="/exams/calendar"
                target="_blank"
                className="inline-flex items-center gap-1 text-sm underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                View the calendar
                <IconArrowUpRight
                  stroke={1.75}
                  className="size-4"
                  aria-hidden
                />
              </Link>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            A wrong date is unpublished, not deleted, so the change stays in the
            activity log.
          </p>
        </aside>
      </form>
    </Shell>
  )
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">{title}</span>}
    >
      {children}
    </PageShell>
  )
}
