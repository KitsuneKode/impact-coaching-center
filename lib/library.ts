/** The library page's content, and the questions it is waiting on. */
export type LibraryFact = { heading: string; body: string }

export const libraryApproved = false

export const libraryUpdated = "2026-09-20"

/** A way to use the library, as ICT prices it. Prices in rupees. */
export type LibraryPlan = {
  name: string
  /** "per month", "for 3 months" */
  period: string
  price: number
  includes: readonly string[]
}

/**
 * ICT's plans, once ICT confirms them (see `libraryQuestions`). Empty means
 * the page says to ask for the fee rather than guessing one.
 */
export const libraryPlans: readonly LibraryPlan[] = []

/** Opening hours as ICT words them, e.g. "7 AM to 9 PM, every day"; null until confirmed. */
export const libraryHours: string | null = null

/** What ICT has to answer before this page can be published. */
export const libraryQuestions: readonly string[] = [
  "Is library access included with enrolment, or is there a separate plan? If separate, what does it cost and for how long?",
  "Opening hours, and whether they differ on Sundays or exam days",
  "How many seats there are, and whether a seat can be reserved or is first-come",
  "Facilities beyond WiFi and study material: lockers, drinking water, power sockets, printing, a discussion room",
  "The rules a student is expected to follow, and what loses someone access",
  "Whether a non-enrolled student can use the library at all, and on what terms",
  "Who at ICT reviews library applications, and how quickly someone hears back",
]
