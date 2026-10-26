/**
 * Human order references: `ICT-7K3F9`. Crockford base32 - no I, L, O or U,
 * so nothing read aloud over the phone can be mistaken for a 1 or a 0.
 * Five characters is ~33.5 million values; the database still checks for a
 * collision before one is used (convex/orders.ts `allocateOrderReference`),
 * because the maths only bounds how often it happens, not that it cannot.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

export function newOrderReference(random: () => number = Math.random): string {
  let code = ""
  for (let i = 0; i < 5; i++) code += ALPHABET[Math.floor(random() * 32)]
  return `ICT-${code}`
}

/** Whether a string has the reference shape, for validating caller input. */
export function isOrderReference(value: string): boolean {
  return /^ICT-[0-9A-HJKMNP-TV-Z]{5}$/.test(value)
}

/** "ict 7k3f9", "7K3F9" or "ICT-7K3F9" all mean the same order. */
export function normaliseReference(raw: string) {
  const code = raw
    .trim()
    .toUpperCase()
    .replace(/^ICT[\s-]*/, "")
  return `ICT-${code}`
}
