"use client"

import {
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconNote,
  IconPhone,
  IconPhoneCall,
  IconProgress,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useId, useState } from "react"

import { StatusBadge } from "@/components/admin/status-badge"
import { Button, ButtonAnchor } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { attemptLabel } from "@/lib/questionnaire"
import { formatPhone } from "@/lib/brand"
import { fromIstDateInput, morningInIst, toIstDateInput } from "@/lib/ist"

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "enrolled", label: "Enrolled" },
  { value: "lost", label: "Lost" },
] as const
type LeadStatus = (typeof STATUSES)[number]["value"]

const NOTE_MAX = 1000
const DAY = 86_400_000
const IST = "Asia/Kolkata"

function exact(at: number) {
  return new Date(at).toLocaleString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

function dayLabel(at: number) {
  return new Date(at).toLocaleDateString("en-IN", {
    timeZone: IST,
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

const REFUSAL_COPY: Record<string, string> = {
  "revision-conflict":
    "Someone else updated this enquiry a moment ago. The latest is shown; try again.",
  forbidden: "Your account can no longer change enquiries.",
  anonymous: "Your session has ended. Log in again to continue.",
  "missing-record": "This enquiry no longer exists.",
  "invalid-input": "That was not accepted. Check it and try again.",
}

type Result = { ok: true } | { ok: false; reason: string }

function describe(kind: string, from?: string, to?: string) {
  if (kind === "status_change")
    return from ? `Moved from ${from} to ${to}` : `Marked ${to}`
  if (kind === "call") return "Called"
  if (kind === "enquiry") return "Sent an enquiry"
  if (kind === "whatsapp_handoff") return "Opened WhatsApp from the site"
  if (kind === "role_change") return "Role changed"
  if (kind === "account_deleted") return "Deleted their account"
  return "Note"
}

/** One enquiry, and everything staff do with it. */
export function LeadSheet({
  personId,
  onOpenChange,
}: {
  personId: Id<"persons"> | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={personId !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto text-sm data-[side=right]:sm:max-w-md"
      >
        {personId ? <LeadDetail personId={personId} /> : null}
      </SheetContent>
    </Sheet>
  )
}

function LeadDetail({ personId }: { personId: Id<"persons"> }) {
  const detail = useQuery(api.leads.leadDetail, { personId })
  const setStatus = useMutation(api.leads.setLeadStatus)
  const setFollowUp = useMutation(api.leads.setLeadFollowUp)
  const addNote = useMutation(api.leads.addLeadNote)
  const logCall = useMutation(api.leads.logLeadCall)

  const noteId = useId()
  const followId = useId()
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // Read once per opening: "overdue" does not need to tick while the sheet is up.
  const [now] = useState(() => Date.now())

  if (detail === undefined)
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Spinner />
      </div>
    )

  if (!detail.ok)
    return (
      <SheetHeader className="p-6">
        <SheetTitle>Enquiry unavailable</SheetTitle>
        <SheetDescription>
          {REFUSAL_COPY[detail.reason] ?? REFUSAL_COPY["invalid-input"]}
        </SheetDescription>
      </SheetHeader>
    )

  const { lead, activities } = detail.value
  const overdue = lead.nextFollowUpAt !== undefined && lead.nextFollowUpAt < now
  const digits = lead.phone.replace(/^\+/, "")

  async function run(key: string, action: () => Promise<Result>) {
    setBusy(key)
    setMessage(null)
    try {
      const result = await action()
      if (!result.ok)
        setMessage(
          REFUSAL_COPY[result.reason] ?? REFUSAL_COPY["invalid-input"]!
        )
      return result.ok
    } catch {
      setMessage("That did not save. Check the connection and try again.")
      return false
    } finally {
      setBusy(null)
    }
  }

  const follow = (at: number | undefined) =>
    run("follow", () =>
      setFollowUp({ personId, at, expectedRevision: lead.revision })
    )

  return (
    <>
      <SheetHeader className="gap-3 border-b border-border p-6 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={lead.leadStatus} />
          {lead.interestTrack ? (
            <span className="text-muted-foreground">{lead.interestTrack}</span>
          ) : null}
          {lead.verifiedAt ? (
            <span className="text-muted-foreground">· Verified number</span>
          ) : null}
        </div>
        <SheetTitle className="text-xl font-medium">
          {lead.name.trim() || "Name not given"}
        </SheetTitle>
        <SheetDescription className="tnum text-base text-foreground">
          {lead.deletedAt ? "Number erased" : formatPhone(lead.phone)}
        </SheetDescription>
        {lead.deletedAt ? null : (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <ButtonAnchor
              href={`tel:${lead.phone}`}
              variant="primary"
              size="md"
            >
              <IconPhone stroke={1.75} />
              Call
            </ButtonAnchor>
            <ButtonAnchor
              href={`https://wa.me/${digits}`}
              target="_blank"
              variant="secondary"
              size="md"
            >
              <IconBrandWhatsapp stroke={1.75} />
              WhatsApp
            </ButtonAnchor>
          </div>
        )}
      </SheetHeader>

      <div className="flex flex-col gap-7 p-6">
        {message ? (
          <p role="alert" className="rounded-control bg-muted px-3 py-2">
            {message}
          </p>
        ) : null}

        {lead.deletedAt ? (
          <p className="rounded-control bg-muted px-3 py-2">
            This person deleted their account. Their name, number and answers
            were erased; the history below keeps only what staff did.
          </p>
        ) : null}

        {lead.targetExam || lead.attempt || lead.preferredBatch ? (
          <section
            aria-labelledby={`${followId}-about`}
            className="grid gap-2.5"
          >
            <h3 id={`${followId}-about`} className="font-medium">
              What they told us
            </h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              {lead.targetExam ? (
                <>
                  <dt className="text-muted-foreground">Preparing for</dt>
                  <dd>{lead.targetExam}</dd>
                </>
              ) : null}
              {lead.attempt ? (
                <>
                  <dt className="text-muted-foreground">Attempt</dt>
                  <dd>{attemptLabel(lead.attempt)}</dd>
                </>
              ) : null}
              {lead.preferredBatch ? (
                <>
                  <dt className="text-muted-foreground">Prefers</dt>
                  <dd>{lead.preferredBatch} batch</dd>
                </>
              ) : null}
            </dl>
          </section>
        ) : null}

        <section
          aria-labelledby={`${followId}-status`}
          className="grid gap-2.5"
        >
          <h3
            id={`${followId}-status`}
            className="flex items-center gap-2 font-medium"
          >
            <IconProgress stroke={1.75} className="size-4" aria-hidden />
            Status
          </h3>
          <ToggleGroup
            value={lead.leadStatus ? [lead.leadStatus] : []}
            onValueChange={(value) => {
              const next = value[0] as LeadStatus | undefined
              if (!next || next === lead.leadStatus) return
              void run("status", () =>
                setStatus({
                  personId,
                  status: next,
                  expectedRevision: lead.revision,
                })
              )
            }}
            disabled={busy === "status"}
            aria-label="Lead status"
            className="flex-wrap"
          >
            {STATUSES.map((status) => (
              <ToggleGroupItem key={status.value} value={status.value}>
                {status.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section aria-labelledby={`${followId}-title`} className="grid gap-2.5">
          <h3
            id={`${followId}-title`}
            className="flex items-center gap-2 font-medium"
          >
            <IconCalendarEvent stroke={1.75} className="size-4" aria-hidden />
            Next follow-up
          </h3>
          <p className={overdue ? "font-medium" : "text-muted-foreground"}>
            {lead.nextFollowUpAt
              ? `${overdue ? "Overdue since" : "Due"} ${dayLabel(lead.nextFollowUpAt)}`
              : "Not scheduled"}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Tomorrow", days: 1 },
              { label: "In 3 days", days: 3 },
              { label: "Next week", days: 7 },
            ].map((choice) => (
              <Button
                key={choice.label}
                variant="secondary"
                size="sm"
                disabled={busy === "follow"}
                onClick={() =>
                  void follow(morningInIst(choice.days, Date.now()))
                }
              >
                {choice.label}
              </Button>
            ))}
            {lead.nextFollowUpAt ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy === "follow"}
                onClick={() => void follow(undefined)}
              >
                Clear
              </Button>
            ) : null}
          </div>
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor={followId} className="text-muted-foreground">
                Or pick a date
              </Label>
              <Input
                id={followId}
                type="date"
                min={toIstDateInput(now)}
                max={toIstDateInput(now + 365 * DAY)}
                defaultValue={toIstDateInput(lead.nextFollowUpAt)}
                key={lead.nextFollowUpAt ?? "none"}
                onChange={(event) => {
                  const at = fromIstDateInput(event.target.value)
                  if (at) void follow(at)
                }}
              />
            </div>
          </div>
        </section>

        <section aria-label="Notes" className="grid gap-2.5">
          <h3 className="flex items-center gap-2 font-medium">
            <IconNote stroke={1.75} className="size-4" aria-hidden />
            <label htmlFor={noteId}>Add a note</label>
          </h3>
          <Textarea
            id={noteId}
            value={note}
            maxLength={NOTE_MAX}
            rows={3}
            placeholder="What was said, what they want next"
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={!note.trim() || busy === "note"}
              onClick={async () => {
                const ok = await run("note", () =>
                  addNote({ personId, body: note })
                )
                if (ok) setNote("")
              }}
            >
              Save note
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy === "call"}
              onClick={async () => {
                const ok = await run("call", () =>
                  logCall({ personId, body: note.trim() || undefined })
                )
                if (ok) setNote("")
              }}
            >
              <IconPhoneCall stroke={1.75} />
              Log a call
            </Button>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {note.length}/{NOTE_MAX}
            </span>
          </div>
        </section>

        <section aria-label="History" className="grid gap-3">
          <h3 className="font-medium">History</h3>
          {activities.length === 0 ? (
            <p className="text-muted-foreground">Nothing recorded yet.</p>
          ) : (
            <ol className="grid gap-4 border-l border-border pl-4">
              {activities.map((activity) => (
                <li key={activity.id} className="relative grid gap-0.5">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-border"
                  />
                  <span className="font-medium">
                    {describe(
                      activity.kind,
                      activity.fromStatus,
                      activity.toStatus
                    )}
                    {activity.kind === "enquiry" && activity.track
                      ? ` about ${activity.track}`
                      : ""}
                  </span>
                  {activity.body ? (
                    <span className="whitespace-pre-wrap">{activity.body}</span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {exact(activity.at)}
                    {activity.actorName ? ` · ${activity.actorName}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
