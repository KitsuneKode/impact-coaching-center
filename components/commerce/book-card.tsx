"use client"

import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"

import { BookCover } from "@/components/commerce/book-cover"
import { useOpenCart } from "@/components/commerce/shop-shell"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"
import { formatPaise } from "@/lib/money"
import type { Book } from "@/lib/catalog"

/** A book on its shelf: the cover, then title, exam and price, with quick add. */
export function BookCard({ book }: { book: Book }) {
  const add = useCart((s) => s.add)
  const openCart = useOpenCart()
  const href = `/books/${book.slug}`

  return (
    <article className="group grid gap-4">
      <Link
        href={href}
        aria-label={book.title}
        className="grid place-items-center rounded-card bg-surface px-[18%] py-8 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <BookCover
          title={book.title}
          subtitle={book.subtitle}
          exam={book.exam}
          tone={book.tone}
          coverUrl={book.coverUrl}
          className="transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:-translate-y-1.5"
        />
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <p className="text-xs text-muted-foreground">{book.exam}</p>
          <Link
            href={href}
            className="font-medium text-balance hover:underline"
          >
            {book.title}
          </Link>
          <p className="tnum text-sm">{formatPaise(book.pricePaise)}</p>
        </div>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={`Add ${book.title} to cart`}
          onClick={() => {
            add(book.slug)
            toast.success(`${book.title} added to your cart`, {
              action: { label: "View cart", onClick: openCart },
            })
          }}
        >
          <IconPlus stroke={1.75} aria-hidden />
        </Button>
      </div>
    </article>
  )
}
