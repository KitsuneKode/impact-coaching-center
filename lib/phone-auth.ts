import { APIError, createAuthMiddleware, getIp } from "better-auth/api"
import { phoneNumber } from "better-auth/plugins"

import { toE164 } from "./leads"

/**
 * What a refused send tells the person, per ceiling.
 *
 * Each has to be true of the ceiling that actually fired. A shared college
 * connection hitting the address limit is not the visitor asking too often,
 * and the deployment cap is not something they can wait out in a few minutes.
 * `inflight` is a send already underway, not a spent allowance.
 */
const REFUSAL_MESSAGES = {
  phone:
    "Too many WhatsApp codes were requested for this number. Wait a few minutes and try again.",
  address:
    "Too many WhatsApp codes were requested from this internet connection. Wait a while, or call ICT instead.",
  deployment:
    "We cannot send WhatsApp codes at the moment. Please call or message ICT and they will help you directly.",
  inflight:
    "A WhatsApp code is already on its way to this number. Wait a moment and try again.",
} as const

/**
 * Sign-in is a WhatsApp code. These routes belong to password, email, or
 * social sign-in. The phone plugin registers the password ones even when
 * we never configure a password sender, and reset-password can mint a
 * credential account. Refuse them before any adapter write.
 */
const WHATSAPP_ONLY =
  "Sign-in is a WhatsApp code to your mobile number. There is no email or password sign-in."

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
          const ip = getIp(
            ctx.request ?? ctx.headers ?? new Headers(),
            ctx.context.options
          )
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
