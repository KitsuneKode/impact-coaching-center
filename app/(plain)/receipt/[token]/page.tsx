"use client"

import { useQuery } from "convex/react"
import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { ReceiptView, ReceiptWaiting } from "@/components/commerce/receipt"
import { ButtonLink } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/**
 * The receipt behind the link in the buyer's WhatsApp message. Opens
 * without signing in; the phone is masked and the street left off.
 */
export default function SharedReceiptPage() {
  const { token } = useParams<{ token: string }>()
  if (!convexConfigured)
    return <PageShell title="Receipt.">Not available here.</PageShell>
  return <SharedReceipt token={token} />
}

function SharedReceipt({ token }: { token: string }) {
  const receipt = useQuery(api.orders.receiptByToken, { token })
  if (receipt === undefined) return <ReceiptWaiting />
  if (receipt === null)
    return (
      <PageShell title="No receipt here.">
        <StatePanel
          title="This receipt link doesn't open"
          description="Check that the whole link was copied. Signed in, your receipts are with your orders."
          action={
            <ButtonLink href="/account" className="mbs-6">
              Sign in to your orders
            </ButtonLink>
          }
        />
      </PageShell>
    )
  return <ReceiptView receipt={receipt} shared />
}
