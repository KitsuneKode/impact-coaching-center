"use client"

import { IconCalendarEvent } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { CatalogList } from "@/components/admin/catalog-list"
import { examLabel, KIND_LABELS } from "@/components/admin/date-editor"
import { OwnerOnly } from "@/components/admin/post-editor"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/** Every exam date, published or not. Owner only. */
export default function AdminCalendarPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Calendar.">
        Not available here.
      </PageShell>
    )
  return <Dates />
}

const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })

function Dates() {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const dates = useQuery(api.calendarAdmin.list)
  const setPublished = useMutation(api.calendarAdmin.setPublished)

  if (allowed === undefined || dates === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Calendar.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed) return <OwnerOnly />

  return (
    <CatalogList
      title="Calendar."
      noun="date"
      newHref="/admin/calendar/new"
      detailHeading="When"
      truncated={dates.truncated}
      rows={dates.rows.map((d) => ({
        id: d.id,
        title: d.title,
        href: `/admin/calendar/${d.id}`,
        thumb: (
          <span className="grid size-full place-content-center bg-muted/40 text-center leading-none">
            <span className="tnum text-sm font-bold">
              {Number(d.starts.slice(8))}
            </span>
          </span>
        ),
        meta: `${examLabel(d.exam)} · ${KIND_LABELS[d.kind]}${d.tentative ? " · tentative" : ""}`,
        detail: d.ends ? `${day(d.starts)} – ${day(d.ends)}` : day(d.starts),
        published: d.published,
        sample: false,
        updatedAt: d.updatedAt,
      }))}
      onTogglePublished={(row) => {
        const date = dates.rows.find((d) => d.id === row.id)!
        return setPublished({
          id: date.id,
          published: !date.published,
          expectedRevision: date.revision,
        })
      }}
      empty={
        <StatePanel
          icon={<IconCalendarEvent stroke={1.75} />}
          title="No dates yet"
          description="Add a date from an official notice. It stays a draft until you publish it."
        />
      }
    />
  )
}
