"use client"

import { useEffect, useState } from "react"

/** True once a wait has gone on long enough to stop being latency. */
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
