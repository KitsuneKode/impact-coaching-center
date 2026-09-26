/**
 * Every sentence the sign-in server may say to a person.
 *
 * Shared by the server (lib/phone-auth.ts, which throws them) and the client
 * (lib/phone-auth-flow.ts, which shows them). The client shows a server
 * message only if it is one of these; anything else - a library's own error
 * such as "Invalid origin", a stack detail, a misconfiguration - becomes a
 * plain sentence instead. Internals never reach the screen.
 */
export const SEND_REFUSALS = {
  phone:
    "Too many codes requested for this number. Please try again in a few minutes.",
  address:
    "Too many codes requested from this network. Please try later, or call ICT.",
  deployment: "We can't send codes right now. Please call or WhatsApp ICT.",
  inflight: "A code is already on its way. Please wait a moment.",
} as const

export const WHATSAPP_ONLY =
  "Sign-in is a WhatsApp code to your mobile number. There is no email or password sign-in."

export const SPEAKABLE_SERVER_MESSAGES: ReadonlySet<string> = new Set([
  ...Object.values(SEND_REFUSALS),
  WHATSAPP_ONLY,
])

/** What a person sees when the server said something we did not write. */
export const GENERIC_AUTH_FAILURE =
  "Couldn't log you in. Please try again, or call ICT."
