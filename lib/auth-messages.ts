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
    "Too many WhatsApp codes were requested for this number. Wait a few minutes and try again.",
  address:
    "Too many WhatsApp codes were requested from this internet connection. Wait a while, or call ICT instead.",
  deployment:
    "We cannot send WhatsApp codes at the moment. Please call or message ICT and they will help you directly.",
  inflight:
    "A WhatsApp code is already on its way to this number. Wait a moment and try again.",
} as const

export const WHATSAPP_ONLY =
  "Sign-in is a WhatsApp code to your mobile number. There is no email or password sign-in."

export const SPEAKABLE_SERVER_MESSAGES: ReadonlySet<string> = new Set([
  ...Object.values(SEND_REFUSALS),
  WHATSAPP_ONLY,
])

/** What a person sees when the server said something we did not write. */
export const GENERIC_AUTH_FAILURE =
  "We could not sign you in just now. Try again in a minute, or call ICT and they will help."
