"use client"

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconSearch,
  IconTruck,
  IconBuildingStore,
} from "@tabler/icons-react"
import { useMutation } from "convex/react"
import { useMemo, useState } from "react"

import { RowsPerPage } from "@/components/admin/rows-per-page"
import { OrderStatusBadge } from "@/components/admin/order-status"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { formatPhone } from "@/lib/brand"
import { formatPaise } from "@/lib/money"
import { nextStatuses, ORDER_STATUS_LABELS } from "@/lib/order-status"

export type OrderRow = {
  id: Id<"orders">
  reference: string
  status: string
  fulfilment: "delivery" | "collection"
  lines: {
    slug: string
    title: string
    language: "en" | "as"
    books: string[]
    quantity: number
    unitPaise: number
  }[]
  itemsPaise: number
  deliveryPaise: number
  totalPaise: number
  address?: {
    line1: string
    line2?: string
    city: string
    district?: string
    pin: string
  }
  placedAt: number
  seen: boolean
  revision: number
  courier?: { name: string; trackingNumber: string }
  receiptNumber?: string
  buyerName: string
  buyerPhone: string
  buyerDeleted: boolean
}

/** The filter row, grouped by the question being asked. */
const FILTERS = [
  { value: "open", label: "Needs you" },
  { value: "all", label: "All" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "ready_for_collection", label: "To collect" },
  { value: "delivered", label: "Delivered" },
  { value: "collected", label: "Collected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const

/* Paid and on its way; an order awaiting payment is the buyer's move and
   has its own filter. */
const OPEN = new Set(["paid", "packed", "shipped", "ready_for_collection"])

function ago(at: number) {
  const minutes = Math.round((Date.now() - at) / 60000)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (minutes < 2) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  if (days < 31) return `${days} ${days === 1 ? "day" : "days"} ago`
  const months = Math.round(days / 30)
  return `${months} ${months === 1 ? "month" : "months"} ago`
}

function exact(at: number) {
  return new Date(at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** The fulfilment queue. */
export function OrdersTable({
  orders,
  isOwner,
  canLoadMore,
  loadingMore,
  onLoadMore,
}: {
  orders: OrderRow[]
  /** Drives whether "refunded" is offered - the server gates it to owners. */
  isOwner: boolean
  canLoadMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const setOrderStatus = useMutation(api.orders.setOrderStatus)
  const setOrderCourier = useMutation(api.orders.setOrderCourier)
  const markSeen = useMutation(api.orders.markOrderSeen)

  const [filter, setFilter] = useState<string>("open")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [courierFor, setCourierFor] = useState<{
    order: OrderRow
    /** Shipping writes courier and status together; correcting only fixes the details. */
    mode: "ship" | "correct"
  } | null>(null)

  const matching = useMemo(() => {
    const needle = search.toLowerCase().replaceAll(/\s/g, "")
    return orders.filter((order) => {
      if (filter === "open" && !OPEN.has(order.status)) return false
      if (filter !== "open" && filter !== "all" && order.status !== filter)
        return false
      if (!needle) return true
      return (
        order.reference.toLowerCase().includes(needle) ||
        order.buyerName.toLowerCase().includes(search.toLowerCase()) ||
        order.buyerPhone.replaceAll(/\s/g, "").includes(needle)
      )
    })
  }, [orders, filter, search])

  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const page = matching.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  )

  function changeFilter(value: string) {
    setFilter(value)
    setPageIndex(0)
  }

  async function move(
    order: OrderRow,
    status: string,
    courier?: { name: string; trackingNumber: string }
  ) {
    setBusy(order.id)
    setError(null)
    try {
      const result = await setOrderStatus({
        orderId: order.id,
        status: status as never,
        expectedRevision: order.revision,
        courier,
      })
      // Discriminate on the value: `Refusal` carries an `ok` key too.
      if (!result.ok) {
        setError(
          result.reason === "revision-conflict"
            ? `${order.reference} changed somewhere else. It has been refreshed - check it and try again.`
            : result.reason === "invalid-input"
              ? `That is not a move ${order.reference} can make from ${ORDER_STATUS_LABELS[order.status]}.`
              : "That change was refused. You may not have permission any more."
        )
        return false
      }
      return true
    } catch {
      setError(
        "Could not reach the server. The order is unchanged - try again."
      )
      return false
    } finally {
      setBusy(null)
    }
  }

  /* The staff answer to "it went out today" is always the same two facts:
     who has it, and how anyone asks where it is. */
  async function applyCourier(
    order: OrderRow,
    courier: { name: string; trackingNumber: string },
    mode: "ship" | "correct"
  ) {
    if (mode === "ship") return move(order, "shipped", courier)
    setBusy(order.id)
    setError(null)
    try {
      const result = await setOrderCourier({
        orderId: order.id,
        courier,
        expectedRevision: order.revision,
      })
      if (!result.ok) {
        setError(
          result.reason === "revision-conflict"
            ? `${order.reference} changed somewhere else. It has been refreshed - check it and try again.`
            : "That change was refused. You may not have permission any more."
        )
        return false
      }
      return true
    } catch {
      setError(
        "Could not reach the server. The order is unchanged - try again."
      )
      return false
    } finally {
      setBusy(null)
    }
  }

  function toggle(order: OrderRow) {
    const opening = expanded !== order.id
    setExpanded(opening ? order.id : null)
    // Opening one order is what "seen" means. Loading the list does not count,
    // or the badge would measure scrolling rather than attention.
    if (opening && !order.seen) void markSeen({ orderId: order.id })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-full max-w-xs">
          <InputGroupAddon className="ps-3">
            <IconSearch
              stroke={1.75}
              className="size-4 text-muted-foreground"
            />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search reference, name or number"
            aria-label="Search orders by reference, buyer name or number"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPageIndex(0)
            }}
          />
        </InputGroup>
        <p aria-live="polite" className="ms-auto text-sm text-muted-foreground">
          {matching.length} of {orders.length} loaded
        </p>
      </div>

      <ToggleGroup
        value={[filter]}
        onValueChange={(value) => changeFilter(value[0] ?? "open")}
        aria-label="Filter orders"
        className="flex-wrap"
      >
        {FILTERS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {error ? (
        <p
          role="alert"
          className="rounded-card border border-destructive/30 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {/*
        Two renderings of the same page of orders. Below md a row of cells
        does not fit a phone, so each order is a card - same expansion, same
        status moves, same courier dialog.
      */}
      <div className="flex flex-col gap-3 md:hidden">
        {page.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-card border border-border p-4">
            <span className="text-muted-foreground">
              {orders.length === 0
                ? "No orders yet. They appear here as soon as somebody buys a book."
                : "Nothing matched that filter."}
            </span>
            {orders.length > 0 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearch("")
                  changeFilter("all")
                }}
              >
                Show all orders
              </Button>
            ) : null}
          </div>
        ) : (
          page.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isOwner={isOwner}
              expanded={expanded === order.id}
              busy={busy === order.id}
              onToggle={() => toggle(order)}
              onMove={(status) => {
                if (status === "shipped") setCourierFor({ order, mode: "ship" })
                else void move(order, status)
              }}
              onCourier={
                order.status === "shipped" || order.status === "delivered"
                  ? () => setCourierFor({ order, mode: "correct" })
                  : undefined
              }
            />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-border md:block">
        <Table className="min-w-200">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24">
                  <div className="flex flex-col items-start gap-3">
                    <span className="text-muted-foreground">
                      {orders.length === 0
                        ? "No orders yet. They appear here as soon as somebody buys a book."
                        : "Nothing matched that filter."}
                    </span>
                    {orders.length > 0 ? (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setSearch("")
                          changeFilter("all")
                        }}
                      >
                        Show all orders
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              page.map((order) => (
                <OrderRows
                  key={order.id}
                  order={order}
                  isOwner={isOwner}
                  expanded={expanded === order.id}
                  busy={busy === order.id}
                  onToggle={() => toggle(order)}
                  onMove={(status) => {
                    /* "Shipped" is not a bare status - it needs the courier
                       details the buyer will ask for, so it goes through
                       the dialog rather than straight to the mutation. */
                    if (status === "shipped")
                      setCourierFor({ order, mode: "ship" })
                    else void move(order, status)
                  }}
                  onCourier={
                    order.status === "shipped" || order.status === "delivered"
                      ? () => setCourierFor({ order, mode: "correct" })
                      : undefined
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <RowsPerPage
          id="orders-per-page"
          value={pageSize}
          onChange={(size) => {
            setPageSize(size)
            setPageIndex(0)
          }}
        />

        <p className="text-sm text-muted-foreground">
          Page {safePage + 1} of {pageCount}
          {canLoadMore ? <span aria-hidden="true">+</span> : null}
          {loadingMore ? (
            <Spinner className="ms-2 inline align-[-2px]" />
          ) : null}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            aria-label="First page"
            onClick={() => setPageIndex(0)}
            disabled={safePage === 0}
          >
            <IconChevronsLeft stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous page"
            onClick={() => setPageIndex(safePage - 1)}
            disabled={safePage === 0}
          >
            <IconChevronLeft stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next page"
            onClick={() => {
              if (safePage < pageCount - 1) setPageIndex(safePage + 1)
              else if (canLoadMore) onLoadMore()
            }}
            disabled={
              (safePage >= pageCount - 1 && !canLoadMore) || loadingMore
            }
          >
            <IconChevronRight stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Last loaded page"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={safePage >= pageCount - 1}
          >
            <IconChevronsRight stroke={1.75} />
          </Button>
        </div>
      </div>

      {courierFor ? (
        <CourierDialog
          order={courierFor.order}
          mode={courierFor.mode}
          busy={busy === courierFor.order.id}
          onClose={() => setCourierFor(null)}
          onSubmit={async (courier) => {
            const done = await applyCourier(
              courierFor.order,
              courier,
              courierFor.mode
            )
            if (done) setCourierFor(null)
          }}
        />
      ) : null}
    </div>
  )
}

/** Courier name and tracking number - the two facts "shipped" is made of. */
function CourierDialog({
  order,
  mode,
  busy,
  onClose,
  onSubmit,
}: {
  order: OrderRow
  mode: "ship" | "correct"
  busy: boolean
  onClose: () => void
  onSubmit: (courier: { name: string; trackingNumber: string }) => void
}) {
  const [name, setName] = useState(order.courier?.name ?? "")
  const [tracking, setTracking] = useState(order.courier?.trackingNumber ?? "")
  const ready = name.trim() !== "" && tracking.trim() !== ""

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "ship" ? `Ship ${order.reference}` : "Courier details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "ship"
              ? "Who is carrying it, and the tracking number the buyer can quote. Both are required before an order counts as shipped."
              : `Fix who is carrying ${order.reference}, or the tracking number.`}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="courier-name">Courier</FieldLabel>
            <Input
              id="courier-name"
              autoComplete="off"
              placeholder="DTDC, India Post, Delhivery…"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="courier-tracking">Tracking number</FieldLabel>
            <Input
              id="courier-tracking"
              autoComplete="off"
              placeholder="As on the receipt or label"
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            disabled={!ready || busy}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                trackingNumber: tracking.trim(),
              })
            }
          >
            {busy ? <Spinner /> : null}
            {mode === "ship" ? "Mark shipped" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** One order: the summary row, and the detail row when it is open. */
function OrderRows({
  order,
  isOwner,
  expanded,
  busy,
  onToggle,
  onMove,
  onCourier,
}: {
  order: OrderRow
  isOwner: boolean
  expanded: boolean
  busy: boolean
  onToggle: () => void
  onMove: (status: string) => void
  /** Offered once the order is on its way - for fixing a mistyped number. */
  onCourier?: () => void
}) {
  const moves = nextStatuses(order.status, isOwner, order.fulfilment)

  return (
    <>
      <TableRow data-state={expanded ? "selected" : undefined}>
        <TableCell>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="tnum font-medium underline-offset-4 hover:underline focus-visible:underline"
          >
            {order.reference}
          </button>
          {/*
            An unopened order gets a mark, not a colour. It is the same
            information the sidebar badge counts, in the place the reader is
            already looking.
          */}
          {order.seen ? null : (
            <span className="ms-2 align-middle text-xs text-muted-foreground">
              new
            </span>
          )}
          {order.receiptNumber ? (
            <a
              href={`/account/receipt/${order.reference}`}
              target="_blank"
              rel="noopener"
              className="tnum mbs-0.5 block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Receipt {order.receiptNumber}
            </a>
          ) : null}
        </TableCell>
        <TableCell>
          <span className="block">
            {order.buyerDeleted ? (
              <span className="text-muted-foreground">Account deleted</span>
            ) : (
              order.buyerName || (
                <span className="text-muted-foreground">Not given</span>
              )
            )}
          </span>
          {order.buyerPhone ? (
            <a
              href={`tel:${order.buyerPhone}`}
              className="tnum text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:underline"
            >
              {formatPhone(order.buyerPhone)}
            </a>
          ) : null}
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            {order.fulfilment === "delivery" ? (
              <IconTruck stroke={1.75} className="size-4" />
            ) : (
              <IconBuildingStore stroke={1.75} className="size-4" />
            )}
            {order.fulfilment === "delivery" ? "Delivery" : "Collection"}
          </span>
        </TableCell>
        <TableCell className="tnum text-right">
          {formatPaise(order.totalPaise)}
        </TableCell>
        <TableCell>
          <OrderStatusBadge status={order.status} />
        </TableCell>
        <TableCell>
          <time
            dateTime={new Date(order.placedAt).toISOString()}
            title={exact(order.placedAt)}
            className="whitespace-nowrap text-muted-foreground"
          >
            {ago(order.placedAt)}
          </time>
        </TableCell>
        <TableCell className="text-right">
          <OrderActions
            order={order}
            moves={moves}
            busy={busy}
            onMove={onMove}
          />
        </TableCell>
      </TableRow>

      {expanded ? (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30">
            <OrderDetail order={order} busy={busy} onCourier={onCourier} />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

/** The status moves menu - same set on the table row and the phone card. */
function OrderActions({
  order,
  moves,
  busy,
  onMove,
}: {
  order: OrderRow
  moves: string[]
  busy: boolean
  onMove: (status: string) => void
}) {
  if (moves.length === 0)
    return <span className="text-sm text-muted-foreground">—</span>
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" />}
        aria-label={`Change status of ${order.reference}`}
        disabled={busy}
      >
        {busy ? <Spinner /> : <IconDotsVertical stroke={1.75} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mark as</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {moves.map((status) => (
            <DropdownMenuItem key={status} onClick={() => onMove(status)}>
              {ORDER_STATUS_LABELS[status] ?? status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Items, money and destination - what "expand" means on either rendering. */
function OrderDetail({
  order,
  busy,
  onCourier,
}: {
  order: OrderRow
  busy: boolean
  onCourier?: () => void
}) {
  return (
    <div className="grid gap-8 py-2 md:grid-cols-2">
      <div>
        <h3 className="text-sm font-medium">Items</h3>
        <ul className="mbs-3 flex flex-col gap-2">
          {order.lines.map((line) => (
            <li key={`${line.slug}:${line.language}`} className="grid gap-1">
              <span className="flex items-baseline justify-between gap-4">
                <span>
                  {line.title}
                  <span className="text-muted-foreground">
                    {" "}
                    · {line.language === "as" ? "Assamese" : "English"} set
                  </span>
                  <span className="tnum text-muted-foreground">
                    {" "}
                    × {line.quantity}
                  </span>
                </span>
                <span className="tnum whitespace-nowrap text-muted-foreground">
                  {formatPaise(line.unitPaise * line.quantity)}
                </span>
              </span>
              {/* The packing list: exactly which books go in the parcel. */}
              <span className="text-sm text-muted-foreground">
                {line.books.join(" · ")}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mbs-4 flex flex-col gap-1 border-t border-border pbs-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Items</dt>
            <dd className="tnum">{formatPaise(order.itemsPaise)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {order.fulfilment === "delivery" ? "Delivery" : "Collection"}
            </dt>
            <dd className="tnum">
              {order.deliveryPaise === 0
                ? "Free"
                : formatPaise(order.deliveryPaise)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 font-medium">
            <dt>Total</dt>
            <dd className="tnum">{formatPaise(order.totalPaise)}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-medium">
          {order.fulfilment === "delivery" ? "Deliver to" : "Collection"}
        </h3>
        {order.address ? (
          <address className="mbs-3 not-italic">
            {order.address.line1}
            <br />
            {order.address.line2 ? (
              <>
                {order.address.line2}
                <br />
              </>
            ) : null}
            {order.address.city}
            {order.address.district ? `, ${order.address.district}` : ""}
            <br />
            <span className="tnum">{order.address.pin}</span>
          </address>
        ) : (
          <p className="mbs-3 text-muted-foreground">
            {/*
              A collection order has no address, and that is a fact
              rather than missing data. Saying so is better than an
              empty panel that reads like something failed to load.
            */}
            Collecting from the centre. No delivery address was taken.
          </p>
        )}

        {order.courier ? (
          <div className="mbs-6">
            <h3 className="text-sm font-medium">Courier</h3>
            <p className="mbs-3 text-muted-foreground">
              {order.courier.name}
              {" · "}
              <span className="tnum">{order.courier.trackingNumber}</span>
            </p>
            {onCourier ? (
              <Button
                variant="secondary"
                size="sm"
                className="mbs-3"
                onClick={onCourier}
                disabled={busy}
              >
                Fix courier details
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** One order as a phone-width card - the md-down rendering of OrderRows. */
function OrderCard({
  order,
  isOwner,
  expanded,
  busy,
  onToggle,
  onMove,
  onCourier,
}: {
  order: OrderRow
  isOwner: boolean
  expanded: boolean
  busy: boolean
  onToggle: () => void
  onMove: (status: string) => void
  onCourier?: () => void
}) {
  const moves = nextStatuses(order.status, isOwner, order.fulfilment)

  return (
    <div
      data-state={expanded ? "selected" : undefined}
      className="rounded-card border border-border p-4 data-[state=selected]:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="tnum font-medium underline-offset-4 hover:underline focus-visible:underline"
        >
          {order.reference}
        </button>
        <div className="flex items-center gap-2">
          {order.seen ? null : (
            <span className="text-xs text-muted-foreground">new</span>
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>
      {order.receiptNumber ? (
        <a
          href={`/account/receipt/${order.reference}`}
          target="_blank"
          rel="noopener"
          className="tnum block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Receipt {order.receiptNumber}
        </a>
      ) : null}

      <div className="mbs-1 text-sm">
        {order.buyerDeleted ? (
          <span className="text-muted-foreground">Account deleted</span>
        ) : (
          order.buyerName || (
            <span className="text-muted-foreground">Not given</span>
          )
        )}
        {order.buyerPhone ? (
          <a
            href={`tel:${order.buyerPhone}`}
            className="tnum block text-muted-foreground underline-offset-4 hover:underline focus-visible:underline"
          >
            {formatPhone(order.buyerPhone)}
          </a>
        ) : null}
      </div>

      <dl className="mbs-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Fulfilment</dt>
          <dd className="inline-flex items-center gap-1.5">
            {order.fulfilment === "delivery" ? (
              <IconTruck stroke={1.75} className="size-4" />
            ) : (
              <IconBuildingStore stroke={1.75} className="size-4" />
            )}
            {order.fulfilment === "delivery" ? "Delivery" : "Collection"}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Total</dt>
          <dd className="tnum text-foreground">
            {formatPaise(order.totalPaise)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Placed</dt>
          <dd>
            <time
              dateTime={new Date(order.placedAt).toISOString()}
              title={exact(order.placedAt)}
            >
              {ago(order.placedAt)}
            </time>
          </dd>
        </div>
      </dl>

      <div className="mbs-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "Details"}
        </Button>
        <OrderActions order={order} moves={moves} busy={busy} onMove={onMove} />
      </div>

      {expanded ? (
        <div className="mbs-4 border-t border-border pbs-4">
          <OrderDetail order={order} busy={busy} onCourier={onCourier} />
        </div>
      ) : null}
    </div>
  )
}
