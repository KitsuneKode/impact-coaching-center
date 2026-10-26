"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { IconLock } from "@tabler/icons-react"
import { useAction } from "convex/react"
import { useState } from "react"

import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { track } from "@/lib/analytics"
import { brand } from "@/lib/brand"
import { formatPaise } from "@/lib/money"

/** What Checkout.js hands the success handler. */
type RazorpaySuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayInstance = {
  open: () => void
  on: (event: "payment.failed", handler: () => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js"

/** Load Checkout.js once, only when someone actually pays. */
let loading: Promise<boolean> | null = null
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true)
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = CHECKOUT_SCRIPT
    script.async = true
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => {
      loading = null
      resolve(false)
    }
    document.head.append(script)
  })
  return loading
}

const REFUSED: Record<string, string> = {
  "payments-off":
    "Online payment isn't switched on yet. Call ICT to order these books.",
  "already-paid": "This is already paid. Your order is in your account.",
  "not-payable": "Your cart changed. Check it and press Pay again.",
  declined: "The payment didn't go through and nothing was charged. Try again.",
  gateway:
    "The payment service didn't answer and nothing was charged. Wait a moment and try again.",
  anonymous: "Your session ended. Log in again to pay.",
  "missing-record": "Your cart changed. Check it and press Pay again.",
}
const refusedText = (reason: string) =>
  REFUSED[reason] ?? "The payment didn't go through. Try again."

export type Paid = { reference: string; receiptNumber: string }
type Prepared = { checkoutId: Id<"checkouts">; totalPaise: number }

type Stage =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "test"; prepared: Prepared }
  | { kind: "confirming" }

/**
 * The Pay button. `prepare` freezes the cart into a checkout attempt (and
 * may refuse, saying why); Razorpay then takes the money. On local and dev
 * a simulated gateway sheet stands in, signed the same way. Closing either
 * changes nothing: the cart is still the cart.
 */
