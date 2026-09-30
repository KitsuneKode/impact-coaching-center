"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useState } from "react"

/** A swap between two states: a short fade with a touch of blur, so it reads as one thing changing. */
function useSwap() {
  const reduce = useReducedMotion()
  return {
    initial: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 10, filter: "blur(4px)" },
    animate: reduce
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" },
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] as const },
  }
}

export type Pick = {
  slug: string
  exam: string
  batch: string
  when: string | null
  duration: string
  price: string
  href: string
}

/** Choose an exam and the tile shows that exam's flagship batch, timing and fee. */
export function ExamPicker({ picks }: { picks: Pick[] }) {
  const [slug, setSlug] = useState(picks[0]!.slug)
  const cur = picks.find((p) => p.slug === slug)!
  const swap = useSwap()

  return (
    <div>
      <ul aria-label="Choose your exam" className="flex flex-wrap gap-2">
        {picks.map((p) => (
          <li key={p.slug}>
            <button
              type="button"
              data-ch-chip
              data-on={p.slug === slug ? "" : undefined}
              aria-pressed={p.slug === slug}
              onClick={() => setSlug(p.slug)}
            >
              {p.exam}
            </button>
          </li>
        ))}
      </ul>
      <div className="relative mt-6 min-h-[178px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.div key={cur.slug} {...swap}>
            <p data-ch-label>Flagship batch</p>
            <p data-k-display className="mt-2 text-3xl leading-none">
              {cur.batch}
            </p>
            <p className="mt-2 text-sm text-[var(--k-muted)]">
              {cur.when ?? "Ask for the timing"}. {cur.duration}.
            </p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <p data-ch-num className="text-4xl">
                {cur.price}
              </p>
              <Link
                href={cur.href}
                data-k-press
                data-k-btn
                className="group inline-flex h-11 items-center gap-2 px-5 text-sm"
              >
                See the batch
                <IconArrowRight
                  aria-hidden
                  size={16}
                  stroke={2}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** The questions people ask first. Pick one and the answer replaces the last. */
export function AskTile({ items }: { items: { q: string; a: string }[] }) {
  const [i, setI] = useState(0)
  const swap = useSwap()
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {items.map((f, n) => (
          <li key={f.q}>
            <button
              type="button"
              data-ch-chip
              data-on={n === i ? "" : undefined}
              aria-pressed={n === i}
              onClick={() => setI(n)}
            >
              {f.q}
            </button>
          </li>
        ))}
      </ul>
      <div className="relative mt-6 min-h-[8.5rem]" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.p
            key={i}
            {...swap}
            className="max-w-[54ch] text-[1.05rem] leading-relaxed text-[var(--k-ink)]"
          >
            {items[i]!.a}
          </m.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
