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
 *
 * `refunded` is offered only to an owner. Asserting money moved back is the
 * same claim as `paid` in reverse, so the server gates it to the owner and
 * this list hides it from everyone else - a staff member who is not offered
 * a refund cannot produce one.
 */
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
