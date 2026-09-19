import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"
import { phoneNumber } from "better-auth/plugins"

import { sendOtp } from "../lib/otp-transport"
import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import authConfig from "./auth.config"

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    database: authComponent.adapter(ctx),
    plugins: [
      phoneNumber({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        /**
         * Not awaited: awaiting delivery adds latency to the request and
         * leaks, through timing, whether a number is already registered.
         */
        sendOTP: (data) => {
          sendOtp({ phoneNumber: data.phoneNumber, code: data.code })
        },
        signUpOnVerification: {
          /**
           * Better Auth's core requires a unique email, so a verified Person
           * carries a placeholder. It must never receive mail and must never
           * appear in an export presented as a contactable address. Account
           * recovery is therefore phone-only - see docs/adr/0001.
           */
          getTempEmail: (phone) => `${phone}@person.ict.invalid`,
        },
      }),
      convex({ authConfig }),
    ],
  })

/**
 * The signed-in Person, or null when nobody is signed in.
 *
 * safeGetAuthUser is deliberate: getAuthUser throws ConvexError
 * "Unauthenticated" for anonymous visitors, so a public page calling it would
 * render a 500 for everyone who is not signed in.
 */
export const getCurrentPerson = query({
  args: {},
  handler: async (ctx) => authComponent.safeGetAuthUser(ctx),
})
