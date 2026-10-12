"use client"

import { IconRefresh, IconSchool } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"

import { convexConfigured } from "@/app/providers"
import { CatalogOnly } from "@/components/admin/book-editor"
import { CATALOG_REFUSALS } from "@/components/admin/catalog-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
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
import { Switch } from "@/components/ui/switch"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { rupeeDraft, rupeesToPaise } from "@/lib/catalog"
import { enquiryTracks } from "@/lib/leads"
import { formatPaise } from "@/lib/money"

const TRACK_ITEMS = [
  { value: "", label: "Not set" },
  ...enquiryTracks.map((track) => ({ value: track, label: track })),
]

const when = (at: number) =>
  new Date(at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })

/** Courses as ClassPlus lists them, plus the few details only ICT knows. */
export default function AdminCoursesPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Courses.">
        Not available here.
      </PageShell>
    )
  return <Courses />
}

function Courses() {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const data = useQuery(api.courses.adminCourses)
  const syncNow = useMutation(api.courses.syncNow)
  const [syncing, setSyncing] = useState(false)

  if (allowed === undefined || data === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Courses.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed || !data) return <CatalogOnly />

  async function onSync() {
    setSyncing(true)
    try {
      const result = await syncNow({})
      if (result.ok)
        toast.success("Checking ClassPlus. This takes a few seconds.")
      else
        toast.error(
          result.reason === "rate-limited"
            ? "A sync ran a moment ago. Try again in a minute."
            : (CATALOG_REFUSALS[result.reason] ?? "Not started.")
        )
    } catch {
      toast.error("Could not reach the server. Try again.")
    } finally {
      setSyncing(false)
    }
  }

  const rows = [...data.rows].sort(
    (a, b) =>
      Number(Boolean(a.missingSince)) - Number(Boolean(b.missingSince)) ||
      (a.local.sortOrder ?? Infinity) - (b.local.sortOrder ?? Infinity) ||
      b.finalPricePaise - a.finalPricePaise
  )

  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">Courses.</span>}
    >
      <div className="grid gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border p-4">
          <div className="grid gap-1 text-sm">
            <p>
              Names, prices and descriptions come from ClassPlus and update
              every six hours. Change them there.
            </p>
            <p className="text-muted-foreground">
              {data.lastSync
                ? data.lastSync.status === "ok"
                  ? `Last checked ${when(data.lastSync.at)}.`
                  : `The last check failed (${when(data.lastSync.at)}): ${data.lastSync.error}. The site keeps showing the previous data.`
                : "Not checked yet."}
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={onSync}
            disabled={syncing}
          >
            {syncing ? <Spinner /> : <IconRefresh stroke={1.75} aria-hidden />}
            Sync now
          </Button>
        </div>

        {rows.length ? (
          <ul className="grid gap-4">
            {rows.map((course) => (
              <li key={course.id}>
                <CourseRow course={course} />
              </li>
            ))}
          </ul>
        ) : (
          <StatePanel
            icon={<IconSchool stroke={1.75} />}
            title="No courses yet"
            description="Sync now to bring in ICT's courses from ClassPlus."
          />
        )}
      </div>
    </PageShell>
  )
}

type Row = NonNullable<
  ReturnType<typeof useQuery<typeof api.courses.adminCourses>>
>["rows"][number]

function CourseRow({ course }: { course: Row }) {
  const save = useMutation(api.courses.saveLocal)
  const initial = {
    track: course.local.track ?? "",
    hidden: course.local.hidden,
    sortOrder: course.local.sortOrder?.toString() ?? "",
    batchStarts: course.local.batchStarts ?? "",
    timing: course.local.timing ?? "",
    offlineFee:
      course.local.offlineFeePaise === undefined
        ? ""
        : `${course.local.offlineFeePaise / 100}`,
  }
  const [draft, setDraft] = useState(initial)
  const [revision, setRevision] = useState(course.revision)
  const [busy, setBusy] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)
  const prefix = `course-${course.id}`

  async function onSave() {
    const offlineFeePaise = draft.offlineFee
      ? rupeesToPaise(draft.offlineFee)
      : undefined
    if (offlineFeePaise === null) {
      toast.error("Offline fee must be in rupees, like 20000.")
      return
    }
    setBusy(true)
    try {
      const result = await save({
        id: course.id as Id<"courses">,
        expectedRevision: revision,
        local: {
          track: draft.track || undefined,
          hidden: draft.hidden,
          sortOrder: draft.sortOrder ? Number(draft.sortOrder) : undefined,
          batchStarts: draft.batchStarts || undefined,
          timing: draft.timing || undefined,
          offlineFeePaise,
        },
      })
      if (result.ok) {
        setRevision(result.revision)
        toast.success("Saved")
      } else
        toast.error(
          result.reason === "invalid-input"
            ? `Check the ${result.field ?? "details"}.`
            : (CATALOG_REFUSALS[result.reason] ?? "Not saved.")
        )
    } catch {
      toast.error("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="grid gap-5 rounded-card border border-border p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="font-medium text-balance">{course.name}</h2>
          <p className="tnum text-sm text-muted-foreground">
            {course.finalPricePaise
              ? formatPaise(course.finalPricePaise)
              : "Free"}{" "}
            · {course.enrolled} enrolled on ClassPlus
          </p>
        </div>
        <div className="flex items-center gap-3">
          {course.missingSince ? <Badge>No longer on ClassPlus</Badge> : null}
          <Switch
            id={`${prefix}-shown`}
            checked={!draft.hidden}
            onCheckedChange={(on) => setDraft({ ...draft, hidden: !on })}
          />
          <label htmlFor={`${prefix}-shown`} className="text-sm">
            Shown on the site
          </label>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field>
          <FieldLabel htmlFor={`${prefix}-track`}>Exam</FieldLabel>
          <Select
            value={draft.track}
            onValueChange={(value) =>
              setDraft({ ...draft, track: (value as string) ?? "" })
            }
            items={TRACK_ITEMS}
          >
            <SelectTrigger id={`${prefix}-track`} className="w-full">
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
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-starts`}>Batch starts</FieldLabel>
          <Input
            id={`${prefix}-starts`}
            type="date"
            value={draft.batchStarts}
            onChange={(e) =>
              setDraft({ ...draft, batchStarts: e.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-timing`}>Class time</FieldLabel>
          <Input
            id={`${prefix}-timing`}
            placeholder="7-9 AM"
            value={draft.timing}
            onChange={(e) => setDraft({ ...draft, timing: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-offline`}>Offline fee (₹)</FieldLabel>
          <Input
            id={`${prefix}-offline`}
            inputMode="decimal"
            value={draft.offlineFee}
            onChange={(e) =>
              setDraft({ ...draft, offlineFee: rupeeDraft(e.target.value) })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-order`}>Position</FieldLabel>
          <Input
            id={`${prefix}-order`}
            inputMode="numeric"
            value={draft.sortOrder}
            onChange={(e) =>
              setDraft({
                ...draft,
                sortOrder: e.target.value.replace(/\D/g, "").slice(0, 3),
              })
            }
          />
        </Field>
      </div>
      <div>
        <Button size="sm" onClick={onSave} disabled={!dirty || busy}>
          {busy ? <Spinner /> : null}
          {dirty ? "Save" : "Saved"}
        </Button>
      </div>
    </article>
  )
}
