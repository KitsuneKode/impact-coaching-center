"use client"

import { useTranslations } from "next-intl"

import { IconShoppingBag, IconTrash } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { Link } from "@/i18n/navigation"

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
import { inLanguage, type Language } from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

/** The cart button with its count, shown once the saved cart has loaded. */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("Shop")
  const hydrated = useCartHydrated()
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  const shown = hydrated ? count : 0
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpen}
      aria-label={t("cartLabel", { count: shown })}
    >
      <IconShoppingBag stroke={1.75} aria-hidden />
      {t("cart")}
      <span className="tnum min-w-5 rounded-full bg-primary px-1.5 text-center text-[0.6875rem] leading-5 text-primary-foreground">
        {shown}
      </span>
    </Button>
  )
}

/**
 * The cart as a side sheet, so the shopper never leaves the set they were
 * looking at. Prices are the published ones; the server prices the real order.
 */
export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("Shop")
  const lines = useCart((s) => s.lines)
  const { setQuantity, remove } = useCartActions()
  /* No subscription while the sheet is closed: a hidden cart should not keep
     a live catalogue query open on every page it is mounted on. */
  const bundles = useQuery(api.catalog.bundles, open ? {} : "skip")
  const loading = bundles === undefined && lines.length > 0

  /* A line whose set is gone or switched off stays as a dead row with a
     remove control, so the badge never counts something nobody can clear. */
  const rows = lines.map((line) => {
    const bundle = bundles?.find((b) => b.slug === line.slug)
    const live = bundle?.variants[line.language].available ? bundle : null
    return { line, bundle: live }
  })
  const subtotal = rows.reduce(
    (sum, { line, bundle }) =>
      sum + line.quantity * (bundle?.variants[line.language].pricePaise ?? 0),
    0
  )
  const setName = (language: Language) =>
    language === "as" ? t("assameseSet") : t("englishSet")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 text-sm sm:max-w-md">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="text-lg font-medium">
            {t("yourCart")}
          </SheetTitle>
          <SheetDescription>
            {loading
              ? t("checking")
              : rows.length === 0
                ? t("empty")
                : t("deliveryNote")}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div aria-hidden className="grid flex-1 content-start gap-4 p-6">
            {lines.map((line) => (
              <Skeleton
                key={`${line.slug}:${line.language}`}
                className="h-24 w-full"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="grid flex-1 place-content-center gap-4 p-6 text-center">
            <p className="text-muted-foreground">{t("emptyNote")}</p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              {t("keepBrowsing")}
            </Button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {rows.map(({ line, bundle }) => {
              const key = `${line.slug}:${line.language}`
              if (!bundle)
                return (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-4 p-6 text-muted-foreground"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{t("unavailable")}</p>
                      <p className="truncate text-sm">{line.slug}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(line)}
                      aria-label={t("removeFromCart", { slug: line.slug })}
                    >
                      <IconTrash stroke={1.75} aria-hidden />
                      {t("remove")}
                    </Button>
                  </li>
                )
              const title = inLanguage(bundle.title, line.language)
              const price = bundle.variants[line.language].pricePaise
              const first = bundle.books[0]?.editions[line.language]
              return (
                <li key={key} className="grid grid-cols-[64px_1fr] gap-4 p-6">
                  <BookCover title={title} cover={first?.cover} size="sm" />
                  <div className="grid min-w-0 gap-3">
                    <div className="min-w-0 break-words">
                      <Link
                        href={`/books/${bundle.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="font-medium hover:underline"
                      >
                        {title}
                      </Link>
                      <p className="tnum text-muted-foreground">
                        {setName(line.language)} ·{" "}
                        {t("each", { price: formatPaise(price) })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        label={t("setOf", {
                          set: title,
                          language: setName(line.language),
                        })}
                        onChange={(next) => setQuantity(line, next)}
                      />
                      <span className="tnum font-medium">
                        {formatPaise(line.quantity * price)}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {rows.some((row) => row.bundle) ? (
          <SheetFooter className="gap-3 border-t border-border p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="tnum text-lg font-medium">
                {formatPaise(subtotal)}
              </span>
            </div>
            <ButtonLink
              size="lg"
              href="/checkout"
              onClick={() => onOpenChange(false)}
            >
              {t("checkout")}
            </ButtonLink>
            <p className="text-center text-xs text-muted-foreground">
              {t("checkoutNote")}
            </p>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
