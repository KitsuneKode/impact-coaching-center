"use client"

import { Dialog } from "@base-ui/react/dialog"
import {
  IconArrowRight,
  IconBrandYoutube,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useRef, useState, type PointerEvent } from "react"

import { youtubeWatch } from "@/lib/brand"

/** How far a finger travels before it counts as a swipe to the next video. */
const SWIPE_PX = 48

/**
 * Short vertical videos one after another, the way Shorts and Reels play:
 * full screen on a phone, next and previous by button, arrow key or swipe,
 * and the offer's button under the video so acting on it is one tap.
 * Only the video on screen has a player; the rest are not loaded.
 */
export function ReelViewer({
  ids,
  index,
  onIndexChange,
  onClose,
  title,
  cta,
}: {
  ids: readonly string[]
  /** The video on screen, or null when the viewer is closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  title: string
  cta?: { label: string; href: string; onClick?: () => void }
}) {
  const t = useTranslations("Promos")
  const closeRef = useRef<HTMLButtonElement>(null)
  const [swipeFrom, setSwipeFrom] = useState<{ x: number; y: number } | null>(
    null
  )
  const open = index !== null
  const current = index ?? 0
  const id = ids[current]
  const go = (next: number) => {
    if (next >= 0 && next < ids.length) onIndexChange(next)
  }

  // Swipes are read off the frame around the video: the player itself keeps
  // its own touches, as YouTube's does.
  const onPointerDown = (event: PointerEvent) =>
    setSwipeFrom({ x: event.clientX, y: event.clientY })
  const onPointerUp = (event: PointerEvent) => {
    if (!swipeFrom) return
    const dx = event.clientX - swipeFrom.x
    const dy = event.clientY - swipeFrom.y
    setSwipeFrom(null)
    const along = Math.abs(dx) > Math.abs(dy) ? dx : dy
    if (Math.abs(along) < SWIPE_PX) return
    // Up or left brings the next video, as in Shorts.
    go(current + (along < 0 ? 1 : -1))
  }

  const external = cta?.href.startsWith("http")
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {}

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-70 bg-black/95 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          initialFocus={closeRef}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault()
              go(current + 1)
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault()
              go(current - 1)
            }
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setSwipeFrom(null)}
          className="fixed inset-0 z-71 grid touch-none grid-rows-[auto_minmax(0,1fr)_auto] gap-3 pbs-[max(0.75rem,env(safe-area-inset-top))] pbe-[max(0.75rem,env(safe-area-inset-bottom))] text-white transition-[opacity,transform] duration-200 outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
        >
          <div className="mx-auto flex w-full max-w-[28rem] items-center gap-3 ps-4 pe-2">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-[0.9375rem] font-semibold">
                {title}
              </Dialog.Title>
              <Dialog.Description className="tnum text-sm text-white/65">
                {t("reelPosition", { n: current + 1, total: ids.length })}
              </Dialog.Description>
            </div>
            <Dialog.Close
              ref={closeRef}
              aria-label={t("close")}
              className="grid size-11 flex-none place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <IconX aria-hidden size={20} stroke={2} />
            </Dialog.Close>
          </div>

          <div className="relative flex min-h-0 items-center justify-center gap-4 px-3">
            <button
              type="button"
              onClick={() => go(current - 1)}
              disabled={current === 0}
              aria-label={t("reelPrevious")}
              className="hidden size-12 flex-none place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 sm:grid"
            >
              <IconChevronLeft aria-hidden size={22} stroke={2} />
            </button>
            {/* 9:16 at the tallest the screen allows, never wider than it. */}
            <div className="relative aspect-[9/16] h-full max-h-full max-w-full overflow-clip rounded-[20px] bg-black">
              {open && id ? (
                <iframe
                  key={id}
                  src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={`${title} (${current + 1})`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 size-full"
                />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => go(current + 1)}
              disabled={current === ids.length - 1}
              aria-label={t("reelNext")}
              className="hidden size-12 flex-none place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 sm:grid"
            >
              <IconChevronRight aria-hidden size={22} stroke={2} />
            </button>
          </div>

          <div className="mx-auto grid w-full max-w-[28rem] gap-3 px-4">
            {ids.length > 1 ? (
              <div className="flex items-center justify-between gap-3 sm:justify-center">
                <button
                  type="button"
                  onClick={() => go(current - 1)}
                  disabled={current === 0}
                  aria-label={t("reelPrevious")}
                  className="grid size-11 place-items-center rounded-full bg-white/10 disabled:opacity-30 sm:hidden"
                >
                  <IconChevronLeft aria-hidden size={20} stroke={2} />
                </button>
                <ol aria-hidden className="flex items-center gap-1.5">
                  {ids.map((videoId, i) => (
                    <li
                      key={videoId}
                      className={
                        i === current
                          ? "h-1.5 w-5 rounded-full bg-white"
                          : "size-1.5 rounded-full bg-white/35"
                      }
                    />
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => go(current + 1)}
                  disabled={current === ids.length - 1}
                  aria-label={t("reelNext")}
                  className="grid size-11 place-items-center rounded-full bg-white/10 disabled:opacity-30 sm:hidden"
                >
                  <IconChevronRight aria-hidden size={20} stroke={2} />
                </button>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {cta ? (
                <a
                  href={cta.href || "#"}
                  {...external}
                  onClick={cta.onClick}
                  data-press
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink sm:flex-none"
                >
                  {cta.label}
                  <IconArrowRight aria-hidden size={18} stroke={2} />
                </a>
              ) : null}
              {id ? (
                <a
                  href={youtubeWatch(id)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
                >
                  <IconBrandYoutube aria-hidden size={16} stroke={1.75} />
                  {t("watchOnYouTube")}
                </a>
              ) : null}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
