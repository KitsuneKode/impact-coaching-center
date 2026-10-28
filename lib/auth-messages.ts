// Relative: convex/ imports this through lib/phone-auth.ts.
import { contact, formatPhone } from "./brand"

/** Every sentence the sign-in server may say to a person. */
export const SEND_REFUSALS = {
  phone: "Too many codes for this number. Try again in a few minutes.",
  address: "Too many codes from this network. Try again later, or call ICT.",
  deployment: "We can't send codes right now. Call or WhatsApp ICT to get in.",
  inflight: "A code is already on its way. Wait a moment for it.",
  too_soon:
    "A code was just sent to this number. Wait 30 seconds before asking for another.",
  not_whatsapp: `No WhatsApp account was found on this number, so the code can't reach it. Use another number that has WhatsApp, or call ICT on ${formatPhone(contact.phones[0])}.`,
} as const

/** A code request that did not come through the site (lib/phone-auth.ts). */
export const SEND_FROM_SITE =
  "Ask for your code on the ICT website, then enter it there."

/** The Turnstile check on a code request failed or never finished. */
export const HUMAN_CHECK =
  "The security check didn't finish. Wait a moment for it to complete, then try again."

export const WHATSAPP_ONLY =
  "Logging in is a WhatsApp code to your mobile number. There is no email or password."

export const SPEAKABLE_SERVER_MESSAGES: ReadonlySet<string> = new Set([
  ...Object.values(SEND_REFUSALS),
  SEND_FROM_SITE,
  HUMAN_CHECK,
  WHATSAPP_ONLY,
])

/** What a person sees when the server said something we did not write. */
export const GENERIC_AUTH_FAILURE =
  "Couldn't log you in. Try again, or call ICT."
