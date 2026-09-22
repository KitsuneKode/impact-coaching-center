import { Badge } from "@/components/ui/badge"

/**
 * Where an order is, weighted by whether it still needs someone.
 *
 * Same rule as the lead queue: emphasis, never hue. §3 of the design guide
 * reserves green for "verified" and amber for the highlighter, and ends with
 * "never rely on colour alone for status" - so the signal is weight, and a
 * dot repeats it in fill.
 *
 * Three tiers, because that is how a fulfilment queue is actually read:
 * **waiting on us** (filled badge - awaiting payment, paid, packed,
 * ready for collection are all somebody's next task), **in motion or done**
 * (quiet - shipped, delivered, collected), and **ended badly** (faded -
 * cancelled, refunded, which should not draw the eye on a working day).
 *
 * Written out per branch rather than looked up: `shadcn/require-static-classes`
 * rejects a className assembled from a variable on a registry component, and
 * a class string the linter cannot read is one Tailwind may not emit.
 */
export function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "awaiting_payment":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-muted-foreground"
          />
          Awaiting payment
        </Badge>
      )
    case "paid":
      return (
        <Badge variant="solid" className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-foreground"
          />
          Paid
        </Badge>
      )
    case "packed":
      return (
        <Badge variant="solid" className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-foreground"
          />
          Packed
        </Badge>
      )
    case "ready_for_collection":
      return (
        <Badge variant="solid" className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-foreground"
          />
          Ready to collect
        </Badge>
      )
    case "shipped":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-muted-foreground"
          />
          Shipped
        </Badge>
      )
    case "delivered":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-muted-foreground"
          />
          Delivered
        </Badge>
      )
    case "collected":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-muted-foreground"
          />
          Collected
        </Badge>
      )
    case "cancelled":
      return (
        <Badge className="gap-1.5 opacity-70">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-border"
          />
          Cancelled
        </Badge>
      )
    case "refunded":
      return (
        <Badge className="gap-1.5 opacity-70">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-border"
          />
          Refunded
        </Badge>
      )
    default:
      // Shown as itself rather than swallowed. A status added to the schema
      // and not here should look wrong, not look fine.
      return <span className="text-muted-foreground">{status}</span>
  }
}

/** Human labels, for the filter row and the status menu. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  ready_for_collection: "Ready to collect",
  collected: "Collected",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

/**
 * What a staff member may move this order to next.
 *
 * A copy of the server's machine, for the menu only. The server refuses an
 * illegal move regardless (`convex/orders.ts`), so this decides what to
 * *offer* rather than what is allowed - the difference matters, because a
 * client-side list going stale must never be the thing that permits a bad
 * transition.
 *
 * `paid` is never offered: payment is established by a verified Razorpay
 * signature and nothing else, so it is not a thing a person clicks.
 */
export function nextStatuses(status: string): string[] {
  switch (status) {
    case "awaiting_payment":
      return ["cancelled"]
    case "paid":
      return ["packed", "ready_for_collection", "cancelled", "refunded"]
    case "packed":
      return ["shipped", "cancelled", "refunded"]
    case "shipped":
      return ["delivered", "refunded"]
    case "ready_for_collection":
      return ["collected", "cancelled", "refunded"]
    case "delivered":
    case "collected":
      return ["refunded"]
    default:
      return []
  }
}
