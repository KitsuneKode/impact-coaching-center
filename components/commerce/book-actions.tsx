"use client"

import { IconBook } from "@tabler/icons-react"
import Image from "next/image"
import { useState } from "react"

import { AddToCart } from "@/components/commerce/add-to-cart"
import { PageViewer } from "@/components/commerce/page-viewer"
import { PaperPage } from "@/components/commerce/paper-page"
import { useOpenCart } from "@/components/commerce/shop-shell"
import { Button } from "@/components/ui/button"
import type { Book } from "@/lib/catalog"

/** Uploaded sample pages, or placeholder sheets for a sample title. */
function samplePages(book: Book) {
  if (book.samplePageUrls?.length)
    return book.samplePageUrls.map((src) => ({ src }))
  return Array.from({ length: book.samplePages }, (_, i) => ({
    heading:
      i === 0 || !book.contents.length
        ? "Contents"
        : book.contents[(i - 1) % book.contents.length],
  }))
}

function noteFor(book: Book) {
  return book.samplePageUrls?.length
    ? `${book.samplePageUrls.length} sample pages.`
    : "Placeholder pages. The book's own pages appear here."
}

/** Add to cart and open the sample reader. */
export function BookActions({ book }: { book: Book }) {
  const openCart = useOpenCart()
  const [reading, setReading] = useState(false)
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <AddToCart
          slug={book.slug}
          title={book.title}
          onOpenCart={openCart}
          size="lg"
        />
        {book.samplePages ? (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setReading(true)}
          >
            <IconBook stroke={1.75} aria-hidden />
            Read a sample
          </Button>
        ) : null}
      </div>
      <PageViewer
        open={reading}
        onOpenChange={setReading}
        title={book.title}
        note={noteFor(book)}
        pages={samplePages(book)}
      />
    </>
  )
}

/** The first sample pages as thumbnails; each opens the reader at that page. */
export function SampleStrip({ book }: { book: Book }) {
  const pages = samplePages(book)
  const [start, setStart] = useState<number | null>(null)
  if (!pages.length) return null
  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">Sample pages</p>
      <ul className="grid grid-cols-4 gap-3">
        {pages.slice(0, 4).map((page, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setStart(i)}
              aria-label={`Open sample page ${i + 1}`}
              className="block w-full rounded-[2px] outline-offset-2 transition-transform duration-200 ease-out focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.97] [@media(hover:hover)]:hover:-translate-y-0.5"
            >
              {"src" in page ? (
                <Image
                  src={page.src}
                  alt=""
                  width={160}
                  height={226}
                  sizes="(min-width: 1024px) 120px, 22vw"
                  className="aspect-[1/1.414] h-auto w-full bg-card object-cover ring-1 ring-border"
                />
              ) : (
                <PaperPage
                  running={book.title}
                  heading={page.heading}
                  lines={8}
                  compact
                />
              )}
            </button>
          </li>
        ))}
      </ul>
      <PageViewer
        open={start !== null}
        onOpenChange={(open) => !open && setStart(null)}
        title={book.title}
        note={noteFor(book)}
        pages={pages}
        startAt={start ?? 0}
      />
    </div>
  )
}
