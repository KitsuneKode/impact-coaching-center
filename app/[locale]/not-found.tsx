import { IconArrowRight } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"

import { PigeonholeFigure } from "@/components/site/pigeonhole-figure"
import { Link } from "@/i18n/navigation"

/** The branded 404, in the reader's language, on the blue field. */
export default function NotFound() {
  const t = useTranslations("NotFound")
  const locale = useLocale()
  return (
    <main>
      <section data-hero="blue" aria-labelledby="missing-heading">
        <div data-hero-glow aria-hidden />
        <div aria-hidden className="h-(--header-height)" />
        <div className="relative container-page grid gap-10 pbs-10 pbe-20 md:pbs-16 md:pbe-28 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p
              aria-hidden
              className="tnum font-display text-[clamp(4rem,3rem+6vw,8rem)] leading-none font-semibold tracking-[-0.06em] text-[color-mix(in_oklch,white_22%,transparent)]"
            >
              404
            </p>
            <h1
              id="missing-heading"
              className="mbs-6 max-w-[22ch] font-display text-[clamp(1.7rem,1.2rem+1.6vw,2.6rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance"
            >
              {t("claim")} <span className="text-on-primary">{t("rest")}</span>
            </h1>
            <div className="mbs-10 flex flex-wrap gap-3">
              <Link
                href="/"
                data-press
                data-cta="amber"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-foreground"
              >
                {t("home")}
                <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
              </Link>
              <Link
                href="/courses"
                data-press
                data-cta="ghost-blue"
                className="inline-flex h-12 items-center rounded-full px-6 font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,white_45%,transparent)]"
              >
                {t("courses")}
              </Link>
              <Link
                href="/contact"
                data-press
                data-cta="ghost-blue"
                className="inline-flex h-12 items-center rounded-full px-6 font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,white_45%,transparent)]"
              >
                {t("talk")}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <PigeonholeFigure
              names={t.raw("figNames") as string[]}
              prefix={locale === "en" ? "" : `/${locale}`}
              labels={{
                title: t("figTitle"),
                hint: t("figHint"),
                empty: t("figEmpty"),
                open: t("figOpen"),
                out: t("figOut"),
              }}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
