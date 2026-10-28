/**
 * What a long post needs beyond its Markdown: the headings for "On this
 * page", an id for each that survives Assamese, the reading time, and which
 * links are videos to play in place. Pure, so the page and the tests share
 * one reading of the text.
 */

export type Heading = { id: string; text: string; depth: 2 | 3 }

/** Unicode-aware: Assamese headings keep their letters and vowel signs. */
export function headingSlug(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/** Strips the Markdown a heading may carry: links, emphasis, code. */
function plain(text: string) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim()
}

/** ## and ### headings outside code fences, in order, with unique ids. */
export function headingsOf(markdown: string): Heading[] {
  const seen = new Map<string, number>()
  const out: Heading[] = []
  let fenced = false
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    if (fenced) continue
    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/)
    if (!match) continue
    const text = plain(match[2]!)
    const base = headingSlug(text) || "section"
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    out.push({
      id: count ? `${base}-${count + 1}` : base,
      text,
      depth: match[1]!.length as 2 | 3,
    })
  }
  return out
}

/** Minutes at 200 words a minute, never under one. */
export function readingMinutes(markdown: string) {
  const words = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** The video id of a YouTube link (watch, youtu.be, shorts, embed), or null. */
export function youTubeId(href: string | undefined): string | null {
  if (!href) return null
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, "")
  let id: string | null = null
  if (host === "youtu.be") id = url.pathname.slice(1)
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v")
    else
      id = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null
}
