// Relative, not aliased: this module is imported from convex/, whose
// tsconfig does not carry the "@/" path alias.
import { timings, tracks } from "./brand"

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

/**
 * Indian mobile numbers start 6-9 and are ten digits, optionally written with
 * a +91 or 91 country code, or a trunk 0.
 *
 * The whole input must match. An earlier version stripped non-digits and took
 * the last ten, which silently turned "9876543210 ext 123" into
 * +916543210123 - a real but entirely different number - and turned foreign
 * numbers into Indian ones. This string is the natural key for a Person and
 * the destination of a verification code, so accepting a number nobody typed
 * means messaging a stranger.
 */
const MOBILE = /^(?:\+?91)?0?([6-9]\d{9})$/

export function toE164(input: string): E164 | null {
  // Only separators people actually type are forgiven; anything else, letters
  // included, must fail rather than be quietly discarded.
  const cleaned = input.replace(/[\s()\-.]/g, "")
  const match = MOBILE.exec(cleaned)
  return match ? (`+91${match[1]}` as E164) : null
}

export function parseLead(input: Record<string, string>): ParseResult {
  const name = (input.name ?? "").trim()
  // Trimmed like the name: a pasted value with a trailing space otherwise
  // fails with "Please pick a course" after the user did pick one.
  const course = (input.course ?? "").trim()
  const timing = (input.timing ?? "").trim()
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

  // `!phone` is not redundant with the error check: it is what narrows
  // E164 | null to E164 for the return below.
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
