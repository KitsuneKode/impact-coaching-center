"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { createPhoneAuthFlow } from "@/lib/phone-auth-flow"
import { safeReturnPath } from "@/lib/return-path"
import { cn } from "@/lib/utils"

const field =
  "h-12 w-full rounded-control border border-input bg-card px-3.5 text-[0.9375rem] text-foreground shadow-frame transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-[invalid=true]:border-destructive"

export function SignInForm({ next }: { next: string }) {
  const router = useRouter()
  const phoneId = useId()
  const codeId = useId()
  const errorId = useId()
  const codeRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const previousStep = useRef<"phone" | "code">("phone")

  const [flow] = useState(() =>
    createPhoneAuthFlow({
      send: (phoneNumber) => authClient.phoneNumber.sendOtp({ phoneNumber }),
      verify: (input) => authClient.phoneNumber.verify(input),
    })
  )
  const { step, phone, code, sentTo, error, pending, resendAt } =
    useSyncExternalStore(
      flow.subscribe,
      flow.getSnapshot,
      flow.getServerSnapshot
    )
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => () => flow.cancelPending(), [flow])

  // Focus follows the acknowledged send, never a late response for an edited
  // number. Changing the number returns focus to its field naturally below.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus()
    else if (previousStep.current === "code") phoneRef.current?.focus()
    previousStep.current = step
  }, [step])

  useEffect(() => {
    const tick = () =>
      setCooldown(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)))
    tick()
    if (!resendAt) return
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [resendAt])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (step === "phone") {
      void flow.send()
      return
    }
    void flow.verify(() => {
      router.replace(safeReturnPath(next))
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={submit}
      aria-busy={Boolean(pending)}
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
            ref={phoneRef}
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98xxx xxxxx"
            value={phone}
            onChange={(e) => flow.setPhone(e.target.value)}
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
            The code sent to {sentTo}
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
            onChange={(e) => flow.setCode(e.target.value)}
            disabled={Boolean(pending)}
            aria-invalid={Boolean(error)}
            className={cn(field, "tnum tracking-[0.3em]")}
          />
          <button
            type="button"
            disabled={cooldown > 0 || Boolean(pending)}
            onClick={() => void flow.send()}
            className="mt-2 inline-flex min-h-11 w-fit items-center text-sm text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new code"}
          </button>
          <button
            type="button"
            disabled={Boolean(pending)}
            onClick={() => flow.changeNumber()}
            className="inline-flex min-h-11 w-fit items-center text-sm text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:text-muted-foreground"
          >
            Use a different number
          </button>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={Boolean(pending)}
        className="mt-8 w-full"
      >
        {pending ? (
          <>
            <IconLoader2 className="animate-spin" stroke={1.75} />
            {pending === "send" ? "Sending" : "Checking"}
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
