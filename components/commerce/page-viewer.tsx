"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import Image from "next/image"
import { useState } from "react"

import { PaperPage } from "@/components/commerce/paper-page"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** A page image when there is one, otherwise a placeholder sheet. */
export type ViewerPage = { heading?: string; src?: string }

/**
 * A page-by-page reader: arrows, the keyboard's left and right keys, and a
 * page count. Used for book samples and free resources alike, so there is
 * one reading experience on the site.
 */
export function PageViewer({
  open,
  onOpenChange,
  title,
  note,
  pages,
  startAt = 0,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  note: string
  pages: readonly ViewerPage[]
  startAt?: number
}) {
  const [index, setIndex] = useState(startAt)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [lastStart, setLastStart] = useState(startAt)

  // Opening at a different thumbnail restarts from that page.
  if (lastStart !== startAt) {
    setLastStart(startAt)
    setIndex(startAt)
  }

  const go = (step: 1 | -1) => {
    const next = index + step
    if (next < 0 || next >= pages.length) return
    setDirection(step)
    setIndex(next)
  }
  const page = pages[index]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-5 p-5 sm:max-w-xl md:p-6"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1)
          if (event.key === "ArrowLeft") go(-1)
        }}
      >
        <div className="pr-8">
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {note}
          </DialogDescription>
        </div>

        <div className="overflow-hidden rounded-control bg-surface p-4 md:p-6">
          <div
            key={index}
            className={cn(
              "mx-auto w-[min(100%,380px,calc(56vh/1.414))] animate-in duration-200 ease-out fade-in-0 motion-reduce:slide-in-from-left-0 motion-reduce:slide-in-from-right-0",
              direction === 1 ? "slide-in-from-right-4" : "slide-in-from-left-4"
            )}
          >
            {page?.src ? (
              <Image
                src={page.src}
                alt={`${title}, page ${index + 1}`}
                width={760}
                height={1075}
                sizes="(min-width: 640px) 380px, 90vw"
                priority
                className="h-auto w-full bg-card shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_30px_-12px_rgb(0_0_0/0.25)] ring-1 ring-border"
              />
            ) : (
              <PaperPage
                running={title}
                heading={page?.heading}
                number={index + 1}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => go(-1)}
            disabled={index === 0}
          >
            <IconChevronLeft stroke={1.75} aria-hidden />
            Previous
          </Button>
          <p aria-live="polite" className="tnum text-sm text-muted-foreground">
            Page {index + 1} of {pages.length}
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => go(1)}
            disabled={index === pages.length - 1}
          >
            Next
            <IconChevronRight stroke={1.75} aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
