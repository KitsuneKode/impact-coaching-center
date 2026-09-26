"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartLine = { slug: string; quantity: number }

type CartState = {
  lines: CartLine[]
  add: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  remove: (slug: string) => void
  clear: () => void
}

/** A single copy caps at this; a bulk order is a phone call, not a cart. */
export const MAX_QUANTITY = 10

/**
 * The cart, kept in this browser until sign-in (the commerce plan merges it
 * server-side then). It stores slugs and quantities only; prices are always
 * looked up, and the server will price the real order.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (slug) =>
        set((state) => {
          const line = state.lines.find((l) => l.slug === slug)
          return {
            lines: line
              ? state.lines.map((l) =>
                  l.slug === slug
                    ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + 1) }
                    : l
                )
              : [...state.lines, { slug, quantity: 1 }],
          }
        }),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.slug !== slug)
              : state.lines.map((l) =>
                  l.slug === slug
                    ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) }
                    : l
                ),
        })),
      remove: (slug) =>
        set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "ict-cart", skipHydration: true }
  )
)

/**
 * Loads the saved cart after mount and reports when it has, so the server
 * render and the first client render agree (an empty cart) and nothing flashes.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    void Promise.resolve(useCart.persist.rehydrate()).then(() =>
      setHydrated(true)
    )
  }, [])
  return hydrated
}
