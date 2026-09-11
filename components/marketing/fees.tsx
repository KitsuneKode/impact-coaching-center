import { IconArrowUpRight, IconPlus } from "@tabler/icons-react"

import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { courseFeeHref, courses, demoHref, included, offer } from "@/lib/brand"

/**
 * Fees and what they buy, laid out like kobbe.io's pricing: a recessed panel
 * that explains, beside one that lists and asks.
 *
 * This is the section a parent comes back to. It answers the two questions
 * that decide the enquiry, "what do I get" and "what does it cost", and it is
 * honest that the second one is answered per batch.
 */
export function Fees() {
  return (
    <Section id="fees">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="rounded-card bg-surface p-7 md:p-10">
          <h2 className="max-w-[34rem] text-[1.1875rem] leading-[1.42] font-medium tracking-[-0.018em] text-balance md:text-[1.3125rem]">
            <span className="text-foreground">Fees.</span>
            <span className="text-muted-foreground">
              {" "}
              One fee per batch covers everything below. ICT gives you the exact
              figure for the batch you pick, not a range, and scholarships are
              open through the ASSIST test.
            </span>
          </h2>

          <ul className="mt-9 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
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
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col rounded-card bg-surface p-7 md:p-10">
          <p className="text-sm text-muted-foreground">Pick a course</p>
          <ul className="mt-4">
            {courses.map((course) => (
              <li key={course.slug}>
                <a
                  href={courseFeeHref(course)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="row-link group"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9875rem] font-medium">{course.exam}</span>
                    <span className="block text-sm text-muted-foreground">{course.duration}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    {course.fee ?? "Get the fee"}
                    <IconArrowUpRight size={15} stroke={1.75} />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <ButtonAnchor href={demoHref} target="_blank" size="lg" className="w-full">
              {offer.cta}
            </ButtonAnchor>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              {offer.promise}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
