"use client"

import { IconInbox, IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { usePaginatedQuery, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { LeadsTable } from "@/components/admin/leads-table"
import { ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

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
       * No count in the heading. It used to read "N to follow up" from
       * whatever the single query returned, which stopped being true the
       * moment there was a second page - and a number derived from one page
       * is worse than no number, because it looks authoritative.
       */
      title={<span className="text-foreground">Enquiries.</span>}
    >
      <LeadsTable
        leads={leads}
        canLoadMore={status === "CanLoadMore"}
        loadingMore={status === "LoadingMore"}
        onLoadMore={() => loadMore(25)}
      />
    </PageShell>
  )
}
