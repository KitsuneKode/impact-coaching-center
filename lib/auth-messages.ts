// Relative: convex/ imports this through lib/phone-auth.ts.
import { contact, formatPhone } from "./brand"

/** Every sentence the sign-in server may say to a person. */
export const SEND_REFUSALS = {
  phone:
    "Too many codes requested for this number. Please try again in a few minutes.",
  address:
    "Too many codes requested from this network. Please try later, or call ICT.",
  deployment: "We can't send codes right now. Please call or WhatsApp ICT.",
  inflight: "A code is already on its way. Please wait a moment.",
  too_soon:
    "A code was just sent to this number. Wait 30 seconds before asking for another.",
  not_whatsapp: `No WhatsApp account was found on this number, so the code can't reach it. Use another number that has WhatsApp, or call ICT on ${formatPhone(contact.phones[0])}.`,
} as const

/** A code request that did not come through the site (lib/phone-auth.ts). */
export const SEND_FROM_SITE =
  "Ask for your code on the ICT website, then enter it there."

export const WHATSAPP_ONLY =
  "Sign-in is a WhatsApp code to your mobile number. There is no email or password sign-in."

export const SPEAKABLE_SERVER_MESSAGES: ReadonlySet<string> = new Set([
  ...Object.values(SEND_REFUSALS),
  SEND_FROM_SITE,
  WHATSAPP_ONLY,
])

/** What a person sees when the server said something we did not write. */
export const GENERIC_AUTH_FAILURE =
  "Couldn't log you in. Please try again, or call ICT."
