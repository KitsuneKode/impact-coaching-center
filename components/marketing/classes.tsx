import { useTranslations } from "next-intl"
import { LectureList } from "@/components/marketing/lecture-list"
import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { links } from "@/lib/brand"

/**
 * The section that removes the risk from the decision: anyone can watch an
 * hour of ICT teaching before they message anyone.
 */
export function Classes() {
  const t = useTranslations("Classes")
  return (
    <Section id="classes">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <Lede
            label={t("label")}
            claim={t("claim")}
            rest={t("rest")}
            link={{
              href: links.youtube,
              label: t("all"),
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
