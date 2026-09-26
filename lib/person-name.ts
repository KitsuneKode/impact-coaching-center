/** Long enough for any real name, short enough to refuse an essay. */
export const NAME_MAX = 120

/**
 * A name as a person typed it, made safe to store, or `null` if it is not a
 * name.
 *
 * One field, not first and last: names in Assam do not reliably split that
 * way (single names, surnames first, initials), and the database stores one
 * string anyway. So this only tidies - Unicode-normalised, invisible and
 * control characters removed, runs of spaces collapsed - and refuses what is
 * clearly not a name: empty, too long, or with no letter at all (a pasted
 * phone number is the common case). Any script's letters count, so Assamese
 * and Bengali names pass.
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
