/**
 * The prototypes this client preview serves, in the order the arrows step
 * through them. Every directory not listed stays in the repo but redirects
 * to the index (next.config.ts).
 */

/** Our shortlist: complete pages with promos, books, notes and the form. */
export const favourites = [
  "pulse-final",
  "apogee",
  "laureate",
  "charter",
  "vesper",
  "pulse",
  "gamusa",
  "notebook",
  "atlas",
  "akhor",
] as const

/** Also complete, just not on the shortlist. */
export const complete = [
  "alloy",
  "calibre",
  "clearcoat",
  "diorama",
  "livery",
  "meridian",
  "rollcall",
  "sovereign",
  "udoy",
] as const

/** First-round concepts: a landing page each, without the full site layer. */
export const concepts = [
  "timetable",
  "channel",
  "answer-sheet",
  "lamp",
  "sandhya",
  "tiles",
  "path",
  "stage",
  "mist",
  "season",
] as const

export const clientSet = [...favourites, ...complete, ...concepts] as const
