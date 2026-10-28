/** The library page's content, and the questions it is waiting on. */
export type LibraryFact = { heading: string; body: string }

export const libraryApproved = false

export const libraryUpdated = "2026-09-20"

/** How much of the day a seat is held: one shift, or the whole day. */
export const LIBRARY_SHIFTS = ["half", "full"] as const
export type LibraryShift = (typeof LIBRARY_SHIFTS)[number]

/** One length of membership, paid once up front, at a rate per month. Rupees. */
export type LibraryTerm = {
  months: 1 | 3 | 6
  perMonth: Record<LibraryShift, number>
  /** ICT's own "Best value" mark. */
  bestValue?: boolean
}

/**
 * PROVISIONAL: copied from ICT's "Study Library Membership Packages" poster
 * (Morning, Evening, Full Day; shared 28 Oct 2026) as stand-in prices until
 * ICT confirms them for the site. Half day is the morning or the evening
 * shift. Longer terms are one payment for the whole term. Paid at the
 * centre; there is no online payment for the library.
 */
export const libraryPricesProvisional = true

export const libraryTerms: readonly LibraryTerm[] = [
  { months: 1, perMonth: { half: 1000, full: 1500 } },
  { months: 3, perMonth: { half: 800, full: 1200 } },
  { months: 6, perMonth: { half: 600, full: 1000 }, bestValue: true },
]

/** A term's one payment, and what it saves against paying month by month. */
export function termPrice(term: LibraryTerm, shift: LibraryShift) {
  const monthly = libraryTerms.find((t) => t.months === 1)!.perMonth[shift]
  const total = term.perMonth[shift] * term.months
  return { total, saves: monthly * term.months - total }
}

/** Opening hours as ICT words them, e.g. "7 AM to 9 PM, every day"; null until confirmed. */
export const libraryHours: string | null = null

/** What ICT has to answer before this page can be published. */
export const libraryQuestions: readonly string[] = [
  "Confirm the poster's prices for the site (half day ₹1,000, full day ₹1,500 a month; 3 months ₹2,400 / ₹3,600; 6 months ₹3,600 / ₹6,000), and whether enrolled students pay the same",
  "The morning and evening shift hours, full-day hours, and whether they differ on Sundays or exam days",
  "How many seats there are, and whether a seat can be reserved or is first-come",
  "Facilities beyond WiFi and study material: lockers, drinking water, power sockets, printing, a discussion room",
  "The rules a student is expected to follow, and what loses someone access",
  "Whether a non-enrolled student can use the library at all, and on what terms",
  "Who at ICT reviews library applications, and how quickly someone hears back",
]
