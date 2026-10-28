"use client"

import { IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { convexConfigured } from "@/app/providers"
import { AddEnquiry } from "@/components/admin/add-enquiry"
import { LeadSheet } from "@/components/admin/lead-sheet"
import { LeadsTable } from "@/components/admin/leads-table"
import { ButtonAnchor } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { InboxView } from "@/convex/leads"
import { useIstDay } from "@/hooks/use-minute"
import { useViewer } from "@/hooks/use-viewer"

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

/** Debounce, so each keystroke does not start a fresh page on the server. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

function Inbox() {
  // Two queries on purpose. `canSeeInbox` answers the access question without
  // fetching a page of enquiries and discarding it, so a student who opens
  // this URL costs one boolean rather than a read of the follow-up queue.
  const allowed = useQuery(api.leads.canSeeInbox)
  // ?lead=<id> opens that person's sheet: links from the overview land here.
  const params = useSearchParams()
  const linked = params.get("lead") as Id<"persons"> | null
  // ?view=due or ?view=new: the overview's queue rows land on that list.
  const linkedView = params.get("view")
  const [chosen, setChosen] = useState<Id<"persons"> | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const openId = chosen ?? (dismissed ? null : linked)
  const setOpenId = (id: Id<"persons"> | null) => {
    setChosen(id)
    if (!id) setDismissed(true)
  }
  /*
   * Read here rather than inside the table: export is owner-only, and the
   * table should be told what the viewer may do rather than work it out. The
   * decision itself lives in convex/authz.ts - this only chooses chrome.
   */
  const viewer = useViewer()

  /*
   * The filters live here because they are the query: changing them asks the
   * server for a different slice rather than hiding rows already fetched.
   * The queue opens on the work - new enquiries and due follow-ups.
   */
  const [view, setView] = useState<InboxView>(
    linkedView === "due" || linkedView === "new" ? linkedView : "action"
  )
  const [track, setTrack] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounced(search.trim(), 300)
  const today = useIstDay()

  const {
    results: leads,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.leads.inboxPage,
    // The server refuses non-staff anyway; skipping keeps a student who lands
    // here from spending a subscription on a queue they may not read.
    allowed === true
      ? { view, track, search: debouncedSearch || undefined, now: today }
      : "skip",
    { initialNumItems: 25 }
  )

  /* A filter change re-reads as LoadingFirstPage with empty results; only the
     very first load earns the skeleton, or the controls vanish under a typing
     hand. Adjusted during render, not in an effect, so no paint flashes the
     empty state first. */
  const [everLoaded, setEverLoaded] = useState(false)
  if (status !== "LoadingFirstPage" && !everLoaded) setEverLoaded(true)

  // A skeleton in the shape of the answer, not a spinner: the reader learns
  // the page is a table of enquiries before the enquiries arrive.
  if (allowed === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Enquiries.</span>}
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
            // A plain link: a full sign-in page, never the public site's
            // pop-up over the admin with the admin loading behind it.
            <ButtonAnchor
              href="/login?next=/admin/leads"
              target="_self"
              size="md"
            >
              Log in
            </ButtonAnchor>
          }
        />
      </PageShell>
    )

  /* First page only: a filter change also reads LoadingFirstPage, and there
     the controls must stay put while the new slice arrives. */
  if (status === "LoadingFirstPage" && !everLoaded)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Enquiries.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )

  /* No page-level empty state: whether zero rows means "no enquiries" or
     "nothing matched" is the table's call - it owns the filter controls. */
  return (
    <PageShell
      density="working"
      /* No count in the heading. */
      title={<span className="text-foreground">Enquiries.</span>}
      actions={<AddEnquiry onCreated={(id) => setOpenId(id)} />}
    >
      <LeadsTable
        leads={leads}
        canLoadMore={status === "CanLoadMore"}
        loadingMore={status === "LoadingMore"}
        onLoadMore={() => loadMore(25)}
        isOwner={viewer?.role === "owner"}
        onOpen={(id) => setOpenId(id as Id<"persons">)}
        view={view}
        track={track}
        search={search}
        onViewChange={setView}
        onTrackChange={setTrack}
        onSearchChange={setSearch}
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
