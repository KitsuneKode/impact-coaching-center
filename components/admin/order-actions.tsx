"use client"

import { IconDotsVertical } from "@tabler/icons-react"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { useId, useState, type ReactNode } from "react"

import { ConfirmAction } from "@/components/admin/confirm-action"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { centres, formatPhone } from "@/lib/brand"
import { COURIERS } from "@/lib/couriers"
import { formatPaise } from "@/lib/money"
import {
  nextStatuses,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status"

export type OrderRow = FunctionReturnType<
  typeof api.orders.adminOrdersPage
>["page"][number]

export type Courier = { name: string; trackingNumber: string }

export function ago(at: number) {
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

export function exact(at: number) {
  return new Date(at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** What a refused move means, in the words staff need to fix it. */
export function refusalText(reference: string, reason?: string) {
  switch (reason) {
    case "revision-conflict":
      return `${reference} changed somewhere else. It has been refreshed: check it and try again.`
    case "transition":
    case "fulfilment":
      return `${reference} can't make that move from where it is now.`
    case "courier":
      return `${reference} needs a courier and a tracking number to ship.`
    case "missing-record":
      return `${reference} no longer exists.`
    default:
      return "That change was refused. You may not have permission any more."
  }
}

const OFFLINE = "Couldn't reach the server. The order is unchanged. Try again."

/**
 * One order's moves, wherever it is shown: the queue row, the phone card,
 * the order's own page. Shipping asks for the courier; cancelling and
 * refunding are typed; the rest go straight through.
 */
export function useOrderActions() {
  const setOrderStatus = useMutation(api.orders.setOrderStatus)
  const setOrderCourier = useMutation(api.orders.setOrderCourier)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [courierFor, setCourierFor] = useState<{
    order: OrderRow
    mode: "ship" | "correct"
  } | null>(null)
  const [confirmFor, setConfirmFor] = useState<{
    order: OrderRow
    status: "cancelled" | "refunded"
  } | null>(null)

  async function run(order: OrderRow, write: () => Promise<{ ok: boolean }>) {
    setBusy(order.id)
    setError(null)
    try {
      const result = await write()
      if (!result.ok) {
        const refused = result as { reason?: string; field?: string }
        setError(refusalText(order.reference, refused.field ?? refused.reason))
        return false
      }
      return true
    } catch {
      setError(OFFLINE)
      return false
    } finally {
      setBusy(null)
    }
  }

  const move = (order: OrderRow, status: OrderStatus, courier?: Courier) =>
    run(order, () =>
      setOrderStatus({
        orderId: order.id,
        status,
        expectedRevision: order.revision,
        courier,
      })
    )

  function request(order: OrderRow, status: OrderStatus) {
    if (status === "shipped") setCourierFor({ order, mode: "ship" })
    else if (status === "cancelled" || status === "refunded")
      setConfirmFor({ order, status })
    else void move(order, status)
  }

  const correctCourier = (order: OrderRow) =>
    setCourierFor({ order, mode: "correct" })

  const dialogs = (
    <>
      <ConfirmAction
        open={confirmFor !== null}
        onOpenChange={(open) => !open && setConfirmFor(null)}
        title={
          confirmFor?.status === "refunded"
            ? `Mark ${confirmFor.order.reference} refunded?`
            : `Cancel ${confirmFor?.order.reference ?? "this order"}?`
        }
        description={
          confirmFor?.status === "refunded"
            ? "A refund made in Razorpay marks itself. Use this only for money returned another way, once the buyer has it."
            : `The buyer has paid ${confirmFor ? formatPaise(confirmFor.order.totalPaise) : ""}. Cancelling moves it to Refund due; refund it in Razorpay and it closes itself.`
        }
        confirmLabel={
          confirmFor?.status === "refunded" ? "Mark refunded" : "Cancel order"
        }
        word={confirmFor?.status === "refunded" ? "REFUND" : "CANCEL"}
        onConfirm={async () =>
          confirmFor ? move(confirmFor.order, confirmFor.status) : false
        }
      />
      {courierFor ? (
        <CourierDialog
          reference={courierFor.order.reference}
          initial={courierFor.order.courier}
          mode={courierFor.mode}
          busy={busy === courierFor.order.id}
          error={error}
          onClose={() => setCourierFor(null)}
          onSubmit={async (courier) => {
            const { order, mode } = courierFor
            const done =
              mode === "ship"
                ? await move(order, "shipped", courier)
                : await run(order, () =>
                    setOrderCourier({
                      orderId: order.id,
                      courier,
                      expectedRevision: order.revision,
                    })
                  )
            if (done) setCourierFor(null)
          }}
        />
      ) : null}
    </>
  )

  return { request, correctCourier, busy, error, setError, dialogs }
}

/** The couriers ICT uses, offered as you type; any other name still works. */
export function CourierNames({ id }: { id: string }) {
  return (
    <datalist id={id}>
      {COURIERS.map((courier) => (
        <option key={courier.name} value={courier.name}>
          {courier.name}
        </option>
      ))}
    </datalist>
  )
}

/** Courier name and tracking number: the two facts "shipped" is made of. */
function CourierDialog({
  reference,
  initial,
  mode,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  reference: string
  initial?: Courier
  mode: "ship" | "correct"
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (courier: Courier) => void
}) {
  const id = useId()
  const [name, setName] = useState(initial?.name ?? "")
  const [tracking, setTracking] = useState(initial?.trackingNumber ?? "")
  const [missing, setMissing] = useState(false)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim() || !tracking.trim()) {
              setMissing(true)
              return
            }
            onSubmit({ name: name.trim(), trackingNumber: tracking.trim() })
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "ship"
                ? `Ship ${reference}`
                : `Fix the courier on ${reference}`}
            </DialogTitle>
            <DialogDescription>
              {mode === "ship"
                ? "The buyer gets both on WhatsApp, with a link to track it."
                : "The buyer is not sent a new message. Tell them if the number changed."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${id}-name`}>Courier</FieldLabel>
              <Input
                id={`${id}-name`}
                list={`${id}-couriers`}
                autoComplete="off"
                placeholder="India Post"
                value={name}
                aria-invalid={missing && !name.trim() ? true : undefined}
                onChange={(event) => setName(event.target.value)}
              />
              <CourierNames id={`${id}-couriers`} />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-tracking`}>
                Tracking number
              </FieldLabel>
              <Input
                id={`${id}-tracking`}
                autoComplete="off"
                spellCheck={false}
                placeholder="EE123456789IN"
                value={tracking}
                aria-invalid={missing && !tracking.trim() ? true : undefined}
                onChange={(event) => setTracking(event.target.value)}
              />
            </Field>
          </FieldGroup>
          <p role="alert" className="text-sm text-destructive empty:hidden">
            {missing && (!name.trim() || !tracking.trim())
              ? "Enter both the courier and the tracking number."
              : (error ?? "")}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Spinner /> : null}
              {mode === "ship" ? "Mark shipped" : "Save courier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** The status moves menu: the same set on the row, the card and the page. */
export function OrderMovesMenu({
  order,
  isOwner,
  busy,
  onMove,
}: {
  order: OrderRow
  isOwner: boolean
  busy: boolean
  onMove: (status: OrderStatus) => void
}) {
  const moves = nextStatuses(
    order.status,
    isOwner,
    order.fulfilment,
    order.refundDue
  )
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
              {ORDER_STATUS_LABELS[status]}
              {status === "shipped" ? "…" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Items, money and destination: the packing slip. */
export function OrderDetail({
  order,
  busy,
  onCourier,
  headingLevel = 3,
}: {
  order: OrderRow
  busy: boolean
  /** Offered once the order is on its way, for a mistyped number. */
  onCourier?: () => void
  headingLevel?: 2 | 3
}) {
  const Heading = `h${headingLevel}` as const
  const heading = (text: ReactNode) => (
    <Heading className="text-sm font-medium">{text}</Heading>
  )
  return (
    <div className="grid gap-8 py-2 md:grid-cols-2">
      <div>
        {heading("Items")}
        <ul className="mbs-3 flex flex-col gap-2">
          {order.lines.map((line) => (
            <li key={`${line.slug}:${line.language}`} className="grid gap-1">
              <span className="flex items-baseline justify-between gap-4">
                <span>
                  {line.title}
                  <span className="whitespace-nowrap text-muted-foreground">
                    {" "}
                    · {line.language === "as" ? "Assamese" : "English"} set
                  </span>
                  <span className="tnum whitespace-nowrap text-muted-foreground">
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
        {heading(order.fulfilment === "delivery" ? "Deliver to" : "Collection")}
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
            {order.address.landmark ? (
              <>
                {order.address.landmark}
                <br />
              </>
            ) : null}
            {order.address.city}
            {order.address.district ? `, ${order.address.district}` : ""}
            <br />
            <span className="tnum">{order.address.pin}</span>
            {order.courierPhone ? (
              <>
                <br />
                Courier calls{" "}
                <a href={`tel:${order.courierPhone}`} className="tnum link">
                  {formatPhone(order.courierPhone)}
                </a>
              </>
            ) : null}
          </address>
        ) : (
          <p className="mbs-3 text-muted-foreground">
            Collecting from the{" "}
            {centres.find((c) => c.id === order.pickupCentre)?.town ??
              centres[0]!.town}{" "}
            centre. No delivery address was taken.
          </p>
        )}

        {order.courier ? (
          <div className="mbs-6">
            {heading("Courier")}
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
