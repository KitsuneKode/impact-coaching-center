"use client"

import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

/** A word that rolls up to the next one every couple of seconds. */
export function WordRoll({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [reduce, words.length])

  return (
    <span className="relative inline-grid overflow-hidden pb-[0.08em] align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={words[i]}
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
          className="col-start-1 row-start-1 whitespace-nowrap text-[var(--pu-amber)]"
        >
          {words[i]}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
