"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"

import { NameStep } from "@/components/account/name-step"
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
import {
  CODE_LENGTH,
  createPhoneAuthFlow,
  PHONE_AUTH_MESSAGES,
  RESEND_MS,
} from "@/lib/phone-auth-flow"

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
  const phoneId = useId()
  const codeId = useId()

  // One flow per mounted form. It owns every request, so a late answer for a
  // number that has since been edited, or for a form that has gone, is dropped
  // instead of moving the wrong number into the code step.
  const [flow] = useState(() =>
    createPhoneAuthFlow({
      send: (phoneNumber) => authClient.phoneNumber.sendOtp({ phoneNumber }),
      verify: (input) => authClient.phoneNumber.verify(input),
    })
  )
  const { phone, code, sentTo, step, pending, error, resendAt } =
    useSyncExternalStore(
      flow.subscribe,
      flow.getSnapshot,
      flow.getServerSnapshot
    )
  const [verified, setVerified] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const cooldown = useSecondsUntil(resendAt)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => flow.cancelPending(), [flow])

  // Focused the moment the code box appears. Done here rather than with
  // `autoFocus` because that attribute moves focus on first paint wherever the
  // element renders; this only fires on the step change that the visitor just
  // asked for, which is the case the accessibility objection does not cover.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus()
  }, [step])

  /**
   * Validated on blur, never on keystroke: a ten-digit number is wrong for
   * nine of the ten characters it takes to type it, and saying so each time
   * is nagging rather than help. Once a field has failed, it re-checks on
   * every change so the correction clears the error immediately.
   */
  function checkPhone(value: string) {
    const ok = Boolean(toE164(value))
    setPhoneError(ok ? null : PHONE_AUTH_MESSAGES.INVALID_PHONE_NUMBER!)
    return ok
  }

  function send(event?: React.FormEvent) {
    event?.preventDefault()
    // Checked here as well as on the server so an obvious typo costs no round
    // trip, and - once WhatsApp lands - no billed message. `phone` is never
    // cleared on failure: whatever went wrong, the visitor should not have to
    // type their number again to find out what.
    if (step === "phone" && !checkPhone(phone)) return
    void flow.send()
  }

  /*
   * Hand over to the name step rather than redirecting here.
   *
   * It decides for itself whether it is needed - a returning Person already
   * has a name and is sent straight on - so this is not a new gate on every
   * sign-in. Doing the check here instead would mean reading the Person
   * before the session has propagated, and guessing wrong either shows the
   * form to someone who has a name or skips it for someone who does not.
   */
  function verify() {
    void flow.verify(() => setVerified(true))
  }

  const formError = error
  const busy = pending !== null

  if (verified) return <NameStep next={next} />

  if (step === "code") {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          verify()
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
              onChange={flow.setCode}
              onComplete={verify}
              ref={codeRef}
              disabled={busy}
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
                Sent on WhatsApp to {formatSentTo(sentTo)}.{" "}
                <button
                  type="button"
                  onClick={flow.changeNumber}
                  disabled={pending === "verify"}
                  className="link"
                >
                  Change number
                </button>
              </FieldDescription>
            )}
          </Field>

          <Field orientation="horizontal">
            <Button type="submit" size="md" disabled={busy}>
              {busy ? (
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
              disabled={cooldown > 0 || busy}
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
                flow.setPhone(value)
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
              We send a WhatsApp code to this number — no password. New to ICT?
              This creates your account.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit" size="md" disabled={busy}>
            {busy ? (
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

/** "+919876543210" as the visitor typed it: "+91 98765 43210". */
function formatSentTo(sentTo: string | null) {
  const national = sentTo?.replace(/^\+91/, "") ?? ""
  return national.length === 10
    ? `+91 ${national.slice(0, 5)} ${national.slice(5)}`
    : (sentTo ?? "")
}

/** Whole seconds left until `at`, ticking once a second while above zero. */
function useSecondsUntil(at: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (at <= Date.now()) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= at) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [at])
  // Clamped because `now` is only as fresh as the last tick: right after a
  // send it can trail the real time by up to a second.
  return Math.min(RESEND_MS / 1000, Math.max(0, Math.ceil((at - now) / 1000)))
}
