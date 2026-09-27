"use server"

import { headers } from "next/headers"

import { parseClientAddress } from "@/lib/client-address"
import { serverEnv } from "@/lib/env.server"
import { HONEYPOT_FIELD, type LeadField, parseLead } from "@/lib/leads"
import { createLeadSink, LeadThrottled } from "@/lib/lead-delivery"
import { verifyTurnstile } from "@/lib/turnstile"

export type { LeadField }

export type LeadState =
  | { status: "idle" }
  | {
      status: "error"
      errors: Partial<Record<LeadField, string>>
      /** Failure not attributable to one field (e.g. Turnstile). */
      formError?: string
      values: Partial<Record<LeadField, string>>
    }
  | {
      status: "ok" | "handoff" | "throttled"
      name: string
      phone: string
      track: string
      timing: string
    }

/**
 * FormData values are `string | File`. A File stringifies to "[object File]",
 * thirteen characters, which passes the 2-80 length check on a name - so a
 * file part would have become a Person's name.
 */
const text = (data: FormData, key: string) => {
  const value = data.get(key)
  return typeof value === "string" ? value : ""
}

/** Records an enquiry before the visitor is handed to WhatsApp. */
export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const submitted = {
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    track: text(formData, "track"),
    timing: text(formData, "timing"),
  }

  const parsed = parseLead(submitted)
  if (!parsed.ok) {
    return { status: "error", errors: parsed.errors, values: submitted }
  }

  const success: LeadState = {
    status: "ok",
    name: parsed.lead.name,
    phone: parsed.lead.phone,
    track: parsed.lead.track,
    timing: parsed.lead.timing,
  }

  // Honeypot: real people never see this field, bots fill it.
  if (text(formData, HONEYPOT_FIELD).length > 0) {
    return success
  }

  // Forwarded to Convex, which otherwise only ever sees this server as the
  // caller. Validated rather than trusted - see lib/client-address.ts for what
  // that does and does not guarantee.
  const ip =
    parseClientAddress((await headers()).get("x-forwarded-for")) ?? undefined

  /* Turnstile gates the delivery path, not the validation errors above: a
     malformed form is answered locally without spending a siteverify call,
     and an unconfigured secret skips the check so development stays free of
     keys. In production the key is required - docs/production.md. */
  if (
    serverEnv.TURNSTILE_SECRET_KEY &&
    !(await verifyTurnstile(
      serverEnv.TURNSTILE_SECRET_KEY,
      text(formData, "cf-turnstile-response"),
      ip
    ))
  ) {
    return {
      status: "error",
      errors: {},
      formError: "Verification did not pass. Wait a moment and try again.",
      values: submitted,
    }
  }

  try {
    await createLeadSink(process.env, fetch, ip).submit(parsed.lead)
  } catch (error) {
    // A shared-IP ceiling may reject a first-time visitor. A limit response
    // does not establish receipt of this enquiry or any previous enquiry.
    if (error instanceof LeadThrottled)
      return { ...success, status: "throttled" }
    // Do not log provider exceptions: they can contain URLs and personal data.
    console.error("[lead] delivery was not confirmed")
    return { ...success, status: "handoff" }
  }

  return success
}
