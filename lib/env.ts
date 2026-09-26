/** Read an environment variable that the code cannot work without. */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} must be set on this deployment. Refusing to continue with it missing, because the failure it causes downstream does not name the variable.`
    )
  }
  return value
}

/** The origins allowed to call the auth routes, from a comma-separated list. */
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
