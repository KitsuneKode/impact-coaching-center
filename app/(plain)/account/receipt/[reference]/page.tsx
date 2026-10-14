"use client"

import { IconPrinter } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { formatPaise } from "@/lib/money"

const when = (ms: number) =>
  new Date(ms).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

/** A paid order's receipt, laid out to print on one A4 page. */
export default function ReceiptPage() {
  const { reference } = useParams<{ reference: string }>()
  if (!convexConfigured)
    return <PageShell title="Receipt.">Not available here.</PageShell>
  return <Receipt reference={reference} />
}

function Receipt({ reference }: { reference: string }) {
  const receipt = useQuery(api.orders.myReceipt, { reference })

  if (receipt === undefined)
    return (
      <PageShell title="Receipt.">
        <ListSkeleton rows={4} className="max-w-160" />
      </PageShell>
    )
  if (receipt === null)
    return (
      <PageShell title="No receipt here.">
        <StatePanel
          title="This order has no receipt yet"
          description="A receipt is issued once the payment goes through. If you paid just now, give it a minute."
          action={
            <ButtonLink href="/account" className="mbs-6">
              Your orders
            </ButtonLink>
          }
        />
      </PageShell>
    )

  return (
    <main
      data-receipt-page
      className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20"
    >
      <div className="mx-auto max-w-[46rem]">
        <div data-no-print className="mbe-6 flex flex-wrap gap-3">
          <button
            type="button"
            data-press
            data-cta="amber"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-highlight px-5 font-semibold text-foreground"
          >
            <IconPrinter aria-hidden size={18} stroke={1.75} />
            Print or save as PDF
          </button>
          <ButtonLink href="/account" variant="ghost">
            Your orders
          </ButtonLink>
        </div>

        <article
          data-receipt
          className="rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)] md:p-10"
        >
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-display text-xl font-semibold">
                {receipt.seller.legalName}
              </p>
              <p className="mbs-1 max-w-[32ch] text-sm text-muted-foreground">
                {receipt.seller.address}
              </p>
              {receipt.seller.gstin ? (
                <p className="tnum mbs-1 text-sm">
                  GSTIN {receipt.seller.gstin}
                </p>
              ) : null}
            </div>
            <div className="text-end">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">
                Receipt
              </h1>
              <p className="tnum mbs-1 font-semibold">
                {receipt.receiptNumber}
              </p>
              <p className="mbs-1 text-sm text-muted-foreground">
                {when(receipt.paidAt)}
              </p>
            </div>
          </header>

          <dl className="mbs-8 grid gap-4 border-bs border-border pbs-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Billed to</dt>
              <dd className="mbs-1 font-semibold">{receipt.buyer.name}</dd>
              <dd className="tnum">{receipt.buyer.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {receipt.fulfilment === "delivery"
                  ? "Delivered to"
                  : "Collected from"}
              </dt>
              {receipt.fulfilment === "delivery" && receipt.address ? (
                <dd className="mbs-1">
                  {receipt.address.line1}
                  {receipt.address.line2
                    ? `, ${receipt.address.line2}`
                    : ""},{" "}
                  {receipt.address.city}
                  {receipt.address.district
                    ? `, ${receipt.address.district}`
                    : ""}{" "}
                  <span className="tnum">{receipt.address.pin}</span>
                </dd>
              ) : (
                <dd className="mbs-1">The centre, {receipt.seller.address}</dd>
              )}
            </div>
            <div>
              <dt className="text-muted-foreground">Order</dt>
              <dd className="tnum mbs-1 font-semibold">{receipt.reference}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Paid by</dt>
              <dd className="mbs-1 capitalize">{receipt.method ?? "Online"}</dd>
              {receipt.paymentId ? (
                <dd className="tnum text-xs text-muted-foreground">
                  {receipt.paymentId}
                </dd>
              ) : null}
            </div>
          </dl>

          <table className="mbs-8 w-full text-sm">
            <caption className="sr-only">What was bought</caption>
            <thead>
              <tr className="border-be border-border text-muted-foreground">
                <th scope="col" className="pbe-2 text-start font-normal">
                  Item
                </th>
                <th scope="col" className="pbe-2 text-end font-normal">
                  Qty
                </th>
                <th scope="col" className="pbe-2 text-end font-normal">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {receipt.lines.map((line) => (
                <tr key={`${line.slug}-${line.language}`} className="align-top">
                  <td className="pbs-3 pbe-3">
                    <span className="block font-semibold">
                      {line.title} (
                      {line.language === "as" ? "Assamese" : "English"} set)
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {line.books.join(", ")}
                    </span>
                  </td>
                  <td className="tnum pbs-3 text-end">{line.quantity}</td>
                  <td className="tnum pbs-3 text-end">
                    {formatPaise(line.unitPaise * line.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-bs border-border">
              <tr>
                <th
                  scope="row"
                  colSpan={2}
                  className="pbs-3 text-end font-normal text-muted-foreground"
                >
                  Books
                </th>
                <td className="tnum pbs-3 text-end">
                  {formatPaise(receipt.itemsPaise)}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  colSpan={2}
                  className="pbs-1 text-end font-normal text-muted-foreground"
                >
                  Delivery
                </th>
                <td className="tnum pbs-1 text-end">
                  {formatPaise(receipt.deliveryPaise)}
                </td>
              </tr>
              <tr className="text-base">
                <th scope="row" colSpan={2} className="pbs-3 text-end">
                  Total paid
                </th>
                <td className="tnum ps-4 pbs-3 text-end font-display text-xl font-semibold">
                  {formatPaise(receipt.totalPaise)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="mbs-10 text-xs text-muted-foreground">
            Computer-generated receipt; no signature needed.
          </p>
        </article>
      </div>
    </main>
  )
}
