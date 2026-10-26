"use client"

import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconCopy,
  IconExternalLink,
  IconPhone,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import {
  exact,
  OrderDetail,
  useOrderActions,
} from "@/components/admin/order-actions"
import { OrderStatusBadge } from "@/components/admin/order-status"
import { Button, ButtonAnchor } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { useViewer } from "@/hooks/use-viewer"
import { formatPhone } from "@/lib/brand"
import { formatPaise } from "@/lib/money"
import { nextStatuses, ORDER_STATUS_LABELS } from "@/lib/order-status"

const METHOD: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  wallet: "Wallet",
  emi: "EMI",
}

const MESSAGE_STATE = {
  queued: "Sending",
  sent: "Sent",
  failed: "Not delivered",
} as const

/** One order: what to do next, the packing slip, and what happened. */
export default function AdminOrderPage() {
  const { reference } = useParams<{ reference: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Order.">
        Not available here.
      </PageShell>
    )
  return <Order reference={decodeURIComponent(reference)} />
}

function Order({ reference }: { reference: string }) {
  const data = useQuery(api.orders.adminOrder, { reference })
  const viewer = useViewer()
  const markSeen = useMutation(api.orders.markOrderSeen)
  const actions = useOrderActions()
  const [copied, setCopied] = useState(false)

  const orderId = data?.row.id
  const unseen = data ? !data.row.seen : false
  useEffect(() => {
    // Opening the order's page is what "seen" means.
    if (orderId && unseen) void markSeen({ orderId })
  }, [orderId, unseen, markSeen])

  if (data === undefined || viewer === undefined)
    return (
      <PageShell density="working" title={<Back />}>
        <ListSkeleton rows={4} />
      </PageShell>
    )

  if (data === null)
    return (
      <PageShell density="working" title={<Back />}>
        <StatePanel
          title={`No order ${reference.toUpperCase()}`}
          description="Check the reference on the buyer's receipt or message; it looks like ICT-7K3F9. If you aren't signed in as staff, log in first."
          action={
            <ButtonAnchor href="/admin/orders" target="_self" size="md">
              Go to all orders
            </ButtonAnchor>
          }
        />
      </PageShell>
    )

  const { row: order } = data
  const moves = nextStatuses(
    order.status,
    viewer?.role === "owner",
    order.fulfilment,
    order.refundDue
  )
  const busy = actions.busy === order.id
  const digits = order.buyerPhone.replace(/\D/g, "")

  return (
    <PageShell density="working" title={<Back reference={order.reference} />}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <OrderStatusBadge status={order.status} refundDue={order.refundDue} />
        <span className="tnum text-foreground">
          {formatPaise(order.totalPaise)}
        </span>
        <span>
          Paid{" "}
          <time dateTime={new Date(order.placedAt).toISOString()}>
            {exact(order.placedAt)}
          </time>
        </span>
        <span className="tnum">Receipt {order.receiptNumber}</span>
      </div>

      {moves.length > 0 ? (
        <div className="mbs-6 flex flex-wrap gap-2">
          {moves.map((status) => {
            const money = status === "cancelled" || status === "refunded"
            return (
              <Button
                key={status}
                variant={money ? "secondary" : "primary"}
                size="md"
                disabled={busy}
                onClick={() => actions.request(order, status)}
              >
                {status === "cancelled"
                  ? "Cancel order"
                  : `Mark ${ORDER_STATUS_LABELS[status].toLowerCase()}`}
                {status === "shipped" ? "…" : ""}
              </Button>
            )
          })}
        </div>
      ) : null}
      <p role="alert" className="mbs-3 text-sm text-destructive empty:hidden">
        {actions.error ?? ""}
      </p>

      <div className="mbs-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <div className="grid content-start gap-10">
          <Panel title="Buyer">
            {order.buyerDeleted ? (
              <p className="text-muted-foreground">
                The buyer deleted their account. The order stays for the
                accounts; there is nobody to contact.
              </p>
            ) : (
              <div className="grid gap-3">
                <p>{order.buyerName || "Name not given"}</p>
                <div className="flex flex-wrap gap-2">
                  <ButtonAnchor
                    href={`tel:${order.buyerPhone}`}
                    variant="secondary"
                    size="sm"
                  >
                    <IconPhone stroke={1.75} />
                    <span className="tnum">
                      {formatPhone(order.buyerPhone)}
                    </span>
                  </ButtonAnchor>
                  <ButtonAnchor
                    href={`https://wa.me/${digits}?text=${encodeURIComponent(`About your ICT order ${order.reference}: `)}`}
                    target="_blank"
                    variant="secondary"
                    size="sm"
                  >
                    <IconBrandWhatsapp stroke={1.75} />
                    WhatsApp
                    <span className="sr-only"> (opens in a new tab)</span>
                  </ButtonAnchor>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Packing slip">
            <div className="rounded-card border border-border p-5">
              <OrderDetail
                order={order}
                busy={busy}
                onCourier={
                  order.status === "shipped" || order.status === "delivered"
                    ? () => actions.correctCourier(order)
                    : undefined
                }
              />
            </div>
          </Panel>
        </div>

        <div className="grid content-start gap-10">
          <Panel title="What happened">
            <ol className="grid gap-3">
              {data.history.map((step, index) => (
                <li
                  key={`${step.status}:${step.at}:${index}`}
                  className="grid grid-cols-[0.5rem_1fr] gap-x-3"
                >
                  <span
                    aria-hidden="true"
                    className="mbs-2 size-2 rounded-full bg-foreground"
                  />
                  <span>
                    {ORDER_STATUS_LABELS[step.status]}
                    <span className="block text-sm text-muted-foreground">
                      <time dateTime={new Date(step.at).toISOString()}>
                        {exact(step.at)}
                      </time>
                      {step.by ? ` · ${step.by}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="WhatsApp messages">
            {data.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                None for this order yet. Buyers are messaged when an order is
                paid, shipped or ready to collect.
              </p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {data.messages.map((message) => (
                  <li
                    key={message.label}
                    className="flex justify-between gap-4"
                  >
                    <span>{message.label}</span>
                    <span
                      className={
                        message.status === "failed"
                          ? "font-medium text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {MESSAGE_STATE[message.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Payment">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Method</dt>
                <dd>{METHOD[data.method] ?? data.method}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-muted-foreground">
                  Razorpay payment
                </dt>
                <dd className="tnum truncate">{data.paymentId}</dd>
              </div>
            </dl>
            <div className="mbs-4 flex flex-wrap gap-2">
              <ButtonAnchor
                href={`/receipt/${data.receiptToken}`}
                target="_blank"
                variant="secondary"
                size="sm"
              >
                <IconExternalLink stroke={1.75} />
                Open the receipt
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonAnchor>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/receipt/${data.receiptToken}`
                  void navigator.clipboard.writeText(url).then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  })
                }}
              >
                <IconCopy stroke={1.75} />
                {copied ? "Link copied" : "Copy the receipt link"}
              </Button>
            </div>
            <output className="sr-only">
              {copied ? "Receipt link copied" : ""}
            </output>
          </Panel>
        </div>
      </div>

      {actions.dialogs}
    </PageShell>
  )
}

function Back({ reference }: { reference?: string }) {
  return (
    <span className="grid gap-2">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-normal tracking-normal text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft aria-hidden stroke={1.75} className="size-4" />
        All orders
      </Link>
      <span className="tnum text-foreground">{reference ?? "Order."}</span>
    </span>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-medium">{title}</h2>
      <div className="mbs-3">{children}</div>
    </section>
  )
}
