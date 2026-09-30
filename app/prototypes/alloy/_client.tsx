"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { Children, useEffect, useRef, useState, type ReactNode } from "react"

/** A snapping row of slides with arrows that stop at either end. */
export function Rail({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const ref = useRef<HTMLUListElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  useEffect(() => {
    const list = ref.current
    const first = list?.firstElementChild
    const last = list?.lastElementChild
    if (!list || !first || !last) return
    const io = new IntersectionObserver(
      (entries) => {
        setEdge((e) => {
          const next = { ...e }
          for (const en of entries) {
            if (en.target === first) next.start = en.intersectionRatio > 0.9
            if (en.target === last) next.end = en.intersectionRatio > 0.9
          }
          return next
        })
      },
      { root: list, threshold: [0, 0.9, 1] }
    )
    io.observe(first)
    io.observe(last)
    return () => io.disconnect()
  }, [])

  const step = (dir: 1 | -1) => {
    const list = ref.current
    const slide = list?.firstElementChild as HTMLElement | null
    if (!list || !slide) return
    list.scrollBy({ left: dir * (slide.offsetWidth + 16), behavior: "smooth" })
  }

  return (
    <div>
      <ul
        ref={ref}
        data-al-rail
        aria-label={label}
        className="flex gap-4 overflow-x-auto px-5 pb-2 md:scroll-px-[max(2rem,calc((100vw_-_1176px)/2))] md:px-[max(2rem,calc((100vw_-_1176px)/2))]"
      >
        {Children.map(children, (c) => (
          <li className="w-[82vw] shrink-0 sm:w-[380px]">{c}</li>
        ))}
      </ul>
      <div className="mx-auto mt-6 flex w-full max-w-[1240px] justify-end gap-2 px-5 md:px-8">
        <button
          type="button"
          data-al-arrow
          aria-label="Previous"
          disabled={edge.start}
          onClick={() => step(-1)}
        >
          <IconChevronLeft aria-hidden size={20} stroke={2} />
        </button>
        <button
          type="button"
          data-al-arrow
          aria-label="Next"
          disabled={edge.end}
          onClick={() => step(1)}
        >
          <IconChevronRight aria-hidden size={20} stroke={2} />
        </button>
      </div>
    </div>
  )
}
