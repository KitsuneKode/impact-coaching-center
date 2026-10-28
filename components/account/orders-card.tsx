"use client"

import {
  IconBuildingStore,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconReceipt,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useState } from "react"

import { OrderStatusBadge } from "@/components/admin/order-status"
import { ButtonLink } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { courierSite, parcelLink } from "@/lib/couriers"
import { formatPaise } from "@/lib/money"
import type { OrderStatus } from "@/lib/order-status"

/**
 * The buyer's own orders. This is where "it is on its way" becomes
 * checkable: the reference to quote on a call, and the courier's tracking
 * number once the parcel has left.
 */
export function OrdersCard() {
  const orders = useQuery(api.orders.myOrders)
  const shop = useTranslations("Shop")

  /* Loading shows the section's shape rather than nothing appearing after
     the rest of the page has already painted. */
  if (orders === undefined)
    return (
      <section
        aria-busy="true"
        aria-label="Your orders, loading"
        className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
      >
        <h2 className="text-lg font-medium">Your orders</h2>
        <div className="mbs-4 flex flex-col gap-4" aria-hidden>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </section>
    )

  if (!orders) return null

  if (orders.length === 0)
    return (
      <section className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]">
        <h2 className="text-lg font-medium">Your orders</h2>
        <p className="mbs-4 text-sm text-muted-foreground">
          No orders yet. Book sets you buy show up here, with where each one has
          got to.
        </p>
        <ButtonLink
          href="/books"
          variant="secondary"
          size="md"
          className="mbs-4"
        >
          Browse books
        </ButtonLink>
      </section>
    )

  return (
    <section className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]">
      <h2 className="text-lg font-medium">Your orders</h2>
      <ul className="mbs-2 flex flex-col divide-y divide-border">
        {orders.map((order) => (
          <li key={order.id} className="grid gap-4 py-5 last:pbe-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-pretty">
                  {order.lines
                    // Two lines of one set differ only by language, so say it.
                    .map(
                      (line) =>
                        `${line.title} (${shop(line.language === "as" ? "assameseSet" : "englishSet")}) × ${line.quantity}`
                    )
                    .join(", ")}
                </p>
                <p className="tnum mbs-1 text-sm text-muted-foreground">
                  {order.reference}
                  {" · "}
                  <time dateTime={new Date(order.placedAt).toISOString()}>
                    {new Date(order.placedAt).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  {" · "}
                  {formatPaise(order.totalPaise)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <OrderTrack
              status={order.status}
              fulfilment={order.fulfilment}
              history={order.history}
            />

            {order.courier ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-secondary px-4 py-3 text-sm">
                <IconTruckDelivery aria-hidden size={18} stroke={1.75} />
                <span>
                  {order.courier.name}
                  {" · "}
                  <span className="tnum font-semibold">
                    {order.courier.trackingNumber}
                  </span>
                </span>
                <span className="ms-auto flex flex-wrap gap-1">
                  <CopyTracking number={order.courier.trackingNumber} />
                  <TrackParcel
                    courier={order.courier.name}
                    number={order.courier.trackingNumber}
                  />
                </span>
              </div>
            ) : order.fulfilment === "collection" &&
              order.status === "ready_for_collection" ? (
              <p className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm">
                <IconBuildingStore aria-hidden size={18} stroke={1.75} />
                Ready at the centre. Bring your reference,{" "}
                <span className="tnum font-semibold">{order.reference}</span>.
              </p>
            ) : null}

            <Link
              href={`/account/receipt/${order.reference}`}
              className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold underline decoration-foreground/30 underline-offset-4"
            >
              <IconReceipt aria-hidden size={16} stroke={1.75} />
              Receipt <span className="tnum">{order.receiptNumber}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Where a parcel or a pickup can be, in order. */
const TRACKS = {
  delivery: [
    ["paid", "Paid"],
    ["shipped", "Shipped"],
    ["delivered", "Delivered"],
  ],
  collection: [
    ["paid", "Paid"],
    ["ready_for_collection", "Ready"],
    ["collected", "Collected"],
  ],
} as const

const stepDate = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
})

/**
 * How far the order has come, as steps, each dated when it happened. A
 * cancelled or refunded order says so in its badge instead.
 */
function OrderTrack({
  status,
  fulfilment,
  history,
}: {
  status: OrderStatus
  fulfilment: "delivery" | "collection"
  history: { status: OrderStatus; at: number }[]
}) {
  const steps = TRACKS[fulfilment]
  const at = steps.findIndex(([key]) => key === status)
  if (at < 0) return null
  return (
    <ol
      aria-label="Progress"
      data-order-track
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map(([key, label], i) => {
        const when = history.find((step) => step.status === key)?.at
        return (
          <li
            key={key}
            data-done={i <= at || undefined}
            data-next-done={i < at || undefined}
            aria-current={i === at ? "step" : undefined}
          >
            <span aria-hidden data-order-dot />
            {label}
            {when && i <= at ? (
              <time
                dateTime={new Date(when).toISOString()}
                className="tnum block text-xs font-normal text-muted-foreground"
              >
                {stepDate.format(when)}
              </time>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Delhivery has a page per parcel: straight there. Other couriers do not,
 * so this copies the number and opens their tracking page to paste it.
 */
function TrackParcel({ courier, number }: { courier: string; number: string }) {
  const parcel = parcelLink(courier, number)
  const site = parcel ?? courierSite(courier)
  if (!site) return null
  return (
    <a
      href={site}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        if (!parcel) void navigator.clipboard?.writeText(number).catch(() => {})
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-primary hover:bg-card"
    >
      {parcel ? "Track this parcel" : <>Track on {courier}&rsquo;s site</>}
      <IconExternalLink aria-hidden size={15} stroke={1.75} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/** Copies the tracking number, for pasting into the courier's site. */
function CopyTracking({ number }: { number: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(number)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        } catch {
          // No clipboard: the number is on screen to copy by hand.
        }
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-primary hover:bg-card"
    >
      {copied ? (
        <IconCheck aria-hidden size={16} stroke={2} />
      ) : (
        <IconCopy aria-hidden size={16} stroke={1.75} />
      )}
      {copied ? "Copied" : "Copy number"}
    </button>
  )
}
