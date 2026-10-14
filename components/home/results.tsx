import { IconArrowUpRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { links, selections } from "@/lib/brand"
import { Tilt } from "./tilt"

/** The merit list: ICT's two officers, in their own words. */
export function Results() {
  const t = useTranslations("Pulse")
  return (
    <section aria-labelledby="results-heading" className="pbe-20 md:pbe-28">
      <div className="container-page grid gap-4 lg:grid-cols-12">
        <div className="rounded-[28px] bg-foreground p-8 text-white md:p-10 lg:col-span-4">
          <h2
            id="results-heading"
            className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em]"
          >
            {t("resultsHeading")}
          </h2>
          <a
            href={links.apscResultPdf}
            target="_blank"
            rel="noreferrer noopener"
            data-quiet-link
            className="mbs-6 inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4"
          >
            {t("resultsLink")}
            <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
          </a>
        </div>
        {selections.map((person) => (
          <Tilt key={person.name} max={3} className="lg:col-span-4">
            <figure className="flex h-full flex-col rounded-[28px] bg-card p-8 shadow-[0_0_0_1px_var(--border)] md:p-10">
              <span className="tnum font-display text-6xl font-semibold text-primary">
                {person.serial}
              </span>
              <blockquote className="mbs-6 leading-relaxed">
                &ldquo;{person.quote}&rdquo;
              </blockquote>
              <figcaption className="mbs-auto pbs-6">
                <span className="block font-semibold">{person.name}</span>
                <span className="text-sm text-muted-foreground">
                  {person.post}
                </span>
              </figcaption>
            </figure>
          </Tilt>
        ))}
      </div>
    </section>
  )
}
