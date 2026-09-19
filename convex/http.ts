import { httpRouter } from "convex/server"

import { requireEnv } from "../lib/env"
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
  // [undefined]. Must equal NEXT_PUBLIC_SITE_URL from the build environment;
  // the two name the same origin and nothing keeps them in sync.
  trustedOrigins: [requireEnv("SITE_URL", process.env.SITE_URL)],
})

export default http
