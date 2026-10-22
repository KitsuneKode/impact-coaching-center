"use client"

import { IconLoader2, IconTrash } from "@tabler/icons-react"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { api } from "@/convex/_generated/api"
import { resetAnalytics } from "@/lib/analytics"
import { authClient } from "@/lib/auth-client"
import { formatPhone } from "@/lib/brand"
import { CODE_LENGTH } from "@/lib/phone-auth-flow"

const REFUSALS: Record<string, string> = {
  "orders-in-progress":
    "You have an order on its way. You can delete your account once it's delivered or cancelled.",
  "history-too-long":
    "Your account has too much history to delete here. Call ICT and they will delete it for you.",
  code: "Enter the WhatsApp code we just sent, then delete.",
  forbidden: "Staff and owner accounts are removed by an owner from the admin.",
  anonymous: "Your session expired. Log in again, then delete.",
}

type Step = "confirm" | "code"

/**
 * Self-serve account deletion, as the privacy policy promises. A WhatsApp
 * code to the account's own number confirms it (an unlocked phone is not
 * enough); the server refuses unless that code was entered in the last ten
 * minutes. What stays afterwards is an audit line: an erased account, when.
 */
export function DeleteAccount({
  role,
  phone,
}: {
  role: string
  phone: string
}) {
  const erase = useMutation(api.account.deleteOwnAccount)
  const codeId = useId()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("confirm")
  const [code, setCode] = useState("")
  const [pending, setPending] = useState<"send" | "delete" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (role !== "student")
    return (
      <section className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]">
        <h2 className="font-medium">Delete account</h2>
        <p className="mbs-1 text-sm text-muted-foreground">
          {REFUSALS.forbidden}
        </p>
      </section>
    )

  async function sendCode() {
    setPending("send")
    setError(null)
    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone,
      })
      if (result.error) {
        setError(result.error.message ?? "Couldn't send a code. Try again.")
        return
      }
      setStep("code")
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again."
      )
    } finally {
      setPending(null)
    }
  }

  async function confirm(entered: string) {
    setPending("delete")
    setError(null)
    try {
      // The right code signs this device in afresh, which is what the server
      // checks for before erasing.
      const verified = await authClient.phoneNumber.verify({
        phoneNumber: phone,
        code: entered,
      })
      if (verified.error) {
        setCode("")
        setError("That code didn't match. Check WhatsApp and try again.")
        return
      }
      const result = await erase({ confirmation: "DELETE" })
      if (!result.ok) {
        const key =
          result.reason === "invalid-input" ? result.field : result.reason
        setError(
          REFUSALS[key ?? ""] ??
            "Couldn't delete your account. Check your connection and try again."
        )
        return
      }
      // The sessions are already gone server-side; this clears the cookie.
      // The confirmation lives on the signed-out account screen, because this
      // dialog unmounts the moment the Person query sees no session.
      resetAnalytics()
      await authClient.signOut().catch(() => undefined)
      router.replace("/account?deleted=1")
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again."
      )
    } finally {
      setPending(null)
    }
  }

  return (
    <section
      aria-labelledby="delete-account"
      className="rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-24px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
    >
      <h2 id="delete-account" className="font-medium">
        Delete account
      </h2>
      <p className="mbs-1 text-sm text-muted-foreground">
        Permanently removes your details. Paid orders are kept, without your
        name or number, as the law requires.
      </p>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (pending) return
          setOpen(next)
          if (!next) {
            setStep("confirm")
            setCode("")
            setError(null)
          }
        }}
      >
        <DialogTrigger
          render={
            <Button variant="secondary" size="md" className="mbs-4">
              <IconTrash stroke={1.75} />
              Delete my account
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This can&rsquo;t be undone. Your name, number and answers are
              erased and you&rsquo;re signed out on every device.
            </DialogDescription>
          </DialogHeader>

          {step === "confirm" ? (
            <>
              <p className="mbs-5 text-sm">
                To confirm it&rsquo;s you, we&rsquo;ll send a code on WhatsApp
                to{" "}
                <span className="tnum font-medium">{formatPhone(phone)}</span>.
              </p>
              {error ? (
                <FieldError className="mbs-3">{error}</FieldError>
              ) : null}
              <DialogFooter className="mbs-6">
                <DialogClose
                  render={
                    <Button type="button" variant="ghost" size="md">
                      Keep my account
                    </Button>
                  }
                />
                <Button
                  type="button"
                  size="md"
                  disabled={pending !== null}
                  onClick={() => void sendCode()}
                >
                  {pending === "send" ? (
                    <>
                      <IconLoader2 className="animate-spin" stroke={1.75} />
                      Sending
                    </>
                  ) : (
                    "Send the code"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <Field className="mbs-5" data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={codeId}>
                Code sent to {formatPhone(phone)}
              </FieldLabel>
              <InputOTP
                id={codeId}
                maxLength={CODE_LENGTH}
                value={code}
                onChange={setCode}
                onComplete={(value) => void confirm(value)}
                disabled={pending === "delete"}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${codeId}-error` : `${codeId}-hint`}
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {error ? (
                <FieldError id={`${codeId}-error`}>{error}</FieldError>
              ) : (
                <FieldDescription id={`${codeId}-hint`}>
                  {pending === "delete"
                    ? "Deleting your account…"
                    : "Entering the code deletes your account."}
                </FieldDescription>
              )}
            </Field>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
