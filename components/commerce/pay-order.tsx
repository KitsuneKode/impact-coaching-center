"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { IconCheck, IconLock, IconReceipt } from "@tabler/icons-react"
import { useAction } from "convex/react"
import Link from "next/link"
import { useState } from "react"

import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
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
    "Online payment is not switched on yet. ICT will call to take payment.",
  "already-paid": "This order is already paid.",
  "not-payable": "This order can no longer be paid online. Call ICT about it.",
  declined: "The payment did not go through. Nothing was charged; try again.",
  gateway:
    "The payment service did not answer. Wait a moment and try again; nothing was charged.",
  pending:
    "Your bank approved the payment and it is being confirmed. This page updates by itself in a few minutes; do not pay again.",
  anonymous: "Your session ended. Log in again to pay.",
  "missing-record": "We could not find that order.",
}
const refusedText = (reason: string) =>
  REFUSED[reason] ?? "The payment did not go through. Try again."

type Stage =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "test"; gatewayOrderId: string }
  | { kind: "confirming" }
  | { kind: "paid"; receipt: string }

/**
 * Pay for one placed order. Razorpay opens its own Checkout; on local and dev
 * a simulated gateway sheet stands in, signed the same way, so the confirm
 * path is identical. Closing either leaves the order payable later.
 */
export function PayOrder({
  reference,
  amountPaise,
  onPaid,
  size = "lg",
}: {
  reference: string
  amountPaise: number
  onPaid?: (receipt: string) => void
  size?: "lg" | "md"
}) {
  const start = useAction(api.payments.startPayment)
  const simulate = useAction(api.payments.simulatePayment)
  const confirm = useAction(api.payments.confirmPayment)
  const [stage, setStage] = useState<Stage>({ kind: "idle" })
  const [error, setError] = useState<string | null>(null)

  const finish = async (paymentId: string, signature: string) => {
    setStage({ kind: "confirming" })
    try {
      const result = await confirm({ reference, paymentId, signature })
      if (result.ok) {
        track({ name: "order_paid", reference })
        setStage({ kind: "paid", receipt: result.receiptNumber })
        onPaid?.(result.receiptNumber)
      } else {
        setError(refusedText(result.reason))
        setStage({ kind: "idle" })
      }
    } catch {
      setError(
        "We could not confirm the payment. If money left your account, it will show here within a few minutes; do not pay again."
      )
      setStage({ kind: "idle" })
    }
  }

  const pay = async () => {
    setError(null)
    setStage({ kind: "starting" })
    try {
      const started = await start({ reference })
      if (!started.ok) {
        setError(refusedText(started.reason))
        setStage({ kind: "idle" })
        return
      }
      track({ name: "payment_started", reference })
      if (started.provider === "simulated") {
        setStage({ kind: "test", gatewayOrderId: started.gatewayOrderId })
        return
      }
      if (!(await loadCheckout()) || !window.Razorpay) {
        setError(
          "The payment window could not load. Check your connection and try again."
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
        description: `Order ${reference}`,
        prefill: { name: started.name, contact: started.phone },
        notes: { reference },
        theme: { color: "#1f5fd1" },
        handler: (response: RazorpaySuccess) =>
          void finish(
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
      setError(
        "The payment did not start. Check your connection and try again."
      )
      setStage({ kind: "idle" })
    }
  }

  if (stage.kind === "paid")
    return (
      <div className="grid justify-items-start gap-3">
        <output className="inline-flex items-center gap-2 rounded-full bg-secondary ps-3 pe-4 pbs-2 pbe-2 font-semibold">
          <span className="grid size-6 place-items-center rounded-full bg-primary text-white">
            <IconCheck aria-hidden size={14} stroke={2.5} />
          </span>
          Paid · receipt <span className="tnum">{stage.receipt}</span>
        </output>
        <Link
          href={`/account/receipt/${reference}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-foreground/30 underline-offset-4"
        >
          <IconReceipt aria-hidden size={16} stroke={1.75} />
          View and print the receipt
        </Link>
      </div>
    )

  const busy = stage.kind === "starting" || stage.kind === "confirming"
  return (
    <div className="grid justify-items-start gap-3">
      <button
        type="button"
        data-press
        data-cta="amber"
        onClick={pay}
        disabled={busy || stage.kind === "test"}
        className={`inline-flex items-center gap-2 rounded-full bg-highlight font-semibold text-foreground disabled:opacity-70 ${size === "lg" ? "h-12 px-6" : "h-10 px-5 text-sm"}`}
      >
        {busy ? (
          <>
            <Spinner />
            {stage.kind === "confirming" ? "Confirming" : "Opening payment"}
          </>
        ) : (
          <>
            <IconLock aria-hidden size={17} stroke={1.75} />
            Pay <span className="tnum">{formatPaise(amountPaise)}</span>
          </>
        )}
      </button>
      {error ? (
        <p role="alert" className="max-w-[46ch] text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          UPI, cards and netbanking, through Razorpay.
        </p>
      )}

      <TestGateway
        open={stage.kind === "test"}
        amountPaise={amountPaise}
        reference={reference}
        onCancel={() => setStage({ kind: "idle" })}
        onPay={async (outcome) => {
          const result = await simulate({ reference, outcome })
          if (result.ok) await finish(result.paymentId, result.signature)
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
  reference,
  onCancel,
  onPay,
}: {
  open: boolean
  amountPaise: number
  reference: string
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
            <span className="justify-self-start rounded-full bg-highlight ps-3 pe-3 pbs-1 pbe-1 text-xs font-semibold">
              Test gateway
            </span>
            <DialogPrimitive.Title className="font-display text-2xl font-semibold tracking-[-0.02em]">
              Pay <span className="tnum">{formatPaise(amountPaise)}</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground">
              Order <span className="tnum">{reference}</span>. This stands in
              for Razorpay on local and dev; no money moves. The live site uses
              Razorpay&apos;s own window.
            </DialogPrimitive.Description>
            <div className="flex flex-wrap gap-3 pbs-1">
              <button
                type="button"
                data-press
                data-cta="amber"
                disabled={working}
                onClick={() => run("success")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-foreground disabled:opacity-70"
              >
                {working ? <Spinner /> : null}
                Pay (test)
              </button>
              <button
                type="button"
                data-press
                data-cta="ghost-paper"
                disabled={working}
                onClick={() => run("failure")}
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
