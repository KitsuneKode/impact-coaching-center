"use client"

import { useMutation, useQuery } from "convex/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { api } from "@/convex/_generated/api"
import {
  BUNDLE_QUANTITY_MAX,
  type Language,
  ORDER_SETS_MAX,
} from "@/lib/catalog"
import { useViewer } from "@/hooks/use-viewer"

export type CartLine = {
  slug: string
  language: Language
  quantity: number
  at: number
}

/** Which line: one bundle in one language. */
export type LineKey = Pick<CartLine, "slug" | "language">

const same = (a: LineKey, b: LineKey) =>
  a.slug === b.slug && a.language === b.language

type CartState = {
  lines: CartLine[]
  /**
   * Whose server cart these lines mirror, or null for a guest's own cart.
   * Only a guest cart is merged at sign-in: on a shared phone, the copy of
   * one person's cart must never land in the next person's account.
   */
  owner: string | null
  add: (key: LineKey) => void
  setQuantity: (key: LineKey, quantity: number) => void
  remove: (key: LineKey) => void
  clear: () => void
}

/** A bulk order is a phone call, not a cart. */
export const MAX_QUANTITY = BUNDLE_QUANTITY_MAX

/** Sets the other lines leave room for, under one order's cap. */
const roomFor = (lines: CartLine[], key: LineKey) =>
  ORDER_SETS_MAX -
  lines.filter((l) => !same(l, key)).reduce((n, l) => n + l.quantity, 0)

/** Said once when a change would pass the cap; the cart keeps what fits. */
function sayCapReached() {
  const assamese = document.documentElement.lang.startsWith("as")
  toast(
    assamese
      ? `এটা অৰ্ডাৰত বেছি হ'লে ${ORDER_SETS_MAX}টা ছেট। অধিক লাগিলে ICTলৈ ফোন কৰক।`
      : `One order holds up to ${ORDER_SETS_MAX} sets. For more, call ICT.`,
    { id: "cart-cap" }
  )
}

