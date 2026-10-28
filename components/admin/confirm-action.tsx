"use client"

import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Spinner } from "@/components/ui/spinner"

/**
 * The check before something that cannot simply be taken back (removing a
 * person's access, cancelling or refunding an order). The word is typed
 * into the same boxes as the sign-in code, and they move the same way: a
 * wave while it runs, a shake for the wrong word, a bounce when it is done.
 * Reversible changes (unpublishing) do not come here; they get Undo.
 */
export function ConfirmAction({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  word,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  /** Typed to confirm, in capitals; up to 6 letters. */
  word: string
  /** Resolves true when it worked; the dialog closes after the bounce. */
  onConfirm: () => Promise<boolean>
}) {
  const id = useId()
  const [typed, setTyped] = useState("")
  const [state, setState] = useState<"idle" | "wrong" | "running" | "done">(
    "idle"
  )
  const [failed, setFailed] = useState(false)

  // Each opening starts clean (adjusted while rendering, not in an effect).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTyped("")
      setState("idle")
      setFailed(false)
    }
  }

  async function run(value: string) {
    if (state === "running" || state === "done") return
    if (value.toUpperCase() !== word) {
      setState("wrong")
      return
    }
    setState("running")
    setFailed(false)
    const ok = await onConfirm().catch(() => false)
    if (!ok) {
      setState("idle")
      setFailed(true)
      return
    }
    setState("done")
    window.setTimeout(() => onOpenChange(false), 650)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => state !== "running" && onOpenChange(next)}
    >
      <DialogContent className="gap-5 p-6 text-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <Field data-invalid={state === "wrong" || failed ? true : undefined}>
          <FieldLabel htmlFor={id}>Type {word} to confirm</FieldLabel>
          <InputOTP
            id={id}
            maxLength={word.length}
            value={typed}
            onChange={(next) => {
              setTyped(next.toUpperCase())
              if (state === "wrong") setState("idle")
            }}
            onComplete={(value) => void run(value)}
            pattern="^[A-Za-z]+$"
            inputMode="text"
            autoCapitalize="characters"
            readOnly={state === "running" || state === "done"}
            success={state === "done"}
            aria-invalid={state === "wrong" ? true : undefined}
            containerClassName={state === "wrong" ? "otp-shake" : undefined}
          >
            <InputOTPGroup>
              {Array.from({ length: word.length }, (_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {state === "wrong" ? (
            <FieldError>That is not {word}. Type it again.</FieldError>
          ) : failed ? (
            <FieldError>
              It did not go through. Nothing changed; try again.
            </FieldError>
          ) : (
            <FieldDescription>Capitals or not, either works.</FieldDescription>
          )}
        </Field>
        <DialogFooter>
          <Button
            variant="secondary"
            size="md"
            disabled={state === "running"}
            onClick={() => onOpenChange(false)}
          >
            Keep it
          </Button>
          <Button
            size="md"
            data-danger
            disabled={
              typed.length < word.length ||
              state === "running" ||
              state === "done"
            }
            onClick={() => void run(typed)}
          >
            {state === "running" ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
