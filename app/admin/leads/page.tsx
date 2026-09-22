"use client"

import { IconInbox, IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { usePaginatedQuery, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { StatusBadge } from "@/components/admin/status-badge"
import { ButtonLink } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { Spinner } from "@/components/ui/spinner"
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

/**
 * How long ago, with the exact moment on hover.
 *
 * A follow-up queue is read by age, not by date: "3 days ago" answers "is this
 * going cold" at a glance, where "19 Sept, 12:53 pm" makes the reader do
 * arithmetic on every row. The precise value stays in `title` and in the
 * machine-readable `dateTime`, so nothing is lost - it just stops being the
 * thing that has to be decoded first.
 */
function ago(at: number) {
  const seconds = Math.round((Date.now() - at) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (seconds < 90) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  if (days < 31) return `${days} ${days === 1 ? "day" : "days"} ago`
  const months = Math.round(days / 30)
  return `${months} ${months === 1 ? "month" : "months"} ago`
}

function exact(at: number) {
  return new Date(at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function When({ at }: { at: number | undefined }) {
  if (!at) return <span className="text-muted-foreground">—</span>
  return (
    <time
      dateTime={new Date(at).toISOString()}
      title={exact(at)}
      className="text-muted-foreground"
    >
      {ago(at)}
    </time>
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
    <PageShell
      density="working"
      title={<span className="text-foreground">Enquiries.</span>}
    >
      <StatePanel
        icon={<IconPlugConnectedX stroke={1.75} />}
        title="Not available here"
        description="This copy of the site has no connection to the enquiry database, so there is nothing to show. Nothing is wrong with your account. If you are seeing this on the live site, tell whoever maintains it."
      />
    </PageShell>
  )
}

function Inbox() {
  // Two queries on purpose. `canSeeInbox` answers the access question without
  // fetching a page of enquiries and discarding it, so a student who opens
  // this URL costs one boolean rather than a read of the follow-up queue.
  const allowed = useQuery(api.leads.canSeeInbox)
  const {
    results: leads,
    status,
    loadMore,
  } = usePaginatedQuery(api.leads.inboxPage, {}, { initialNumItems: 25 })

  // A skeleton in the shape of the answer, not a spinner: the reader learns
  // the page is a table of enquiries before the enquiries arrive.
  if (allowed === undefined || status === "LoadingFirstPage")
    return (
      <PageShell
        density="working"
        title={
          <>
            <span className="text-foreground">Enquiries.</span>{" "}
            <span className="text-muted-foreground">Loading…</span>
          </>
        }
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )

  if (!allowed)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Staff only.</span>}
      >
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="This page is for ICT staff"
          description="If you are staff and seeing this, log in with the number ICT has on file for you."
          action={
            <ButtonLink href="/login?next=/admin/leads" size="md">
              {" "}
              Log in{" "}
            </ButtonLink>
          }
        />
      </PageShell>
    )

  if (leads.length === 0)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Enquiries.</span>}
      >
        <StatePanel
          icon={<IconInbox stroke={1.75} />}
          title="No enquiries yet"
          description="They appear here as soon as someone sends the form on the site."
        />
      </PageShell>
    )

  return (
    <PageShell
      density="working"
      /*
       * No count. It used to read "N to follow up" from whatever the single
       * query returned, which stopped being true the moment there was a
       * second page - and a number derived from one page is worse than no
       * number, because it looks authoritative.
       */
      title={<span className="text-foreground">Enquiries.</span>}
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
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  {lead.name || (
                    <span className="text-muted-foreground">Not given</span>
                  )}
                </TableCell>
                <TableCell>
                  {/*
                   * A tel: link, not plain text. Staff read this queue on a
                   * handset and the next action is always a call.
                   */}
                  {/*
                   * Underlined on hover rather than always. Thirty underlined
                   * numbers in a column is a wall of rules that fights the
                   * data for attention; the affordance is still there the
                   * moment a cursor or keyboard reaches it.
                   */}
                  <a
                    href={`tel:${lead.phone}`}
                    className="tnum whitespace-nowrap text-foreground underline-offset-4 hover:underline focus-visible:underline"
                  >
                    {formatPhone(lead.phone)}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.interestTrack ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.leadStatus} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <When at={lead.lastEnquiryAt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="mt-6">
          <Button
            variant="secondary"
            size="md"
            disabled={status === "LoadingMore"}
            onClick={() => loadMore(25)}
          >
            {status === "LoadingMore" ? <Spinner /> : null}
            Load more
          </Button>
        </div>
      ) : null}
    </PageShell>
  )
}
