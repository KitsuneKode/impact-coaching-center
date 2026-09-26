import Link from "next/link"

import { BookCover } from "@/components/commerce/book-cover"
import { formatPaise } from "@/lib/money"
import type { PreviewBook } from "@/lib/preview-catalogue"

/** One book in a grid: cover, title, exam and price, all one link. */
export function BookCard({ book }: { book: PreviewBook }) {
  return (
    <Link
      href={`/preview/books/${book.slug}`}
      className="group grid gap-4 rounded-card outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <BookCover
        title={book.title}
        subtitle={book.subtitle}
        tone={book.tone}
        className="transition-transform duration-200 ease-out group-active:scale-[0.98] [@media(hover:hover)]:group-hover:-translate-y-1"
      />
      <div className="grid gap-1">
        <p className="text-xs text-muted-foreground">{book.exam}</p>
        <p className="font-medium text-balance">{book.title}</p>
        <p className="tnum text-sm">{formatPaise(book.pricePaise)}</p>
      </div>
    </Link>
  )
}
