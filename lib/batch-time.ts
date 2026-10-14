/**
 * Batch timings as ICT writes them on posters and in the admin ("12 to 2 PM",
 * "4 to 5:30 PM", "11 AM to 1 PM"), read into hours of the day so a timeline
 * can place them. Anything it cannot read is left off the timeline, never
 * guessed.
 */

export type Span = { start: number; end: number }

const RANGE =
  /(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*(?:to|-|–|—)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)/i

function hour(h: number, m: number, meridiem: string) {
  const base = h % 12
  return base + (meridiem.toLowerCase() === "pm" ? 12 : 0) + m / 60
}

/** "4 to 5:30 PM" → { start: 16, end: 17.5 }; null when it is not a time range. */
export function parseTiming(text: string | undefined | null): Span | null {
  const match = text?.match(RANGE)
  if (!match) return null
  const [, h1, m1, mer1, h2, m2, mer2] = match
  const end = hour(Number(h2), Number(m2 ?? 0), mer2!)
  let start = hour(Number(h1), Number(m1 ?? 0), mer1 ?? mer2!)
  // "11 to 1 PM" means 11 AM: a start written without AM/PM that would land
  // after the end belongs to the morning.
  if (!mer1 && start >= end) start -= 12
  if (start < 0 || end > 24 || start >= end) return null
  return { start, end }
}

export const PARTS = ["morning", "noon", "afternoon", "evening"] as const
export type Part = (typeof PARTS)[number]

/** Which part of the day a batch belongs to, by when it starts. */
export function partOf(start: number): Part {
  if (start < 11) return "morning"
  if (start < 14) return "noon"
  if (start < 17.5) return "afternoon"
  return "evening"
}
