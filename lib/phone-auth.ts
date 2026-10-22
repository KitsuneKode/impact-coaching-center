import { APIError, createAuthMiddleware } from "better-auth/api"
import { phoneNumber } from "better-auth/plugins"

import { SEND_FROM_SITE, SEND_REFUSALS, WHATSAPP_ONLY } from "./auth-messages"
import { secretsMatch } from "./env"
import { parseClientAddress } from "./client-address"
import { toE164 } from "./leads"

/*
 * The refusal sentences live in lib/auth-messages.ts so the client can tell
 * them apart from library errors it must not show. Each has to be true of the
 * ceiling that actually fired:
 */
const REFUSAL_MESSAGES = SEND_REFUSALS

const BLOCKED_AUTH_PATHS = new Set([
  "/sign-in/phone-number",
  "/phone-number/request-password-reset",
  "/phone-number/reset-password",
  "/sign-in/email",
  "/sign-up/email",
  "/sign-in/social",
  "/change-email",
  "/send-verification-email",
  "/verify-email",
  "/request-password-reset",
  "/reset-password",
  "/change-password",
  "/verify-password",
])

function isOutsideWhatsApp(path: string) {
  return BLOCKED_AUTH_PATHS.has(path) || path.startsWith("/reset-password/")
}

export type OtpSendRefusal = keyof typeof REFUSAL_MESSAGES

export type OtpSendClaim =
  | { ok: true; generation: number }
  | { ok: false; reason: OtpSendRefusal }

export type OtpVerifyVerdict =
  | "ok"
  | "missing"
  | "expired"
  | "exhausted"
  | "invalid"

/** Same lifetime the phone plugin is given. Acceptance uses our expiry. */
const CODE_TTL_MS = 300_000

type AttemptContext = { otpSendGeneration?: number }

function attemptContext(ctx: { context: object }): AttemptContext {
  return ctx.context
}

