import { timings, tracks } from "@/lib/brand"

/**
 * Parsing and validation for an enquiry, kept out of the server action so
 * every rule can be exercised without FormData, React or a request.
 *
 * The rules used to live in three places at once: the option list was
 * duplicated verbatim in the form and the action, the phone regex was written
 * twice, and the honeypot returned a raw number while the real path returned
 * E.164 - a divergence that only survived because formatPhone re-normalised
 * on the way out.
 */

/** A mobile number in E.164. The only phone shape allowed to leave this module. */
export type E164 = string & { readonly __e164: unique symbol }

/**
 * The enquiry options, declared once. The form renders these; the action
 * validates against these. Adding a Track adds an option in both places.
 */
export const enquiryCourses = [
  ...tracks.map((track) => track.exam),
  "Not sure yet",
] as const satisfies readonly string[]

export const enquiryTimings = [...timings] as const satisfies readonly string[]

export type LeadField = "name" | "phone" | "course" | "timing"
export type FieldErrors = Partial<Record<LeadField, string>>

export type Lead = {
  name: string
  phone: E164
  course: string
  timing: string
  source: string
}

export type ParseResult =
  | { ok: true; lead: Lead }
  | { ok: false; errors: FieldErrors }

/** Indian mobile numbers start 6-9 and are ten digits. */
const MOBILE = /^[6-9]\d{9}$/

function toE164(input: string): E164 | null {
  const digits = input.replace(/\D/g, "").slice(-10)
  return MOBILE.test(digits) ? (`+91${digits}` as E164) : null
}

export function parseLead(input: Record<string, string>): ParseResult {
  const name = (input.name ?? "").trim()
  const course = input.course ?? ""
  const timing = input.timing ?? ""
  const phone = toE164(input.phone ?? "")

  const errors: FieldErrors = {}
  if (name.length < 2 || name.length > 80) {
    errors.name = "Please enter your name."
  }
  if (!phone) {
    errors.phone = "Please enter a 10 digit mobile number."
  }
  if (!enquiryCourses.includes(course as (typeof enquiryCourses)[number])) {
    errors.course = "Please pick a course."
  }
  if (!enquiryTimings.includes(timing as (typeof enquiryTimings)[number])) {
    errors.timing = "Please pick a time of day."
  }

  if (!phone || Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    lead: { name, phone, course, timing, source: input.source || "website" },
  }
}

/**
 * Where a parsed Lead goes.
 *
 * Two adapters make this a real seam rather than a hypothetical one: the
 * webhook today, Convex next.
 */
export interface LeadSink {
  submit(lead: Lead): Promise<void>
}
