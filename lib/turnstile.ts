/**
 * Cloudflare Turnstile verification, server-side only. The widget writes a
 * `cf-turnstile-response` field into the form; this is the other half of the
 * handshake. A token is single-use and short-lived, so it is verified on the
 * server action that consumes the submission, never trusted client-side.
 *
 * Env-gated: with no TURNSTILE_SECRET_KEY the check is skipped entirely, so
 * development stays frictionless. For production the key is required -
 * docs/production.md records that.
 */

/** The header a sign-in code request carries its Turnstile token in. */
export const HUMAN_CHECK_HEADER = "x-ict-human-check"

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function verifyTurnstile(
  secret: string,
  token: string,
  ip?: string
): Promise<boolean> {
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set("remoteip", ip)
    const response = await fetch(SITEVERIFY, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return false
    const data = (await response.json()) as { success?: boolean }
    return data.success === true
  } catch {
    /* A network failure on the check is a refusal, not a bypass: the honest
       failure mode for a blocked or expired token is the same "try again"
       the visitor gets, and the handoff path still carries the enquiry. */
    return false
  }
}
