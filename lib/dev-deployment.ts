/**
 * Whether a Convex deployment may run development-only affordances: the
 * logger OTP transport and the fixture seed. A hosted deployment qualifies
 * only when DEV_DEPLOYMENT_NAME is its own name, so production never does.
 */
export function isDevelopmentDeployment(
  convexSiteUrl: string | undefined,
  devDeploymentName?: string
): boolean {
  const url = convexSiteUrl ? URL.parse(convexSiteUrl) : null
  if (!url || url.username || url.password) return false

  if (url.protocol === "http:")
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)

  const name = devDeploymentName?.trim()
  return (
    url.protocol === "https:" &&
    !!name &&
    /^[a-z]+-[a-z]+-\d+$/.test(name) &&
    url.hostname === `${name}.convex.site` &&
    url.port === ""
  )
}
