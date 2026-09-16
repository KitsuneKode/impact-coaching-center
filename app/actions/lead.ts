"use server"

import { timings, tracks } from "@/lib/brand"

export type LeadField = "name" | "phone" | "course" | "timing"

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

const courseOptions = [...tracks.map((t) => t.exam), "Not sure yet"] as string[]
const timingOptions = [...timings] as string[]

/**
 * Records an enquiry before the visitor is handed to WhatsApp.
 *
 * Without this, an abandoned WhatsApp handoff is a lost lead and nobody can
 * tell which course drives enquiries. Delivery goes to LEAD_WEBHOOK_URL when
 * it is set: a Google Apps Script bound to a Sheet, Zapier, Make, a Slack or
 * Discord webhook, anything that accepts JSON. Without it, the lead is logged
 * on the server so development works with no setup.
 */
export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    course: String(formData.get("course") ?? ""),
    timing: String(formData.get("timing") ?? ""),
  }

  // Honeypot: real people never see this field. Bots fill it. Pretend success.
  if (String(formData.get("company") ?? "").length > 0) {
    return { status: "ok", ...values }
  }

  const digits = values.phone.replace(/\D/g, "").slice(-10)
  const errors: Partial<Record<LeadField, string>> = {}

  if (values.name.length < 2 || values.name.length > 80) {
    errors.name = "Please enter your name."
  }
  if (!/^[6-9]\d{9}$/.test(digits)) {
    errors.phone = "Please enter a 10 digit mobile number."
  }
  if (!courseOptions.includes(values.course)) {
    errors.course = "Please pick a course."
  }
  if (!timingOptions.includes(values.timing)) {
    errors.timing = "Please pick a time of day."
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values }
  }

  const lead = {
    name: values.name,
    phone: `+91${digits}`,
    course: values.course,
    timing: values.timing,
    source: "website",
    receivedAt: new Date().toISOString(),
  }

  const webhook = process.env.LEAD_WEBHOOK_URL
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) {
        console.error("[lead] webhook responded", response.status)
      }
    } catch (error) {
      // The visitor still gets the WhatsApp handoff, so the lead is not lost.
      console.error("[lead] webhook failed", error)
    }
  } else {
    console.info("[lead]", lead)
  }

  return {
    status: "ok",
    name: lead.name,
    phone: lead.phone,
    course: lead.course,
    timing: lead.timing,
  }
}
