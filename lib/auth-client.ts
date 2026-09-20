"use client"

import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { phoneNumberClient } from "better-auth/client/plugins"

/**
 * The browser-side auth client.
 *
 * Phone only. There is no email/password path and no social provider: a
 * Person is keyed by their mobile number (ADR-0001), and the plugin's
 * `updatePhoneNumber` route is refused server-side in lib/phone-auth.ts,
 * so a number change is a staff-assisted, audited operation rather than
 * something a session can do to itself.
 */
export const authClient = createAuthClient({
  plugins: [convexClient(), phoneNumberClient()],
})
