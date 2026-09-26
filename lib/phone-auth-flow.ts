import { toE164 } from "./leads"

type AuthError = { code?: string; message?: string } | null
export type PhoneAuthResult = { error: AuthError }

export type PhoneAuthSnapshot = {
  phone: string
  code: string
  /** The normalized number the last acknowledged send went to. */
  sentTo: string | null
  step: "phone" | "code"
  pending: "send" | "verify" | null
  error: string | null
  resendAt: number
}

const INITIAL: PhoneAuthSnapshot = {
  phone: "",
  code: "",
  sentTo: null,
  step: "phone",
  pending: null,
  error: null,
  resendAt: 0,
}

/** Spec §10. Courtesy only - the real ceiling is three sends per ten minutes. */
export const RESEND_MS = 30_000
export const CODE_LENGTH = 6

/**
 * The plugin enumerates its error codes, so the UI maps them rather than
 * matching on prose that a library upgrade could reword.
 *
 * Anything unlisted falls back to the server's own message, which is already
 * written for a person - the send ceilings in convex/otp.ts return a sentence
 * naming the ceiling that actually fired.
 */
export const PHONE_AUTH_MESSAGES: Record<string, string> = {
  INVALID_PHONE_NUMBER: "Enter a valid Indian mobile number.",
  INVALID_OTP: "That code is not right. Check it and try again.",
  OTP_EXPIRED: "That code has expired. Ask for a new one.",
  OTP_NOT_FOUND: "Ask for a code first.",
  TOO_MANY_ATTEMPTS:
    "Too many attempts on this code. Ask for a new one in a few minutes.",
  PHONE_NUMBER_CANNOT_BE_UPDATED:
    "Changing a number needs ICT staff. Please call them.",
  SEND_OTP_NOT_IMPLEMENTED:
    "Verification is not available yet. Please call or message ICT.",
}

// A thrown failure (offline, a dropped request) never comes back as {error},
// and its message is transport detail, not something to show a person.
const SEND_FAILED =
  "The code could not be sent. Check your connection and try again."
const VERIFY_FAILED =
  "The code could not be checked. Check your connection and try again."

function errorMessage(error: Exclude<AuthError, null>) {
  return (
    (error.code && PHONE_AUTH_MESSAGES[error.code]) ||
    error.message ||
    "Something went wrong. Please try again."
  )
}

/**
 * One form's request lifecycle, kept outside React so its races are testable.
 *
 * The acknowledged send owns the phone used to verify, and every request
 * carries a generation: editing the number, changing it, or unmounting
 * invalidates whatever is in flight, so a late answer cannot move a different
 * number into the code step or navigate a form that has gone. This does not
 * cancel a message already sent or a session the server already created, and
 * it is not the server's cross-instance guarantee - that is the send lease in
 * convex/otp.ts.
 */
export function createPhoneAuthFlow(client: {
  send: (phoneNumber: string) => Promise<PhoneAuthResult>
  verify: (input: {
    phoneNumber: string
    code: string
  }) => Promise<PhoneAuthResult>
}) {
  let state = INITIAL
  let generation = 0
  const listeners = new Set<() => void>()
  function update(patch: Partial<PhoneAuthSnapshot>) {
    state = { ...state, ...patch }
    for (const listener of listeners) listener()
  }

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => INITIAL,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setPhone(phone: string) {
      if (state.step !== "phone" || state.phone === phone) return
      generation++
      update({ phone, pending: null, error: null, sentTo: null, code: "" })
    },
    setCode(code: string) {
      if (state.pending) return
      update({ code, error: null })
    },
    changeNumber() {
      // A pending verify can create a server session: do not suggest that a
      // local phone edit can cancel or change the identity of that operation.
      if (state.pending === "verify") return
      generation++
      update({
        step: "phone",
        pending: null,
        sentTo: null,
        code: "",
        error: null,
        resendAt: 0,
      })
    },
    cancelPending() {
      generation++
      if (state.pending) update({ pending: null })
    },
    async send() {
      if (state.pending || Date.now() < state.resendAt) return
      const phone = toE164(state.phone)
      if (!phone) {
        update({ error: PHONE_AUTH_MESSAGES.INVALID_PHONE_NUMBER })
        return
      }
      const attempt = ++generation
      update({ pending: "send", error: null })
      try {
        const result = await client.send(phone)
        if (attempt !== generation) return
        if (result.error) {
          update({ pending: null, error: errorMessage(result.error) })
          return
        }
        update({
          pending: null,
          step: "code",
          sentTo: phone,
          code: "",
          resendAt: Date.now() + RESEND_MS,
        })
      } catch {
        if (attempt === generation)
          update({ pending: null, error: SEND_FAILED })
      }
    },
    async verify(onVerified: () => void) {
      if (state.pending || state.step !== "code" || !state.sentTo) return
      if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(state.code)) {
        update({ error: "Enter the six-digit code ICT sent you." })
        return
      }
      const attempt = ++generation
      const input = { phoneNumber: state.sentTo, code: state.code }
      update({ pending: "verify", error: null })
      try {
        const result = await client.verify(input)
        if (attempt !== generation) return
        if (result.error) {
          update({ pending: null, error: errorMessage(result.error) })
          return
        }
      } catch {
        if (attempt === generation)
          update({ pending: null, error: VERIFY_FAILED })
        return
      }
      // Keep controls locked while the next step takes over: success has
      // already created a session and must not be retried as another verify.
      onVerified()
    },
  }
}

export type PhoneAuthFlow = ReturnType<typeof createPhoneAuthFlow>
