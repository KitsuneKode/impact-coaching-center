/**
 * The library page's content, and the questions it is waiting on.
 *
 * Spec §5 lists `/library` as a launch route carrying "plans, facilities,
 * rules, timings, and application". Of those, only some facilities are known:
 * spec line 704 lists "Library plans, capacity language, facilities, timings,
 * rules, review owner, and follow-up promise" among the things still to be
 * obtained from ICT.
 *
 * So this page states what is already published elsewhere on the site and
 * nothing more. `approved` stays false until ICT answers `libraryQuestions`,
 * which keeps the route noindex, out of the sitemap, and visibly marked as a
 * draft. Do not add a plan, a price, a capacity or an opening hour here before
 * that answer arrives - add them in the same commit that flips the flag.
 */
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

/**
 * What ICT has to answer before this page can be published.
 *
 * Kept next to the content so the page and its open questions cannot drift
 * apart. Surfaced in `toConfirm`, the owner sign-off checklist.
 */
export const libraryQuestions: readonly string[] = [
  "Is library access included with enrolment, or is there a separate plan? If separate, what does it cost and for how long?",
  "Opening hours, and whether they differ on Sundays or exam days",
  "How many seats there are, and whether a seat can be reserved or is first-come",
  "Facilities beyond WiFi and study material: lockers, drinking water, power sockets, printing, a discussion room",
  "The rules a student is expected to follow, and what loses someone access",
  "Whether a non-enrolled student can use the library at all, and on what terms",
  "Who at ICT reviews library applications, and how quickly someone hears back",
]
