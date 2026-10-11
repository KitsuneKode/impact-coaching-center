import Link from "next/link"
import type { CSSProperties } from "react"

import { nextBatch, rupees, timetable } from "../../_data"
import { siteBase } from "../_theme"

/**
 * The VICTOR ticket: the newest batch as a boarding pass. Pulse's own markup;
 * the link goes to Pulse's course page (a bare `/courses/...` redirects to the
 * index on this branch). Returns null when the batch leaves the timetable.
 */
export function BatchTicket({ className }: { className?: string }) {
  const victor = timetable.find((t) => t.name === nextBatch.name)
  if (!victor) return null
  return (
    <Link
      data-hero-ticket
      href={`${siteBase}${victor.href}`}
      className={`block ${className ?? ""}`}
    >
      <span data-ticket-wrap className="block">
        <span
          data-ticket
          style={{ "--cut": "34%" } as CSSProperties}
          className="relative grid grid-cols-[34%_1fr] rounded-[22px] bg-white text-[var(--pu-ink)]"
        >
          <span data-perf aria-hidden />
          <span className="flex flex-col justify-between p-5">
            <span className="text-xs font-semibold text-[var(--pu-muted)]">
              Started
            </span>
            <span className="font-[family-name:var(--pu-display)] text-2xl leading-none font-semibold">
              14
              <span className="block text-sm">Sept</span>
            </span>
          </span>
          <span className="p-5 pl-6">
            <span className="block text-xs font-semibold text-[var(--pu-muted)]">
              The newest batch
            </span>
            <span className="mt-1 block font-[family-name:var(--pu-display)] text-xl font-semibold">
              {victor.name}
            </span>
            <span className="block text-sm text-[var(--pu-muted)]">
              {victor.exam}
            </span>
            <span className="mt-4 flex items-end justify-between gap-3">
              <span className="font-[family-name:var(--pu-display)] text-lg font-semibold whitespace-nowrap tabular-nums">
                {victor.when}
              </span>
              <span className="font-semibold tabular-nums">
                {rupees(victor.price)}
              </span>
            </span>
          </span>
        </span>
      </span>
    </Link>
  )
}
