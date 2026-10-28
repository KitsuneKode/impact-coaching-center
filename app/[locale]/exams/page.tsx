import { IconArrowRight, IconCalendarEvent } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
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

/** Every exam ICT teaches, one guide each, and the dates calendar. */
export default async function ExamsPage({
  params,
}: PageProps<"/[locale]/exams">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Exams")
  const tc = await getTranslations("Calendar")
  const nav = await getTranslations("Nav")

  return (
    <main>
      <PageHead
        trail={[{ label: nav("exams") }]}
        title={t("claim")}
        lede={t("rest")}
      />

      <section className="container-page pbe-20 md:pbe-28">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,26rem),1fr))] gap-4">
          {exams.map((exam, i) => (
            <li key={exam.slug}>
              <Reveal delay={(i % 2) * 0.05} className="h-full">
                <Link
                  href={`/exams/${exam.slug}`}
                  data-row-card
                  className="flex h-full flex-col p-7"
                >
                  <span className="text-sm font-semibold text-primary">
                    {pick(exam.body, locale)}
                  </span>
                  <span className="mbs-2 font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance">
                    {pick(exam.name, locale)}
                  </span>
                  <span className="mbs-3 text-muted-foreground">
                    {pick(exam.summary, locale)}
                  </span>
                  <span className="mbs-auto flex items-center justify-between gap-4 pbs-6 font-semibold">
                    {t("read")}
                    <span
                      data-row-go
                      className="grid size-11 place-items-center rounded-full"
                    >
                      <IconArrowRight aria-hidden size={18} stroke={2} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
          <li className="col-span-full">
            <Reveal>
              <Link
                href="/exams/calendar"
                data-row-card
                data-calendar-card
                className="flex items-center gap-5 p-6 md:p-7"
              >
                <span className="grid size-12 flex-none place-items-center rounded-2xl bg-white/12">
                  <IconCalendarEvent aria-hidden size={22} stroke={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-semibold">
                    {tc("calendar")}
                  </span>
                  <span className="block text-on-primary">
                    {tc("calendarRest")}
                  </span>
                </span>
                <span
                  data-row-go
                  className="grid size-11 flex-none place-items-center rounded-full"
                >
                  <IconArrowRight aria-hidden size={18} stroke={2} />
                </span>
              </Link>
            </Reveal>
          </li>
        </ul>
        <p className="mbs-8 text-sm text-muted-foreground">{t("changes")}</p>
      </section>
    </main>
  )
}
