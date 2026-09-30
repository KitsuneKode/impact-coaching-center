"use server"

import type { LeadState } from "@/app/actions/lead"
import { parseLead } from "@/lib/leads"

const text = (data: FormData, key: string) => {
  const value = data.get(key)
  return typeof value === "string" ? value : ""
}

/** Same validation as the live form; the enquiry is never stored or sent. */
export async function previewLead(
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
  return { status: "ok", ...parsed.lead }
}
