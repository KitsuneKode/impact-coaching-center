/**
 * Read an environment variable that the code cannot work without.
 *
 * The alternative in this codebase was a non-null assertion, which turns a
 * missing variable into `undefined` flowing onward: CORS allowlists that
 * silently contain nothing, Convex URLs that resolve to "undefined", and an
 * opaque 500 at request time instead of a named failure at startup. Name the
 * variable, fail where it is missing.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} must be set on this deployment. Refusing to continue with it missing, because the failure it causes downstream does not name the variable.`
    )
  }
  return value
}

/**
 * The origins allowed to call the auth routes, from a comma-separated list.
 *
 * One deployment legitimately serves several origins - local development and
 * a rotating preview URL both talk to the same Convex dev deployment - and a
 * single-origin setting forces a choice between them. Empty entries are
 * dropped so a trailing comma cannot inject an empty origin into the
 * allowlist, which would be a trust hole rather than a typo.
 */
export function parseTrustedOrigins(value: string): string[] {
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)

  if (origins.length === 0) {
    throw new Error(
      "SITE_URL contained no usable origin. Refusing an empty trusted-origin allowlist."
    )
  }
  return origins
}

/**
 * Constant-time equality against a secret, so the secret cannot be recovered
 * by timing how long a comparison takes to fail.
 *
 * Argument order matters: the loop runs exactly `secret`'s length, so the work
 * done does not depend on anything the caller controls. An earlier version
 * looped to `Math.max(candidate.length, secret.length)`, which meant a caller
 * lengthening their input could watch for the point where timing started to
 * grow and read off the secret's length - the very leak the length fold below
 * is there to prevent.
 *
 * Length is folded into the accumulator rather than short-circuiting, for the
 * same reason: returning early on a length mismatch leaks it too.
 */
export function secretsMatch(candidate: string, secret: string): boolean {
  const encoder = new TextEncoder()
  const given = encoder.encode(candidate)
  const expected = encoder.encode(secret)
  let diff = given.length ^ expected.length
  for (let i = 0; i < expected.length; i++)
    diff |= (given[i] ?? 0) ^ (expected[i] ?? 0)
  return diff === 0
}
