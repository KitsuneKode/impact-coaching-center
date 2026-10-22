// Relative, not aliased: this module is imported from convex/, whose
// tsconfig does not carry the "@/" path alias.
import { timings, tracks } from "./brand"

/**
 * Parsing and validation for an enquiry, kept out of the server action so
 * every rule can be exercised without FormData, React or a request.
 */

/** A mobile number in E.164. The only phone shape allowed to leave this module. */
export type E164 = string & { readonly __e164: unique symbol }

/**
 * The enquiry options, declared once. The form renders these; the action
 * validates against these. Adding a Track adds an option in both places.
 */
export const enquiryTracks = [
  ...tracks.map((track) => track.exam),
  "Not sure yet",
] as const satisfies readonly string[]

export const enquiryTimings = [...timings] as const satisfies readonly string[]

export type LeadField = "name" | "phone" | "track" | "timing"
export type FieldErrors = Partial<Record<LeadField, string>>

export type Lead = {
  name: string
  phone: E164
  track: string
  timing: string
  source: string
}

export type ParseResult =
  | { ok: true; lead: Lead }
  | { ok: false; errors: FieldErrors }

/**
 * Indian mobile numbers start 6-9 and are ten digits, optionally written with
 * a +91 or 91 country code, or a trunk 0.
 */
const MOBILE = /^(?:\+?91)?0?([6-9]\d{9})$/

/**
 * Digits a mobile field is allowed to show: ten, national, nothing else.
 *
 * A pasted country code or trunk zero is unwrapped first. Anything past ten
 * digits is cut from the front, never the tail, so a long paste cannot become
 * a different real number. Letters never stay in the field. `toE164` still
 * decides whether the ten digits are a mobile; this only stops the box
 * growing past what an Indian mobile can be.
 */
export function nationalMobileDraft(input: string): string {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2)
  if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1)
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2)
  return digits.slice(0, 10)
}

export function toE164(input: string): E164 | null {
  // Only separators people actually type are forgiven; anything else, letters
  // included, must fail rather than be quietly discarded.
  const cleaned = input.replace(/[\s()\-.]/g, "")
  const match = MOBILE.exec(cleaned)
  return match ? (`+91${match[1]}` as E164) : null
}

/*
 * A few digits of a number have no index to answer them, so the inbox walks
 * the newest enquiries looking for them. Both bounds are stated in the inbox
 * so a miss is never mistaken for "nobody has this number".
 */
/** Fewer digits than this match too many phones to be a lookup. */
export const PHONE_FRAGMENT_MIN = 4
/** Enquiries a fragment search reads at most, newest first. */
export const FRAGMENT_SCAN_ROWS = 2000
/** Matches a fragment search returns at most, in one page. */
export const FRAGMENT_MATCHES_MAX = 50

/** The digits of a search that is part of a number, or null. */
export function phoneFragment(search: string): string | null {
  const trimmed = search.trim()
  if (!trimmed || /\p{L}/u.test(trimmed) || toE164(trimmed)) return null
  const digits = trimmed.replace(/\D/g, "")
  return digits.length >= PHONE_FRAGMENT_MIN ? digits : null
}

export function parseLead(input: Record<string, string>): ParseResult {
  const name = (input.name ?? "").trim()
  // Trimmed like the name: a pasted value with a trailing space otherwise
  // fails with "Please pick an exam." after the user did pick one.
  const track = (input.track ?? "").trim()
  const timing = (input.timing ?? "").trim()
  const phone = toE164(input.phone ?? "")

  const errors: FieldErrors = {}
  if (name.length < 2) {
    errors.name = "Enter your name, at least 2 characters."
  } else if (name.length > 80) {
    errors.name = "Name must be 80 characters or fewer."
  }
  if (!phone) {
    errors.phone = "Please enter a 10 digit mobile number."
  }
  if (!enquiryTracks.includes(track as (typeof enquiryTracks)[number])) {
    errors.track = "Please pick an exam."
  }
  if (!enquiryTimings.includes(timing as (typeof enquiryTimings)[number])) {
    errors.timing = "Please pick a time of day."
  }

  // `!phone` is not redundant with the error check: it is what narrows
  // E164 | null to E164 for the return below.
  if (!phone || Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    lead: { name, phone, track, timing, source: input.source || "website" },
  }
}

/** Where a parsed Lead goes. */
/** Where an enquiry came from: the page and the visit's first source. */
export type LeadSource = {
  page?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface LeadSink {
  submit(lead: Lead, source?: LeadSource): Promise<void>
}

/**
 * The enquiry form's honeypot field.
 *
 * Deliberately not a recognised autofill token: browsers and password managers
 * fill fields they can name, bots fill every input they find. An earlier
 * revision called it "company", which maps to the standard `organization`
 * token, so password managers tripped the trap for real visitors.
 *
 * It lives here rather than beside the action because a "use server" module
 * may only export async functions.
 */
export const HONEYPOT_FIELD = "enquiry-ref"
