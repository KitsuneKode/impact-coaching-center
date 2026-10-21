import { httpRouter } from "convex/server"

import { parseTrustedOrigins, requireEnv, secretsMatch } from "../lib/env"
import { authComponent, createAuth } from "./auth"
import { internal } from "./_generated/api"
import { httpAction } from "./_generated/server"
import { parseClientAddress } from "../lib/client-address"
import { parseLead } from "../lib/leads"
import { webhookSignatureValid } from "../lib/payments"
import { undeliverableFrom } from "../lib/whatsapp-status"
import { ENQUIRY_RATE_LIMITED } from "./persons"

const http = httpRouter()

/** A string field from an untrusted body, or nothing. */
const optionalString = (value: unknown) =>
  typeof value === "string" ? value : undefined

http.route({
  path: "/enquiries",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.LEAD_INGEST_SECRET
    const header = request.headers.get("authorization") ?? ""
    if (!secret || !secretsMatch(header, `Bearer ${secret}`))
      return new Response(null, { status: 401 })
    let input: unknown
    try {
      const body = await request.text()
      if (body.length > 8192) return new Response(null, { status: 413 })
      input = JSON.parse(body)
    } catch {
      return new Response(null, { status: 400 })
    }
    if (!input || typeof input !== "object")
      return new Response(null, { status: 400 })
    const data = input as Record<string, unknown>
    if (
      ![data.name, data.phone, data.track, data.timing].every(
        (value) => typeof value === "string"
      )
    )
      return new Response(null, { status: 400 })
    if (!parseLead(data as Record<string, string>).ok)
      return new Response(null, { status: 400 })
    try {
      await ctx.runMutation(internal.persons.recordEnquiry, {
        name: data.name as string,
        phone: data.phone as string,
        track: data.track as string,
        timing: data.timing as string,
        // Re-validated here: holding the ingestion secret does not make a
        // forwarded address well formed, and a junk value would mint its own
        // counter row.
        ip:
          (typeof data.ip === "string" ? parseClientAddress(data.ip) : null) ??
          undefined,
        page: optionalString(data.page),
        utmSource: optionalString(data.utmSource),
        utmMedium: optionalString(data.utmMedium),
        utmCampaign: optionalString(data.utmCampaign),
        referrer: optionalString(data.referrer),
      })
    } catch (error) {
      // A ceiling is the one failure the caller can act on by backing off.
      // Everything else stays a 500 rather than describing our internals.
      if (
        error instanceof Error &&
        error.message.includes(ENQUIRY_RATE_LIMITED)
      )
        return new Response(null, { status: 429 })
      throw error
    }
    return new Response(null, { status: 204 })
  }),
})

/**
 * Razorpay's word that money arrived, for when the shopper's browser never
 * came back. Verified over the raw body with the webhook secret (not the key
 * secret), recorded once per event id, then settled like a checkout.
 * Acknowledged with 200 even when there is nothing to do, so Razorpay stops
 * retrying; only a bad signature is refused.
 */
/*
 * Meta's WhatsApp webhook. GET answers the subscription check with the verify
 * token; POST carries message statuses, signed with the app secret. A code
 * that failed because the number is not on WhatsApp marks that number, so
 * the next sign-in attempt is refused with the reason instead of a silent
 * wait (Meta does not bill undelivered messages).
 */
http.route({
  path: "/whatsapp/webhook",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const token = process.env.WHATSAPP_VERIFY_TOKEN
    const url = new URL(request.url)
    if (
      !token ||
      url.searchParams.get("hub.mode") !== "subscribe" ||
      !secretsMatch(url.searchParams.get("hub.verify_token") ?? "", token)
    )
      return new Response(null, { status: 403 })
    return new Response(url.searchParams.get("hub.challenge") ?? "", {
      status: 200,
    })
  }),
})

http.route({
  path: "/whatsapp/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.WHATSAPP_APP_SECRET
    if (!secret) return new Response(null, { status: 503 })
    const body = await request.text()
    if (body.length > 256 * 1024) return new Response(null, { status: 413 })
    const signature = (
      request.headers.get("x-hub-signature-256") ?? ""
    ).replace(/^sha256=/, "")
    if (!(await webhookSignatureValid({ body, signature, secret })))
      return new Response(null, { status: 401 })
    let payload: unknown
    try {
      payload = JSON.parse(body)
    } catch {
      return new Response(null, { status: 400 })
    }
    for (const { phones, code } of undeliverableFrom(payload))
      await ctx.runMutation(internal.otp.markUndeliverable, { phones, code })
    return new Response(null, { status: 200 })
  }),
})

http.route({
  path: "/razorpay/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) return new Response(null, { status: 503 })
    const body = await request.text()
    if (body.length > 64 * 1024) return new Response(null, { status: 413 })
    const signature = request.headers.get("x-razorpay-signature") ?? ""
    if (!(await webhookSignatureValid({ body, signature, secret })))
      return new Response(null, { status: 401 })
    const eventId = request.headers.get("x-razorpay-event-id")
    let event: RazorpayEvent
    try {
      event = JSON.parse(body) as RazorpayEvent
    } catch {
      return new Response(null, { status: 400 })
    }
    if (!eventId || typeof event.event !== "string")
      return new Response(null, { status: 400 })
    const payment = event.payload?.payment?.entity
    const text = (value: unknown) =>
      typeof value === "string" && value.length <= 100 ? value : undefined
    // Recorded and settled in one transaction: if settling fails, the event
    // is not marked seen, the route answers 500 and Razorpay retries it.
    await ctx.runMutation(internal.payments.handleWebhook, {
      eventId: eventId.slice(0, 100),
      type: event.event.slice(0, 60),
      gatewayOrderId:
        text(event.payload?.order?.entity?.id) ?? text(payment?.order_id),
      paymentId: text(payment?.id),
      method: text(payment?.method),
      amountPaise:
        typeof payment?.amount === "number" &&
        Number.isSafeInteger(payment.amount)
          ? payment.amount
          : undefined,
    })
    return new Response(null, { status: 200 })
  }),
})

/** The few fields of a Razorpay webhook body this route reads. */
type RazorpayEvent = {
  event?: unknown
  payload?: {
    order?: { entity?: { id?: unknown } }
    payment?: {
      entity?: {
        id?: unknown
        order_id?: unknown
        amount?: unknown
        method?: unknown
      }
    }
  }
}

/**
 * Lazy registration: Better Auth is not constructed while routes are being
 * registered, which keeps deployment memory down.
 */
authComponent.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
  cors: true,
  // Anchors CORS and CSRF trust, so a missing value must not become
  // [undefined]. Comma-separated, because one Convex deployment serves both
  // local development and a preview URL. Every origin here must be one we
  // actually control.
  trustedOrigins: parseTrustedOrigins(
    requireEnv("SITE_URL", process.env.SITE_URL)
  ),
})

export default http
