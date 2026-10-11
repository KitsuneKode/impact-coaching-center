"use client"

import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

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

/**
 * A reel that waits four seconds, plays on its own, and can be closed for good.
 * With `after`, a selector for the hero element, the reel additionally waits
 * below md until the hero has scrolled out of view — small screens get the
 * hero clean first. The card's own entrance supplies the opacity + translate
 * transition; reduced motion renders without it.
 */
export function SiteReel({ c, after }: { c: Campaign; after?: string }) {
  const [open, setOpen] = useState(true)
  const [show, setShow] = useState(!after)

  useEffect(() => {
    if (!after) return
    const el = document.querySelector(after)
    const mq = window.matchMedia("(max-width: 767px)")
    const check = () => {
      if (!el || !mq.matches) {
        setShow(true)
        return
      }
      if (el.getBoundingClientRect().bottom <= 0) setShow(true)
    }
    const io = el
      ? new IntersectionObserver(([e]) => {
          if (mq.matches && !e?.isIntersecting) setShow(true)
        })
      : null
    if (el) io?.observe(el)
    mq.addEventListener("change", check)
    const raf = requestAnimationFrame(check)
    return () => {
      io?.disconnect()
      mq.removeEventListener("change", check)
      cancelAnimationFrame(raf)
    }
  }, [after])

  if (!open || !show) return null
  return <ReelCard c={c} delay={4000} onClose={() => setOpen(false)} />
}
