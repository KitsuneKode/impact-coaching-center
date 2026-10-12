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
  /* Walk right to left: every trusted proxy appends the address it actually
     saw, so the last well-formed entry is the one the edge vouches for.
     Entries further left were supplied by the client and can be anything the
     sender invented - taking the leftmost made the rate-limit bucket itself
     attacker-chosen. */
  const parts = forwarded.split(",")
  for (let i = parts.length - 1; i >= 0; i--) {
    const candidate = parts[i]?.trim()
    if (!candidate || candidate.length > MAX_LENGTH) continue
    if (isIpv4(candidate)) return candidate
    const ipv6 = canonicalIpv6(candidate)
    if (ipv6) return ipv6
  }
  return null
}
