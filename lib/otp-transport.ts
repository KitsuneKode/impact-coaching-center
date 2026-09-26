import { isDevelopmentDeployment } from "./dev-deployment"

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
 * Unset fails closed. Resolve this before the plugin is constructed - see
 * convex/auth.ts, which calls it per request because the check reads
 * CONVEX_SITE_URL, supplied to the running function rather than to module
 * scope. Deferring the check to send time would be too late: the plugin writes
 * the verification row *before* it calls sendOTP, so a throw there leaves a
 * stored, still-acceptable code that nobody received.
 */
export function chooseTransport(
  configured: string | undefined,
  convexSiteUrl?: string,
  devDeploymentName?: string
): TransportName {
  if (configured === "logger") {
    // Convex supplies its own origin. A user-set "development" flag alone
    // must not turn on credential logging for a hosted production backend;
    // a hosted deployment qualifies only by its own name (lib/dev-deployment).
    if (!isDevelopmentDeployment(convexSiteUrl, devDeploymentName)) {
      throw new Error(
        "The logger OTP transport requires a local HTTP CONVEX_SITE_URL, or DEV_DEPLOYMENT_NAME set to this deployment's own name."
      )
    }
    return "logger"
  }
  if (configured === "whatsapp")
    throw new Error("The WhatsApp OTP transport is not implemented yet.")
  throw new Error(
    `OTP_TRANSPORT must be set to "logger" or "whatsapp" on this deployment. Refusing to construct an auth instance without an explicit transport.`
  )
}

/**
 * Deliver a code over the already-resolved transport.
 *
 * Async on purpose: WhatsApp delivery will be a network call, and the caller
 * must await it so a delivery failure surfaces as a failed request rather
 * than a discarded promise and a cheerful "code sent".
 */
export async function sendOtp(
  transport: TransportName,
  target: { phoneNumber: string; code: string }
): Promise<void> {
  if (transport === "whatsapp") {
    // Plan 2. Until it exists, refuse rather than pretend a code was sent.
    throw new Error("The WhatsApp OTP transport is not implemented yet.")
  }

  console.log(`[otp] ${target.phoneNumber}: ${target.code}`)
}
