import { LectureList } from "@/components/marketing/lecture-list"
import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { links } from "@/lib/brand"

/**
 * The section that removes the risk from the decision: anyone can watch an
 * hour of ICT teaching before they message anyone.
 */
export function Classes() {
  return (
    <Section id="classes">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <Lede
            label="Free classes"
            claim="Watch a full class before you decide."
            rest="These are the most-watched lectures on the ICT channel this year, by the same teachers you would join."
            link={{
              href: links.youtube,
              label: "All lectures",
              external: true,
            }}
          />
        </Reveal>
        <Reveal delay={0.08}>
          <LectureList />
        </Reveal>
      </div>
    </Section>
  )
}
