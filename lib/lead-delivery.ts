import type { LeadSink } from "./leads"

/**
 * The destination refused this enquiry for volume, not because delivery broke.
 * Distinguished to explain the temporary limit without inferring whether ICT
 * has received any previous enquiry from this visitor.
 */
export class LeadThrottled extends Error {
  constructor() {
    super("Enquiry ceiling reached.")
    this.name = "LeadThrottled"
  }
}

/** Delivery stays server-side, and it has one destination. */
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
      if (!secret || !site) throw new Error("Enquiry delivery is unavailable.")
      const response = await fetcher(new URL("/enquiries", site).href, {
        method: "POST",
        redirect: "error",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          track: lead.track,
          timing: lead.timing,
          ...(ip ? { ip } : {}),
        }),
        signal: AbortSignal.timeout(5000),
      })
      if (response.status === 429) throw new LeadThrottled()
      if (!response.ok)
        throw new Error("Enquiry delivery was not acknowledged.")
    },
  }
}
