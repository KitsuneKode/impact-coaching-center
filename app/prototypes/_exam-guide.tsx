"use client"

import { IconArrowUpRight } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useRef, useState, type KeyboardEvent } from "react"

export type GuideStage = { name: string; facts?: string; points: string[] }
export type Guide = {
  slug: string
  short: string
  name: string
  body: string
  summary: string
  stages: GuideStage[]
  eligibility: string[]
  papers: { label: string; href: string }[]
  checked: string
}

/**
 * How each exam actually works, taken from the conducting body's own papers
 * (see lib/exams.ts). Tabs for the exam, numbered stages, official papers to
 * download. Styled by the page through `--eg-*` variables and `examGuideCss`.
 */
export function ExamGuide({ guides }: { guides: Guide[] }) {
  const [i, setI] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const reduce = useReducedMotion()
  const g = guides[i]!

  const onKey = (e: KeyboardEvent, at: number) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0
    if (!step) return
    e.preventDefault()
    const next = (at + step + guides.length) % guides.length
    setI(next)
    refs.current[next]?.focus()
  }

  return (
    <div data-eg>
      <div role="tablist" aria-label="Exams" data-eg-tabs>
        {guides.map((x, at) => (
          <button
            key={x.slug}
            ref={(el) => {
              refs.current[at] = el
            }}
            type="button"
            role="tab"
            id={`eg-tab-${x.slug}`}
            aria-selected={at === i}
            aria-controls="eg-panel"
            tabIndex={at === i ? 0 : -1}
            data-on={at === i ? "" : undefined}
            onClick={() => setI(at)}
            onKeyDown={(e) => onKey(e, at)}
            data-eg-tab
          >
            {x.short}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="eg-panel"
        aria-labelledby={`eg-tab-${g.slug}`}
        data-eg-panel
      >
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={g.slug}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            <p data-eg-body>{g.body}</p>
            <h3 data-eg-name>{g.name}</h3>
            <p data-eg-summary>{g.summary}</p>

            <ol data-eg-stages>
              {g.stages.map((s, n) => (
                <li key={s.name} data-eg-stage>
                  <span data-eg-n aria-hidden>
                    {n + 1}
                  </span>
                  <div>
                    <h4>{s.name}</h4>
                    {s.facts && <p data-eg-facts>{s.facts}</p>}
                    <ul>
                      {s.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>

            {(g.eligibility.length > 0 || g.papers.length > 0) && (
              <div data-eg-more>
                {g.eligibility.length > 0 && (
                  <div>
                    <h4>Who can apply</h4>
                    <ul>
                      {g.eligibility.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {g.papers.length > 0 && (
                  <div>
                    <h4>Official papers and syllabus</h4>
                    <ul>
                      {g.papers.map((p) => (
                        <li key={p.href}>
                          <a
                            href={p.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            data-eg-link
                          >
                            {p.label}
                            <IconArrowUpRight
                              aria-hidden
                              size={14}
                              stroke={1.75}
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <p data-eg-checked>
              From the official notices. Checked on {g.checked}.
            </p>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
