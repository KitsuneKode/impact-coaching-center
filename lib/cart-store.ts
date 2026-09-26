"use client"

import { useMutation, useQuery } from "convex/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { api } from "@/convex/_generated/api"

export type CartLine = { slug: string; quantity: number; at: number }

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
 * The cart, kept in this browser until sign-in, when `useCartSync` merges it
 * into the server copy (`at` decides which write is newer). From then on this
 * store mirrors the server: reads are local, writes are echoed by mutation.
 * It stores slugs and quantities only; prices are always looked up, and the
 * server prices the real order from `books`.
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
                    ? {
                        ...l,
                        quantity: Math.min(MAX_QUANTITY, l.quantity + 1),
                        at: Date.now(),
                      }
                    : l
                )
              : [...state.lines, { slug, quantity: 1, at: Date.now() }],
          }
        }),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.slug !== slug)
              : state.lines.map((l) =>
                  l.slug === slug
                    ? {
                        ...l,
                        quantity: Math.min(MAX_QUANTITY, quantity),
                        at: Date.now(),
                      }
                    : l
                ),
        })),
      remove: (slug) =>
        set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "ict-cart",
      skipHydration: true,
      /*
       * v0 carts carried {slug, quantity} with no timestamp. Upgrading in
       * place with at:0 makes them the oldest copy, so a server line always
       * wins the merge - anything else would let a stale ghost overwrite a
       * deliberate server-side change.
       */
      version: 1,
      migrate: (state) => ({
        lines: (
          (
            state as {
              lines?: { slug: string; quantity: number; at?: number }[]
            }
          ).lines ?? []
        )
          .filter((line) => line.slug && line.quantity > 0)
          .map((line) => ({
            slug: line.slug,
            quantity: Math.min(MAX_QUANTITY, Math.floor(line.quantity)),
            at: line.at ?? 0,
          })),
      }),
    }
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

/**
 * Sign-in handoff: merge the browser cart into the Person's server cart once,
 * then mirror the server copy back down so every authed device sees the same
 * cart. Order matters: the merge must read local state before the mirror can
 * overwrite it, so this hook's merge effect is declared before the mirror
 * effect below - and the mirror only applies what arrived *after* the merge
 * commits, because Convex publishes mutation results before query updates.
 */
export function useCartSync() {
  const viewer = useQuery(api.auth.getCurrentPerson)
  const serverCart = useQuery(api.carts.myCart)
  const mergeCart = useMutation(api.carts.mergeCart)
  const mergedFor = useRef<string | null>(null)
  const [synced, setSynced] = useState(false)
  const viewerId = viewer?.id ?? null
  /*
   * The merge must not run before rehydration: the persisted guest cart is
   * what the merge is *for*. Merging first would send an empty cart and let
   * the mirror overwrite the recovered lines.
   */
  const [hydrated, setHydrated] = useState(useCart.persist.hasHydrated())
  useEffect(() => {
    if (hydrated) return
    void Promise.resolve(useCart.persist.rehydrate()).then(() =>
      setHydrated(true)
    )
  }, [hydrated])

  // Signed-in only: merge this browser's lines into the server cart, once.
  useEffect(() => {
    if (!hydrated || !viewerId || mergedFor.current === viewerId) return
    mergedFor.current = viewerId
    mergeCart({ lines: useCart.getState().lines })
      .then((result) => {
        if (!result.ok) toast.error("Your saved cart could not be merged.")
      })
      .catch(() => {
        toast.error("Your saved cart could not be merged.")
      })
      /* Synced either way: a failed merge keeps the server cart, which is
         what checkout orders from anyway - refusing to proceed would only
         strand a shopper whose server cart was already correct. */
      .finally(() => setSynced(true))
  }, [hydrated, viewerId, mergeCart])

  // Server → local mirror. Skipped for guests and until the merge landed.
  useEffect(() => {
    if (!hydrated || !viewerId || !serverCart) return
    if (!synced && useCart.getState().lines.length > 0) return
    useCart.setState({ lines: serverCart.lines })
  }, [hydrated, viewerId, serverCart, synced])

  return { synced: !viewerId || synced }
}

/**
 * Cart writes routed by sign-in: guests write localStorage; signed-in
 * shoppers write locally (instant) and echo the absolute quantity to the
 * server cart, which other devices then see through the mirror above.
 */
export function useCartActions() {
  const viewer = useQuery(api.auth.getCurrentPerson)
  const setLine = useMutation(api.carts.setCartLine)
  const authed = viewer != null

  const push = (slug: string) => {
    if (!authed) return
    const quantity =
      useCart.getState().lines.find((line) => line.slug === slug)?.quantity ?? 0
    void setLine({ slug, quantity }).catch(() => {
      toast.error("Cart could not sync - check your connection.")
    })
  }

  const { add, setQuantity, remove } = useCart.getState()
  return {
    add: (slug: string) => {
      add(slug)
      push(slug)
    },
    setQuantity: (slug: string, quantity: number) => {
      setQuantity(slug, quantity)
      push(slug)
    },
    remove: (slug: string) => {
      remove(slug)
      if (authed)
        void setLine({ slug, quantity: 0 }).catch(() => {
          toast.error("Cart could not sync - check your connection.")
        })
    },
  }
}
