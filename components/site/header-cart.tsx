"use client"

import { IconShoppingBag } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { useShopMode } from "@/components/commerce/order-on-whatsapp"
import { Link } from "@/i18n/navigation"
import { useCart, useCartHydrated } from "@/lib/cart-store"

/**
 * The cart in the header, on every page, once it holds something: the way
 * back to checkout from wherever the shopper wandered. Hidden while empty
 * (nothing to go back to) and while sets order on WhatsApp.
 */
export function HeaderCart() {
  const t = useTranslations("Shop")
  const hydrated = useCartHydrated()
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  const online = useShopMode() === "online"
  if (!hydrated || count === 0 || !online) return null
  return (
    <Link
      href="/checkout"
      data-site-cart
      data-arrive
      data-press
      aria-label={t("cartLabel", { count })}
    >
      <IconShoppingBag aria-hidden size={19} stroke={1.75} />
      {/* Keyed by the count, so each new item pops the badge. */}
      <span key={count} aria-hidden data-site-cart-count className="tnum">
        {count}
      </span>
    </Link>
  )
}
