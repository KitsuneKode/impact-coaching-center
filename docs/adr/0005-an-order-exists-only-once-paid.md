# An order exists only once it is paid

Pressing Pay freezes the cart into a **checkout** (`checkouts` table): the
lines at their prices, the delivery choice and address, and the Razorpay order
it opened. Nobody but the buyer sees a checkout. An **order** is written only
when Razorpay reports the money captured, by whichever of the browser's
confirmation or the webhook arrives first (`settleCheckout` is idempotent on
the Razorpay order id).

Before this, an order was created at "Place order" with status
`awaiting_payment`, and a daily job expired the unpaid ones. Staff saw orders
nobody had paid for, counts and badges included them, and an abandoned
attempt held a receipt number's place in the queue.

## Consequences

**Every order has a payment, a receipt number and a receipt token.** The
schema makes them required, so no screen has to handle "not paid yet".

**The order's statuses start at `paid`.** `awaiting_payment` and `packed` are
gone; each move is appended to `history` with who made it, so the buyer's
timeline and the admin's "what happened" read the same record.

**A replaced attempt still settles.** If money arrives for a checkout the buyer
has since replaced (they changed the cart and paid again), it still becomes an
order: keeping money without an order is the one wrong answer. The owner sees
both and refunds one.

**Abandoned checkouts are swept after 30 days** by the cleanup cron; they hold
an address, so account deletion clears them too.

**Old deployments need a migration.** `internal.migrations.ordersToV2` turns
unpaid legacy orders into checkouts and fills the new fields on paid ones.
Production never had legacy orders; dev deployments do. Steps are in
`docs/production.md`.
