"use server"

import { headers } from "next/headers"

import { HONEYPOT_FIELD, type LeadField, parseLead } from "@/lib/leads"
import { createLeadSink } from "@/lib/lead-delivery"

export type { LeadField }

export type LeadState =
  | { status: "idle" }
  | {
      status: "error"
      errors: Partial<Record<LeadField, string>>
      values: Partial<Record<LeadField, string>>
    }
  | {
      status: "ok" | "handoff"
      name: string
      phone: string
      course: string
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
    course: String(formData.get("course") ?? ""),
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
    course: parsed.lead.course,
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

  // The first entry is the visitor; later ones are proxies we added. Only the
  // hop nearest the client is meaningful, and it is forwarded to Convex, which
  // otherwise only ever sees this server as the caller.
  const forwarded = (await headers()).get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || undefined

  try {
    await createLeadSink(process.env, fetch, ip).submit(parsed.lead)
  } catch {
    // Do not log provider exceptions: they can contain URLs and personal data.
    console.error("[lead] delivery was not confirmed")
    return { ...success, status: "handoff" }
  }

  return success
}
