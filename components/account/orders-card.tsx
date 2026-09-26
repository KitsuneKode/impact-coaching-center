"use client"

import { useQuery } from "convex/react"

import { OrderStatusBadge } from "@/components/admin/order-status"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { formatPaise } from "@/lib/money"

/**
 * The buyer's own orders. This is where "it is on its way" becomes
 * checkable: the reference to quote on a call, and the courier's tracking
 * number once the parcel has left.
 */
export function OrdersCard() {
  const orders = useQuery(api.orders.myOrders)

  /* Loading shows the section's shape rather than nothing appearing after
     the rest of the page has already painted. */
  if (orders === undefined)
    return (
      <section
        aria-busy="true"
        aria-label="Your orders, loading"
        className="max-w-160 rounded-card border border-border p-6"
      >
        <h2 className="text-lg font-medium">Your orders</h2>
        <div className="mt-4 flex flex-col gap-4" aria-hidden>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </section>
    )

  /* null means signed out (unreachable on /account, but honest); empty
     means this Person has never ordered - the card simply is not there. */
  if (!orders || orders.length === 0) return null

  return (
    <section className="max-w-160 rounded-card border border-border p-6">
      <h2 className="text-lg font-medium">Your orders</h2>
      <ul className="mt-4 flex flex-col divide-y divide-border">
        {orders.map((order) => (
          <li key={order.id} className="flex flex-col gap-2 py-4 first:pt-0">
            <div className="flex items-center justify-between gap-4">
              <span className="tnum font-medium">{order.reference}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              <time dateTime={new Date(order.placedAt).toISOString()}>
                {new Date(order.placedAt).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              {" · "}
              {order.items
                .map((item) => `${item.title} × ${item.quantity}`)
                .join(", ")}
              {" · "}
              <span className="tnum">{formatPaise(order.totalPaise)}</span>
            </p>
            {order.courier ? (
              <p className="text-sm">
                Sent via {order.courier.name}
                {" · tracking "}
                <span className="tnum">{order.courier.trackingNumber}</span>
              </p>
            ) : order.fulfilment === "collection" &&
              order.status === "ready_for_collection" ? (
              <p className="text-sm">
                Ready at the centre - bring your reference number.
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
