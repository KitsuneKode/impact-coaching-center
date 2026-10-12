/**
 * Whether a Convex deployment may run development-only affordances: the
 * logger OTP transport and the fixture seed. Two facts must agree: the URL
 * Convex itself hands the function (CONVEX_SITE_URL is set by the platform,
 * not the operator env) and this reviewed constant. Not an env var on purpose:
 * a pasted DEV_DEPLOYMENT_NAME could have been copied onto production, while
 * changing this line takes a code change and review.
 */
const HOSTED_DEV_DEPLOYMENT = "peaceful-emu-861"

export function isDevelopmentDeployment(
  convexSiteUrl: string | undefined
): boolean {
  const url = convexSiteUrl ? URL.parse(convexSiteUrl) : null
  if (!url || url.username || url.password) return false

  if (url.protocol === "http:")
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)

  return (
    url.protocol === "https:" &&
    url.hostname === `${HOSTED_DEV_DEPLOYMENT}.convex.site` &&
    url.port === ""
  )
}
