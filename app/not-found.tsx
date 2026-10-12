import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"

/** The branded 404 for paths outside the localised site, on the blue field. */
export default function NotFound() {
  return (
    <main>
      <section data-hero="blue" aria-labelledby="missing-heading">
        <div data-hero-glow aria-hidden />
        <div className="relative container-page pbs-16 pbe-20 md:pbs-24 md:pbe-28">
          <p
            aria-hidden
            className="tnum font-display text-[clamp(5rem,3rem+12vw,12rem)] leading-none font-semibold tracking-[-0.06em] text-[color-mix(in_oklch,white_22%,transparent)]"
          >
            404
          </p>
          <h1
            id="missing-heading"
            className="mbs-6 max-w-[20ch] font-display text-[clamp(1.8rem,1.3rem+2.4vw,3.2rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance"
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
      </section>
    </main>
  )
}
