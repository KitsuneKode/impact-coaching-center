"use client"

import {
  IconBuildingStore,
  IconChevronDown,
  IconPrinter,
  IconSearch,
  IconTruck,
} from "@tabler/icons-react"
import { useMutation } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useMemo, useState } from "react"

import {
  ago,
  CourierNames,
  exact,
  OrderDetail,
  OrderMovesMenu,
  refusalText,
  useOrderActions,
  type OrderRow,
} from "@/components/admin/order-actions"
import { OrderStatusBadge } from "@/components/admin/order-status"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
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
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { formatPhone } from "@/lib/brand"
import { formatPaise } from "@/lib/money"
import { isOrderReference, normaliseReference } from "@/lib/order-reference"
import type { OrderTab } from "@/lib/order-status"

/** What a selection in each open tab can become, all at once. */
type BulkMove = "shipped" | "ready_for_collection" | "delivered" | "collected"

const EMPTY: Record<OrderTab, string> = {
  to_send: "Nothing to send. Paid orders land here first.",
  on_the_way: "No parcels on the way.",
  to_collect: "Nobody is due to collect.",
  refund_due: "No refunds owed.",
  done: "No finished orders yet.",
}

/** One tab of the fulfilment queue. */
export function OrdersTable({
  tab,
  orders,
  isOwner,
  canLoadMore,
  loadingMore,
  onLoadMore,
}: {
  tab: OrderTab
  orders: OrderRow[]
  isOwner: boolean
  canLoadMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const router = useRouter()
  const markSeen = useMutation(api.orders.markOrderSeen)
  const actions = useOrderActions()

  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [picked, setPicked] = useState<ReadonlySet<Id<"orders">>>(new Set())
  const [bulk, setBulk] = useState<{
    move: BulkMove
    orders: OrderRow[]
  } | null>(null)

  const selectable = tab !== "done" && tab !== "refund_due"
  const matching = useMemo(() => {
    const words = search.trim().toLowerCase()
    const digits = words.replaceAll(/\D/g, "")
    if (!words) return orders
    return orders.filter(
      (order) =>
        order.reference.toLowerCase().includes(words.replace(/\s/g, "")) ||
        order.buyerName.toLowerCase().includes(words) ||
        (digits.length >= 3 && order.buyerPhone.includes(digits))
    )
  }, [orders, search])

  // Rows that left the tab (moved elsewhere) leave the selection too.
  const selected = orders.filter((order) => picked.has(order.id))
  const toShip = selected.filter((o) => o.fulfilment === "delivery")
  const toHand = selected.filter((o) => o.fulfilment === "collection")
  const allPicked =
    matching.length > 0 && matching.every((order) => picked.has(order.id))

  function pick(id: Id<"orders">, on: boolean) {
    setPicked((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function pickAll(on: boolean) {
    setPicked(on ? new Set(matching.map((order) => order.id)) : new Set())
  }

  function toggle(order: OrderRow) {
    const opening = expanded !== order.id
    setExpanded(opening ? order.id : null)
    // Opening an order is what "seen" means; loading the list is not.
    if (opening && !order.seen) void markSeen({ orderId: order.id })
  }

  function printLabels(rows: OrderRow[]) {
    const refs = rows.map((order) => order.reference).join(",")
    window.open(`/admin/orders/labels?refs=${refs}`, "_blank", "noopener")
  }

  const rowProps = (order: OrderRow) => ({
    order,
    isOwner,
    selectable,
    picked: picked.has(order.id),
    onPick: (on: boolean) => pick(order.id, on),
    expanded: expanded === order.id,
    busy: actions.busy === order.id,
    onToggle: () => toggle(order),
    onMove: (status: Parameters<typeof actions.request>[1]) =>
      actions.request(order, status),
    onCourier:
      order.status === "shipped" || order.status === "delivered"
        ? () => actions.correctCourier(order)
        : undefined,
  })

  const empty =
    orders.length === 0 ? (
      <span className="text-muted-foreground">{EMPTY[tab]}</span>
    ) : (
      <div className="flex flex-col items-start gap-3">
        <span className="text-muted-foreground">
          Nothing loaded matches “{search.trim()}”.
        </span>
        <Button variant="secondary" size="md" onClick={() => setSearch("")}>
          Clear the search
        </Button>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <search>
        <form
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          onSubmit={(event) => {
            event.preventDefault()
            const reference = normaliseReference(search)
            if (isOrderReference(reference))
              router.push(`/admin/orders/${reference}`)
          }}
        >
          <InputGroup className="w-full max-w-sm">
            <InputGroupAddon className="ps-3">
              <IconSearch
                stroke={1.75}
                className="size-4 text-muted-foreground"
              />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="ICT-7K3F9, a name or a number"
              aria-label="Find an order by reference, buyer name or number"
              aria-describedby="orders-search-hint"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
          <p id="orders-search-hint" className="text-sm text-muted-foreground">
            Enter on a reference opens it from any tab.
          </p>
        </form>
      </search>

      <p role="alert" className="text-sm text-destructive empty:hidden">
        {actions.error ?? ""}
      </p>

      {selectable && selected.length > 0 ? (
        <section
          aria-label="Selected orders"
          className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-card border border-border bg-card p-2 ps-4 shadow-frame"
        >
          <span className="tnum me-auto text-sm font-medium">
            {selected.length} selected
          </span>
          {tab === "to_send" && toShip.length > 0 ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => printLabels(toShip)}
              >
                <IconPrinter stroke={1.75} />
                Print {toShip.length} {toShip.length === 1 ? "label" : "labels"}
              </Button>
              <Button
                size="sm"
                onClick={() => setBulk({ move: "shipped", orders: toShip })}
              >
                Ship {toShip.length}…
              </Button>
            </>
          ) : null}
          {tab === "to_send" && toHand.length > 0 ? (
            <Button
              size="sm"
              onClick={() =>
                setBulk({ move: "ready_for_collection", orders: toHand })
              }
            >
              Mark {toHand.length} ready to collect
            </Button>
          ) : null}
          {tab === "on_the_way" ? (
            <Button
              size="sm"
              onClick={() => setBulk({ move: "delivered", orders: selected })}
            >
              Mark {selected.length} delivered
            </Button>
          ) : null}
          {tab === "to_collect" ? (
            <Button
              size="sm"
              onClick={() => setBulk({ move: "collected", orders: selected })}
            >
              Mark {selected.length} collected
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => pickAll(false)}>
            Clear
          </Button>
        </section>
      ) : null}

      {/* Below md a row of cells does not fit a phone: each order is a card. */}
      <div className="flex flex-col gap-3 md:hidden">
        {matching.length === 0 ? (
          <div className="rounded-card border border-border p-4">{empty}</div>
        ) : (
          matching.map((order) => (
            <OrderCard key={order.id} {...rowProps(order)} />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-border md:block">
        <Table className="min-w-200">
          <TableHeader className="bg-muted/40">
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allPicked}
                    indeterminate={selected.length > 0 && !allPicked}
                    onCheckedChange={(on) => pickAll(Boolean(on))}
                    aria-label="Select every order shown"
                  />
                </TableHead>
              ) : null}
              <TableHead>Order</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matching.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectable ? 8 : 7} className="h-24">
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              matching.map((order) => (
                <OrderRows key={order.id} {...rowProps(order)} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {canLoadMore || loadingMore ? (
        <Button
          variant="secondary"
          size="md"
          className="self-start"
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? <Spinner /> : null}
          Load more orders
        </Button>
      ) : null}

      {actions.dialogs}

      {bulk ? (
        <BulkDialog
          move={bulk.move}
          orders={bulk.orders}
          onClose={() => setBulk(null)}
          onDone={(moved) => {
            setPicked((current) => {
              const next = new Set(current)
              for (const id of moved) next.delete(id)
              return next
            })
          }}
          onPrint={printLabels}
        />
      ) : null}
    </div>
  )
}

const BULK_VERB: Record<BulkMove, string> = {
  shipped: "shipped",
  ready_for_collection: "ready to collect",
  delivered: "delivered",
  collected: "collected",
}

/**
 * The review before a batch: every order it touches, by reference and
 * buyer, and for shipping the tracking number each parcel carries. Applied
 * one order at a time on the server; anything refused stays listed.
 */
function BulkDialog({
  move,
  orders,
  onClose,
  onDone,
  onPrint,
}: {
  move: BulkMove
  orders: OrderRow[]
  onClose: () => void
  onDone: (moved: Id<"orders">[]) => void
  onPrint: (rows: OrderRow[]) => void
}) {
  const id = useId()
  const apply = useMutation(api.orders.setOrderStatuses)
  const [courier, setCourier] = useState("")
  const [tracking, setTracking] = useState<Record<string, string>>({})
  const [left, setLeft] = useState(orders)
  const [refused, setRefused] = useState<Record<string, string>>({})
  const [working, setWorking] = useState(false)
  const [error, setError] = useState("")
  const shipping = move === "shipped"

  async function run() {
    if (shipping) {
      if (!courier.trim()) return setError("Enter the courier.")
      const blank = left.find((order) => !tracking[order.id]?.trim())
      if (blank)
        return setError(`Enter the tracking number for ${blank.reference}.`)
    }
    setError("")
    setWorking(true)
    try {
      const result = await apply({
        moves: left.map((order) => ({
          orderId: order.id,
          status: move,
          expectedRevision: order.revision,
          courier: shipping
            ? {
                name: courier.trim(),
                trackingNumber: (tracking[order.id] ?? "").trim(),
              }
            : undefined,
        })),
      })
      if (!result.ok) {
        setError(refusalText("These orders", result.reason))
        return
      }
      const moved = result.results.filter((r) => r.ok).map((r) => r.orderId)
      onDone(moved)
      const failed = result.results.filter((r) => !r.ok)
      if (failed.length === 0) return onClose()
      setLeft(left.filter((order) => !moved.includes(order.id)))
      setRefused(
        Object.fromEntries(
          failed.map((r) => {
            const order = left.find((o) => o.id === r.orderId)
            return [r.orderId, refusalText(order?.reference ?? "", r.reason)]
          })
        )
      )
      setError(
        `${moved.length} done. ${failed.length} refused: see below, then try again or close.`
      )
    } catch {
      setError("Couldn't reach the server. Nothing changed. Try again.")
    } finally {
      setWorking(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !working && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            void run()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Mark {left.length} {left.length === 1 ? "order" : "orders"}{" "}
              {BULK_VERB[move]}?
            </DialogTitle>
            <DialogDescription>
              {move === "shipped"
                ? "Each buyer gets a WhatsApp message with the courier and their own tracking number."
                : move === "ready_for_collection"
                  ? "Each buyer gets a WhatsApp message saying their books are ready, with the centre's address."
                  : "These orders close and move to Done. Buyers are not sent a message."}
            </DialogDescription>
          </DialogHeader>

          {shipping ? (
            <Field>
              <FieldLabel htmlFor={`${id}-courier`}>
                Courier, for all of them
              </FieldLabel>
              <Input
                id={`${id}-courier`}
                list={`${id}-couriers`}
                autoComplete="off"
                placeholder="India Post"
                value={courier}
                onChange={(event) => setCourier(event.target.value)}
              />
              <CourierNames id={`${id}-couriers`} />
            </Field>
          ) : null}

          <ul className="-mx-1 flex max-h-[50dvh] flex-col divide-y divide-border overflow-y-auto px-1">
            {left.map((order) => (
              <li key={order.id} className="grid gap-2 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="tnum font-medium">{order.reference}</span>
                  <span className="text-sm text-muted-foreground">
                    {order.buyerName || "Name not given"}
                    {order.address
                      ? ` · ${order.address.city} ${order.address.pin}`
                      : ""}
                  </span>
                </div>
                {shipping ? (
                  <Input
                    aria-label={`Tracking number for ${order.reference}`}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Tracking number"
                    value={tracking[order.id] ?? ""}
                    onChange={(event) =>
                      setTracking((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                  />
                ) : null}
                {refused[order.id] ? (
                  <p className="text-sm text-destructive">
                    {refused[order.id]}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <p role="alert" className="text-sm text-destructive empty:hidden">
            {error}
          </p>

          <DialogFooter className="flex-wrap">
            {shipping ? (
              <Button
                type="button"
                variant="ghost"
                className="me-auto"
                onClick={() => onPrint(left)}
              >
                <IconPrinter stroke={1.75} />
                Print labels
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={working}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={working || left.length === 0}>
              {working ? <Spinner /> : null}
              Mark {left.length} {BULK_VERB[move]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type RowProps = {
  order: OrderRow
  isOwner: boolean
  selectable: boolean
  picked: boolean
  onPick: (on: boolean) => void
  expanded: boolean
  busy: boolean
  onToggle: () => void
  onMove: Parameters<typeof OrderMovesMenu>[0]["onMove"]
  onCourier?: () => void
}

function Buyer({ order }: { order: OrderRow }) {
  return (
    <>
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
    </>
  )
}

function Route({ order }: { order: OrderRow }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      {order.fulfilment === "delivery" ? (
        <IconTruck aria-hidden stroke={1.75} className="size-4" />
      ) : (
        <IconBuildingStore aria-hidden stroke={1.75} className="size-4" />
      )}
      {order.fulfilment === "delivery"
        ? (order.address?.city ?? "Delivery")
        : "Collection"}
    </span>
  )
}

function Placed({ at }: { at: number }) {
  return (
    <time
      dateTime={new Date(at).toISOString()}
      title={exact(at)}
      className="whitespace-nowrap text-muted-foreground"
    >
      {ago(at)}
    </time>
  )
}

/** One order on a wide screen: the summary row, and its slip when open. */
function OrderRows(props: RowProps) {
  const { order, expanded } = props
  return (
    <>
      <TableRow data-state={expanded || props.picked ? "selected" : undefined}>
        {props.selectable ? (
          <TableCell>
            <Checkbox
              checked={props.picked}
              onCheckedChange={(on) => props.onPick(Boolean(on))}
              aria-label={`Select ${order.reference}`}
            />
          </TableCell>
        ) : null}
        <TableCell>
          <span className="flex items-center gap-1">
            <Link
              href={`/admin/orders/${order.reference}`}
              className="tnum font-medium underline-offset-4 hover:underline focus-visible:underline"
            >
              {order.reference}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={props.onToggle}
              aria-expanded={expanded}
              aria-label={`${expanded ? "Hide" : "Show"} the packing slip for ${order.reference}`}
            >
              <IconChevronDown
                stroke={1.75}
                className="transition-transform data-[open]:rotate-180"
                data-open={expanded ? "" : undefined}
              />
            </Button>
            {order.seen ? null : (
              <span className="text-xs text-muted-foreground">new</span>
            )}
          </span>
        </TableCell>
        <TableCell>
          <Buyer order={order} />
        </TableCell>
        <TableCell>
          <Route order={order} />
        </TableCell>
        <TableCell className="tnum text-right">
          {formatPaise(order.totalPaise)}
        </TableCell>
        <TableCell>
          <OrderStatusBadge status={order.status} refundDue={order.refundDue} />
        </TableCell>
        <TableCell>
          <Placed at={order.placedAt} />
        </TableCell>
        <TableCell className="text-right">
          <OrderMovesMenu
            order={order}
            isOwner={props.isOwner}
            busy={props.busy}
            onMove={props.onMove}
          />
        </TableCell>
      </TableRow>

      {expanded ? (
        <TableRow>
          <TableCell colSpan={props.selectable ? 8 : 7} className="bg-muted/30">
            <OrderDetail
              order={order}
              busy={props.busy}
              onCourier={props.onCourier}
            />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

/** One order as a phone-width card. */
function OrderCard(props: RowProps) {
  const { order, expanded } = props
  return (
    <div
      data-state={expanded || props.picked ? "selected" : undefined}
      className="rounded-card border border-border p-4 data-[state=selected]:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          {props.selectable ? (
            <Checkbox
              checked={props.picked}
              onCheckedChange={(on) => props.onPick(Boolean(on))}
              aria-label={`Select ${order.reference}`}
            />
          ) : null}
          <Link
            href={`/admin/orders/${order.reference}`}
            className="tnum font-medium underline-offset-4 hover:underline focus-visible:underline"
          >
            {order.reference}
          </Link>
        </span>
        <span className="flex items-center gap-2">
          {order.seen ? null : (
            <span className="text-xs text-muted-foreground">new</span>
          )}
          <OrderStatusBadge status={order.status} refundDue={order.refundDue} />
        </span>
      </div>

      <div className="mbs-2 text-sm">
        <Buyer order={order} />
      </div>

      <dl className="mbs-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <div>
          <dt className="sr-only">Route</dt>
          <dd>
            <Route order={order} />
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Total</dt>
          <dd className="tnum text-foreground">
            {formatPaise(order.totalPaise)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Paid</dt>
          <dd>
            <Placed at={order.placedAt} />
          </dd>
        </div>
      </dl>

      <div className="mbs-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={props.onToggle}
          aria-expanded={expanded}
        >
          {expanded ? "Hide the slip" : "Packing slip"}
        </Button>
        <OrderMovesMenu
          order={order}
          isOwner={props.isOwner}
          busy={props.busy}
          onMove={props.onMove}
        />
      </div>

      {expanded ? (
        <div className="mbs-4 border-t border-border pbs-4">
          <OrderDetail
            order={order}
            busy={props.busy}
            onCourier={props.onCourier}
          />
        </div>
      ) : null}
    </div>
  )
}
