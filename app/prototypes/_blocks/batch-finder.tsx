"use client"

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useState } from "react"

export type FinderBatch = {
  id: number
  name: string
  exam: string
  when: string
  days: string | null
  price: string
  href: string
  start: number
}
export type FinderNoTiming = {
  exam: string
  name: string
  price: string
  href: string
}

const bucket = (start: number) =>
  start < 12 ? "Morning" : start < 16 ? "Day" : start < 20 ? "Evening" : "Night"

/**
 * Three questions, then the batches that fit: which exam, which part of the
 * day, and the printed batches at that hour. Nothing is guessed: a batch with
 * no printed timing is shown as "ask for the timing".
 */
export function BatchFinder({
  batches,
  noTiming,
  exams,
  times,
  askHref,
}: {
  batches: FinderBatch[]
  noTiming: FinderNoTiming[]
  exams: string[]
  times: string[]
  askHref: string
}) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [exam, setExam] = useState<string | null>(null)
  const [when, setWhen] = useState<string | null>(null)
  const reduce = useReducedMotion()

  const go = (to: number) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
  }
  const reset = () => {
    setExam(null)
    setWhen(null)
    go(0)
  }

  const pool =
    exam === "Not sure yet" ? batches : batches.filter((b) => b.exam === exam)
  const fits =
    when === "Online only" ? pool : pool.filter((b) => bucket(b.start) === when)
  const untimed =
    exam === "Not sure yet" ? noTiming : noTiming.filter((n) => n.exam === exam)

  const enter = reduce ? { opacity: 0 } : { opacity: 0, x: dir * 24 }
  const leave = reduce ? { opacity: 0 } : { opacity: 0, x: dir * -24 }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 data-k-display className="text-xl font-semibold">
          Find your batch
        </h2>
        <ol className="flex items-center gap-2" aria-label="Progress">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <span
                data-bf-step
                data-on={i <= step ? "" : undefined}
                data-now={i === step ? "" : undefined}
                aria-current={i === step ? "step" : undefined}
              >
                {i + 1}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 min-h-[260px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <m.div
            key={step}
            initial={enter}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={{ ...leave, transition: { duration: 0.12 } }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="text-lg font-semibold">Which exam?</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {exams.map((x) => (
                    <button
                      key={x}
                      type="button"
                      aria-pressed={exam === x}
                      data-bf-chip
                      data-on={exam === x ? "" : undefined}
                      onClick={() => {
                        setExam(x)
                        go(1)
                      }}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="text-lg font-semibold">
                  When can you study?
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {times.map((x) => (
                    <button
                      key={x}
                      type="button"
                      aria-pressed={when === x}
                      data-bf-chip
                      data-on={when === x ? "" : undefined}
                      onClick={() => {
                        setWhen(x)
                        go(2)
                      }}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(0)}
                  data-k-link
                  className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--k-muted)]"
                >
                  <IconArrowLeft aria-hidden size={16} stroke={2} />
                  Change the exam
                </button>
              </fieldset>
            )}

            {step === 2 && (
              <div>
                <p className="text-lg font-semibold text-balance">
                  {fits.length > 0
                    ? `${fits.length === 1 ? "One batch fits" : `${fits.length} batches fit`}: ${exam === "Not sure yet" ? "any exam" : exam}, ${when === "Online only" ? "online" : when!.toLowerCase()}.`
                    : "No printed batch at that hour yet."}
                </p>
                {when === "Online only" && (
                  <p className="mt-1 text-sm text-[var(--k-muted)]">
                    Every class is recorded on the ICT app, so any batch works.
                  </p>
                )}
                <ul className="mt-4 grid gap-2.5">
                  {fits.map((b, i) => (
                    <m.li
                      key={b.id}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.06 * i, duration: 0.24 },
                      }}
                    >
                      <Link
                        href={b.href}
                        data-bf-result
                        className="sm:grid-cols-[1fr_auto]"
                      >
                        <span data-k-display className="text-lg font-semibold">
                          {b.name}
                        </span>
                        <span className="font-bold tabular-nums sm:text-right">
                          {b.price}
                        </span>
                        <span data-bf-fact className="text-sm">
                          {b.when}
                        </span>
                        <span className="text-sm text-[var(--k-muted)] sm:text-right">
                          {b.days ?? "Days on the batch page"}
                        </span>
                      </Link>
                    </m.li>
                  ))}
                  {untimed.map((n) => (
                    <li key={n.name}>
                      <Link
                        href={n.href}
                        data-bf-result
                        className="sm:grid-cols-[1fr_auto]"
                      >
                        <span data-k-display className="text-lg font-semibold">
                          {n.name}
                        </span>
                        <span className="font-bold tabular-nums sm:text-right">
                          {n.price}
                        </span>
                        <span className="text-sm text-[var(--k-muted)]">
                          Ask for the timing
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href={askHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-k-press
                    data-k-btn
                    className="group inline-flex h-11 items-center gap-2 px-5 text-sm"
                  >
                    Ask ICT about this
                    <IconArrowRight
                      aria-hidden
                      size={16}
                      stroke={2.25}
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    data-k-link
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--k-muted)] underline underline-offset-4"
                  >
                    Start again
                  </button>
                </div>
              </div>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
