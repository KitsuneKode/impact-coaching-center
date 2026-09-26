"use client"

import { useQuery } from "convex/react"

import { OrderStatusBadge } from "@/components/admin/order-status"
import { api } from "@/convex/_generated/api"
import { formatPaise } from "@/lib/money"

/**
 * The buyer's own orders. This is where "it is on its way" becomes
 * checkable: the reference to quote on a call, and the courier's tracking
 * number once the parcel has left.
 */
export function OrdersCard() {
  const orders = useQuery(api.orders.myOrders)

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
