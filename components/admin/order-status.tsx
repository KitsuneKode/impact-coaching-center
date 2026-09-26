import { Badge } from "@/components/ui/badge"

/** Where an order is, weighted by whether it still needs someone. */
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
