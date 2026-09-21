/**
 * Where a sign-in should send the visitor afterwards.
 *
 * The destination arrives in the query string, so it is attacker-controlled:
 * an open redirect on a sign-in page hands someone a link that looks like
 * this site, asks for a real one-time code, and lands somewhere else. The
 * value is therefore not sanitised but re-derived — resolved against an
 * origin that cannot exist, and kept only if it stayed on that origin.
 *
 * Prefix checks are not enough. A URL parser folds a backslash into a slash
 * for http(s), so `/\evil.com` resolves to `https://evil.com/` while passing
 * any test that only refuses a leading `//`.
 */

/** An origin no real deployment can hold, so a match means "stayed put". */
const BASE = "https://return-path.invalid"

export function safeReturnPath(
  value: string | string[] | undefined,
  fallback = "/"
) {
  /*
   * A repeated `?next=` arrives as an array. Refused rather than resolved,
   * because the only way a second one appears is someone appending it to a
   * link that already had the first: there is no correct choice between
   * them, and guessing is how smuggling works.
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
