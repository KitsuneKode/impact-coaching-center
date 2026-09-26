"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { CartButton, CartSheet } from "@/components/commerce/cart-sheet"

const OpenCart = createContext<() => void>(() => {})

/** Opens the cart sheet from anywhere inside the shop. */
export const useOpenCart = () => useContext(OpenCart)

/** The cart sheet, reachable from every page under /books. */
export function ShopShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <OpenCart.Provider value={() => setCartOpen(true)}>
      {children}
      {convexConfigured ? (
        <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      ) : null}
    </OpenCart.Provider>
  )
}

/** The cart button, wired to the shop's sheet. */
export function ShopCartButton() {
  return <CartButton onOpen={useOpenCart()} />
}

/** Said plainly while the catalogue is placeholder titles. */
export function SampleNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-control border border-highlight bg-highlight/20 px-4 py-2.5 text-sm">
      <span className="font-medium">Sample.</span> {children}
    </p>
  )
}
