import { formatPaise } from "./money"

/**
 * Order messages on WhatsApp (ADR-0005). Each is a Meta "utility" template,
 * approved under the name below, whose body takes these values in order.
 * Plain wording, no offers: a template Meta reads as marketing is billed
 * as marketing and puts the number's quality rating at risk.
 */
export const ORDER_TEMPLATES = {
  /** To the buyer. "Payment received for order {{1}}: {{2}}. Receipt: {{3}}" */
  order_paid: { name: "ict_order_paid", params: 3 },
  /** "Order {{1}} has shipped with {{2}}, tracking number {{3}}. Track it: {{4}}" */
  order_shipped: { name: "ict_order_shipped", params: 4 },
  /** "Order {{1}} is ready to collect at {{2}}. Bring this message." */
  order_ready: { name: "ict_order_ready", params: 2 },
  /** To ICT's desk phone. "New paid order {{1}}: {{2}}. Open it: {{3}}" */
  desk_new_order: { name: "ict_desk_new_order", params: 3 },
} as const

export type OrderTemplate = keyof typeof ORDER_TEMPLATES

/** The public site, for links in messages: the first SITE_URL origin. */
export function publicOrigin(siteUrl: string | undefined) {
  return siteUrl?.split(",")[0]?.trim().replace(/\/$/, "") || null
}

/** "2 sets · ₹1,200 · delivery" */
export function orderSummary(order: {
  lines: { quantity: number }[]
  totalPaise: number
  fulfilment: "delivery" | "collection"
}) {
  const sets = order.lines.reduce((n, line) => n + line.quantity, 0)
  return `${sets} ${sets === 1 ? "set" : "sets"} · ${formatPaise(order.totalPaise)} · ${order.fulfilment === "delivery" ? "delivery" : "collection"}`
}

/** The Cloud API request for one template message. */
export function whatsappTemplateRequest(
  config: { token: string; phoneNumberId: string },
  message: { to: string; template: string; language: string; params: string[] }
) {
  return {
    url: `https://graph.facebook.com/v25.0/${config.phoneNumberId}/messages`,
    init: {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: message.template,
          language: { code: message.language },
          components: [
            {
              type: "body",
              parameters: message.params.map((text) => ({
                type: "text",
                // Meta refuses newlines, tabs and long runs of spaces here.
                text: text.replace(/\s+/g, " ").slice(0, 1000),
              })),
            },
          ],
        },
      }),
    },
  }
}
