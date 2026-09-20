/**
 * The visitor's network address, taken from a forwarded header.
 *
 * Only ever used as a rate-limit bucket, never stored on a Person and never
 * shown to anyone. It is validated rather than trusted: the value reaches us
 * through a header the client can set, so an unchecked string would both let a
 * caller mint a fresh bucket per request and write an unbounded row per made-up
 * value into the counter table.
 *
 * Validation bounds the damage; it does not make the value authentic. The
 * leftmost entry is the visitor only on a host that overwrites this header
 * rather than appending to it. This project has not chosen its production host
 * yet, so confirm that behaviour before relying on the per-address ceiling —
 * the per-number ceiling is the backstop that does not depend on it.
 */

/** Longest textual IPv6 address, including an IPv4-mapped tail. */
const MAX_LENGTH = 45

/** No leading zeros: `01.2.3.4` and `1.2.3.4` must not be separate buckets. */
const IPV4 = /^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/

function isIpv4(value: string) {
  return (
    IPV4.test(value) && value.split(".").every((part) => Number(part) <= 255)
  )
}

/**
 * Canonical IPv6 text, or null.
 *
 * Canonicalising is the point, not a bonus. `2001:db8::1`, `2001:0db8::1` and
 * `2001:DB8:0:0:0:0:0:1` are one address written three ways; validating
 * without normalising would give each its own rate-limit bucket and let a
 * caller mint as many as they can spell. The IPv4 branch guards exactly this
 * with its no-leading-zeros rule, and IPv6 needs the same care.
 *
 * `URL` does the normalising: `hostname` comes back as `[2001:db8::1]`.
 */
function canonicalIpv6(value: string) {
  if (!value.includes(":")) return null
  const url = URL.parse(`http://[${value}]`)
  const host = url?.hostname
  return host?.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : null
}

export function parseClientAddress(
  forwarded: string | null | undefined
): string | null {
  if (!forwarded) return null
  const first = forwarded.split(",")[0]?.trim()
  if (!first || first.length > MAX_LENGTH) return null
  if (isIpv4(first)) return first
  return canonicalIpv6(first)
}
