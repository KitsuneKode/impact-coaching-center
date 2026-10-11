import { IconArrowUpRight } from "@tabler/icons-react"

import { links, selections } from "../../_data"
import { Tilt } from "../../_fx"
import { container, external } from "../_theme"

/** The merit list, as in Pulse. */
export function Results() {
  return (
    <section aria-labelledby="results-h" className="pb-20 md:pb-28">
      <div className={`${container} grid gap-4 lg:grid-cols-12`}>
        <div className="rounded-[28px] bg-[var(--pu-ink)] p-8 text-white md:p-10 lg:col-span-4">
          <h2
            id="results-h"
            className="text-2xl leading-tight font-semibold tracking-[-0.02em]"
          >
            On the APSC CCE 2022 list, prepared at ICT.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            className="mt-6 inline-flex items-center gap-1 text-sm text-[#AEB9D3] underline decoration-white/25 underline-offset-4 hover:text-white"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
          </a>
        </div>
        {selections.map((s) => (
          <Tilt key={s.name} max={3} className="lg:col-span-4">
            <figure className="flex h-full flex-col rounded-[28px] bg-[var(--pu-card)] p-8 shadow-[0_0_0_1px_var(--pu-line)] md:p-10">
              <span className="font-[family-name:var(--pu-display)] text-6xl font-semibold text-[var(--pu-blue)] tabular-nums">
                {s.serial}
              </span>
              <blockquote className="mt-6 leading-relaxed">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto pt-6">
                <span className="block font-semibold">{s.name}</span>
                <span className="text-sm text-[var(--pu-muted)]">{s.post}</span>
              </figcaption>
            </figure>
          </Tilt>
        ))}
      </div>
    </section>
  )
}
