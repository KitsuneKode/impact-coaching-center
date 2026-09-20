import type { LeadSink } from "./leads"

/** Delivery selection stays server-side. Never fall back after an ambiguous timeout. */
export function createLeadSink(
  env: Record<string, string | undefined>,
  fetcher: typeof fetch = fetch,
  /** Forwarded so Convex can rate-limit the visitor, not our own server. */
  ip?: string
): LeadSink {
  return {
    async submit(lead) {
      const secret = env.LEAD_INGEST_SECRET
      const site = env.NEXT_PUBLIC_CONVEX_SITE_URL
      const convexConfigured = Boolean(secret)
      // A secret without a site URL is a half-configured deployment: fail
      // rather than quietly falling back to the legacy webhook, which would
      // send enquiries somewhere the operator thinks they have moved off.
      if (convexConfigured && !site)
        throw new Error("Incomplete enquiry persistence configuration.")
      const target = convexConfigured
        ? new URL("/enquiries", site).href
        : env.LEAD_WEBHOOK_URL
      if (!target) throw new Error("Enquiry delivery is unavailable.")
      const response = await fetcher(target, {
        method: "POST",
        redirect: "error",
        headers: {
          "content-type": "application/json",
          ...(convexConfigured ? { authorization: `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify(
          convexConfigured
            ? {
                name: lead.name,
                phone: lead.phone,
                course: lead.course,
                timing: lead.timing,
                ...(ip ? { ip } : {}),
              }
            : { ...lead, receivedAt: new Date().toISOString() }
        ),
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok)
        throw new Error("Enquiry delivery was not acknowledged.")
    },
  }
}
