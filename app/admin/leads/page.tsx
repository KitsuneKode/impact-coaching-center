"use client"

import { IconInbox, IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { formatPhone } from "@/lib/brand"

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  enrolled: "Enrolled",
  lost: "Lost",
}

function when(at: number | undefined) {
  if (!at) return "—"
  return new Date(at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * One shell for every state, so the page cannot change shape underneath the
 * reader as data arrives, and so the heading is present before it does -
 * docs/design-guide.md §6.
 */
function Shell({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="type-display">{title}</h1>
        <div className="mt-10">{children}</div>
      </Section>
    </main>
  )
}

/**
 * The follow-up queue. Read-only by design.
 *
 * No status changes, notes or export yet: every one of those is a write, and
 * a write needs an audit record and a considered undo story. Seeing the queue
 * is the half that is safe to ship first.
 *
 * The role check is NOT here. `api.leads.inbox` refuses a non-staff caller
 * itself, because a guard in this component protects the markup and not the
 * data - the query is one fetch away for anyone with a session.
 */
export default function AdminLeadsPage() {
  // Checked before any hook runs, and in a parent rather than around the hook
  // itself: `useQuery` throws when no provider is mounted, and this page is
  // prerendered, so an unconfigured build failed `next build` outright instead
  // of degrading. The value is fixed when the bundle is built, so this branch
  // cannot change between renders.
  if (!convexConfigured) return <Unavailable />
  return <Inbox />
}

/**
 * What a build with no `NEXT_PUBLIC_CONVEX_URL` shows here.
 *
 * Expected on a preview deployment that was never given the variable. On the
 * live site it means the site cannot reach its own database, which is a
 * configuration fault and not something the person reading this can fix.
 */
function Unavailable() {
  return (
    <Shell title={<span className="text-foreground">Enquiries.</span>}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPlugConnectedX stroke={1.75} />
          </EmptyMedia>
          <EmptyTitle>Not available here</EmptyTitle>
          <EmptyDescription>
            This copy of the site has no connection to the enquiry database, so
            there is nothing to show. Nothing is wrong with your account. If you
            are seeing this on the live site, tell whoever maintains it.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Shell>
  )
}

function Inbox() {
  const result = useQuery(api.leads.inbox)

  // A skeleton in the shape of the answer, not a spinner: the reader learns
  // the page is a table of enquiries before the enquiries arrive.
  if (result === undefined)
    return (
      <Shell
        title={
          <>
            <span className="text-foreground">Enquiries.</span>{" "}
            <span className="text-muted-foreground">Loading…</span>
          </>
        }
      >
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-control" />
          ))}
        </div>
      </Shell>
    )

  if (!result.authorized)
    return (
      <Shell title={<span className="text-foreground">Staff only.</span>}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconLock stroke={1.75} />
            </EmptyMedia>
            <EmptyTitle>This page is for ICT staff</EmptyTitle>
            <EmptyDescription>
              If you are staff and seeing this, log in with the number ICT has
              on file for you.
            </EmptyDescription>
          </EmptyHeader>
          <ButtonLink href="/login?next=/admin/leads" size="md">
            Log in
          </ButtonLink>
        </Empty>
      </Shell>
    )

  if (result.leads.length === 0)
    return (
      <Shell title={<span className="text-foreground">Enquiries.</span>}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox stroke={1.75} />
            </EmptyMedia>
            <EmptyTitle>No enquiries yet</EmptyTitle>
            <EmptyDescription>
              They appear here as soon as someone sends the form on the site.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Shell>
    )

  return (
    <Shell
      title={
        <>
          <span className="text-foreground">Enquiries.</span>{" "}
          <span className="text-muted-foreground">
            {result.leads.length} to follow up.
          </span>
        </>
      }
    >
      <div className="overflow-x-auto">
        <Table className="min-w-160">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last enquiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  {lead.name || (
                    <span className="text-muted-foreground">Not given</span>
                  )}
                </TableCell>
                <TableCell>
                  {/*
                   * A tel: link, not plain text. Staff read this queue on a
                   * handset and the next action is always a call.
                   */}
                  <a href={`tel:${lead.phone}`} className="tnum link">
                    {formatPhone(lead.phone)}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.interestTrack ?? "—"}
                </TableCell>
                <TableCell>
                  {lead.leadStatus ? (
                    <Badge>{STATUS_LABELS[lead.leadStatus] ?? "—"}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="tnum text-muted-foreground">
                  {when(lead.lastEnquiryAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Shell>
  )
}
