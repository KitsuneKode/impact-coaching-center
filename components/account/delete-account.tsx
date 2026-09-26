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
import { authClient } from "@/lib/auth-client"

const REFUSALS: Record<string, string> = {
  "orders-in-progress":
    "You have an order that is still being packed or delivered. Your account can be deleted once it has arrived or been cancelled.",
  confirmation: "Type DELETE in capitals to confirm.",
  forbidden:
    "Staff and owner accounts are removed by an owner from the admin, so nobody is locked out by accident.",
  anonymous: "Your session expired. Log in again to delete your account.",
}

/**
 * Self-serve account deletion, as the privacy policy promises.
 *
 * Deliberately two steps: a plainly worded section on the page, then a dialog
 * that says exactly what goes and what stays and asks for the word DELETE.
 * Typing a word is slower than a second click, which is the point for
 * something that cannot be undone. The server checks the word too.
 */
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
        setError(REFUSALS[key ?? ""] ?? "That did not work. Try again.")
        return
      }
      // The sessions are already gone server-side; this clears the cookie.
      // The confirmation lives on the signed-out account screen, because this
      // dialog unmounts the moment the Person query sees no session.
      await authClient.signOut().catch(() => undefined)
      router.replace("/account?deleted=1")
    } catch {
      setError("That did not go through. Check the connection and try again.")
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
        Erases your name, number, answers and sign-in from ICT&rsquo;s records.
        Orders you paid for are kept without your details, because the law
        requires sales records.
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
                This cannot be undone. Your name, mobile number, answers and
                enquiry history are erased and you are signed out everywhere.
                Paid orders stay on record without your name, number or address.
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
              />
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription>In capitals.</FieldDescription>
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
