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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  items: {
    title: string
    edition?: string
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
  buyerName: string
  buyerPhone: string
}

/**
 * The filter row, grouped by the question being asked.
 *
 * "Needs you" first because it is the view somebody opens the screen to see:
 * everything still waiting on ICT, across both fulfilment routes, without
 * having to know that "paid" and "ready to collect" are both somebody's next
 * task. The individual statuses follow for when the question is narrower.
 */
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

const OPEN = new Set([
  "awaiting_payment",
  "paid",
  "packed",
  "shipped",
  "ready_for_collection",
])

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

/**
 * The fulfilment queue.
 *
 * Hand-rolled rather than on `@tanstack/react-table` like the lead queue, and
 * deliberately: an order row expands to show its items and delivery address,
 * which is a disclosure pattern rather than a grid, and bending a table
 * library around a row that is sometimes two rows tall costs more than it
 * saves at this size. The lead queue earns the library because it sorts,
 * hides columns and selects; this one filters and expands.
 */
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
  const markSeen = useMutation(api.orders.markOrderSeen)

  const [filter, setFilter] = useState<string>("open")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  async function move(order: OrderRow, status: string) {
    setBusy(order.id)
    setError(null)
    const result = await setOrderStatus({
      orderId: order.id,
      status: status as never,
      expectedRevision: order.revision,
    })
    setBusy(null)
    // Discriminate on the value: `Refusal` carries an `ok` key too.
    if (!result.ok) {
      setError(
        result.reason === "revision-conflict"
          ? `${order.reference} changed somewhere else. It has been refreshed - check it and try again.`
          : result.reason === "invalid-input"
            ? `That is not a move ${order.reference} can make from ${ORDER_STATUS_LABELS[order.status]}.`
            : "That change was refused. You may not have permission any more."
      )
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
          <InputGroupAddon className="pl-3">
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
        <p aria-live="polite" className="ml-auto text-sm text-muted-foreground">
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

      <div className="overflow-x-auto rounded-card border border-border">
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
                  onMove={(status) => void move(order, status)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="orders-per-page" className="text-sm">
            Rows per page
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setPageIndex(0)
            }}
            items={[10, 20, 30, 50].map((size) => ({
              label: `${size}`,
              value: `${size}`,
            }))}
          >
            <SelectTrigger id="orders-per-page" className="w-20">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          Page {safePage + 1} of {pageCount}
          {canLoadMore ? <span aria-hidden="true">+</span> : null}
          {loadingMore ? (
            <Spinner className="ml-2 inline align-[-2px]" />
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
    </div>
  )
}

/**
 * One order: the summary row, and the detail row when it is open.
 *
 * Two `<tr>`s rather than a nested table, so the columns of the open row stay
 * aligned with every other row's and the browser's own table layout does the
 * work.
 */
function OrderRows({
  order,
  isOwner,
  expanded,
  busy,
  onToggle,
  onMove,
}: {
  order: OrderRow
  isOwner: boolean
  expanded: boolean
  busy: boolean
  onToggle: () => void
  onMove: (status: string) => void
}) {
  const moves = nextStatuses(order.status, isOwner)

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
           * An unopened order gets a mark, not a colour. It is the same
           * information the sidebar badge counts, in the place the reader is
           * already looking.
           */}
          {order.seen ? null : (
            <span className="ml-2 align-middle text-xs text-muted-foreground">
              new
            </span>
          )}
        </TableCell>
        <TableCell>
          <span className="block">
            {order.buyerName || (
              <span className="text-muted-foreground">Not given</span>
            )}
          </span>
          <a
            href={`tel:${order.buyerPhone}`}
            className="tnum text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:underline"
          >
            {formatPhone(order.buyerPhone)}
          </a>
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
          {moves.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
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
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onMove(status)}
                    >
                      {ORDER_STATUS_LABELS[status] ?? status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>

      {expanded ? (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30">
            <div className="grid gap-8 py-2 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Items</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {order.items.map((item, index) => (
                    <li
                      key={`${item.title}-${index}`}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <span>
                        {item.title}
                        {item.edition ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {item.edition}
                          </span>
                        ) : null}
                        <span className="tnum text-muted-foreground">
                          {" "}
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="tnum whitespace-nowrap text-muted-foreground">
                        {formatPaise(item.unitPaise * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Items</dt>
                    <dd className="tnum">{formatPaise(order.itemsPaise)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {order.fulfilment === "delivery"
                        ? "Delivery"
                        : "Collection"}
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
                  {order.fulfilment === "delivery"
                    ? "Deliver to"
                    : "Collection"}
                </h3>
                {order.address ? (
                  <address className="mt-3 not-italic">
                    {order.address.line1}
                    <br />
                    {order.address.line2 ? (
                      <>
                        {order.address.line2}
                        <br />
                      </>
                    ) : null}
                    {order.address.city}
                    {order.address.district
                      ? `, ${order.address.district}`
                      : ""}
                    <br />
                    <span className="tnum">{order.address.pin}</span>
                  </address>
                ) : (
                  <p className="mt-3 text-muted-foreground">
                    {/*
                     * A collection order has no address, and that is a fact
                     * rather than missing data. Saying so is better than an
                     * empty panel that reads like something failed to load.
                     */}
                    Collecting from the centre. No delivery address was taken.
                  </p>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}
