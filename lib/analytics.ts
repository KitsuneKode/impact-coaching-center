import type { PostHog } from "posthog-js"

/**
 * The funnel events AGENTS.md centralizes behind a typed adapter, sent to
 * PostHog when NEXT_PUBLIC_POSTHOG_KEY is set (debug-logged in development
 * otherwise). The library loads only after the page is idle
 * (instrumentation-client.ts), never in the admin, and talks through this
 * site's own /relay-ph path (next.config rewrites), so blockers matching
 * posthog.com leave it alone and the CSP needs no new origin. Events sent
 * before it loads are queued, not dropped.
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
  | { name: "payment_started"; reference: string }
  | { name: "order_paid"; reference: string }
  | { name: "resource_opened"; slug: string }
  | { name: "reader_shared"; path: string; method: "share" | "copy" }
  | { name: "contact_tapped"; kind: "whatsapp" | "call"; page: string }
  | { name: "finder_completed"; exam: string; matched: boolean }
  | { name: "search_result_opened"; kind: string; query_length: number }
  | { name: "signed_in" }

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
let client: PostHog | null = null
let queue: AnalyticsEvent[] = []

/** Loads PostHog once; a no-op without a key, on the server, or in the admin. */
export function startAnalytics() {
  if (!key || client || typeof window === "undefined") return
  if (/^\/admin(\/|$)/.test(window.location.pathname)) return
  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: "/relay-ph",
      ui_host: "https://us.posthog.com",
      defaults: "2026-05-30",
      // A profile only for people who sign in; visitors stay anonymous.
      person_profiles: "identified_only",
      // No screen recordings: not needed, and a privacy cost.
      disable_session_recording: true,
      respect_dnt: true,
    })
    client = posthog
    for (const event of queue) send(event)
    queue = []
  })
}

function send({ name, ...props }: AnalyticsEvent) {
  client?.capture(name, props)
}

export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development")
    console.debug("[analytics]", event)
  if (!key) return
  if (client) send(event)
  else queue.push(event)
}

/** After sign-in: ties this browser's events to the Person's id, never a phone. */
export function identify(personId: string) {
  if (!key) return
  if (client) client.identify(personId)
  else
    void import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) posthog.identify(personId)
    })
}

/** On sign-out, so the next person on this device starts fresh. */
export function resetAnalytics() {
  client?.reset()
}
