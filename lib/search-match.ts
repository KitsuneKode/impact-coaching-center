/**
 * How well a search box entry matches what was typed, 0 to 1. Every word
 * typed must appear somewhere (title or keywords); a title that starts with
 * the query ranks first, then a word that does, then the phrase anywhere,
 * then keyword-only matches. Never letter-scatter matching: "apsc" must not
 * find "Assam Police SI & Govt. Exams".
 */
export function searchScore(
  title: string,
  search: string,
  keywords: readonly string[] = []
): number {
  const query = normalise(search)
  if (!query) return 1
  const name = normalise(title)
  const extra = normalise(keywords.join(" "))
  const words = query.split(" ")
  const everywhere = `${name} ${extra}`
  if (!words.every((word) => everywhere.includes(word))) return 0
  if (name.startsWith(query)) return 1
  if (wordStarts(name, query)) return 0.9
  if (name.includes(query)) return 0.8
  if (words.every((word) => name.includes(word))) return 0.7
  if (wordStarts(extra, query)) return 0.5
  return 0.3
}

/** Lowercase, composed, punctuation to spaces; works for Assamese and English alike. */
export function normalise(text: string) {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‌‍]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim()
}

function wordStarts(text: string, query: string) {
  return text.startsWith(query) || text.includes(` ${query}`)
}
