import { IconArrowUpRight } from "@tabler/icons-react"
import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import type { ExamDate } from "@/lib/calendar"
import { examBySlug, pick } from "@/lib/exams"
import { cn } from "@/lib/utils"

const DAY_MS = 86_400_000
const utc = (day: string) => Date.parse(`${day}T00:00:00Z`)
const tag = (locale: string) => (locale === "as" ? "as-IN-u-nu-latn" : "en-IN")

/** A `yyyy-mm-dd` day in words, read as a calendar day with no timezone. */
export function dayInWords(
  day: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
) {
  return new Date(utc(day)).toLocaleDateString(tag(locale), {
    ...options,
    timeZone: "UTC",
  })
}

/**
 * A list of exam dates: the day large, what it is beside it, and the notice
 * it came from. `today` is the IST day the page was rendered for.
 */
export async function ExamDateList({
  dates,
  today,
  locale,
  showExam = true,
  past = false,
}: {
  dates: ExamDate[]
  today: string
  locale: string
  showExam?: boolean
  /** Recent dates: quieter, and no countdown. */
  past?: boolean
}) {
  const t = await getTranslations("Calendar")

  return (
    <ol>
      {dates.map((date) => {
        const title = (locale === "as" && date.titleAs) || date.title
        const exam = examBySlug(date.exam)
        const toStart = Math.round((utc(date.starts) - utc(today)) / DAY_MS)
        const open = !!date.ends && toStart <= 0 && date.ends >= today
        const toClose = date.ends
          ? Math.round((utc(date.ends) - utc(today)) / DAY_MS)
          : 0
        const when = past
          ? null
          : open
            ? t("closesIn", { n: toClose })
            : toStart === 0
              ? t("today")
              : t("inDays", { n: toStart })

        return (
          <li
            key={`${date.exam}-${date.kind}-${date.starts}-${date.title}`}
            className={cn(
              "grid grid-cols-[4rem_minmax(0,1fr)] gap-x-5 gap-y-3 border-t border-border py-6 first:border-t-0 first:pbs-0 md:grid-cols-[5rem_minmax(0,1fr)_auto] md:items-start",
              past && "text-muted-foreground"
            )}
          >
            <time dateTime={date.starts} className="grid leading-none">
              <span
                className={cn(
                  "tnum text-4xl font-bold tracking-tight",
                  past ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {Number(date.starts.slice(8))}
              </span>
              <span className="mbs-2 text-sm text-muted-foreground">
                {dayInWords(date.starts, locale, {
                  month: "short",
                  weekday: "short",
                })}
              </span>
            </time>

            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                {showExam && exam ? (
                  <>
                    <span className="font-bold text-foreground">
                      {pick(exam.short, locale)}
                    </span>
                    <span aria-hidden>·</span>
                  </>
                ) : null}
                <span>{t(`kinds.${date.kind}`)}</span>
                {date.tentative ? (
                  <Badge className="ms-1 py-0.5">{t("tentative")}</Badge>
                ) : null}
              </p>
              <p
                lang={locale === "as" && date.titleAs ? "as" : "en"}
                className={cn(
                  "mbs-1.5 text-lg leading-snug font-bold text-balance",
                  past ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {title}
              </p>
              {date.ends && date.ends !== date.starts ? (
                <p className="tnum mbs-1 text-sm text-muted-foreground">
                  {t("until", {
                    date: dayInWords(date.ends, locale, {
                      day: "numeric",
                      month: "long",
                    }),
                  })}
                </p>
              ) : null}
            </div>

            <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 md:col-start-3 md:justify-end md:pbs-1">
              {when ? (
                <span className="tnum inline-flex items-center gap-2 text-sm font-bold text-foreground">
                  {open ? (
                    <span
                      aria-hidden
                      className="size-2 rounded-full bg-highlight ring-4 ring-highlight/20"
                    />
                  ) : null}
                  {open ? `${t("open")} · ${when}` : when}
                </span>
              ) : null}
              <a
                href={date.source}
                target="_blank"
                rel="noreferrer noopener"
                className="link inline-flex items-center gap-1 text-sm"
              >
                {t("notice")}
                <IconArrowUpRight size={14} stroke={1.75} aria-hidden />
              </a>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
