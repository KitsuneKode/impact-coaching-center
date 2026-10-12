import { httpRouter } from "convex/server"

import { parseTrustedOrigins, requireEnv, secretsMatch } from "../lib/env"
import { authComponent, createAuth } from "./auth"
import { internal } from "./_generated/api"
import { httpAction } from "./_generated/server"
import { parseClientAddress } from "../lib/client-address"
import { parseLead } from "../lib/leads"
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
