import { IconPhone } from "@tabler/icons-react"

import { joining, phone, tel } from "../../_data"
import { container } from "../_theme"
import { PrimaryCta } from "./primary-cta"

/** The third blue field: "Your first class is free." */
export function JoinBand() {
  return (
    <section
      data-pf-end
      aria-labelledby="join-h"
      className="bg-[var(--pu-blue)] py-20 text-white md:py-28"
    >
      <div className={`${container} grid gap-12 lg:grid-cols-12`}>
        <div className="lg:col-span-7">
          <h2
            id="join-h"
            className="text-[clamp(2.2rem,5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]"
          >
            Your first class is free.
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <PrimaryCta />
            <a
              data-press
              href={tel}
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold tabular-nums shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45)] hover:bg-white/10"
            >
              <IconPhone aria-hidden size={18} stroke={1.75} />
              Call {phone}
            </a>
          </div>
        </div>
        <ol className="grid gap-6 lg:col-span-5">
          {joining.map((j) => (
            <li key={j.verb} className="border-t border-white/25 pt-4">
              <p className="font-semibold">{j.verb}</p>
              <p className="mt-1 text-sm text-[var(--pu-on-blue)]">{j.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
