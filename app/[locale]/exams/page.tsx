import { IconArrowRight, IconCalendarEvent } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { Link } from "@/i18n/navigation"
import { exams, pick } from "@/lib/exams"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/exams">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Exams" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/exams", locale),
    openGraph: openGraphFor("/exams", t("title"), t("description"), locale),
  }
}

/** Every exam ICT teaches, one guide each. */
export default async function ExamsPage({
  params,
}: PageProps<"/[locale]/exams">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Exams")
  const tc = await getTranslations("Calendar")
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <Lede as="h1" size="lg" claim={t("claim")} rest={t("rest")} />
        <Reveal className="mt-12 grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.slug}
              href={`/exams/${exam.slug}`}
              className="group flex flex-col rounded-card border border-border bg-card p-7 shadow-frame transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="text-sm text-muted-foreground">
                {pick(exam.body, locale)}
              </span>
              <span className="mt-2 text-xl leading-snug font-bold text-balance">
                {pick(exam.name, locale)}
              </span>
              <span className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {pick(exam.summary, locale)}
              </span>
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold">
                {t("read")}
                <IconArrowRight
                  size={15}
                  stroke={2}
                  aria-hidden
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
          <Link
            href="/exams/calendar"
            className="group flex items-center gap-5 rounded-card bg-surface p-7 transition-transform duration-300 hover:-translate-y-0.5 md:col-span-2"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-control bg-card shadow-frame">
              <IconCalendarEvent size={22} stroke={1.75} aria-hidden />
            </span>
            <span className="grid min-w-0">
              <span className="text-xl leading-snug font-bold">
                {tc("calendar")}
              </span>
              <span className="text-[0.9375rem] text-muted-foreground">
                {tc("calendarRest")}
              </span>
            </span>
            <IconArrowRight
              size={18}
              stroke={2}
              aria-hidden
              className="ml-auto shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
        <p className="mt-8 text-sm text-muted-foreground">{t("changes")}</p>
      </Section>
    </main>
  )
}
