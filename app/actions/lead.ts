"use server"

import {
  type Lead,
  type LeadField,
  type LeadSink,
  parseLead,
} from "@/lib/leads"

export type { LeadField }

export type LeadState =
  | { status: "idle" }
  | {
      status: "error"
      errors: Partial<Record<LeadField, string>>
      values: Partial<Record<LeadField, string>>
    }
  | {
      status: "ok"
      name: string
      phone: string
      course: string
      timing: string
    }

/**
 * Delivery to LEAD_WEBHOOK_URL: a Google Apps Script bound to a Sheet,
 * Zapier, Make, a Slack or Discord webhook, anything that accepts JSON.
 * Without it, the lead is logged on the server so development works with no
 * setup. Convex becomes the second adapter behind this same interface.
 */
const webhookSink: LeadSink = {
  async submit(lead: Lead) {
    const webhook = process.env.LEAD_WEBHOOK_URL
    const payload = { ...lead, receivedAt: new Date().toISOString() }

    if (!webhook) {
      console.info("[lead]", payload)
      return
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      throw new Error(`Lead webhook responded ${response.status}`)
    }
  },
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

  // Honeypot: real people never see this field. Bots fill it. Pretend success,
  // returning nothing, so the response cannot be used to probe validation.
  if (String(formData.get("company") ?? "").length > 0) {
    return { status: "ok", name: "", phone: "", course: "", timing: "" }
  }

  const parsed = parseLead(submitted)
  if (!parsed.ok) {
    return { status: "error", errors: parsed.errors, values: submitted }
  }

  try {
    await webhookSink.submit(parsed.lead)
  } catch (error) {
    // The visitor still gets the WhatsApp handoff, so the enquiry is not lost
    // to them - but it is lost to us, which is why this is an error and not a
    // silent return. Convex replaces this path.
    console.error("[lead] delivery failed", error)
  }

  return {
    status: "ok",
    name: parsed.lead.name,
    phone: parsed.lead.phone,
    course: parsed.lead.course,
    timing: parsed.lead.timing,
  }
}
