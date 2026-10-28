"use client"

import { IconShoppingBag } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { useCartCount } from "@/components/commerce/cart-sheet"
import { useShopMode } from "@/components/commerce/order-on-whatsapp"
import { useOpenCartIfShop } from "@/components/commerce/shop-shell"
import { Link, usePathname } from "@/i18n/navigation"

/**
 * The cart in the header, on every page, once it holds something: it opens
 * the cart sheet in place, so a look at the cart never costs the page the
 * shopper was on. On checkout, which is the cart, it is not shown twice.
 * Hidden while empty and while sets order on WhatsApp.
 */
export function HeaderCart() {
  const t = useTranslations("Shop")
  const count = useCartCount()
  const online = useShopMode() === "online"
  const openCart = useOpenCartIfShop()
  const onCheckout = usePathname() === "/checkout"
  if (count === 0 || !online || onCheckout) return null
  const badge = (
    <>
      <IconShoppingBag aria-hidden size={19} stroke={1.75} />
      {/* Keyed by the count, so each new item pops the badge. */}
      <span key={count} aria-hidden data-site-cart-count className="tnum">
        {count}
      </span>
    </>
  )
  // No shell (a bare preview without Convex): the cart page instead.
  if (!openCart)
    return (
      <Link
        href="/checkout"
        data-site-cart
        data-arrive
        data-press
        aria-label={t("cartLabel", { count })}
      >
        {badge}
      </Link>
    )
  return (
    <button
      type="button"
      onClick={openCart}
      data-site-cart
      data-arrive
      data-press
      aria-haspopup="dialog"
      aria-label={t("cartLabel", { count })}
    >
      {badge}
    </button>
  )
}
