"use client"

import { IconArrowRight, IconCheck, IconLoader2 } from "@tabler/icons-react"
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"

import { NameStep } from "@/components/account/name-step"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { TERMS_VERSION } from "@/lib/terms"
import { nationalMobileDraft, toE164 } from "@/lib/leads"
import {
  CODE_LENGTH,
  createPhoneAuthFlow,
  RESEND_MS,
} from "@/lib/phone-auth-flow"

/** One flow, not two. */
export function SignInForm({
  next,
  onVerified,
}: {
  next: string
  /** The code was right; what follows is the name and questions, not a log-in. */
  onVerified?: () => void
}) {
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
  const [accepted, setAccepted] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  // Ticked already for someone who agreed to this version on this device,
  // until they untick it.
  const remembered = useSyncExternalStore(noSubscribe, agreedHere, () => false)
  const [choice, setAgreed] = useState<boolean | null>(null)
  const agreed = choice ?? remembered
  const [termsError, setTermsError] = useState(false)
  const termsId = useId()
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

  // A refused code clears itself (see the flow); put the cursor back in the
  // first box so the right one can simply be typed.
  useEffect(() => {
    if (step === "code" && error && code === "") codeRef.current?.focus()
  }, [step, error, code])

  /**
   * Validated on blur, never on keystroke: a ten-digit number is wrong for nine
   * of the ten characters it takes to type it, and saying so each time is
   * nagging rather than help.
   */
  function checkPhone(value: string) {
    const ok = Boolean(toE164(value))
    setPhoneError(ok ? null : "Please enter a 10 digit mobile number.")
    return ok
  }

  function send(event?: React.FormEvent) {
    event?.preventDefault()
    // Checked here as well as on the server so an obvious typo costs no round
    // trip, and - once WhatsApp lands - no billed message. `phone` is never
    // cleared on failure: whatever went wrong, the visitor should not have to
    // type their number again to find out what.
    if (step === "phone" && !checkPhone(phone)) return
    if (step === "phone" && !agreed) {
      setTermsError(true)
      return
    }
    try {
      localStorage.setItem(TERMS_KEY, TERMS_VERSION)
    } catch {}
    void flow.send()
  }

  /*
   * Hand over to the name step rather than redirecting here, after the
   * boxes have had a moment to show the code was right.
   */
  function verify() {
    void flow.verify(() => {
      setAccepted(true)
      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      window.setTimeout(
        () => {
          setVerified(true)
          onVerified?.()
        },
        still ? 0 : 650
      )
    })
  }

  const formError = error
  const busy = pending !== null

  if (verified) return <NameStep next={next} />

  if (step === "code") {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!accepted) verify()
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
              // Read-only, not disabled, while it is checked: the digits keep
              // their colour and run the checking wave instead of greying out.
              readOnly={busy || accepted}
              success={accepted}
              aria-invalid={formError ? true : undefined}
              aria-describedby={
                formError ? `${codeId}-error` : `${codeId}-hint`
              }
              containerClassName={formError ? "otp-shake" : undefined}
            >
              <InputOTPGroup>
                {Array.from({ length: CODE_LENGTH }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {formError ? (
              <FieldError id={`${codeId}-error`}>{formError}</FieldError>
            ) : (
              <FieldDescription id={`${codeId}-hint`}>
                Sent on WhatsApp to {formatSentTo(sentTo)}.{" "}
                <button
                  type="button"
                  onClick={flow.changeNumber}
                  disabled={pending === "verify"}
                  className="link"
                >
                  Change number
                </button>
                {cooldown === 0 ? (
                  <span className="mbs-1 block">
                    No message? The code only reaches a number that has
                    WhatsApp.
                  </span>
                ) : null}
              </FieldDescription>
            )}
          </Field>

          <Field orientation="horizontal">
            <Button type="submit" size="md" disabled={busy && !accepted}>
              {accepted ? (
                <>
                  <IconCheck stroke={2} />
                  Logged in
                </>
              ) : busy ? (
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
              +91 is an addon rather than placeholder text because it is not a
              choice: ADR-0001 keys a Person by an Indian mobile number, so a
              country field would offer a freedom the system does not have.
            */}
            <InputGroupAddon className="ps-3.5">
              <InputGroupText className="tnum border-r border-border pe-3 text-[0.9375rem] text-foreground">
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
                const value = nationalMobileDraft(event.target.value)
                flow.setPhone(value)
                if (phoneError) checkPhone(value)
              }}
              onBlur={(event) => {
                if (event.target.value) checkPhone(event.target.value)
              }}
              aria-invalid={phoneError || formError ? true : undefined}
              aria-describedby={
                phoneError || formError ? `${phoneId}-error` : `${phoneId}-hint`
              }
              className="tnum"
            />
          </InputGroup>
          {phoneError || formError ? (
            <FieldError id={`${phoneId}-error`}>
              {phoneError ?? formError}
            </FieldError>
          ) : (
            <FieldDescription id={`${phoneId}-hint`}>
              We&rsquo;ll send a 6-digit code on WhatsApp.
            </FieldDescription>
          )}
        </Field>

        <Field
          orientation="horizontal"
          data-invalid={termsError || undefined}
          className="items-start"
        >
          <Checkbox
            id={termsId}
            checked={agreed}
            onCheckedChange={(checked) => {
              setAgreed(checked)
              if (checked) setTermsError(false)
            }}
            aria-invalid={termsError || undefined}
            aria-describedby={termsError ? `${termsId}-error` : undefined}
            className="mbs-0.5"
          />
          <div className="grid gap-1">
            <FieldLabel htmlFor={termsId} className="font-normal">
              <span>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener"
                  className="font-medium underline underline-offset-4"
                >
                  Terms
                </a>{" "}
                and the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener"
                  className="font-medium underline underline-offset-4"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </FieldLabel>
            {termsError ? (
              <FieldError id={`${termsId}-error`}>
                Tick the box to continue.
              </FieldError>
            ) : null}
          </div>
        </Field>

        <Field>
          <Button type="submit" size="md" disabled={busy && !accepted}>
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

/** This device's record of the terms version its visitor agreed to. */
const TERMS_KEY = "ict-terms"
const noSubscribe = () => () => {}
function agreedHere() {
  try {
    return localStorage.getItem(TERMS_KEY) === TERMS_VERSION
  } catch {
    return false
  }
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
