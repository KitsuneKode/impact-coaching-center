"use client"

import { IconPrinter } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { brand, contact, formatPhone, place } from "@/lib/brand"
import { isOrderReference } from "@/lib/order-reference"

/**
 * Parcel labels for the orders picked in the queue: eight to an A4 sheet,
 * to cut and tape on. The buyer's address large, ICT's small, the
 * reference on both sides of the fold so a returned parcel finds its order.
 */
export default function OrderLabelsPage() {
  if (!convexConfigured) return <main className="p-8">Not available here.</main>
  return <Labels />
}

function Labels() {
  const params = useSearchParams()
  const references = (params.get("refs") ?? "")
    .split(",")
    .filter(isOrderReference)
  const labels = useQuery(api.orders.labelsFor, { references })

  return (
    <main className="mx-auto max-w-[210mm] p-6 print:max-w-none print:p-0">
      <div className="mbe-6 flex flex-wrap items-center gap-4 print:hidden">
        <h1 className="me-auto text-xl font-semibold">
          {labels === undefined
            ? "Preparing labels…"
            : `${labels.length} parcel ${labels.length === 1 ? "label" : "labels"}`}
        </h1>
        <Button
          size="md"
          disabled={!labels?.length}
          onClick={() => window.print()}
        >
          <IconPrinter stroke={1.75} />
          Print
        </Button>
      </div>
      {labels && labels.length < references.length ? (
        <p className="mbe-6 text-sm text-muted-foreground print:hidden">
          {references.length - labels.length} of the orders picked are
          collections or have no address, so they have no label.
        </p>
      ) : null}

      <ol className="grid grid-cols-2 gap-[4mm] print:gap-0">
        {labels?.map((label) => (
          <li
            key={label.reference}
            className="flex h-[70mm] break-inside-avoid flex-col justify-between border border-dashed border-black/40 bg-white p-[6mm] text-black"
          >
            <div>
              <p className="text-xs tracking-wide uppercase">To</p>
              <p className="mbs-1 text-lg leading-snug font-semibold">
                {label.name}
              </p>
              <address className="text-base leading-snug not-italic">
                {label.address.line1}
                {label.address.line2 ? (
                  <>
                    <br />
                    {label.address.line2}
                  </>
                ) : null}
                {label.address.landmark ? (
                  <>
                    <br />
                    {label.address.landmark}
                  </>
                ) : null}
                <br />
                {label.address.city}
                {label.address.district ? `, ${label.address.district}` : ""}
                <br />
                Assam{" "}
                <span className="tnum font-semibold">{label.address.pin}</span>
              </address>
              <p className="tnum mbs-1">{formatPhone(label.phone)}</p>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-black/30 pbs-2 text-xs leading-snug">
              <p>
                From {brand.legalName}
                <br />
                {place.street}, {place.city} {place.pin}
                <br />
                <span className="tnum">{formatPhone(contact.phones[0])}</span>
              </p>
              <p className="tnum text-end">
                <span className="block text-sm font-semibold whitespace-nowrap">
                  {label.reference}
                </span>
                {label.sets} {label.sets === 1 ? "set" : "sets"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
