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

function isIpv6(value: string) {
  // Bracket form is what the URL parser accepts, and it rejects zone ids and
  // trailing junk that a hand-written pattern tends to let through.
  return value.includes(":") && URL.canParse(`http://[${value}]`)
}

export function parseClientAddress(
  forwarded: string | null | undefined
): string | null {
  if (!forwarded) return null
  const first = forwarded.split(",")[0]?.trim()
  if (!first || first.length > MAX_LENGTH) return null
  return isIpv4(first) || isIpv6(first) ? first : null
}
