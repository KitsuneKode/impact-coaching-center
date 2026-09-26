"use client"

import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { phoneNumberClient } from "better-auth/client/plugins"

/** The browser-side auth client. */
export const authClient = createAuthClient({
  plugins: [convexClient(), phoneNumberClient()],
})
