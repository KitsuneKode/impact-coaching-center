"use client"

import { useTranslations } from "next-intl"

import { createContext, useContext, useState, type ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { CartButton, CartSheet } from "@/components/commerce/cart-sheet"
import { useCartSync } from "@/lib/cart-store"
import { useShopMode } from "@/components/commerce/order-on-whatsapp"

const OpenCart = createContext<(() => void) | null>(null)

/** Opens the cart sheet from anywhere inside the shop; outside it, null. */
export const useOpenCartIfShop = () => useContext(OpenCart)
/** Opens the cart sheet from anywhere inside the shop. */
export const useOpenCart = () => useContext(OpenCart) ?? (() => {})

/* Sign-in merges the browser cart into the Person's server copy and keeps
   the local store mirroring it. Exists only to own the hook. */
function CartSync() {
  useCartSync()
  return null
}

/** The cart sheet, reachable from every page under /books. */
export function ShopShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  // One function for the life of the shell, so opening the cart does not
  // re-render every "Add" button that reads it.
  const [openCart] = useState(() => () => setCartOpen(true))
  return (
    <OpenCart.Provider value={openCart}>
      {children}
      {convexConfigured ? (
        <>
          <CartSync />
          <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
        </>
      ) : null}
    </OpenCart.Provider>
  )
}

/** The cart button, wired to the shop's sheet. */
export function ShopCartButton() {
  const onOpen = useOpenCart()
  // Ordering on WhatsApp: nothing goes in a cart, so there is none to show.
  if (useShopMode() === "whatsapp") return null
  return <CartButton onOpen={onOpen} />
}

/** Said plainly while the catalogue is placeholder titles. */
export function SampleNotice({ children }: { children: ReactNode }) {
  const t = useTranslations("Shop")
  return (
    <p className="rounded-control border border-highlight bg-highlight/20 px-4 py-2.5 text-sm">
      <span className="font-medium">{t("sampleTag")}</span> {children}
    </p>
  )
}
