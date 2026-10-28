"use client"

import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

/** A word that rolls up to the next one every couple of seconds. */
export function WordRoll({
  words,
  className,
}: {
  words: readonly string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % words.length),
      2200
    )
    return () => clearInterval(timer)
  }, [reduce, words.length])

  return (
    <span className="relative inline-grid overflow-clip pbe-[0.08em] align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={words[index]}
          aria-hidden
          initial={{ y: "90%", opacity: 0, filter: "blur(6px)" }}
          animate={{
            y: "0%",
            opacity: 1,
            filter: "blur(0px)",
            transition: { type: "spring", duration: 0.6, bounce: 0.18 },
          }}
          exit={{
            y: "-60%",
            opacity: 0,
            filter: "blur(6px)",
            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
          }}
          className={cn(
            "col-start-1 row-start-1 whitespace-nowrap text-highlight",
            className
          )}
        >
          {words[index]}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
