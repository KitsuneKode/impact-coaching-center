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

/** Log in without leaving the page you were on. */
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
  // After the code, the dialog asks a name (once) rather than logging in.
  const [verified, setVerified] = useState(false)
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
          <DialogTitle className="type-display">
            {verified ? "You're in." : heading}
          </DialogTitle>
          {/*
            A real description, not an empty node hidden from view. The
            dialog is announced by its title and description, and an empty
            one tells a screen reader nothing about what it just opened.
          */}
          <DialogDescription>
            {verified ? "One last thing before you continue." : description}
          </DialogDescription>
        </DialogHeader>
        <SignInForm next={next} onVerified={() => setVerified(true)} />
      </DialogContent>
    </Dialog>
  )
}
