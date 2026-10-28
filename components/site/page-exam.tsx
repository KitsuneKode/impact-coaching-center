"use client"

import { useLayoutEffect, useSyncExternalStore } from "react"

/*
 * Which exam the page on screen is about, for promotions aimed at an exam
 * (lib/campaigns.ts showsOn). A page about a course, a book set, a free
 * note or an exam guide renders <PageExam>; every other page leaves it null.
 */
let current: string | null = null
const listeners = new Set<() => void>()

function set(exam: string | null) {
  if (exam === current) return
  current = exam
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Names the page's exam while the page is on screen. Renders nothing. */
export function PageExam({ exam }: { exam?: string | null }) {
  useLayoutEffect(() => {
    set(exam ?? null)
    return () => set(null)
  }, [exam])
  return null
}

/** The exam the page on screen is about, or null. */
export function usePageExam() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  )
}
