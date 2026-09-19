"use client"

import { IconArrowRight } from "@tabler/icons-react"

import { useDaysUntilBatch } from "@/components/marketing/batch-countdown"
import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { nextBatch, offer } from "@/lib/brand"
import { contactHref } from "@/lib/contact"

/**
 * Kobbe's closing move: one two-tone sentence and one button.
 *
 * The claim adapts to the calendar. Before VICTOR8 starts it names the real
 * deadline; after, it falls back to a line that stays true, so the page never
 * shows an expired urgency.
 */
export function FinalCta() {
  const days = useDaysUntilBatch()

  const claim =
    days !== null && days >= 0 && days <= 14
      ? days === 0
        ? `${nextBatch.name} starts today.`
        : days === 1
          ? `${nextBatch.name} starts tomorrow.`
          : `${nextBatch.name} starts in ${days} days.`
      : "The next batch is forming now."

  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <Reveal className="flex flex-col gap-8 border-t border-border pt-14 md:flex-row md:items-end md:justify-between md:pt-16">
          <h2 className="type-display max-w-[42rem]">
            <span className="text-foreground">{claim}</span>
            <span className="block text-muted-foreground">
              Sit in on a class this week. It costs nothing.
            </span>
          </h2>
          <ButtonAnchor
            href={contactHref({ kind: "workshop" })}
            target="_blank"
            size="lg"
            className="self-start md:self-auto"
          >
            {offer.cta}
            <IconArrowRight data-nudge stroke={1.75} />
          </ButtonAnchor>
        </Reveal>
      </div>
    </section>
  )
}
