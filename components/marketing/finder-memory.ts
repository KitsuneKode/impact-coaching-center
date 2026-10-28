"use client"

import { useSyncExternalStore } from "react"

import type { FinderAnswers } from "@/lib/course-finder"

/*
 * The course finder's answers, kept on this device so a visitor who comes
 * back finds the list still sorted for them. Only the four choices are
 * kept, never anything about who they are.
 */
const KEY = "ict-finder"
const NONE: FinderAnswers = {}
const listeners = new Set<() => void>()
let cached: { raw: string | null; value: FinderAnswers } = {
  raw: null,
  value: NONE,
}

function read(): FinderAnswers {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return cached.value
  }
  if (raw === cached.raw) return cached.value
  let value: FinderAnswers = NONE
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === "object") value = parsed as FinderAnswers
  } catch {
    value = NONE
  }
  cached = { raw, value }
  return value
}

export function rememberAnswers(answers: FinderAnswers) {
  try {
    if (Object.values(answers).some(Boolean))
      localStorage.setItem(KEY, JSON.stringify(answers))
    else localStorage.removeItem(KEY)
  } catch {
    // Blocked storage: the answers last until the page closes.
    cached = { raw: JSON.stringify(answers), value: answers }
  }
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** The remembered answers; none on the server and before hydration. */
export function useFinderAnswers(): FinderAnswers {
  return useSyncExternalStore(subscribe, read, () => NONE)
}
