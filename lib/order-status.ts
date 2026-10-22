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
 * What a staff member may move this order to next. The fulfilment route
 * decides which forward move exists: parcels ship, collections get picked
 * up. The server enforces the same split (convex/orders.ts). A cancelled
 * order only moves on when it was paid for: the owner records the refund.
 */
export function nextStatuses(
  status: string,
  isOwner: boolean,
  fulfilment: "delivery" | "collection",
  refundDue = false
): string[] {
  const moves = (() => {
    switch (status) {
      case "awaiting_payment":
        return ["cancelled"]
      case "paid":
        return [
          fulfilment === "delivery" ? "packed" : "ready_for_collection",
          "cancelled",
          "refunded",
        ]
      case "packed":
        return ["shipped", "cancelled", "refunded"]
      case "shipped":
        return ["delivered", "refunded"]
      case "ready_for_collection":
        return ["collected", "cancelled", "refunded"]
      case "delivered":
      case "collected":
        return ["refunded"]
      case "cancelled":
        return refundDue ? ["refunded"] : []
      default:
        return []
    }
  })()
  return isOwner ? moves : moves.filter((move) => move !== "refunded")
}
