/**
 * An order's life after payment, shared by the server (convex/orders.ts)
 * and the admin. Orders exist only once paid (ADR-0005), so there is no
 * unpaid status; parcels ship, collections are handed over.
 */
export type OrderStatus =
  | "paid"
  | "shipped"
  | "delivered"
  | "ready_for_collection"
  | "collected"
  | "cancelled"
  | "refunded"

export type Fulfilment = "delivery" | "collection"

/** Human labels, for the filter row and the status menu. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  ready_for_collection: "Ready to collect",
  collected: "Collected",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

/** Nothing left for anyone to do. */
export const CLOSED_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "delivered",
  "collected",
  "cancelled",
  "refunded",
])

/** Every move the server allows, before role and money rules. */
export const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  paid: ["shipped", "ready_for_collection", "cancelled"],
  shipped: ["delivered"],
  ready_for_collection: ["collected", "cancelled"],
  delivered: [],
  collected: [],
  // Only while ICT still holds the money (refundDueAt).
  cancelled: ["refunded"],
  refunded: [],
}

/** Moves that only make sense for one way of getting the books. */
export const ROUTE_OF: Partial<Record<OrderStatus, Fulfilment>> = {
  shipped: "delivery",
  delivered: "delivery",
  ready_for_collection: "collection",
  collected: "collection",
}

/**
 * What this person may move the order to next. Cancelling a paid order
 * owes a refund, so it is the owner's call; so is saying the money went
 * back. The server enforces the same rules.
 */
export function nextStatuses(
  status: OrderStatus,
  isOwner: boolean,
  fulfilment: Fulfilment,
  refundDue = false
): OrderStatus[] {
  return TRANSITIONS[status].filter((next) => {
    const route = ROUTE_OF[next]
    if (route && route !== fulfilment) return false
    if (next === "refunded") return isOwner && refundDue
    if (next === "cancelled") return isOwner
    return true
  })
}

/** The admin's queue, one tab per thing somebody has to do. */
export const ORDER_TABS = [
  "to_send",
  "on_the_way",
  "to_collect",
  "refund_due",
  "done",
] as const
export type OrderTab = (typeof ORDER_TABS)[number]

export const ORDER_TAB_LABELS: Record<OrderTab, string> = {
  to_send: "To send",
  on_the_way: "On the way",
  to_collect: "To collect",
  refund_due: "Refund due",
  done: "Done",
}
