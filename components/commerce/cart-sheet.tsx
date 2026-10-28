"use client"

import { useTranslations } from "next-intl"

import { IconArrowRight, IconLock, IconShoppingBag } from "@tabler/icons-react"
import { useQuery } from "convex/react"

import {
  cartRows,
  cartTotals,
  CartLines,
} from "@/components/commerce/cart-lines"
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
import { useEffect } from "react"
import { toast } from "sonner"

import { CART_ADDED_TOAST, useCart, useCartHydrated } from "@/lib/cart-store"
import { formatPaise } from "@/lib/money"

/** How many copies the cart holds, once the saved cart has loaded. */
export function useCartCount() {
  const hydrated = useCartHydrated()
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  return hydrated ? count : 0
}

/** The cart button with its count, shown once the saved cart has loaded. */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("Shop")
  const shown = useCartCount()
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpen}
      aria-label={t("cartLabel", { count: shown })}
    >
      <IconShoppingBag stroke={1.75} aria-hidden />
      {t("cart")}
      <span
        key={shown}
        data-swap
        className="tnum min-w-5 rounded-full bg-primary px-1.5 text-center text-[0.6875rem] leading-5 text-primary-foreground"
      >
        {shown}
      </span>
    </Button>
  )
}

/**
 * The cart as a side sheet, on every page: a look at what is in it, and
 * changes to it, without leaving the page. Checkout is the full cart, with
 * delivery and payment; the sheet hands over to it. Prices are the
 * published ones; the server prices the real order.
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
  /* No subscription while the sheet is closed: a hidden cart should not keep
     a live catalogue query open on every page it is mounted on. */
  const bundles = useQuery(api.catalog.bundles, open ? {} : "skip")
  const shop = useQuery(api.settings.shop, open ? {} : "skip")
  const loading = bundles === undefined && lines.length > 0
  const rows = cartRows(lines, bundles)
  const totals = cartTotals(rows)
  const close = () => onOpenChange(false)
  /* The "added" toast offers this sheet; once it is open, the toast only
     covers its checkout button. */
  useEffect(() => {
    if (open) toast.dismiss(CART_ADDED_TOAST)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        // The primitive sizes a right sheet with the same variant; a sliver
        // of page stays on phones, to tap out.
        className="gap-0 text-sm data-[side=right]:w-[92%] data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="flex items-baseline gap-2 text-lg font-semibold">
            {t("yourCart")}
            {totals.sets ? (
              <span className="tnum text-sm font-normal text-muted-foreground">
                {t("setCount", { count: totals.sets })}
              </span>
            ) : null}
          </SheetTitle>
          <SheetDescription>
            {loading
              ? t("checking")
              : rows.length === 0
                ? t("empty")
                : shop
                  ? t("deliveryCharge", {
                      price: formatPaise(shop.shippingPaise),
                    })
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
          <div className="grid flex-1 place-content-center justify-items-center gap-4 p-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <IconShoppingBag aria-hidden size={24} stroke={1.5} />
            </span>
            <p className="max-w-[28ch] text-muted-foreground">
              {t("emptyNote")}
            </p>
            <ButtonLink href="/books" variant="secondary" onClick={close}>
              {t("browseSets")}
            </ButtonLink>
          </div>
        ) : (
          <CartLines
            rows={rows}
            onNavigate={close}
            className="flex-1 overflow-y-auto px-6"
          />
        )}

        {totals.sets ? (
          <SheetFooter className="gap-3 border-t border-border p-6">
            <dl className="grid gap-1">
              <div className="flex items-baseline justify-between">
                <dt className="text-muted-foreground">{t("subtotal")}</dt>
                <dd className="tnum text-lg font-semibold">
                  {formatPaise(totals.itemsPaise)}
                </dd>
              </div>
              {totals.savedPaise ? (
                <div className="flex items-baseline justify-between text-verified">
                  <dt>{t("youSave")}</dt>
                  <dd className="tnum">{formatPaise(totals.savedPaise)}</dd>
                </div>
              ) : null}
            </dl>
            <ButtonLink size="lg" href="/checkout" onClick={close}>
              <IconLock aria-hidden stroke={1.75} />
              {t("checkoutSecure")}
              <IconArrowRight aria-hidden stroke={2} />
            </ButtonLink>
            <p className="text-center text-xs text-pretty text-muted-foreground">
              {totals.blocked ? t("blockedNote") : t("checkoutNote")}
            </p>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
