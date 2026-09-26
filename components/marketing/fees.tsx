import { IconArrowRight, IconPlus } from "@tabler/icons-react"
import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { Section } from "@/components/ui/section"
import { fees, included, offer } from "@/lib/brand"

/** What one fee covers, for every batch. */
export function Fees() {
  return (
    <Section id="fees">
      <Reveal className="rounded-card bg-surface p-7 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="type-lede max-w-[26rem]">
              <span className="text-foreground">
                Every batch includes all of it.
              </span>
              <span className="text-muted-foreground">
                {" "}
                {fees.note} {fees.scholarship}
              </span>
            </h2>

            <p className="mt-6 max-w-[26rem] text-sm leading-relaxed text-muted-foreground">
              {offer.promise}
            </p>
            <Link
              href="/courses"
              className="link mt-4 inline-flex items-center gap-1 text-sm font-medium"
            >
              Compare every course and its fee
              <IconArrowRight size={14} stroke={1.75} aria-hidden />
            </Link>
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
