import { useTranslations } from "next-intl"
import { IconArrowRight, IconPlus } from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"

import { Reveal } from "@/components/motion/reveal"
import { Section } from "@/components/ui/section"
import { useContent } from "@/i18n/content"

/** What one fee covers, for every batch. */
export function Fees() {
  const t = useTranslations("Fees")
  const ta = useTranslations("Assist")
  const offer = useTranslations("Offer")
  const content = useContent()
  return (
    <Section id="fees">
      <Reveal className="rounded-card bg-surface p-7 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="type-lede max-w-[26rem]">
              <span className="text-foreground">{t("claim")}</span>
              <span className="text-muted-foreground">
                {" "}
                {t("note")} {t("scholarship")}
              </span>
            </h2>

            <p className="mt-6 max-w-[26rem] text-sm leading-relaxed text-muted-foreground">
              {offer("promise")}
            </p>
            <Link
              href="/assist"
              className="link mt-4 mr-5 inline-flex items-center gap-1 text-sm font-medium"
            >
              {ta("learnMore")}
              <IconArrowRight size={14} stroke={1.75} aria-hidden />
            </Link>
            <Link
              href="/courses"
              className="link mt-4 inline-flex items-center gap-1 text-sm font-medium"
            >
              {t("compare")}
              <IconArrowRight size={14} stroke={1.75} aria-hidden />
            </Link>
          </div>

          <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:content-start">
            {content.included.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-snug">
                <IconPlus
                  size={15}
                  stroke={1.75}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  )
}
