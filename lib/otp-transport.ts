import { isDevelopmentDeployment } from "./dev-deployment"

/** How a verification code reaches a Person. */
export type TransportName = "logger" | "whatsapp"

/** Which transport may run, read from OTP_TRANSPORT on the deployment. */
export function chooseTransport(
  configured: string | undefined,
  convexSiteUrl?: string
): TransportName {
  if (configured === "logger") {
    // CONVEX_SITE_URL is set by Convex, not the operator: a hosted deployment
    // qualifies only when its own origin is the dev deployment's (see
    // lib/dev-deployment.ts).
    if (!isDevelopmentDeployment(convexSiteUrl)) {
      throw new Error(
        "The logger OTP transport requires a local HTTP CONVEX_SITE_URL, or the development deployment named in lib/dev-deployment.ts."
      )
    }
    return "logger"
  }
  if (configured === "whatsapp") {
    // Fail at construction, before any code is stored, if it cannot send.
    whatsappConfig()
    return "whatsapp"
  }
  throw new Error(
    `OTP_TRANSPORT must be set to "logger" or "whatsapp" on this deployment. Refusing to construct an auth instance without an explicit transport.`
  )
}

/** The Graph API version the request is written against (Meta's docs, 2026). */
const GRAPH_VERSION = "v25.0"

/**
 * WhatsApp Cloud API settings, from the Convex deployment's env:
 * WHATSAPP_ACCESS_TOKEN (a system-user token), WHATSAPP_PHONE_NUMBER_ID,
 * and the approved copy-code authentication template's name and language
 * (WHATSAPP_OTP_TEMPLATE, WHATSAPP_OTP_LANGUAGE; default "verification_code"
 * and "en"). See docs/production.md.
 */
export function whatsappConfig(
  env: Record<string, string | undefined> = process.env
) {
  const token = env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId)
    throw new Error(
      "The WhatsApp OTP transport needs WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID on this deployment."
    )
  return {
    token,
    phoneNumberId,
    template: env.WHATSAPP_OTP_TEMPLATE || "verification_code",
    language: env.WHATSAPP_OTP_LANGUAGE || "en",
  }
}

/** The send request for a copy-code authentication template: the code goes in twice. */
export function whatsappOtpRequest(
  config: ReturnType<typeof whatsappConfig>,
  target: { phoneNumber: string; code: string }
) {
  return {
    url: `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`,
    init: {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        // Graph wants digits only, country code first.
        to: target.phoneNumber.replace(/\D/g, ""),
        type: "template",
        template: {
          name: config.template,
          language: { code: config.language },
          components: [
            { type: "body", parameters: [{ type: "text", text: target.code }] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: target.code }],
            },
          ],
        },
      }),
    },
  }
}

/** Deliver a code over the already-resolved transport. */
export async function sendOtp(
  transport: TransportName,
  target: { phoneNumber: string; code: string },
  send: typeof fetch = fetch
): Promise<void> {
  if (transport === "whatsapp") {
    const { url, init } = whatsappOtpRequest(whatsappConfig(), target)
    const response = await send(url, init)
    if (!response.ok) {
      // Meta's error code and type only: never the token, never the code.
      let detail = `${response.status}`
      try {
        const body = (await response.json()) as {
          error?: { code?: number; type?: string; error_subcode?: number }
        }
        if (body.error)
          detail = `${response.status} ${body.error.type ?? ""} ${body.error.code ?? ""}/${body.error.error_subcode ?? ""}`
      } catch {
        /* the status is enough */
      }
      throw new Error(
        `WhatsApp did not accept the code message (${detail.trim()}).`
      )
    }
    return
  }

  console.log(`[otp] ${target.phoneNumber}: ${target.code}`)
}
