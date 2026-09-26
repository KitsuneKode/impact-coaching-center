/** Where a sign-in should send the visitor afterwards. */

/** An origin no real deployment can hold, so a match means "stayed put". */
const BASE = "https://return-path.invalid"

export function safeReturnPath(
  value: string | string[] | undefined,
  fallback = "/"
) {
  /*
   * A repeated `?next=` arrives as an array. Refused rather than resolved,
   * because the only way a second one appears is someone appending it to a link
   * that already had the first:
   */
  if (typeof value !== "string") return fallback
  if (!value.startsWith("/")) return fallback

  let resolved: URL
  try {
    resolved = new URL(value, BASE)
  } catch {
    return fallback
  }
  if (resolved.origin !== BASE) return fallback

  // Returned normalised rather than as given, so what the router receives is
  // what was actually checked.
  return `${resolved.pathname}${resolved.search}${resolved.hash}`
}
