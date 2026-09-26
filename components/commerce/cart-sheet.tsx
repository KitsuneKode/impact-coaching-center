"use client"

import { IconShoppingBag, IconTrash } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import Link from "next/link"

import { BookCover } from "@/components/commerce/book-cover"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { useCart, useCartActions, useCartHydrated } from "@/lib/cart-store"
import { formatPaise } from "@/lib/money"

/** The cart button with its count, shown once the saved cart has loaded. */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const hydrated = useCartHydrated()
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  const shown = hydrated ? count : 0
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpen}
      aria-label={`Cart, ${shown} ${shown === 1 ? "item" : "items"}`}
    >
      <IconShoppingBag stroke={1.75} aria-hidden />
      Cart
      <span className="tnum min-w-5 rounded-full bg-primary px-1.5 text-center text-[0.6875rem] leading-5 text-primary-foreground">
        {shown}
      </span>
    </Button>
  )
}

/**
 * The cart as a side sheet, so the shopper never leaves the book they were
 * reading. Prices are the published ones from Convex; a line whose book is no
 * longer published drops out. Checkout is a labelled prototype until payments
 * are live, and the server will price the real order.
 */
export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const lines = useCart((s) => s.lines)
  const { setQuantity, remove } = useCartActions()
  /* No subscription while the sheet is closed: a hidden cart should not keep
     a live catalogue query open on every page it is mounted on. */
  const books = useQuery(api.catalog.books, open ? {} : "skip")
  const loading = books === undefined && lines.length > 0

  /*
   * A line whose book has vanished (unpublished or removed) is rendered as a
   * dead row with a remove control, not silently dropped - otherwise the
   * badge keeps counting an item the shopper can neither see nor clear.
   */
  const rows = lines.flatMap((line) => {
    const book = books?.find((b) => b.slug === line.slug)
    return [{ line, book: book ?? null }]
  })
  const subtotal = rows.reduce(
    (sum, { line, book }) => sum + line.quantity * (book?.pricePaise ?? 0),
    0
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 text-sm sm:max-w-md">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="text-lg font-medium">Your cart</SheetTitle>
          <SheetDescription>
            {loading
              ? "Checking prices…"
              : rows.length === 0
                ? "Nothing here yet."
                : "One delivery charge for the whole order, shown at checkout."}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div aria-hidden className="grid flex-1 content-start gap-4 p-6">
            {lines.map((line) => (
              <Skeleton key={line.slug} className="h-24 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="grid flex-1 place-content-center gap-4 p-6 text-center">
            <p className="text-muted-foreground">
              Add a book and it will wait here, even if you close the tab.
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Keep browsing
            </Button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {rows.map(({ line, book }) =>
              book ? (
                <li
                  key={book.slug}
                  className="grid grid-cols-[64px_1fr] gap-4 p-6"
                >
                  <BookCover
                    title={book.title}
                    tone={book.tone}
                    coverUrl={book.coverUrl}
                    size="sm"
                  />
                  <div className="grid min-w-0 gap-3">
                    <div className="min-w-0 break-words">
                      <Link
                        href={`/books/${book.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="font-medium hover:underline"
                      >
                        {book.title}
                      </Link>
                      <p className="tnum text-muted-foreground">
                        {formatPaise(book.pricePaise)} each
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        label={book.title}
                        onChange={(next) => setQuantity(book.slug, next)}
                      />
                      <span className="tnum font-medium">
                        {formatPaise(line.quantity * book.pricePaise)}
                      </span>
                    </div>
                  </div>
                </li>
              ) : (
                <li
                  key={line.slug}
                  className="flex items-center justify-between gap-4 p-6 text-muted-foreground"
                >
                  <div className="min-w-0">
                    <p className="font-medium">No longer available</p>
                    <p className="truncate text-sm">{line.slug}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(line.slug)}
                    aria-label={`Remove ${line.slug} from cart`}
                  >
                    <IconTrash stroke={1.75} aria-hidden />
                    Remove
                  </Button>
                </li>
              )
            )}
          </ul>
        )}

        {rows.some((row) => row.book) ? (
          <SheetFooter className="gap-3 border-t border-border p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tnum text-lg font-medium">
                {formatPaise(subtotal)}
              </span>
            </div>
            <ButtonLink
              size="lg"
              href="/checkout"
              onClick={() => onOpenChange(false)}
            >
              Checkout
            </ButtonLink>
            <p className="text-center text-xs text-muted-foreground">
              Sign in with your number to place the order. No online payment yet
              - ICT confirms it with you first.
            </p>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
