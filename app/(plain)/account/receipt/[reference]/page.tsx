"use client"

import { useQuery } from "convex/react"
import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { ReceiptView, ReceiptWaiting } from "@/components/commerce/receipt"
import { ButtonLink } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/** A paid order's receipt, for the signed-in buyer (or staff). */
export default function ReceiptPage() {
  const { reference } = useParams<{ reference: string }>()
  if (!convexConfigured)
    return <PageShell title="Receipt.">Not available here.</PageShell>
  return <Receipt reference={reference} />
}

function Receipt({ reference }: { reference: string }) {
  const receipt = useQuery(api.orders.myReceipt, { reference })
  if (receipt === undefined) return <ReceiptWaiting />
  if (receipt === null)
    return (
      <PageShell title="No receipt here.">
        <StatePanel
          title="We couldn't find this receipt"
          description="It belongs to another account, or the link is mistyped. Your own receipts are with your orders."
          action={
            <ButtonLink href="/account" className="mbs-6">
              Your orders
            </ButtonLink>
          }
        />
      </PageShell>
    )
  return <ReceiptView receipt={receipt} />
}
