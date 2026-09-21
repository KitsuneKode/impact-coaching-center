"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { toE164 } from "@/lib/leads"
import { cn } from "@/lib/utils"

const field =
  "h-12 w-full rounded-control border border-input bg-card px-3.5 text-[0.9375rem] text-foreground shadow-frame transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-[invalid=true]:border-destructive"

/**
 * The plugin enumerates its error codes, so the UI maps them rather than
 * matching on prose that a library upgrade could reword.
 *
 * Anything unlisted falls back to the server's own message, which is already
 * written for a person - the send ceilings in convex/otp.ts return a sentence
 * naming the ceiling that actually fired.
 */
const CODE_MESSAGES: Record<string, string> = {
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

/** Spec §10. Courtesy only - the real ceiling is three sends per ten minutes. */
const RESEND_SECONDS = 30

function messageFor(error: { code?: string; message?: string } | null) {
  if (!error) return "Something went wrong. Please try again."
  return (
    (error.code && CODE_MESSAGES[error.code]) ||
    error.message ||
    "Something went wrong. Please try again."
  )
}

export function SignInForm({ next }: { next: string }) {
  const router = useRouter()
  const phoneId = useId()
  const codeId = useId()
  const errorId = useId()
  const codeRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Focus the code box the moment it appears; the visitor is holding a
  // handset and should not have to hunt for the field.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function send(event?: React.FormEvent) {
    event?.preventDefault()
    setError(null)
    // Checked here as well as on the server so an obvious typo costs no
    // round trip, and - once WhatsApp lands - no billed message.
    if (!toE164(phone)) {
      setError(CODE_MESSAGES.INVALID_PHONE_NUMBER!)
      return
    }
    setPending(true)
    const { error: failed } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phone,
    })
    setPending(false)
    if (failed) {
      setError(messageFor(failed))
      return
    }
    setStep("code")
    setCooldown(RESEND_SECONDS)
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const { error: failed } = await authClient.phoneNumber.verify({
      phoneNumber: phone,
      code,
    })
    setPending(false)
    if (failed) {
      setError(messageFor(failed))
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <form
      onSubmit={step === "phone" ? send : verify}
      noValidate
      aria-describedby={error ? errorId : undefined}
    >
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mb-6 rounded-control border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {step === "phone" ? (
        <div className="grid gap-2">
          <label htmlFor={phoneId} className="text-sm font-medium">
            Mobile number
          </label>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98xxx xxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(error)}
            className={cn(field, "tnum")}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            ICT will send a one-time code to this number.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          <label htmlFor={codeId} className="text-sm font-medium">
            The code sent to {phone}
          </label>
          <input
            id={codeId}
            ref={codeRef}
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={Boolean(error)}
            className={cn(field, "tnum tracking-[0.3em]")}
          />
          <button
            type="button"
            disabled={cooldown > 0 || pending}
            onClick={() => send()}
            className="mt-2 inline-flex min-h-11 w-fit items-center text-sm text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new code"}
          </button>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="mt-8 w-full"
      >
        {pending ? (
          <>
            <IconLoader2 className="animate-spin" stroke={1.75} />
            {step === "phone" ? "Sending" : "Checking"}
          </>
        ) : (
          <>
            {step === "phone" ? "Send me a code" : "Sign in"}
            <IconArrowRight stroke={1.75} />
          </>
        )}
      </Button>
    </form>
  )
}
