"use client"

import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { phoneNumberClient } from "better-auth/client/plugins"

/**
 * The browser-side auth client.
 *
 * WhatsApp only. There is no email, password, or social sign-in: a
 * Person is keyed by their mobile number (ADR-0001). Password, email,
 * and phone-password routes are refused in lib/phone-auth.ts before they
 * can write an account. The plugin's `updatePhoneNumber` route is refused
 * there too, so a number change is a staff-assisted, audited operation
 * rather than something a session can do to itself.
 */
export const authClient = createAuthClient({
  plugins: [convexClient(), phoneNumberClient()],
})
