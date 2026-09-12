"use client"

import { IconPlayerPlayFilled } from "@tabler/icons-react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"
import Image from "next/image"
import { useRef, useState, type PointerEvent } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { lectures, lectureStill } from "@/lib/brand"

function views(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`
}

/**
 * Hairline list of real lectures with a floating preview.
 *
 * YouTube thumbnails are loud by design and would shout over a calm page, so
 * they stay hidden until the visitor reaches for a row; then the thumbnail
 * follows the cursor on a spring. Pointer position lives in motion values, not
 * React state, so moving the mouse never re-renders the list. On touch screens
 * the thumbnail shows inline instead, since there is no hover to reveal it.
 */
export function LectureList({ limit = 6 }: { limit?: number }) {
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState<string | null>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 })

  function onPointerMove(event: PointerEvent<HTMLUListElement>) {
    if (event.pointerType !== "mouse" || !listRef.current) return
    const rect = listRef.current.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  const items = lectures.slice(0, limit)

  return (
    <div className="relative">
      <ul
        ref={listRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
        className="border-b border-border"
      >
        {items.map((lecture) => (
          <li key={lecture.id}>
            <VideoDialog
              id={lecture.id}
              title={lecture.title}
              subtitle={lecture.by}
              onPointerEnter={(event) => event.pointerType === "mouse" && setActive(lecture.id)}
              onFocus={() => setActive(null)}
              className="row-link w-full gap-4 py-4 md:py-5"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-[0.5rem] bg-surface ring-1 ring-border md:hidden">
                  <Image
                    src={lectureStill(lecture.id)}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover grayscale-[0.85]"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9875rem] font-medium transition-colors md:text-[1.0625rem]">
                    {lecture.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">{lecture.by}</span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                <span className="tnum hidden sm:inline">{views(lecture.views)} views</span>
                <IconPlayerPlayFilled
                  size={14}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              </span>
            </VideoDialog>
          </li>
        ))}
      </ul>

      {/* floating preview, desktop pointers only */}
      <AnimatePresence>
        {active && !reduce ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-10 hidden w-72 md:block"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-video translate-x-6 -translate-y-1/2 overflow-hidden rounded-[0.75rem] bg-surface shadow-lift ring-1 ring-border">
              {items.map((lecture) => (
                <Image
                  key={lecture.id}
                  src={lectureStill(lecture.id)}
                  alt=""
                  fill
                  sizes="288px"
                  className={
                    "object-cover transition-opacity duration-200 " +
                    (lecture.id === active ? "opacity-100" : "opacity-0")
                  }
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
