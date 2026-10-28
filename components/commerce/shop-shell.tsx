"use client"

import { useTranslations } from "next-intl"

import { createContext, useContext, useState, type ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { CartButton, CartSheet } from "@/components/commerce/cart-sheet"
import { useCartSync } from "@/lib/cart-store"
import { useShopMode } from "@/components/commerce/order-on-whatsapp"

const OpenCart = createContext<(() => void) | null>(null)
/* True until a signed-in shopper's guest cart has been merged. */
const Synced = createContext(true)

/** Opens the cart sheet from anywhere on the site; outside the shell, null. */
export const useOpenCartIfShop = () => useContext(OpenCart)
/** Opens the cart sheet from anywhere on the site. */
export const useOpenCart = () => useContext(OpenCart) ?? (() => {})
/**
 * False while a signed-in shopper's guest cart is still being merged into
 * the server copy - the one checkout pays for - so checkout can wait.
 */
export const useCartSynced = () => useContext(Synced)

/**
 * The cart sheet and the cart's sign-in sync, once for the whole public
 * site (SiteChrome), so the header's cart opens the same sheet on any page
 * and there is only ever one merge. Changing the sync state re-renders this
 * shell, not the page: `children` keep their identity.
 */
export function ShopShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  // One function for the life of the shell, so opening the cart does not
  // re-render every "Add" button that reads it.
  const [openCart] = useState(() => () => setCartOpen(true))
  return (
    <OpenCart.Provider value={openCart}>
      {convexConfigured ? (
        <SyncedShop open={cartOpen} onOpenChange={setCartOpen}>
          {children}
        </SyncedShop>
      ) : (
        children
      )}
    </OpenCart.Provider>
  )
}

function SyncedShop({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  /* Sign-in merges the browser cart into the Person's server copy and keeps
     the local store mirroring it. */
  const { synced } = useCartSync()
  return (
    <Synced.Provider value={synced}>
      {children}
      <CartSheet open={open} onOpenChange={onOpenChange} />
    </Synced.Provider>
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
