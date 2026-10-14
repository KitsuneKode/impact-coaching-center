import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"

import { PigeonholeFigure } from "@/components/site/pigeonhole-figure"
import { HOLES } from "@/components/site/pigeonholes-art"

/** The branded 404 for paths outside the localised site, on the blue field. */
export default function NotFound() {
  return (
    <main>
      <section data-hero="blue" aria-labelledby="missing-heading">
        <div data-hero-glow aria-hidden />
        <div className="relative container-page grid gap-10 pbs-16 pbe-20 md:pbs-24 md:pbe-28 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p
              aria-hidden
              className="tnum font-display text-[clamp(4rem,3rem+6vw,8rem)] leading-none font-semibold tracking-[-0.06em] text-[color-mix(in_oklch,white_22%,transparent)]"
            >
              404
            </p>
            <h1
              id="missing-heading"
              className="mbs-6 max-w-[22ch] font-display text-[clamp(1.7rem,1.2rem+1.6vw,2.6rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance"
            >
              This page does not exist.{" "}
              <span className="text-on-primary">
                The link may be mistyped, or it may have moved.
              </span>
            </h1>
            <div className="mbs-10 flex flex-wrap gap-3">
              <Link
                href="/"
                data-press
                data-cta="amber"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-foreground"
              >
                Home
                <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
              </Link>
              <Link
                href="/courses"
                data-press
                data-cta="ghost-blue"
                className="inline-flex h-12 items-center rounded-full px-6 font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,white_45%,transparent)]"
              >
                Courses and fees
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <PigeonholeFigure
              names={HOLES.map((hole) => hole.name)}
              labels={{
                title: "Pigeonholes at the centre",
                hint: "Point at a pigeonhole, or tap a name",
                empty: "404 · nothing filed here",
                open: "tap to open",
                out: "The lamp is out · try again",
              }}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
