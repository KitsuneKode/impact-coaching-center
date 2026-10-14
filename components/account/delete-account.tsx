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
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { resetAnalytics } from "@/lib/analytics"
import { authClient } from "@/lib/auth-client"

const REFUSALS: Record<string, string> = {
  "orders-in-progress":
    "You have an order on its way. You can delete your account once it's delivered or cancelled.",
  confirmation: "Type DELETE to confirm.",
  forbidden: "Staff and owner accounts are removed by an owner from the admin.",
  anonymous: "Your session expired. Log in again, then delete.",
}

/** Self-serve account deletion, as the privacy policy promises. */
export function DeleteAccount({ role }: { role: string }) {
  const erase = useMutation(api.account.deleteOwnAccount)
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (role !== "student")
    return (
      <section className="max-w-160 rounded-card border border-border p-6">
        <h2 className="font-medium">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {REFUSALS.forbidden}
        </p>
      </section>
    )

  async function confirm() {
    setPending(true)
    setError(null)
    try {
      const result = await erase({ confirmation: typed })
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
      setPending(false)
    }
  }

  return (
    <section
      aria-labelledby="delete-account"
      className="max-w-160 rounded-card border border-border p-6"
    >
      <h2 id="delete-account" className="font-medium">
        Delete account
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently removes your details. Paid orders are kept, without your
        name or number, as the law requires.
      </p>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (pending) return
          setOpen(next)
          if (!next) {
            setTyped("")
            setError(null)
          }
        }}
      >
        <DialogTrigger
          render={
            <Button variant="secondary" size="md" className="mt-4">
              <IconTrash stroke={1.75} />
              Delete my account
            </Button>
          }
        />
        <DialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void confirm()
            }}
          >
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This can&rsquo;t be undone. Your name, number and answers are
                erased and you&rsquo;re signed out on every device.
              </DialogDescription>
            </DialogHeader>

            <Field className="mt-5" data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={inputId}>Type DELETE to confirm</FieldLabel>
              <Input
                id={inputId}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                  error ? `${inputId}-error` : `${inputId}-hint`
                }
              />
              {error ? (
                <FieldError id={`${inputId}-error`}>{error}</FieldError>
              ) : (
                <FieldDescription id={`${inputId}-hint`}>
                  In capital letters.
                </FieldDescription>
              )}
            </Field>

            <DialogFooter className="mt-6">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    disabled={pending}
                  >
                    Keep my account
                  </Button>
                }
              />
              <Button
                type="submit"
                size="md"
                disabled={pending || typed.trim() !== "DELETE"}
              >
                {pending ? (
                  <>
                    <IconLoader2 className="animate-spin" stroke={1.75} />
                    Deleting
                  </>
                ) : (
                  "Delete permanently"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
