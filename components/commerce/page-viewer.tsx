"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { IconX } from "@tabler/icons-react"
import { useEffect, useMemo, useRef } from "react"

import {
  BookPreview,
  pageEngine,
  type BookPreviewPage,
  type BookPreviewSource,
} from "@/components/book-preview"
import { curlEngine } from "@/components/book-preview/engines/curl-engine.meta"
import { pdfEngine } from "@/components/book-preview/engines/pdf-engine.meta"
import { PaperPage } from "@/components/commerce/paper-page"

/** A page image when there is one, otherwise a placeholder sheet. */
export type ViewerPage = { heading?: string; src?: string }

const ENGINES = [pageEngine, curlEngine, pdfEngine]

/**
 * The site's one reader, for book samples and free notes alike: the kitsu-lab
 * BookPreview with its page-curl book, opened full screen over the page.
 * A PDF (`pdfUrl`, e.g. a signed R2 link) is rasterised in the browser a few
 * pages at a time, so length does not matter; stored page images and
 * placeholder sheets read the same way.
 */
export function PageViewer({
  open,
  onOpenChange,
  title,
  note,
  pages,
  pdfUrl,
  startAt = 0,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  note: string
  pages?: readonly ViewerPage[]
  pdfUrl?: string
  startAt?: number
}) {
  const popup = useRef<HTMLDivElement>(null)

  // The PDF engine mounts a beat after the dialog, so the initial focus may
  // find no book yet. Hand focus to it once it exists, unless the reader has
  // already put focus somewhere else inside the dialog.
  useEffect(() => {
    if (!open) return
    let tries = 0
    const timer = window.setInterval(() => {
      const book = popup.current?.querySelector<HTMLElement>(".book-preview")
      const active = document.activeElement
      const settled = book && (active === book || book.contains(active))
      if (book && !settled && !popup.current?.querySelector("input:focus")) {
        book.focus({ preventScroll: true })
      }
      if (settled || ++tries > 20) window.clearInterval(timer)
    }, 100)
    return () => window.clearInterval(timer)
  }, [open, pdfUrl])
  const source = useMemo<BookPreviewSource>(() => {
    if (pdfUrl) return { title, pdfUrl, revision: pdfUrl }
    return {
      title,
      revision: (pages ?? []).map((page) => page.src ?? page.heading).join("|"),
      pages: (pages ?? []).map((page, index): BookPreviewPage => ({
        id: `p-${index + 1}`,
        pageNumber: index + 1,
        title: page.heading,
        render: () =>
          page.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- a signed storage URL, sized by the reader
            <img
              src={page.src}
              alt={`${title}, page ${index + 1}`}
              className="block size-full object-contain"
              draggable={false}
            />
          ) : (
            <PaperPage
              running={title}
              heading={page.heading}
              lines={18}
              className="size-full"
            />
          ),
      })),
    }
  }, [pdfUrl, pages, title])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop data-reader-backdrop />
        {/* Focus starts on the book itself, so the arrow keys turn pages
            straight away; the close button is one Tab back. */}
        <DialogPrimitive.Popup
          ref={popup}
          data-reader-popup
          initialFocus={() =>
            popup.current?.querySelector<HTMLElement>(".book-preview") ?? true
          }
        >
          <header className="flex items-center justify-between gap-4 ps-4 pe-2 pbs-2 pbe-2 sm:ps-6">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate font-display text-lg font-semibold">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="truncate text-xs text-muted-foreground">
                {note}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              data-press
              aria-label="Close the reader"
              className="grid size-11 flex-none place-items-center rounded-full hover:bg-secondary"
            >
              <IconX aria-hidden size={20} stroke={1.75} />
            </DialogPrimitive.Close>
          </header>
          <div className="min-h-0 flex-1">
            <BookPreview
              source={source}
              engines={ENGINES}
              enabledModes={pdfUrl ? ["curl", "pdf"] : ["curl", "page"]}
              defaultMode="curl"
              defaultPageIndex={startAt}
              layout="fill"
              persistPreferences
              share={false}
              label={title}
              className="size-full"
            />
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
