import { httpRouter } from "convex/server"

import { authComponent, createAuth } from "./auth"

const http = httpRouter()

/**
 * Lazy registration: Better Auth is not constructed while routes are being
 * registered, which keeps deployment memory down.
 */
authComponent.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
  cors: true,
  trustedOrigins: [process.env.SITE_URL!],
})

export default http
