/** Every sentence the sign-in server may say to a person. */
export const SEND_REFUSALS = {
  phone:
    "Too many codes requested for this number. Please try again in a few minutes.",
  address:
    "Too many codes requested from this network. Please try later, or call ICT.",
  deployment: "We can't send codes right now. Please call or WhatsApp ICT.",
  inflight: "A code is already on its way. Please wait a moment.",
  not_whatsapp:
    "This number isn't on WhatsApp, so the code can't reach it. Use the number you have WhatsApp on.",
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
