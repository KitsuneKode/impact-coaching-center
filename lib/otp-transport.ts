import { isDevelopmentDeployment } from "./dev-deployment"

/** How a verification code reaches a Person. */
export type TransportName = "logger" | "whatsapp"

/** Which transport may run, read from OTP_TRANSPORT on the deployment. */
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

/** Deliver a code over the already-resolved transport. */
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
