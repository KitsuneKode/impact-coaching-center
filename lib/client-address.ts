/** The visitor's network address, taken from a forwarded header. */

/** Longest textual IPv6 address, including an IPv4-mapped tail. */
const MAX_LENGTH = 45

/** No leading zeros: `01.2.3.4` and `1.2.3.4` must not be separate buckets. */
const IPV4 = /^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/

function isIpv4(value: string) {
  return (
    IPV4.test(value) && value.split(".").every((part) => Number(part) <= 255)
  )
}

/** Canonical IPv6 text, or null. */
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
