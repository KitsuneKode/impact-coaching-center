import { isDevelopmentDeployment } from "./dev-deployment"

/**
 * The parts of taking payment that need no database: which provider runs,
 * Razorpay's signatures, and receipt numbers. Web Crypto only, so the same
 * code runs in Convex functions, the HTTP webhook and the tests.
 */

export type PaymentProvider = "razorpay" | "simulated" | "off"

/**
 * `PAYMENT_PROVIDER` decides. "simulated" walks the whole flow with a fake
 * gateway and is refused anywhere but local or the dev deployment, the same
 * guard the logger OTP transport uses. Unset means checkout cannot take
 * payment, and says so, rather than guessing.
 */
export function choosePaymentProvider(
  configured: string | undefined,
  convexSiteUrl: string | undefined
): PaymentProvider {
  if (configured === "razorpay") return "razorpay"
  if (configured === "simulated")
    return isDevelopmentDeployment(convexSiteUrl) ? "simulated" : "off"
  return "off"
}

/** The secret a simulated payment is signed with; never valid on Razorpay. */
export const SIMULATED_SECRET = "ict-simulated-gateway"

const encoder = new TextEncoder()

/** HMAC-SHA256 of `message` under `secret`, as lowercase hex. */
export async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  )
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

/** Equal-length comparison that does not stop at the first difference. */
export function sameHex(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Checkout's proof of payment: HMAC of `order_id|payment_id` under the key
 * secret. The order id must be ours, from the database, never the browser's.
 */
export async function checkoutSignatureValid(args: {
  orderId: string
  paymentId: string
  signature: string
  secret: string
}) {
  const expected = await hmacHex(
    args.secret,
    `${args.orderId}|${args.paymentId}`
  )
  return sameHex(expected, args.signature.toLowerCase())
}

/** A webhook's proof: HMAC of the raw body under the webhook secret. */
export async function webhookSignatureValid(args: {
  body: string
  signature: string
  secret: string
}) {
  const expected = await hmacHex(args.secret, args.body)
  return sameHex(expected, args.signature.toLowerCase())
}

/**
 * India's financial year for a moment, as "26-27": April to March, read in
 * IST so a payment at 00:30 on 1 April lands in the new year.
 */
export function financialYear(at: number) {
  const ist = new Date(at + 5.5 * 60 * 60 * 1000)
  const year = ist.getUTCFullYear()
  const start = ist.getUTCMonth() >= 3 ? year : year - 1
  const short = (y: number) => String(y % 100).padStart(2, "0")
  return `${short(start)}-${short(start + 1)}`
}

/** ICT/26-27/0007: the prefix ICT sets, the year, and a padded sequence. */
export function receiptNumber(prefix: string, year: string, sequence: number) {
  return `${prefix}/${year}/${String(sequence).padStart(4, "0")}`
}

/** What Razorpay's payment states mean for an order. */
export function paymentSettled(status: string) {
  return status === "captured" || status === "authorized"
}
