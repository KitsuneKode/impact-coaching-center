/**
 * The funnel events AGENTS.md centralizes behind a typed adapter. No provider
 * is provisioned yet (KIT-69 tracks the decision), so events debug-log in
 * development and are otherwise dropped - the point of landing the adapter
 * first is that every callsite already calls `track`, and wiring a real
 * destination later is one forward inside this file, not a sweep through
 * components.
 *
 * Events never carry names, phones, addresses, or free text - the rule in
 * AGENTS.md is that analytics sees funnel shape, not personal data.
 */
export type AnalyticsEvent =
  | { name: "cta_click"; target: string }
  | { name: "enquiry_submitted"; track: string }
  | { name: "add_to_cart"; slug: string }
  | { name: "checkout_started"; lines: number }
  | { name: "order_placed"; fulfilment: "delivery" | "collection" }
  | { name: "resource_opened"; slug: string }

export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development")
    console.debug("[analytics]", event)
}
