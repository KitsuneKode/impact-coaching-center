"use client"

import { IconShoppingBag } from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"

import { BookCover } from "@/components/commerce/book-cover"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart, useCartHydrated } from "@/lib/cart-store"
import { formatPaise } from "@/lib/money"
import { previewBookBySlug } from "@/lib/preview-catalogue"

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
      <IconShoppingBag stroke={1.75} />
      Cart
      <span className="tnum min-w-5 rounded-full bg-primary px-1.5 text-center text-[0.6875rem] leading-5 text-primary-foreground">
        {shown}
      </span>
    </Button>
  )
}

/**
 * The cart as a side sheet, so the shopper never leaves the book they were
 * reading. Checkout is a labelled prototype until payments are live.
 */
export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const lines = useCart((s) => s.lines)
  const setQuantity = useCart((s) => s.setQuantity)

  const rows = lines.flatMap((line) => {
    const book = previewBookBySlug(line.slug)
    return book ? [{ line, book }] : []
  })
  const subtotal = rows.reduce(
    (sum, { line, book }) => sum + line.quantity * book.pricePaise,
    0
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 text-sm sm:max-w-md">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="text-lg font-medium">Your cart</SheetTitle>
          <SheetDescription>
            {rows.length === 0
              ? "Nothing here yet."
              : "One delivery charge for the whole order, shown at checkout."}
          </SheetDescription>
        </SheetHeader>

        {rows.length === 0 ? (
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
            {rows.map(({ line, book }) => (
              <li
                key={book.slug}
                className="grid grid-cols-[64px_1fr] gap-4 p-6"
              >
                <BookCover title={book.title} tone={book.tone} size="sm" />
                <div className="grid gap-3">
                  <div>
                    <Link
                      href={`/preview/books/${book.slug}`}
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
            ))}
          </ul>
        )}

        {rows.length > 0 ? (
          <SheetFooter className="gap-3 border-t border-border p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tnum text-lg font-medium">
                {formatPaise(subtotal)}
              </span>
            </div>
            <Button
              size="lg"
              onClick={() =>
                toast("Checkout is next", {
                  description:
                    "Payments open once ICT's Razorpay account is approved. Your cart stays saved.",
                })
              }
            >
              Checkout
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
