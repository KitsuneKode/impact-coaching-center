"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { SignInForm } from "@/components/account/sign-in-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Log in without leaving the page you were on.
 *
 * Rendered by the intercepting routes under `app/@authModal`, so a
 * `<Link href="/login">` from anywhere in the site opens this over the
 * current page, while a hard load of /login still renders the full page.
 * One set of URLs, two presentations, no duplicated form.
 *
 * This matters for the funnel rather than for polish. The resource gate asks
 * somebody to verify their number at the exact moment they wanted a
 * document; sending them to a different page loses the thing they were
 * reaching for, and asks them to find their way back to it afterwards.
 *
 * `router.back()` runs only on close, not on every `onOpenChange`. Calling it
 * when the dialog *opens* pops the history entry that put the modal there,
 * which is a subtle way to send somebody backwards through the site while
 * they are trying to log in.
 */
export function AuthModal({
  heading,
  description,
  next,
}: {
  heading: string
  description: string
  next: string
}) {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) router.back()
      }}
    >
      <DialogContent className="max-w-112">
        <DialogHeader>
          <DialogTitle className="type-display">{heading}</DialogTitle>
          {/*
           * A real description, not an empty node hidden from view. The
           * dialog is announced by its title and description, and an empty
           * one tells a screen reader nothing about what it just opened.
           */}
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <SignInForm next={next} />
      </DialogContent>
    </Dialog>
  )
}
