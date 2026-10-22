import {
  sanitizeAnnotations,
  type BookPreviewAnnotation,
} from "@/components/book-preview"

/**
 * What the reader remembers on this device: the page a student stopped on
 * and their highlights, bookmarks and ink. Kept here rather than by the
 * reader itself, which keys its memory on the document URL, and a free
 * note's URL is a fresh signed link on every open.
 */

const PREFIX = "ict-reader:"
const INDEX = `${PREFIX}recent`
/** Documents remembered at once; the least recently opened is forgotten. */
const RECENT_MAX = 40

/**
 * A document's lasting identity: a signed link without its signature (the
 * storage key, which changes only when ICT uploads a new file), or the page
 * image addresses when there is no PDF.
 */
export function documentId(pdfUrl?: string, pageSrcs: string[] = []) {
  if (pdfUrl) {
    try {
      const url = new URL(pdfUrl)
      return `pdf:${url.host}${url.pathname}`
    } catch {
      return `pdf:${pdfUrl.split("?")[0]}`
    }
  }
  return `pages:${pageSrcs.map((src) => src.split("?")[0]).join("|")}`
}

const read = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** False when the browser refused: storage blocked, or full. */
const write = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** Marks a document as just opened, forgetting the oldest past the cap. */
function touch(id: string) {
  const recent = read(INDEX)
  const list = Array.isArray(recent)
    ? recent.filter((item): item is string => typeof item === "string")
    : []
  const next = [id, ...list.filter((item) => item !== id)]
  for (const old of next.splice(RECENT_MAX)) {
    try {
      localStorage.removeItem(`${PREFIX}page:${old}`)
      localStorage.removeItem(`${PREFIX}notes:${old}`)
    } catch {
      /* blocked storage: nothing was kept anyway */
    }
  }
  write(INDEX, next)
}

/**
 * Where to open: the remembered page, unless the student had reached the
 * last page (a finished read starts again) or the document has shrunk.
 */
export function rememberedPage(id: string, pageCount: number): number {
  touch(id)
  const page = read(`${PREFIX}page:${id}`)
  if (typeof page !== "number" || !Number.isInteger(page) || page < 0) return 0
  if (pageCount > 0 && page >= pageCount - 1) return 0
  return page
}

export function rememberPage(id: string, page: number) {
  write(`${PREFIX}page:${id}`, page)
}

export function rememberedNotes(id: string): BookPreviewAnnotation[] {
  return sanitizeAnnotations(read(`${PREFIX}notes:${id}`))
}

/** False when the notes could not be kept, so the reader can say so once. */
export function rememberNotes(id: string, notes: BookPreviewAnnotation[]) {
  if (notes.length === 0) {
    try {
      localStorage.removeItem(`${PREFIX}notes:${id}`)
    } catch {
      /* nothing to forget */
    }
    return true
  }
  return write(`${PREFIX}notes:${id}`, notes)
}

/*
 * Progress per note, by slug, for the notes list: "Page 5 of 12" and a
 * Continue button. One small record, the 40 most recent kept.
 */
const PROGRESS = `${PREFIX}progress`
/** Fired in this tab when progress changes; `storage` covers other tabs. */
const PROGRESS_EVENT = "ict-reader-progress"

export type ReadingProgress = Record<
  string,
  { page: number; total: number; at: number }
>

export function parseProgress(raw: string): ReadingProgress {
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== "object" || Array.isArray(value)) return {}
    const out: ReadingProgress = {}
    for (const [slug, entry] of Object.entries(value)) {
      const { page, total, at } = (entry ?? {}) as Record<string, unknown>
      if (
        Number.isInteger(page) &&
        Number.isInteger(total) &&
        typeof at === "number" &&
        (page as number) >= 0 &&
        (total as number) > 0
      )
        out[slug] = { page: page as number, total: total as number, at }
    }
    return out
  } catch {
    return {}
  }
}

export function rememberProgress(slug: string, page: number, total: number) {
  if (!slug || !(total > 0)) return
  let raw = ""
  try {
    raw = localStorage.getItem(PROGRESS) ?? ""
  } catch {
    return
  }
  const all = parseProgress(raw)
  all[slug] = { page, total, at: Date.now() }
  const kept = Object.fromEntries(
    Object.entries(all)
      .toSorted(([, a], [, b]) => b.at - a.at)
      .slice(0, RECENT_MAX)
  )
  if (write(PROGRESS, kept) && typeof window !== "undefined")
    window.dispatchEvent(new Event(PROGRESS_EVENT))
}

/** The stored progress as a string: a stable snapshot for useSyncExternalStore. */
export function progressSnapshot(): string {
  try {
    return localStorage.getItem(PROGRESS) ?? ""
  } catch {
    return ""
  }
}

export function subscribeProgress(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(PROGRESS_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(PROGRESS_EVENT, onChange)
  }
}

/** Book or Scroll, as this device last chose. */
const MODE = `${PREFIX}mode`

export function rememberedMode(): string | null {
  const mode = read(MODE)
  return typeof mode === "string" ? mode : null
}

export function rememberMode(mode: string) {
  write(MODE, mode)
}
