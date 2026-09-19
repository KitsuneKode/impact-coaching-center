import { httpRouter } from "convex/server"

import { parseTrustedOrigins, requireEnv } from "../lib/env"
import { authComponent, createAuth } from "./auth"

const http = httpRouter()

/**
 * Lazy registration: Better Auth is not constructed while routes are being
 * registered, which keeps deployment memory down.
 */
authComponent.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
  cors: true,
  // Anchors CORS and CSRF trust, so a missing value must not become
  // [undefined]. Comma-separated, because one Convex deployment serves both
  // local development and a preview URL. Every origin here must be one we
  // actually control.
  trustedOrigins: parseTrustedOrigins(
    requireEnv("SITE_URL", process.env.SITE_URL)
  ),
})

export default http
