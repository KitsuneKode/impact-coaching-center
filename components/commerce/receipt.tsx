"use client"

import { IconPrinter } from "@tabler/icons-react"
import Image from "next/image"

import { ButtonLink } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { api } from "@/convex/_generated/api"
import { contact, formatPhone } from "@/lib/brand"
import { formatPaise } from "@/lib/money"
import type { FunctionReturnType } from "convex/server"

export type ReceiptData = NonNullable<
  FunctionReturnType<typeof api.orders.myReceipt>
>

/** The stored address can open with the name already printed above it. */
const withoutName = (address: string, name: string) =>
  address.startsWith(`${name}, `) ? address.slice(name.length + 2) : address

/** Printed books: HSN 4901, nil-rated under GST. */
const BOOKS_HSN = "4901"

const when = (ms: number) =>
  new Date(ms).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

/** The receipt in outline: the buttons, the header, the lines, the total. */
export function ReceiptWaiting() {
  return (
    <main className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20">
      <output className="sr-only">Opening the receipt…</output>
      <div aria-hidden className="mx-auto max-w-[46rem]">
        <div className="mbe-6 flex gap-3">
          <Skeleton className="h-11 w-48 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
        <div className="rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)] md:p-10">
          <div className="flex justify-between gap-6">
            <div className="flex gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="grid content-start gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-56" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            </div>
            <div className="grid content-start justify-items-end gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mbs-8 grid gap-4 border-bs border-border pbs-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid gap-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
          <div className="mbs-8 grid gap-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="mbs-6 grid justify-items-end gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * A paid order's receipt, laid out to print on one A4 page. `shared` is the
 * WhatsApp link's copy: the phone arrives masked and the street left off.
 */
export function ReceiptView({
  receipt,
  shared = false,
}: {
  receipt: ReceiptData
  shared?: boolean
}) {
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
            className="inline-flex h-11 items-center gap-2 rounded-full bg-highlight px-5 font-semibold text-ink"
          >
            <IconPrinter aria-hidden size={18} stroke={1.75} />
            Print or save as PDF
          </button>
          <ButtonLink href="/account" variant="ghost">
            {shared ? "Log in to follow the order" : "Your orders"}
          </ButtonLink>
        </div>

        <article
          data-receipt
          className="rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)] md:p-10"
        >
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 flex-none place-items-center rounded-xl bg-white shadow-[inset_0_0_0_1px_var(--border)]">
                <Image
                  src="/brand/ict-mark.png"
                  alt=""
                  width={30}
                  height={30}
                  className="size-8"
                />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">
                  {receipt.seller.legalName}
                </p>
                <p className="mbs-1 max-w-[32ch] text-sm text-muted-foreground">
                  {withoutName(
                    receipt.seller.address,
                    receipt.seller.legalName
                  )}
                </p>
                <p className="tnum mbs-1 text-sm text-muted-foreground">
                  {formatPhone(contact.phones[0])} · {contact.email}
                </p>
                {receipt.seller.gstin ? (
                  <p className="tnum mbs-1 text-sm">
                    GSTIN {receipt.seller.gstin}
                  </p>
                ) : null}
              </div>
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

          {receipt.status === "cancelled" || receipt.status === "refunded" ? (
            <p className="mbs-6 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold">
              {receipt.status === "refunded"
                ? "This order was cancelled and the payment refunded."
                : "This order was cancelled. The payment is being refunded."}
            </p>
          ) : null}

          <dl className="mbs-8 grid gap-4 border-bs border-border pbs-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Billed to</dt>
              <dd className="mbs-1 font-semibold">{receipt.buyer.name}</dd>
              <dd className="tnum">
                {shared
                  ? receipt.buyer.phone
                  : formatPhone(receipt.buyer.phone)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {receipt.fulfilment === "delivery"
                  ? "Delivered to"
                  : "Collected from"}
              </dt>
              {receipt.fulfilment === "delivery" && receipt.address ? (
                <dd className="mbs-1">
                  {receipt.address.line1 ? `${receipt.address.line1}, ` : ""}
                  {receipt.address.line2 ? `${receipt.address.line2}, ` : ""}
                  {receipt.address.landmark
                    ? `${receipt.address.landmark}, `
                    : ""}
                  {receipt.address.city}
                  {receipt.address.district
                    ? `, ${receipt.address.district}`
                    : ""}{" "}
                  <span className="tnum">{receipt.address.pin}</span>
                </dd>
              ) : (
                <dd className="mbs-1">
                  The centre,{" "}
                  {withoutName(
                    receipt.seller.address,
                    receipt.seller.legalName
                  )}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-muted-foreground">Order</dt>
              <dd className="tnum mbs-1 font-semibold">{receipt.reference}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Paid by</dt>
              <dd className="mbs-1 capitalize">{receipt.method}</dd>
              <dd className="tnum text-xs text-muted-foreground">
                {receipt.paymentId}
              </dd>
            </div>
          </dl>

          <table className="mbs-8 w-full text-sm">
            <caption className="sr-only">What was bought</caption>
            <thead>
              <tr className="border-be border-border text-muted-foreground">
                <th scope="col" className="pbe-2 text-start font-normal">
                  Item
                </th>
                <th scope="col" className="ps-4 pbe-2 text-end font-normal">
                  HSN
                </th>
                <th scope="col" className="ps-4 pbe-2 text-end font-normal">
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
                  <td className="tnum pbs-3 text-end text-muted-foreground">
                    {BOOKS_HSN}
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
                  colSpan={3}
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
                  colSpan={3}
                  className="pbs-1 text-end font-normal text-muted-foreground"
                >
                  Delivery
                </th>
                <td className="tnum pbs-1 text-end">
                  {formatPaise(receipt.deliveryPaise)}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  colSpan={3}
                  className="pbs-1 text-end font-normal text-muted-foreground"
                >
                  GST
                </th>
                <td className="tnum pbs-1 text-end">{formatPaise(0)}</td>
              </tr>
              <tr className="text-base">
                <th scope="row" colSpan={3} className="pbs-3 text-end">
                  Total paid
                </th>
                <td className="tnum ps-4 pbs-3 text-end font-display text-xl font-semibold">
                  {formatPaise(receipt.totalPaise)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="mbs-10 text-xs text-muted-foreground">
            Printed books (HSN {BOOKS_HSN}) are exempt from GST, so no tax is
            charged. Computer-generated receipt; no signature needed.
          </p>
        </article>
      </div>
    </main>
  )
}
