/** The library page's content, and the questions it is waiting on. */
export type LibraryFact = { heading: string; body: string }

export const libraryApproved = false

export const libraryUpdated = "2026-09-20"

/**
 * Every claim below already appears on the site, sourced from ICT's own
 * storefront and FAQ. Nothing here is new.
 */
export const libraryFacts: readonly LibraryFact[] = [
  {
    heading: "A room to work in, not just a shelf",
    body: "ICT's stated intent is a culture of group study in the library, so that preparation is engaging and competitive from the start rather than something you do alone at home.",
  },
  {
    heading: "WiFi and study material",
    body: "The centre has a library and study space with WiFi, and study material available there.",
  },
  {
    heading: "Open to enrolled students",
    body: "The library is open to students enrolled at ICT. If you are not enrolled yet, ask when you enquire and ICT will tell you what is possible.",
  },
]

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
