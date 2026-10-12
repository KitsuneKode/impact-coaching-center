import { IconArrowUpRight, IconBrandWhatsapp } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { dayInWords, ExamDateList } from "@/components/marketing/exam-dates"
import { PageHead } from "@/components/site/page-head"
import { byMonth, splitCalendar } from "@/lib/calendar"
import { examDates } from "@/lib/catalog-server"
import { contactHref } from "@/lib/contact"
import { exams, pick } from "@/lib/exams"
import { alternatesFor, openGraphFor } from "@/lib/site"

/* Matches the cached read in lib/catalog-server.ts. */
export const revalidate = 3600

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/exams/calendar">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Calendar" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/exams/calendar", locale),
    openGraph: openGraphFor(
      "/exams/calendar",
      t("title"),
      t("description"),
      locale
    ),
  }
}

/** Every notified date, by month, each with the notice it came from. */
export default async function CalendarPage({
  params,
}: PageProps<"/[locale]/exams/calendar">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Calendar")
  const te = await getTranslations("Exams")
  const { today, dates } = await examDates()
  const { upcoming, recent } = splitCalendar(dates, today)

  return (
    <main>
      <PageHead
        trail={[
          { label: te("exams"), href: "/exams" },
          { label: t("calendar") },
        ]}
        title={t("claim")}
        lede={t("rest")}
      />

      <section className="container-page pbe-20">
        {upcoming.length === 0 ? (
          <div className="grid gap-10 rounded-[32px] bg-highlight p-7 md:p-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h2 className="font-display text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.03em] text-balance">
                {t("emptyTitle")}{" "}
                <span className="text-[color-mix(in_oklch,var(--foreground)_78%,var(--highlight))]">
                  {t("emptyRest")}
                </span>
              </h2>
              <a
                href={contactHref({ kind: "dates" })}
                target="_blank"
                rel="noreferrer noopener"
                data-press
                className="mbs-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 font-semibold text-background"
              >
                <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
                {t("notify")}
              </a>
            </div>
            <ul className="grid content-start gap-2 lg:col-span-6">
              {exams.map((exam) => (
                <li key={exam.slug}>
                  <a
                    href={exam.sources[0].href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-row-card
                    className="flex items-center justify-between gap-4 ps-5 pe-5 pbs-4 pbe-4"
                  >
                    <span className="grid">
                      <span className="font-semibold">
                        {pick(exam.name, locale)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {pick(exam.body, locale)}
                      </span>
                    </span>
                    <IconArrowUpRight
                      size={16}
                      stroke={1.75}
                      aria-hidden
                      className="shrink-0 text-muted-foreground"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid gap-12">
            {byMonth(upcoming).map(([month, list]) => (
              <section
                key={month}
                aria-labelledby={`month-${month}`}
                className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12"
              >
                <h2
                  id={`month-${month}`}
                  className="font-display text-2xl font-semibold tracking-[-0.02em] lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start"
                >
                  {dayInWords(`${month}-01`, locale, {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <ExamDateList dates={list} today={today} locale={locale} />
              </section>
            ))}
          </div>
        )}
        <p className="mbs-12 text-sm text-muted-foreground">{t("note")}</p>
      </section>

      {recent.length > 0 ? (
        <section className="container-page pbe-20 md:pbe-28">
          <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-muted-foreground">
              {t("recent")}
            </h2>
            <ExamDateList
              dates={recent.slice(0, 8)}
              today={today}
              locale={locale}
              past
            />
          </div>
        </section>
      ) : null}
    </main>
  )
}
