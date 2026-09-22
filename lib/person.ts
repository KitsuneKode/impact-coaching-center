/**
 * Initials, or null when there is no name to take them from.
 *
 * Null rather than a fallback string on purpose. An earlier version returned
 * the last two digits of the phone number, which put a round badge reading
 * "45" in the header - a fragment of somebody's phone number presented as if
 * it were a monogram. Callers render a person mark instead, which says "we do
 * not know your name yet" and is true.
 *
 * First and last only. A three-part name gives two letters, not three, because
 * the badge is a fixed circle and a third letter shrinks the type past
 * legibility on the phones this audience uses.
 */
export function initials(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase() || null
}
