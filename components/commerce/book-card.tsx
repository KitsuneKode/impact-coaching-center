"use client"

import { IconPlus } from "@tabler/icons-react"
import { useContent } from "@/i18n/content"
import { Link } from "@/i18n/navigation"
import { toast } from "sonner"

import { BookCover } from "@/components/commerce/book-cover"
import { useOpenCart } from "@/components/commerce/shop-shell"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"
import { formatPaise } from "@/lib/money"
import type { Book } from "@/lib/catalog"

/** A book on its shelf: the cover, then title, exam and price, with quick add. */
export function BookCard({ book }: { book: Book }) {
  const { phrase } = useContent()
  const add = useCart((s) => s.add)
  const openCart = useOpenCart()
  const href = `/books/${book.slug}`

  return (
    <article className="group relative grid gap-4">
      <Link
        href={href}
        className="grid gap-4 rounded-card outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="grid place-items-center rounded-card bg-surface px-[18%] py-8">
          <BookCover
            title={book.title}
            subtitle={book.subtitle}
            exam={book.exam}
            tone={book.tone}
            coverUrl={book.coverUrl}
            className="transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:-translate-y-1.5"
          />
        </span>
        <span className="grid gap-0.5 pr-12">
          <span className="text-xs text-muted-foreground">
            {phrase(book.exam)}
          </span>
          <span className="font-medium text-balance group-hover:underline">
            {book.title}
          </span>
          <span className="tnum text-sm">{formatPaise(book.pricePaise)}</span>
        </span>
      </Link>
      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={`Add ${book.title} to cart`}
        className="absolute right-0 bottom-0"
        onClick={() => {
          add(book.slug)
          toast.success(`${book.title} added to your cart`, {
            action: { label: "View cart", onClick: openCart },
          })
        }}
      >
        <IconPlus stroke={1.75} aria-hidden />
      </Button>
    </article>
  )
}
