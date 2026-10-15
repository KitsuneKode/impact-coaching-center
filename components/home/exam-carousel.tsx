"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { type ReactNode, useEffect, useId, useRef, useState } from "react"

/**
 * The three exams as one row that snaps a panel at a time: a tab per exam
 * above it, arrows beside the tabs, swipe or trackpad on the row itself.
 * The tab follows whichever panel is mostly in view, so scrolling and
 * tapping never disagree. Panels are server-rendered; this only moves them.
 */
export function ExamCarousel({
  panels,
}: {
  panels: { slug: string; label: string; node: ReactNode }[]
}) {
  const t = useTranslations("Pulse")
  const id = useId()
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const row = track.current
    if (!row) return
    const items = [...row.children] as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(items.indexOf(entry.target as HTMLElement))
      },
      { root: row, threshold: 0.6 }
    )
    for (const item of items) observer.observe(item)
    return () => observer.disconnect()
  }, [])

  const go = (index: number) => {
    const row = track.current
    const item = row?.children[index] as HTMLElement | undefined
    if (!row || !item) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const start =
      parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0
    row.scrollTo({
      left: item.offsetLeft - row.offsetLeft - start,
      behavior: reduce ? "auto" : "smooth",
    })
  }

  return (
    <div>
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label={t("stackTabs")}
          className="flex max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-full bg-secondary p-1"
        >
          {panels.map((panel, i) => (
            <button
              key={panel.slug}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => go(i)}
              onKeyDown={(event) => {
                const step =
                  event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0
                if (!step) return
                event.preventDefault()
                const next = (i + step + panels.length) % panels.length
                go(next)
                document.getElementById(`${id}-tab-${next}`)?.focus()
              }}
              data-exam-tab
              className="h-10 flex-none rounded-full px-4 text-sm font-semibold whitespace-nowrap"
            >
              {panel.label}
            </button>
          ))}
        </div>
        {/* Phones swipe; the tabs get the whole row. */}
        <div className="flex gap-2 max-sm:hidden">
          <button
            type="button"
            data-press
            disabled={active === 0}
            onClick={() => go(active - 1)}
            aria-label={t("stackPrevious")}
            className="grid size-11 place-items-center rounded-full bg-card shadow-[inset_0_0_0_1px_var(--border)] disabled:opacity-40"
          >
            <IconChevronLeft aria-hidden size={20} stroke={1.75} />
          </button>
          <button
            type="button"
            data-press
            disabled={active === panels.length - 1}
            onClick={() => go(active + 1)}
            aria-label={t("stackNext")}
            className="grid size-11 place-items-center rounded-full bg-card shadow-[inset_0_0_0_1px_var(--border)] disabled:opacity-40"
          >
            <IconChevronRight aria-hidden size={20} stroke={1.75} />
          </button>
        </div>
      </div>
      <div ref={track} data-exam-track className="mbs-8">
        {panels.map((panel, i) => (
          <div
            key={panel.slug}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            data-exam-slide
          >
            {panel.node}
          </div>
        ))}
      </div>
    </div>
  )
}
