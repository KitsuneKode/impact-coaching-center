"use client"

import { IconPhone } from "@tabler/icons-react"
import {
  AnimatePresence,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react"
import * as m from "motion/react-m"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ButtonAnchor } from "@/components/ui/button"
import { contactHref } from "@/lib/contact"

/** The mobile conversion bar: call, or book, one thumb away. */
export function MobileActionBar() {
  const t = useTranslations("MobileBar")
  const offer = useTranslations("Offer")
  const [shown, setShown] = useState(false)
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (value) => setShown(value > 560))

  return (
    <AnimatePresence>
      {shown ? (
        <m.div
          initial={reduce ? { opacity: 0 } : { y: "110%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "110%" }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-md gap-2">
            <ButtonAnchor
              href={contactHref({ kind: "call" })}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              <IconPhone stroke={1.6} />
              {t("call")}
            </ButtonAnchor>
            <ButtonAnchor
              href={contactHref({ kind: "workshop" })}
              target="_blank"
              size="lg"
              className="flex-[2]"
            >
              {offer("short")}
            </ButtonAnchor>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}
