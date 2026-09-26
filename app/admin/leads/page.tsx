"use client"

import { IconInbox, IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { useState } from "react"

import { convexConfigured } from "@/app/providers"
import { LeadSheet } from "@/components/admin/lead-sheet"
import { LeadsTable } from "@/components/admin/leads-table"
import { ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

/** The follow-up queue. */
export default function AdminLeadsPage() {
  // Checked before any hook runs, and in a parent rather than around the hook
  // itself:
  if (!convexConfigured) return <Unavailable />
  return <Inbox />
}

/** What a build with no `NEXT_PUBLIC_CONVEX_URL` shows here. */
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
  const [openId, setOpenId] = useState<Id<"persons"> | null>(null)
  /*
   * Read here rather than inside the table: export is owner-only, and the
   * table should be told what the viewer may do rather than work it out. The
   * decision itself lives in convex/authz.ts - this only chooses chrome.
   */
  const viewer = useQuery(api.auth.getCurrentPerson)
  const {
    results: leads,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.leads.inboxPage,
    // The server refuses non-staff anyway; skipping keeps a student who lands
    // here from spending a subscription on a queue they may not read.
    allowed === true ? {} : "skip",
    { initialNumItems: 25 }
  )

  // A skeleton in the shape of the answer, not a spinner: the reader learns
  // the page is a table of enquiries before the enquiries arrive.
  if (allowed === undefined)
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

  if (status === "LoadingFirstPage")
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
      /* No count in the heading. */
      title={<span className="text-foreground">Enquiries.</span>}
    >
      <LeadsTable
        leads={leads}
        canLoadMore={status === "CanLoadMore"}
        loadingMore={status === "LoadingMore"}
        onLoadMore={() => loadMore(25)}
        isOwner={viewer?.role === "owner"}
        onOpen={(id) => setOpenId(id as Id<"persons">)}
      />
      <LeadSheet
        personId={openId}
        onOpenChange={(open) => {
          if (!open) setOpenId(null)
        }}
      />
    </PageShell>
  )
}