async function hashOtpCode(secret: string, phone: string, code: string) {
  if (secret.length < 16)
    throw new Error(
      "Verification hashing requires BETTER_AUTH_SECRET or AUTH_SECRET."
    )
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${phone}:${code}`)
  )
  return [...new Uint8Array(mac)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function verdictError(verdict: Exclude<OtpVerifyVerdict, "ok">) {
  if (verdict === "expired")
    return APIError.from("BAD_REQUEST", {
      code: "OTP_EXPIRED",
      message: "OTP expired",
    })
  if (verdict === "missing")
    return APIError.from("BAD_REQUEST", {
      code: "OTP_NOT_FOUND",
      message: "OTP not found",
    })
  if (verdict === "exhausted")
    return APIError.from("FORBIDDEN", {
      code: "TOO_MANY_ATTEMPTS",
      message: "Too many attempts",
    })
  return APIError.from("BAD_REQUEST", {
    code: "INVALID_OTP",
    message: "Invalid OTP",
  })
}

/** Shared by the Convex adapter and the integration-test memory adapter. */
export function phoneAuthOptions(delivery: {
  secret: string
  send: (target: { phoneNumber: string; code: string }) => Promise<void>
  record: (person: { phone: string; name: string }) => Promise<void>
  /**
   * One mutation: ceilings plus the per-phone lease. A refusal leaves any
   * live code in place. See convex/otp.ts.
   */
  claim: (target: { phone: string; ip: string | null }) => Promise<OtpSendClaim>
  commit: (attempt: {
    phone: string
    generation: number
    codeHash: string
    codeExpiresAt: number
  }) => Promise<"ok" | "lost" | "expired">
  release: (attempt: { phone: string; generation: number }) => Promise<void>
  abort: (attempt: { phone: string; generation: number }) => Promise<void>
  verify: (attempt: {
    phone: string
    codeHash: string
  }) => Promise<OtpVerifyVerdict>
}) {
  return {
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (isOutsideWhatsApp(ctx.path)) {
          throw new APIError("FORBIDDEN", { message: WHATSAPP_ONLY })
        }
        if (!ctx.path.startsWith("/phone-number/")) return
        // Reject before the plugin consumes the OTP or edits its account.
        if (ctx.body?.updatePhoneNumber) {
          throw new APIError("FORBIDDEN", {
            message: "Phone changes require staff assistance.",
          })
        }
        const raw = ctx.body?.phoneNumber
        const phone = typeof raw === "string" ? toE164(raw) : null
        if (!phone)
          throw new APIError("BAD_REQUEST", {
            message: "Enter a valid Indian mobile number.",
          })
        let otpSendGeneration: number | undefined
        if (ctx.path === "/phone-number/send-otp") {
          /* Better Auth's getIp reads the leftmost XFF entry, which is the
             one the client controls. parseClientAddress takes the last
             well-formed entry - the address the edge actually saw - and
             canonicalises it, so the ip bucket cannot be moved by spoofing. */
          const header = (name: string) =>
            ctx.request instanceof Request
              ? ctx.request.headers.get(name)
              : (ctx.headers?.get(name) ?? null)
          /* Our own Next.js server vouches for the visitor's address with a
             shared secret (lib/auth-server.ts); otherwise the forwarded
             chain, which may only name that server. */
          const proxySecret = process.env.AUTH_PROXY_SECRET
          const fromOurSite = Boolean(
            proxySecret &&
            secretsMatch(header("x-ict-proxy-key") ?? "", proxySecret)
          )
          /* With the secret set, codes are only sent for requests our site
             forwarded. A script calling the Convex address directly would
             otherwise choose the address its ceilings are counted against,
             and step around any check the site adds in front. */
          if (proxySecret && !fromOurSite)
            throw new APIError("FORBIDDEN", { message: SEND_FROM_SITE })
          const vouched = fromOurSite
            ? parseClientAddress(header("x-ict-client-ip"))
            : null
          const ip = vouched ?? parseClientAddress(header("x-forwarded-for"))
          const decision = await delivery.claim({ phone, ip })
          if (!decision.ok) {
            throw new APIError("TOO_MANY_REQUESTS", {
              message: REFUSAL_MESSAGES[decision.reason],
            })
          }
          // Plugin rows are not the acceptance record. Clearing them here only
          // stops a leftover row from sitting beside the one this request
          // inserts. A refused claim never reaches this delete.
          try {
            await ctx.context.internalAdapter.deleteVerificationByIdentifier(
              phone
            )
          } catch (error) {
            await delivery.release({ phone, generation: decision.generation })
            throw error
          }
          otpSendGeneration = decision.generation
          attemptContext(ctx).otpSendGeneration = decision.generation
        }
        return {
          context: {
            ...ctx,
            body: { ...ctx.body, phoneNumber: phone },
            otpSendGeneration,
          },
        }
      }),
    },
    plugins: [
      phoneNumber({
        otpLength: 6,
        expiresIn: CODE_TTL_MS / 1000,
        allowedAttempts: 5,
        phoneNumberValidator: (input) => toE164(input) === input,
        sendOTP: async ({ phoneNumber: rawPhone, code }, ctx) => {
          const phone = toE164(rawPhone)
          const carrier = ctx as
            | { otpSendGeneration?: number; context: object }
            | undefined
          const generation = carrier
            ? (carrier.otpSendGeneration ??
              attemptContext(carrier).otpSendGeneration)
            : undefined
          if (!phone || generation === undefined)
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Could not start verification. Please try again.",
            })
          const committed = await delivery.commit({
            phone,
            generation,
            codeHash: await hashOtpCode(delivery.secret, phone, code),
            codeExpiresAt: Date.now() + CODE_TTL_MS,
          })
          if (committed !== "ok") {
            throw new APIError("CONFLICT", {
              message:
                committed === "expired"
                  ? "That request took too long. Ask for a code again."
                  : "That request was overtaken by a newer one. Ask for a code again.",
            })
          }
          try {
            await delivery.send({ phoneNumber: phone, code })
          } catch (error) {
            await delivery.abort({ phone, generation })
            throw error
          }
          try {
            await delivery.release({ phone, generation })
          } catch {
            // The code is already on its way. Failing the request would
            // invite another send, and aborting would erase a code the
            // person can still enter. The lease expires on its own.
          }
        },
        verifyOTP: async ({ phoneNumber: rawPhone, code }) => {
          const phone = toE164(rawPhone)
          if (!phone) return false
          const verdict = await delivery.verify({
            phone,
            codeHash: await hashOtpCode(delivery.secret, phone, code),
          })
          if (verdict === "ok") return true
          throw verdictError(verdict)
        },
        callbackOnVerification: async ({ phoneNumber: phone, user }) => {
          await delivery.record({ phone, name: user.name })
        },
        signUpOnVerification: {
          getTempEmail: (phone) => `${phone}@person.ict.invalid`,
          getTempName: () => "",
        },
      }),
    ],
  }
}
