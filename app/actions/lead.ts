"use server"

import { headers } from "next/headers"

import { parseClientAddress } from "@/lib/client-address"
import { HONEYPOT_FIELD, type LeadField, parseLead } from "@/lib/leads"
import { createLeadSink, LeadThrottled } from "@/lib/lead-delivery"

export type { LeadField }

export type LeadState =
  | { status: "idle" }
  | {
      status: "error"
      errors: Partial<Record<LeadField, string>>
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
 * Records an enquiry before the visitor is handed to WhatsApp.
 *
 * Without this, an abandoned WhatsApp handoff is a lost lead and nobody can
 * tell which course drives enquiries. Validation lives in lib/leads.ts so it
 * can be tested without FormData or a request; this function only maps
 * between the form and that module.
 */
export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const submitted = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    track: String(formData.get("track") ?? ""),
    timing: String(formData.get("timing") ?? ""),
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

  // Honeypot: real people never see this field, bots fill it. The reply is
  // byte-identical to a real submission - same validation errors, same success
  // payload - so a bot cannot detect the control by submitting twice and
  // diffing the responses. Only the delivery is skipped.
  //
  // The field is named so that no autofill heuristic recognises it (see
  // lead-form.tsx). An earlier revision called it "company", which maps to the
  // standard `organization` token, so password managers filled it for real
  // visitors; that false-positive is fixed at the field, not by weakening the
  // reply here.
  if (String(formData.get(HONEYPOT_FIELD) ?? "").length > 0) {
    return success
  }

  // Forwarded to Convex, which otherwise only ever sees this server as the
  // caller. Validated rather than trusted - see lib/client-address.ts for what
  // that does and does not guarantee.
  const ip =
    parseClientAddress((await headers()).get("x-forwarded-for")) ?? undefined

  try {
    await createLeadSink(process.env, fetch, ip).submit(parsed.lead)
  } catch (error) {
    // A ceiling is not a failure: ICT already has these details, and saying
    // "we could not confirm receipt" would both be untrue and push a throttled
    // sender onto an unmetered channel.
    if (error instanceof LeadThrottled)
      return { ...success, status: "throttled" }
    // Do not log provider exceptions: they can contain URLs and personal data.
    console.error("[lead] delivery was not confirmed")
    return { ...success, status: "handoff" }
  }

  return success
}
