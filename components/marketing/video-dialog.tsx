"use client"

import { Dialog } from "@base-ui/react/dialog"
import { IconBrandYoutube, IconX } from "@tabler/icons-react"
import { useRef, useState, type ComponentProps, type ReactNode } from "react"

import { youtubeWatch } from "@/lib/brand"
import { cn } from "@/lib/utils"

/** Plays a video in place instead of throwing the visitor at YouTube. */
export function VideoDialog({
  id,
  title,
  subtitle,
  vertical = false,
  label,
  className,
  children,
  ...trigger
}: {
  id: string
  title: string
  subtitle?: string
  /** shorts are filmed vertically and look wrong in a 16:9 frame */
  vertical?: boolean
  /**
   * The button's name when its visible text says more than the title; null
   * lets the visible text name it (add a hidden verb to the children).
   */
  label?: string | null
  className?: string
  children: ReactNode
} & Pick<ComponentProps<"button">, "onPointerEnter" | "onFocus">) {
  const [open, setOpen] = useState(false)
  /*
   * An iframe is focusable, so without this the player takes focus the moment
   * it opens and swallows Escape: the dialog cannot be closed from the
   * keyboard and the page stays scroll locked. Focus the close button instead.
   */
  const closeRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        data-press
        className={cn("group block cursor-pointer text-left", className)}
        aria-label={label === null ? undefined : (label ?? `Play: ${title}`)}
        {...trigger}
      >
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          initialFocus={closeRef}
          className={cn(
            "fixed inset-bs-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(94vw,64rem,calc((100dvh-10rem)*1.7778))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto outline-none",
            "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            vertical && "w-[min(92vw,24rem,calc((100dvh-10rem)*0.5625))]"
          )}
        >
          <div
            className={cn(
              "relative overflow-clip rounded-card bg-black shadow-lift",
              vertical ? "aspect-[9/16]" : "aspect-video"
            )}
          >
            {open ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : null}
          </div>

          <div className="mbs-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-[0.9375rem] font-medium text-white">
                {title}
              </Dialog.Title>
              {subtitle ? (
                <p className="text-sm text-white/60">{subtitle}</p>
              ) : null}
              <a
                href={youtubeWatch(id)}
                target="_blank"
                rel="noreferrer noopener"
                className="mbs-1.5 inline-flex items-center gap-1.5 text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
              >
                <IconBrandYoutube size={15} stroke={1.75} />
                Watch on YouTube
              </a>
            </div>
            <Dialog.Close
              ref={closeRef}
              aria-label="Close video"
              className="relative grid size-9 shrink-0 cursor-pointer place-items-center rounded-control border border-white/20 text-white transition-colors after:absolute after:-inset-1 hover:bg-white/10"
            >
              <IconX size={18} stroke={1.75} />
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