export function PayButton({
  amountPaise,
  prepare,
  onPaid,
  onPending,
  disabled,
}: {
  amountPaise: number
  prepare: () => Promise<Prepared | null>
  onPaid: (paid: Paid) => void
  /** The bank approved; the webhook will finish it. */
  onPending: (checkoutId: Id<"checkouts">) => void
  disabled?: boolean
}) {
  const start = useAction(api.payments.startPayment)
  const simulate = useAction(api.payments.simulatePayment)
  const confirm = useAction(api.payments.confirmPayment)
  const [stage, setStage] = useState<Stage>({ kind: "idle" })
  const [error, setError] = useState<string | null>(null)

  const finish = async (
    prepared: Prepared,
    paymentId: string,
    signature: string
  ) => {
    setStage({ kind: "confirming" })
    try {
      const result = await confirm({
        checkoutId: prepared.checkoutId,
        paymentId,
        signature,
      })
      if (result.ok) {
        track({ name: "order_paid", reference: result.reference })
        onPaid({
          reference: result.reference,
          receiptNumber: result.receiptNumber,
        })
        return
      }
      if (result.reason === "pending") onPending(prepared.checkoutId)
      else setError(refusedText(result.reason))
    } catch {
      // Money may have moved: wait for the webhook rather than invite a retry.
      onPending(prepared.checkoutId)
    }
    setStage({ kind: "idle" })
  }

  const pay = async () => {
    setError(null)
    setStage({ kind: "starting" })
    try {
      const prepared = await prepare()
      if (!prepared) {
        setStage({ kind: "idle" })
        return
      }
      const started = await start({ checkoutId: prepared.checkoutId })
      if (!started.ok) {
        setError(refusedText(started.reason))
        setStage({ kind: "idle" })
        return
      }
      track({ name: "payment_started", reference: prepared.checkoutId })
      if (started.provider === "simulated") {
        setStage({ kind: "test", prepared })
        return
      }
      if (!(await loadCheckout()) || !window.Razorpay) {
        setError(
          "The payment window couldn't load. Check your connection and try again."
        )
        setStage({ kind: "idle" })
        return
      }
      const checkout = new window.Razorpay({
        key: started.keyId,
        amount: started.amountPaise,
        currency: "INR",
        order_id: started.gatewayOrderId,
        name: brand.legalName,
        description: "Book sets",
        prefill: { name: started.name, contact: started.phone },
        theme: { color: "#1f5fd1" },
        handler: (response: RazorpaySuccess) =>
          void finish(
            prepared,
            response.razorpay_payment_id,
            response.razorpay_signature
          ),
        modal: {
          ondismiss: () => setStage({ kind: "idle" }),
          confirm_close: true,
        },
      })
      checkout.on("payment.failed", () => setError(refusedText("declined")))
      checkout.open()
    } catch {
      setError("The payment didn't start. Check your connection and try again.")
      setStage({ kind: "idle" })
    }
  }

  const busy = stage.kind === "starting" || stage.kind === "confirming"
  return (
    <div className="grid gap-3">
      <button
        type="button"
        data-press
        data-cta="amber"
        onClick={() => void pay()}
        disabled={disabled || busy || stage.kind === "test"}
        aria-describedby={error ? "pay-error" : undefined}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink disabled:opacity-70"
      >
        {busy ? (
          <>
            <Spinner />
            {stage.kind === "confirming"
              ? "Confirming payment"
              : "Opening payment"}
          </>
        ) : (
          <>
            <IconLock aria-hidden size={17} stroke={1.75} />
            Pay <span className="tnum">{formatPaise(amountPaise)}</span>
          </>
        )}
      </button>
      <p
        id="pay-error"
        role="alert"
        className="text-sm text-destructive empty:hidden"
      >
        {error}
      </p>

      <TestGateway
        open={stage.kind === "test"}
        amountPaise={amountPaise}
        onCancel={() => setStage({ kind: "idle" })}
        onPay={async (outcome) => {
          if (stage.kind !== "test") return
          const prepared = stage.prepared
          const result = await simulate({
            checkoutId: prepared.checkoutId,
            outcome,
          })
          if (result.ok)
            await finish(prepared, result.paymentId, result.signature)
          else {
            setError(refusedText(result.reason))
            setStage({ kind: "idle" })
          }
        }}
      />
    </div>
  )
}

/**
 * The simulated gateway: says plainly that it is a test, and lets the tester
 * pay or decline. Only reachable when the server runs the simulated provider.
 */
function TestGateway({
  open,
  amountPaise,
  onCancel,
  onPay,
}: {
  open: boolean
  amountPaise: number
  onCancel: () => void
  onPay: (outcome: "success" | "failure") => Promise<void>
}) {
  const [working, setWorking] = useState(false)
  const run = async (outcome: "success" | "failure") => {
    setWorking(true)
    try {
      await onPay(outcome)
    } finally {
      setWorking(false)
    }
  }
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !working) onCancel()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop data-promo-backdrop />
        <DialogPrimitive.Popup data-promo-popup className="bg-card">
          <div className="grid gap-4 p-6 sm:p-7">
            <span className="justify-self-start rounded-full bg-highlight ps-3 pe-3 pbs-1 pbe-1 text-xs font-semibold text-ink">
              Test gateway
            </span>
            <DialogPrimitive.Title className="font-display text-2xl font-semibold tracking-[-0.02em]">
              Pay <span className="tnum">{formatPaise(amountPaise)}</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground">
              This stands in for Razorpay on local and dev; no money moves. The
              live site uses Razorpay&apos;s own window.
            </DialogPrimitive.Description>
            <div className="flex flex-wrap gap-3 pbs-1">
              <button
                type="button"
                data-press
                data-cta="amber"
                disabled={working}
                onClick={() => void run("success")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink disabled:opacity-70"
              >
                {working ? <Spinner /> : null}
                Pay (test)
              </button>
              <button
                type="button"
                data-press
                data-cta="ghost-paper"
                disabled={working}
                onClick={() => void run("failure")}
                className="inline-flex h-12 items-center rounded-full px-5 font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
              >
                Decline
              </button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
