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

/** What a staff member may move this order to next. */
export function nextStatuses(status: string, isOwner: boolean): string[] {
  const moves = (() => {
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
  })()
  return isOwner ? moves : moves.filter((move) => move !== "refunded")
}
