"use client"

import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useState } from "react"

import {
  AnnouncementBar,
  ReelCard,
  type Campaign,
} from "@/components/marketing/promos"

/** A dismissible announcement bar for the top of a kit theme's home page. */
export function TopBar({ c }: { c: Campaign }) {
  const [open, setOpen] = useState(true)
  const reduce = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, y: -8, transition: { duration: 0.16 } }
          }
          className="mx-auto w-full max-w-[1240px] px-5 pt-4 md:px-8"
        >
          <AnnouncementBar c={c} onClose={() => setOpen(false)} />
        </m.div>
      )}
    </AnimatePresence>
  )
}

/** A reel that waits four seconds, plays on its own, and can be closed for good. */
export function SiteReel({ c }: { c: Campaign }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return <ReelCard c={c} delay={4000} onClose={() => setOpen(false)} />
}
