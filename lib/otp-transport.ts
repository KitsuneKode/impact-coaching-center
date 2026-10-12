import { isDevelopmentDeployment } from "./dev-deployment"

/** How a verification code reaches a Person. */
export type TransportName = "logger" | "whatsapp"

/** Which transport may run, read from OTP_TRANSPORT on the deployment. */
export function chooseTransport(
  configured: string | undefined,
  convexSiteUrl?: string
): TransportName {
  if (configured === "logger") {
    // CONVEX_SITE_URL is set by Convex, not the operator: a hosted deployment
    // qualifies only when its own origin is the dev deployment's (see
    // lib/dev-deployment.ts).
    if (!isDevelopmentDeployment(convexSiteUrl)) {
      throw new Error(
        "The logger OTP transport requires a local HTTP CONVEX_SITE_URL, or the development deployment named in lib/dev-deployment.ts."
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
