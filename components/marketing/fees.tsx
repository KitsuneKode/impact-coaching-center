import { IconPlus } from "@tabler/icons-react"

import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { demoHref, fees, included, offer } from "@/lib/brand"

/**
 * What one fee covers, for every batch.
 *
 * The course cards carry the price and the few points that separate one course
 * from another. This panel carries the full list, which is the same whichever
 * course you pick, so it is stated once here instead of three times up there.
 */
export function Fees() {
  return (
    <Section id="fees">
      <Reveal className="rounded-card bg-surface p-7 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="type-lede max-w-[26rem]">
              <span className="text-foreground">Every batch includes all of it.</span>
              <span className="text-muted-foreground">
                {" "}
                {fees.note} {fees.scholarship}
              </span>
            </h2>

            <ButtonAnchor
              href={demoHref}
              target="_blank"
              size="lg"
              className="mt-8 w-full sm:w-auto"
            >
              {offer.cta}
            </ButtonAnchor>
            <p className="mt-3 max-w-[26rem] text-sm leading-relaxed text-muted-foreground">
              {offer.promise}
            </p>
          </div>

          <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:content-start">
            {included.map((item) => (
              <li key={item.text} className="flex gap-2.5 text-sm leading-snug">
                <IconPlus
                  size={15}
                  stroke={1.75}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  )
}
