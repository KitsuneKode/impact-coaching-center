"use client"

import { useSyncExternalStore } from "react"

const KEY = "ict-proto-picks"
export const MAX_PICKS = 3

export type Picks = { slugs: string[]; notes: Record<string, string> }

const empty: Picks = { slugs: [], notes: {} }
const listeners = new Set<() => void>()
let state: Picks | undefined

function parse(raw: string | null): Picks {
  if (!raw) return empty
  const value: unknown = JSON.parse(raw)
  if (typeof value !== "object" || value === null) return empty
  const { slugs, notes } = value as Partial<Picks>
  return {
    slugs: Array.isArray(slugs)
      ? slugs.filter((s) => typeof s === "string").slice(0, MAX_PICKS)
      : [],
    notes: notes && typeof notes === "object" ? notes : {},
  }
}

function load(): Picks {
  if (state) return state
  try {
    state = parse(localStorage.getItem(KEY))
  } catch {
    state = empty
  }
  return state
}

function save(next: Picks) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    state = undefined
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** The designs the visitor has liked, kept in this browser only. */
export function usePicks() {
  const picks = useSyncExternalStore(subscribe, load, () => empty)
  return {
    ...picks,
    full: picks.slugs.length >= MAX_PICKS,
    has: (slug: string) => picks.slugs.includes(slug),
    toggle(slug: string) {
      const now = load()
      if (now.slugs.includes(slug)) {
        const { [slug]: _dropped, ...notes } = now.notes
        save({ slugs: now.slugs.filter((s) => s !== slug), notes })
      } else if (now.slugs.length < MAX_PICKS) {
        save({ ...now, slugs: [...now.slugs, slug] })
      }
    },
    setNote(slug: string, note: string) {
      const now = load()
      save({ ...now, notes: { ...now.notes, [slug]: note.slice(0, 280) } })
    },
    move(slug: string, by: -1 | 1) {
      const now = load()
      const from = now.slugs.indexOf(slug)
      const to = from + by
      if (from < 0 || to < 0 || to >= now.slugs.length) return
      const slugs = [...now.slugs]
      ;[slugs[from], slugs[to]] = [slugs[to]!, slugs[from]!]
      save({ ...now, slugs })
    },
    clear() {
      save(empty)
    },
  }
}
