"use client"

import { IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { usePaginatedQuery, useQuery } from "convex/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { OrdersTable } from "@/components/admin/orders-table"
import { ButtonAnchor } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { useViewer } from "@/hooks/use-viewer"
import { ORDER_TAB_LABELS, ORDER_TABS, type OrderTab } from "@/lib/order-status"

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
  // Cancel and refund are offered only to an owner, matching the server.
  const viewer = useViewer()
  const params = useSearchParams()
  const asked = params.get("tab")
  const tab: OrderTab = ORDER_TABS.includes(asked as OrderTab)
    ? (asked as OrderTab)
    : "to_send"
  const counts = useQuery(api.orders.orderCounts, allowed ? {} : "skip")
  const {
    results: orders,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.orders.adminOrdersPage,
    allowed ? { tab } : "skip",
    { initialNumItems: 25 }
  )

  if (allowed === undefined || viewer === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Orders.</span>}
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
      title={<span className="text-foreground">Orders.</span>}
    >
      {/* Links, not a widget: each queue has its own URL to share or bookmark. */}
      <nav aria-label="Order queues" className="-mx-1 overflow-x-auto px-1">
        <ul className="flex w-max gap-1 border-b border-border">
          {ORDER_TABS.map((key) => {
            const count = key === "done" ? undefined : counts?.[key]
            return (
              <li key={key}>
                <Link
                  href={
                    key === "to_send"
                      ? "/admin/orders"
                      : `/admin/orders?tab=${key}`
                  }
                  aria-current={key === tab ? "page" : undefined}
                  className="relative -mbe-px inline-flex h-11 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground"
                >
                  {ORDER_TAB_LABELS[key]}
                  {count ? (
                    <span className="tnum rounded-full bg-muted px-1.5 text-xs leading-5 text-foreground">
                      {count}
                      {counts?.capped ? "+" : ""}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="mbs-6">
        {status === "LoadingFirstPage" ? (
          <ListSkeleton rows={6} />
        ) : (
          <OrdersTable
            key={tab}
            tab={tab}
            orders={orders}
            isOwner={viewer?.role === "owner"}
            canLoadMore={status === "CanLoadMore"}
            loadingMore={status === "LoadingMore"}
            onLoadMore={() => loadMore(25)}
          />
        )}
      </div>
    </PageShell>
  )
}
