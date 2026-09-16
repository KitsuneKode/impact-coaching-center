"use client"

import { IconPhone } from "@tabler/icons-react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react"
import { useState } from "react"

import { ButtonAnchor } from "@/components/ui/button"
import { callHref, demoHref, offer } from "@/lib/brand"

/**
 * The mobile conversion bar: call, or book, one thumb away.
 *
 * Local businesses convert on the phone button, and on a phone the nav CTA is
 * folded into the menu, so this appears once the hero's own buttons have
 * scrolled off. Desktop does not need it; the nav CTA is always on screen.
 * Scroll is read through useScroll, not a scroll listener.
 */
export function MobileActionBar() {
  const [shown, setShown] = useState(false)
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (value) => setShown(value > 560))

  return (
    <AnimatePresence>
      {shown ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: "110%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "110%" }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-md gap-2">
            <ButtonAnchor
              href={callHref}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              <IconPhone stroke={1.6} />
              Call
            </ButtonAnchor>
            <ButtonAnchor
              href={demoHref}
              target="_blank"
              size="lg"
              className="flex-[2]"
            >
              {offer.short}
            </ButtonAnchor>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
