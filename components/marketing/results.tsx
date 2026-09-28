import { useTranslations } from "next-intl"
import { IconArrowUpRight, IconCircleCheckFilled } from "@tabler/icons-react"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { Link } from "@/i18n/navigation"

import { links, selections } from "@/lib/brand"

/**
 * One officer, one card. The serial is the proof, so it is the largest thing
 * on the card and it is the number printed in the commission's own result,
 * never a rank ICT's marketing has claimed elsewhere.
 */
export function SelectionCard({
  person,
}: {
  person: (typeof selections)[number]
}) {
  const t = useTranslations("Results")
  return (
    <article className="flex flex-col rounded-card border border-border bg-card p-6 shadow-frame md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="tnum text-[3rem] leading-none font-medium tracking-[-0.04em]">
            {person.serial}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t("serial")}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-verified/25 bg-verified/8 px-2.5 py-1 text-xs font-medium text-verified">
          <IconCircleCheckFilled size={14} aria-hidden />
          {t("verified")}
        </span>
      </div>

      {person.quote ? (
        <blockquote className="mt-6 font-display text-[1.375rem] leading-snug text-pretty text-foreground">
          &ldquo;{person.quote}&rdquo;
        </blockquote>
      ) : null}

      <div className="mt-auto border-t border-border pt-5 [blockquote+&]:mt-6">
        <p className="text-[1.0625rem] font-medium">{person.name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{person.post}</p>
      </div>
    </article>
  )
}

/** Results: the numbers first, then the voices. */
export function Results() {
  const t = useTranslations("Results")
  return (
    <Section id="results" bleed>
      <div className="container-page">
        <Reveal>
          <Lede
            label={t("label")}
            claim={t("claim")}
            rest={t("rest")}
            link={{
              href: links.apscResultPdf,
              label: t("open"),
              external: true,
            }}
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-10 grid gap-5 md:grid-cols-2">
          {selections.map((person) => (
            <SelectionCard key={person.serial} person={person} />
          ))}
        </Reveal>
      </div>

      <div className="container-page">
        <Reveal delay={0.16}>
          <Link
            href="/success-stories"
            className="link mt-10 inline-flex items-center gap-1 text-sm"
          >
            {t("more")}
            <IconArrowUpRight size={14} stroke={1.75} />
          </Link>
        </Reveal>
      </div>
    </Section>
  )
}
