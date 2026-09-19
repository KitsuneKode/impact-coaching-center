/**
 * How a verification code reaches a Person.
 *
 * Today there is one transport and it only logs. WhatsApp arrives behind this
 * same call, which is why the choice is a named decision rather than an
 * inline console.log.
 */
export type TransportName = "logger" | "whatsapp"

/**
 * Which transport may run, read from OTP_TRANSPORT on the deployment.
 *
 * NODE_ENV deliberately plays no part: this runs inside Convex functions,
 * where NODE_ENV is "production" even on a local development deployment, so
 * it cannot tell the two apart.
 *
 * Unset fails closed. The Phone Number plugin stores the code even when
 * sendOTP does nothing and raises no warning when it does, so a transport
 * that quietly degraded to logging would store a code nobody received and
 * then accept it - a silent authentication bypass. Choosing the logger has
 * to be a deliberate act, visible in `convex env list`.
 */
export function chooseTransport(configured: string | undefined): TransportName {
  if (configured === "logger") return "logger"
  if (configured === "whatsapp") return "whatsapp"
  throw new Error(
    `OTP_TRANSPORT must be set to "logger" or "whatsapp" on this deployment. Refusing to send a verification code without an explicit transport: a silent fallback would store a code nobody received and then accept it.`
  )
}

export function sendOtp(target: { phoneNumber: string; code: string }): void {
  const transport = chooseTransport(process.env.OTP_TRANSPORT)

  if (transport === "whatsapp") {
    // Plan 2. Until it exists, refuse rather than pretend a code was sent.
    throw new Error("The WhatsApp OTP transport is not implemented yet.")
  }

  console.log(`[otp] ${target.phoneNumber}: ${target.code}`)
}
