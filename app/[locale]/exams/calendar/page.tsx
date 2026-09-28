import { IconArrowUpRight, IconBrandWhatsapp } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { dayInWords, ExamDateList } from "@/components/marketing/exam-dates"
import { ButtonAnchor } from "@/components/ui/button"
import { Lede, Section } from "@/components/ui/section"
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
  const { today, dates } = await examDates()
  const { upcoming, recent } = splitCalendar(dates, today)

  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <Lede as="h1" size="lg" claim={t("claim")} rest={t("rest")} />
      </Section>

      <Section size="sm" className="border-t border-border">
        {upcoming.length === 0 ? (
          <div className="grid gap-10 rounded-card bg-surface p-7 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <h2 className="type-lede">
                <span className="text-foreground">{t("emptyTitle")}</span>{" "}
                <span className="text-muted-foreground">{t("emptyRest")}</span>
              </h2>
              <ButtonAnchor
                href={contactHref({ kind: "dates" })}
                target="_blank"
                size="lg"
                className="mt-8"
              >
                <IconBrandWhatsapp stroke={1.75} aria-hidden />
                {t("notify")}
              </ButtonAnchor>
            </div>
            <ul className="grid content-start gap-2">
              {exams.map((exam) => (
                <li key={exam.slug}>
                  <a
                    href={exam.sources[0].href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="row-link text-[0.9375rem]"
                  >
                    <span className="grid">
                      <span className="font-bold">
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
                  className="text-xl font-bold lg:sticky lg:top-24 lg:self-start"
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
        <p className="mt-12 text-sm text-muted-foreground">{t("note")}</p>
      </Section>

      {recent.length > 0 ? (
        <Section size="sm" className="border-t border-border">
          <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
            <h2 className="text-xl font-bold text-muted-foreground">
              {t("recent")}
            </h2>
            <ExamDateList
              dates={recent.slice(0, 8)}
              today={today}
              locale={locale}
              past
            />
          </div>
        </Section>
      ) : null}
    </main>
  )
}
