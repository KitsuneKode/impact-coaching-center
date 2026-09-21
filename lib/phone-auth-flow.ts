import { toE164 } from "./leads"

type AuthError = { code?: string; message?: string } | null
export type PhoneAuthResult = { error: AuthError }

type Snapshot = {
  phone: string
  code: string
  sentTo: string | null
  step: "phone" | "code"
  pending: "send" | "verify" | null
  error: string | null
  resendAt: number
}

const INITIAL: Snapshot = {
  phone: "",
  code: "",
  sentTo: null,
  step: "phone",
  pending: null,
  error: null,
  resendAt: 0,
}

const MESSAGES: Record<string, string> = {
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

const NETWORK_ERROR = "We could not connect. Please try again."

function errorMessage(error: Exclude<AuthError, null>) {
  return (
    (error.code && MESSAGES[error.code]) ||
    error.message ||
    "Something went wrong. Please try again."
  )
}

/**
 * One form's request lifecycle. The acknowledged send owns the phone used to
 * verify; editing before acknowledgement invalidates that request's UI result.
 * This does not cancel an already-issued message or a server-created session,
 * and is not the server's cross-instance OTP concurrency safeguard.
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
  function update(patch: Partial<Snapshot>) {
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
      if (state.pending) return
      generation++
      update({
        step: "phone",
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
        update({ error: MESSAGES.INVALID_PHONE_NUMBER })
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
          resendAt: Date.now() + 30_000,
        })
      } catch {
        if (attempt === generation)
          update({ pending: null, error: NETWORK_ERROR })
      }
    },
    async verify(onVerified: () => void) {
      if (state.pending || state.step !== "code" || !state.sentTo) return
      if (!/^\d{6}$/.test(state.code)) {
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
          update({ pending: null, error: NETWORK_ERROR })
        return
      }
      // Keep controls locked while navigation completes: success has already
      // created a session and must not be retried as another verification.
      onVerified()
    },
  }
}
