/** Long enough for any real name, short enough to refuse an essay. */
export const NAME_MAX = 120

/**
 * A name as a person typed it, made safe to store, or `null` if it is not a
 * name.
 */
export function cleanName(input: string): string | null {
  const name = input
    .normalize("NFC")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  if (!name || name.length > NAME_MAX) return null
  if (!/\p{L}/u.test(name)) return null
  return name
}
