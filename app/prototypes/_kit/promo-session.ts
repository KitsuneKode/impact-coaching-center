/** When the offers pop-up appears on a home page, and how a visitor brings it back. */
export const POPUP_DELAY_MS = 6_000
const REPLAY_DELAY_MS = 600

/** One flag per design, so seeing the pop-up on one does not hide it on the next. */
export const seenKey = (base: string) => `ict-proto-promo-seen:${base}`
const REPLAY = "ict-proto-promo-replay"

/** Forget what was seen on this design and ask for the pop-up to come straight back. */
export function replayOffers(base: string) {
  try {
    sessionStorage.removeItem(seenKey(base))
    sessionStorage.setItem(REPLAY, "1")
  } catch {}
  window.location.reload()
}

/** How long to wait before opening, or null if it was already seen. */
export function popupDelay(base: string): number | null {
  try {
    if (sessionStorage.getItem(REPLAY)) {
      sessionStorage.removeItem(REPLAY)
      return REPLAY_DELAY_MS
    }
    if (sessionStorage.getItem(seenKey(base))) return null
  } catch {}
  return POPUP_DELAY_MS
}
