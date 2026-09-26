/**
 * Checkout constants shared by the UI and convex/checkout.ts.
 *
 * DELIVERY_CHARGE_PAISE is PROVISIONAL: the shipping policy's delivery
 * charge is an unfilled {{fill:}} until ICT supplies the real one, so every
 * rendered total is demo pricing, labelled at the point of collection.
 */
export const DELIVERY_CHARGE_PAISE = 60_00

export const FULFILMENT_LABELS = {
  delivery: "Delivered to me",
  collection: "I'll collect it",
} as const
