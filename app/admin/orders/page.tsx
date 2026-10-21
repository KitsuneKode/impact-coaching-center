"use client"

import { IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { usePaginatedQuery, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { OrdersTable } from "@/components/admin/orders-table"
import { ButtonAnchor } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { useViewer } from "@/hooks/use-viewer"

/** The fulfilment queue. */
export default function AdminOrdersPage() {
  if (!convexConfigured) return <Unavailable />
  return <Orders />
}

function Unavailable() {
  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">Orders.</span>}
    >
      <StatePanel
        icon={<IconPlugConnectedX stroke={1.75} />}
        title="Not available here"
        description="This copy of the site has no connection to the order database, so there is nothing to show. Nothing is wrong with your account."
      />
    </PageShell>
  )
}

function Orders() {
  const allowed = useQuery(api.orders.canSeeOrders)
  // The viewer's own Person, for the one role split the screen needs: the
  // refund move is offered only to an owner, matching the server gate.
  const viewer = useViewer()
  const {
    results: orders,
    status,
    loadMore,
  } = usePaginatedQuery(api.orders.adminOrdersPage, {}, { initialNumItems: 25 })

  if (
    allowed === undefined ||
    viewer === undefined ||
    status === "LoadingFirstPage"
  )
    return (
      <PageShell
        density="working"
        title={
          <>
            <span className="text-foreground">Orders.</span>{" "}
            <span className="text-muted-foreground">Loading…</span>
          </>
        }
      >
        <ListSkeleton rows={6} />
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
              href="/login?next=/admin/orders"
              target="_self"
              size="md"
            >
              Log in
            </ButtonAnchor>
          }
        />
      </PageShell>
    )

  return (
    <PageShell
      density="working"
      /*
       * No count in the heading, for the reason the inbox has none: a number derived
       * from the page that happens to be loaded looks authoritative and stops being
       * true at the second page.
       */
      title={<span className="text-foreground">Orders.</span>}
    >
      <OrdersTable
        orders={orders}
        isOwner={viewer?.role === "owner"}
        canLoadMore={status === "CanLoadMore"}
        loadingMore={status === "LoadingMore"}
        onLoadMore={() => loadMore(25)}
      />
    </PageShell>
  )
}
