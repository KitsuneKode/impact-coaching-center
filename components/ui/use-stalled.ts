"use client"

import { useEffect, useState } from "react"

/**
 * True once a wait has gone on long enough to stop being latency.
 *
 * Convex's `useQuery` gives `undefined` while a query is in flight, and a
 * query that never resolves stays `undefined` forever - so "loading" and
 * "broken" are the same value. Anything that renders nothing while waiting
 * therefore renders nothing permanently when the backend is unreachable. This
 * is how a caller tells the two apart: hold the quiet state for a moment, then
 * say something.
 *
 * It also covers the opposite trap, which is `null` meaning two things. Right
 * after verification the client can report "nobody is signed in" for a beat
 * before the new session propagates, so treating that `null` as final sends a
 * freshly signed-in person somewhere they did not ask to go.
 *
 * Resets when the wait ends, so a fast navigation never trips it, and so a
 * later wait starts its own clock rather than inheriting a verdict.
 *
 * That reset happens during render, not in the effect. React documents
 * adjusting state while rendering for exactly this - a value derived from a
 * changed input - and it re-renders before touching the DOM, so nothing
 * flashes. Doing it in the effect means a committed render showing the stale
 * verdict, and it is what `react(set-state-in-effect)` objects to.
 */
export function useStalled(waiting: boolean, afterMs = 6000) {
  const [stalled, setStalled] = useState(false)
  const [watched, setWatched] = useState(waiting)

  if (watched !== waiting) {
    setWatched(waiting)
    setStalled(false)
  }

  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(() => setStalled(true), afterMs)
    return () => clearTimeout(timer)
  }, [waiting, afterMs])

  return stalled
}
