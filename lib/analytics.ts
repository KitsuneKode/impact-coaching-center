import { ROUTE_TARGETS, type PromotionContent } from "./promotions"

type PromotionProperties = {
  promotion_id: string
  revision: number
  placement: PromotionContent["placement"]
  route: string
}

export type AnalyticsEvent =
  | {
      name: "promotion_viewed" | "promotion_clicked" | "promotion_dismissed"
      properties: PromotionProperties
    }
  | {
      name: "lead_submitted"
      properties: { source: "website" | "promotion"; promotion_id?: string }
    }
  | {
      name: "whatsapp_handoff"
      properties: {
        intent: "workshop" | "whatsapp-handoff"
        promotion_id?: string
      }
    }

export type AnalyticsTransport = (event: AnalyticsEvent) => void | Promise<void>

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Callers supply database IDs, never identifiers constructed from visitor data. */
function opaqueId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-zA-Z0-9_-]{1,64}$/.test(value) &&
    /[a-zA-Z]/.test(value)
  )
}

/**
 * Construct every outbound object explicitly. Unknown fields are discarded,
 * malformed required fields reject the event, and raw URLs are never supported.
 * Shape checks cannot prove an arbitrary string is free of personal information;
 * the caller must source promotion_id from a validated Promotion database record.
 */
export function parseAnalyticsEvent(input: unknown): AnalyticsEvent | null {
  if (!record(input) || !record(input.properties)) return null
  const props = input.properties
  const id = props.promotion_id
  if (id !== undefined && !opaqueId(id)) return null
  switch (input.name) {
    case "promotion_viewed":
    case "promotion_clicked":
    case "promotion_dismissed": {
      const revision = props.revision
      const placement = props.placement
      const route = props.route
      if (
        !opaqueId(id) ||
        typeof revision !== "number" ||
        !Number.isSafeInteger(revision) ||
        revision < 1 ||
        (placement !== "announcement" &&
          placement !== "inline" &&
          placement !== "dialog") ||
        typeof route !== "string" ||
        !ROUTE_TARGETS.includes(route)
      )
        return null
      return {
        name: input.name,
        properties: { promotion_id: id, revision, placement, route },
      }
    }
    case "lead_submitted": {
      const source = props.source
      if (source !== "website" && source !== "promotion") return null
      if (source === "promotion" && id === undefined) return null
      return {
        name: input.name,
        properties: {
          source,
          ...(id === undefined ? {} : { promotion_id: id }),
        },
      }
    }
    case "whatsapp_handoff": {
      const intent = props.intent
      if (intent !== "workshop" && intent !== "whatsapp-handoff") return null
      return {
        name: input.name,
        properties: {
          intent,
          ...(id === undefined ? {} : { promotion_id: id }),
        },
      }
    }
    default:
      return null
  }
}

/** No default transport, persistence or SDK initialization; consent is checked per call. */
export function createAnalytics(options: {
  isOptedIn: () => boolean
  transport?: AnalyticsTransport
}): { capture: (input: unknown) => Promise<boolean> } {
  return {
    async capture(input) {
      try {
        if (!options.transport || !options.isOptedIn()) return false
        const event = parseAnalyticsEvent(input)
        if (!event) return false
        await options.transport(event)
        return true
      } catch {
        // Analytics failure must not expose event payloads or interrupt conversion.
        return false
      }
    },
  }
}
