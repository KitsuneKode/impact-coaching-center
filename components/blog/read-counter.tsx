"use client"

import { useMutation } from "convex/react"
import { useEffect } from "react"

import { api } from "@/convex/_generated/api"

/** Seconds on the page, or how far down it, that count as having read it. */
const READ_AFTER_MS = 20_000
const READ_DEPTH = 0.5

/**
 * Counts one read of a post: once per visit, and only after the visitor has
 * stayed a while or read halfway. Nothing about them is stored.
 */
export function ReadCounter({ slug }: { slug: string }) {
  const count = useMutation(api.blog.countRead)
  useEffect(() => {
    const key = `ict-read:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
    } catch {
      return
    }
    let done = false
    const read = () => {
      if (done) return
      done = true
      try {
        sessionStorage.setItem(key, "1")
      } catch {}
      void count({ slug }).catch(() => {})
      cleanup()
    }
    const onScroll = () => {
      const depth =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight
      if (depth >= READ_DEPTH) read()
    }
    const timer = window.setTimeout(read, READ_AFTER_MS)
    window.addEventListener("scroll", onScroll, { passive: true })
    const cleanup = () => {
      window.clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
    return cleanup
  }, [slug, count])
  return null
}
