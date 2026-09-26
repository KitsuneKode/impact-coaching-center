/**
 * Whether a Convex deployment may run development-only affordances: the
 * logger OTP transport and the fixture seed.
 *
 * Two kinds of deployment qualify:
 *
 * 1. A local backend, recognised by its plain-HTTP loopback origin.
 * 2. One hosted deployment named explicitly by `DEV_DEPLOYMENT_NAME`, and only
 *    when that name is this deployment's own. Convex supplies
 *    `CONVEX_SITE_URL` itself, so the name is checked against the origin the
 *    platform reports rather than trusted on its own. Copying the variable to
 *    production does nothing: production has a different name, so the check
 *    fails closed there.
 *
 * The hosted case exists so the owner can be shown the staff screens through
 * a preview link without a billed WhatsApp transport. Codes it logs are only
 * readable by someone with deploy access (`bunx convex logs`), the same
 * privilege the dashboard already grants.
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
