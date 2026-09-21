"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { toE164 } from "@/lib/leads"

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
const CODE_LENGTH = 6

function messageFor(error: { code?: string; message?: string } | null) {
  if (!error) return "Something went wrong. Please try again."
  return (
    (error.code && CODE_MESSAGES[error.code]) ||
    error.message ||
    "Something went wrong. Please try again."
  )
}

/**
 * One flow, not two.
 *
 * There is no separate registration step to build: entering a number either
 * finds that Person or creates one (ADR-0001), so offering "log in" and
 * "register" as a choice would be two doors onto the same room. The single
 * line under the field answers the question a first-time visitor actually
 * has, and then stops talking.
 */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter()
  const phoneId = useId()
  const codeId = useId()

  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  // Focused the moment the code box appears. Done here rather than with
  // `autoFocus` because that attribute moves focus on first paint wherever the
  // element renders; this only fires on the step change that the visitor just
  // asked for, which is the case the accessibility objection does not cover.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  /**
   * Validated on blur, never on keystroke: a ten-digit number is wrong for
   * nine of the ten characters it takes to type it, and saying so each time
   * is nagging rather than help. Once a field has failed, it re-checks on
   * every change so the correction clears the error immediately.
   */
  function checkPhone(value: string) {
    const ok = Boolean(toE164(value))
    setPhoneError(ok ? null : CODE_MESSAGES.INVALID_PHONE_NUMBER!)
    return ok
  }

  async function send(event?: React.FormEvent) {
    event?.preventDefault()
    setFormError(null)
    // Checked here as well as on the server so an obvious typo costs no round
    // trip, and - once WhatsApp lands - no billed message.
    if (!checkPhone(phone)) return

    setPending(true)
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phone,
    })
    setPending(false)
    // `phone` is never cleared on failure. Whatever went wrong, the visitor
    // should not have to type their number again to find out what.
    if (error) {
      setFormError(messageFor(error))
      return
    }
    setStep("code")
    setCooldown(RESEND_SECONDS)
  }

  async function verify(value: string) {
    setFormError(null)
    setPending(true)
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: phone,
      code: value,
    })
    setPending(false)
    if (error) {
      setFormError(messageFor(error))
      return
    }
    router.push(next)
    router.refresh()
  }

  if (step === "code") {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void verify(code)
        }}
        noValidate
      >
        <FieldGroup>
          <Field data-invalid={formError ? true : undefined}>
            <FieldLabel htmlFor={codeId}>
              The {CODE_LENGTH}-digit code
            </FieldLabel>
            <InputOTP
              id={codeId}
              maxLength={CODE_LENGTH}
              value={code}
              onChange={setCode}
              onComplete={(value) => void verify(value)}
              ref={codeRef}
              disabled={pending}
              aria-invalid={formError ? true : undefined}
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                {Array.from({ length: CODE_LENGTH }, (_, index) => (
                  <InputOTPSlot key={index} index={index} className="size-11" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {formError ? (
              <FieldError>{formError}</FieldError>
            ) : (
              <FieldDescription>
                Sent on WhatsApp to +91 {phone}.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone")
                    setCode("")
                    setFormError(null)
                  }}
                  className="link"
                >
                  Change number
                </button>
              </FieldDescription>
            )}
          </Field>

          <Field orientation="horizontal">
            <Button type="submit" size="md" disabled={pending}>
              {pending ? (
                <>
                  <IconLoader2 className="animate-spin" stroke={1.75} />
                  Checking
                </>
              ) : (
                <>
                  Log in
                  <IconArrowRight stroke={1.75} />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={cooldown > 0 || pending}
              onClick={() => void send()}
            >
              {cooldown > 0 ? `Send again in ${cooldown}s` : "Send a new code"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={send} noValidate>
      <FieldGroup>
        <Field data-invalid={phoneError || formError ? true : undefined}>
          <FieldLabel htmlFor={phoneId}>Mobile number</FieldLabel>
          <InputGroup>
            {/*
             * +91 is an addon rather than placeholder text because it is not a
             * choice: ADR-0001 keys a Person by an Indian mobile number, so a
             * country field would offer a freedom the system does not have.
             */}
            <InputGroupAddon className="pl-3.5">
              <InputGroupText className="tnum border-r border-border pr-3 text-[0.9375rem] text-foreground">
                +91
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={phoneId}
              name="phone"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={phone}
              onChange={(event) => {
                const value = event.target.value
                setPhone(value)
                if (phoneError) checkPhone(value)
              }}
              onBlur={(event) => {
                if (event.target.value) checkPhone(event.target.value)
              }}
              aria-invalid={phoneError || formError ? true : undefined}
              className="tnum"
            />
          </InputGroup>
          {phoneError || formError ? (
            <FieldError>{phoneError ?? formError}</FieldError>
          ) : (
            <FieldDescription>
              New to ICT? This creates your account.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit" size="md" disabled={pending}>
            {pending ? (
              <>
                <IconLoader2 className="animate-spin" stroke={1.75} />
                Sending
              </>
            ) : (
              <>
                Continue
                <IconArrowRight stroke={1.75} />
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
