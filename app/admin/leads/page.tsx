"use client"

import { useQuery } from "convex/react"
import Link from "next/link"

import { Section } from "@/components/ui/section"
import { api } from "@/convex/_generated/api"
import { formatPhone } from "@/lib/brand"

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  enrolled: "Enrolled",
  lost: "Lost",
}

function when(at: number | undefined) {
  if (!at) return "—"
  return new Date(at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * The follow-up queue. Read-only by design.
 *
 * No status changes, notes or export yet: every one of those is a write, and
 * a write needs an audit record and a considered undo story. Seeing the queue
 * is the half that is safe to ship first.
 *
 * The role check is NOT here. `api.leads.inbox` refuses a non-staff caller
 * itself, because a guard in this component protects the markup and not the
 * data - the query is one fetch away for anyone with a session.
 */
export default function AdminLeadsPage() {
  const result = useQuery(api.leads.inbox)

  if (result === undefined)
    return (
      <main>
        <Section size="sm" className="pt-26 md:pt-30">
          <p className="text-muted-foreground">Loading…</p>
        </Section>
      </main>
    )

  if (!result.authorized)
    return (
      <main>
        <Section size="sm" className="pt-26 md:pt-30">
          <h1 className="type-display">
            <span className="text-foreground">Staff only.</span>
          </h1>
          <p className="type-lede mt-4 max-w-160 text-muted-foreground">
            This page is for Impact Career Tutorials staff. If you are staff and
            seeing this,{" "}
            <Link
              href="/sign-in?next=/admin/leads"
              className="text-foreground underline underline-offset-4"
            >
              sign in
            </Link>{" "}
            with the number ICT has on file for you.
          </p>
        </Section>
      </main>
    )

  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="type-display">
          <span className="text-foreground">Enquiries.</span>{" "}
          <span className="text-muted-foreground">
            {result.leads.length} to follow up.
          </span>
        </h1>

        {result.leads.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            No enquiries yet. They appear here as soon as someone sends the form
            on the site.
          </p>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-160 border-collapse text-left text-[0.9375rem]">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Name
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Mobile
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Exam
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Status
                  </th>
                  <th scope="col" className="py-3 font-medium">
                    Last enquiry
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      {lead.name || (
                        <span className="text-muted-foreground">Not given</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <a
                        href={`tel:${lead.phone}`}
                        className="tnum underline underline-offset-4"
                      >
                        {formatPhone(lead.phone)}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {lead.interestTrack ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {STATUS_LABELS[lead.leadStatus ?? ""] ?? "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {when(lead.lastEnquiryAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </main>
  )
}