/**
 * The cart, kept in this browser until sign-in, when `useCartSync` merges it
 * into the server copy (`at` decides which write is newer). From then on this
 * store mirrors the server. It holds no prices; the server prices the order.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      owner: null,
      add: (key) =>
        set((state) => {
          const line = state.lines.find((l) => same(l, key))
          const wanted = (line?.quantity ?? 0) + 1
          const quantity = Math.min(
            MAX_QUANTITY,
            wanted,
            roomFor(state.lines, key)
          )
          // Either cap (five of one set, five in the order) says the same.
          if (quantity < wanted) sayCapReached()
          if (quantity <= 0) return state
          return {
            lines: line
              ? state.lines.map((l) =>
                  same(l, key) ? { ...l, quantity, at: Date.now() } : l
                )
              : [...state.lines, { ...key, quantity, at: Date.now() }],
          }
        }),
      setQuantity: (key, quantity) =>
        set((state) => {
          if (quantity <= 0)
            return { lines: state.lines.filter((l) => !same(l, key)) }
          const allowed = Math.min(
            MAX_QUANTITY,
            quantity,
            roomFor(state.lines, key)
          )
          if (allowed < quantity) sayCapReached()
          if (allowed <= 0) return state
          return {
            lines: state.lines.map((l) =>
              same(l, key) ? { ...l, quantity: allowed, at: Date.now() } : l
            ),
          }
        }),
      remove: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => !same(l, key)) })),
      clear: () => set({ lines: [], owner: null }),
    }),
    {
      name: "ict-cart",
      skipHydration: true,
      // v2: lines became bundle + language. Older carts held single books,
      // which are no longer sold on their own, so they are dropped.
      // v3: lines carry their owner. A v2 cart is treated as a guest's.
      version: 3,
      migrate: (state, version) => {
        if (version < 2) return { lines: [], owner: null }
        const old = state as { lines: CartLine[]; owner?: string | null }
        return { lines: old.lines, owner: old.owner ?? null }
      },
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
    /* persist is absent when storage is unavailable - resolving undefined
       counts as done rather than throwing on a missing rehydrate. */
    void Promise.resolve(useCart.persist?.rehydrate()).then(() =>
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
/** The server cart the mirror last applied, to fall back to on a refusal. */
let lastServerLines: CartLine[] | null = null

export function useCartSync() {
  const viewer = useViewer()
  const serverCart = useQuery(api.carts.myCart)
  const mergeCart = useMutation(api.carts.mergeCart)
  const mergedFor = useRef<string | null>(null)
  const [synced, setSynced] = useState(false)
  const viewerId = viewer?.id ?? null
  /*
   * The merge must not run before rehydration: the persisted guest cart is
   * what the merge is *for*. Merging first would send an empty cart and let
   * the mirror overwrite the recovered lines. `persist` is undefined under
   * SSR (zustand skips attaching the API when storage is unavailable), so
   * the initializer must tolerate it.
   */
  const [hydrated, setHydrated] = useState(
    () => useCart.persist?.hasHydrated() ?? false
  )
  useEffect(() => {
    if (hydrated) return
    void Promise.resolve(useCart.persist?.rehydrate()).then(() =>
      setHydrated(true)
    )
  }, [hydrated])

  /* Signed out (viewer null, not still loading): lines that mirrored
     somebody's account leave with them, so the next person starts clean. */
  useEffect(() => {
    if (!hydrated || viewer !== null) return
    mergedFor.current = null
    lastServerLines = null
    if (useCart.getState().owner !== null) useCart.getState().clear()
  }, [hydrated, viewer])

  // Signed-in only: merge this browser's guest lines into the server cart,
  // once. Lines that mirror another account are not this person's to merge.
  useEffect(() => {
    if (!hydrated || !viewerId || mergedFor.current === viewerId) return
    mergedFor.current = viewerId
    const { lines, owner } = useCart.getState()
    const foreign = owner !== null && owner !== viewerId
    // From here these lines are this person's, merged or not.
    useCart.setState({ lines: foreign ? [] : lines, owner: viewerId })
    mergeCart({ lines: foreign ? [] : lines })
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
    lastServerLines = serverCart.lines
    useCart.setState({ lines: serverCart.lines, owner: viewerId })
  }, [hydrated, viewerId, serverCart, synced])

  return { synced: !viewerId || synced }
}

/**
 * Cart writes routed by sign-in: guests write localStorage; signed-in
 * shoppers write locally (instant) and echo the absolute quantity to the
 * server cart, which other devices then see through the mirror above.
 */
export function useCartActions() {
  const viewer = useViewer()
  const setLine = useMutation(api.carts.setCartLine)
  const authed = viewer != null

  const sync = (key: LineKey, quantity: number) => {
    if (!authed) return
    // A signed-in change is this account's line, never a guest's.
    if (useCart.getState().owner !== viewer.id)
      useCart.setState({ owner: viewer.id })
    void setLine({ ...key, quantity })
      .then((result) => {
        if (result.ok) return
        /* Refused, so the server cart - the one checkout orders - did not
           change and will not re-emit. Showing the refused change would
           promise a set the order will not contain. */
        if (lastServerLines) useCart.setState({ lines: lastServerLines })
        toast.error("That change could not be saved to your cart.")
      })
      .catch(() => {
        toast.error("Cart could not sync - check your connection.")
      })
  }
  const quantityOf = (key: LineKey) =>
    useCart.getState().lines.find((line) => same(line, key))?.quantity ?? 0

  const { add, setQuantity, remove } = useCart.getState()
  return {
    /** True when a copy went in; false when a cap kept it out (and said so). */
    add: (key: LineKey) => {
      const before = quantityOf(key)
      add(key)
      const after = quantityOf(key)
      if (after !== before) sync(key, after)
      return after > before
    },
    setQuantity: (key: LineKey, quantity: number) => {
      setQuantity(key, quantity)
      sync(key, quantityOf(key))
    },
    remove: (key: LineKey) => {
      remove(key)
      sync(key, 0)
    },
  }
}
