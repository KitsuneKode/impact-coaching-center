import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { schedules } from "@/lib/brand"
import { inr, type Course } from "@/lib/courses"
import { cn } from "@/lib/utils"

/** "2026-11-02" in IST, as day and short month in the page's language. */
function dayAndMonth(iso: string, locale: string) {
  const date = new Date(`${iso}T00:00:00+05:30`)
  const format = (options: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString(locale === "as" ? "as-IN-u-nu-latn" : "en-IN", {
      timeZone: "Asia/Kolkata",
      ...options,
    })
  return { day: format({ day: "numeric" }), month: format({ month: "short" }) }
}

/**
 * The newest batch as a boarding pass. The stub shows its start date when ICT
 * has entered one in the admin; until then it simply says "New batch".
 */
export function BatchTicket({
  course,
  today,
  className,
}: {
  course: Course
  /** IST `yyyy-mm-dd`, so the server decides started or not. */
  today: string
  className?: string
}) {
  const t = useTranslations("Pulse")
  const locale = useLocale()
  const when = course.timing ?? schedules[course.id]?.when
  const starts = course.batchStarts
    ? dayAndMonth(course.batchStarts, locale)
    : null

  return (
    <Link
      data-hero-ticket
      href={`/courses/${course.slug}`}
      className={cn("text-foreground", className)}
    >
      <span data-ticket-wrap>
        <span
          data-ticket
          className="relative grid grid-cols-[34%_1fr] rounded-[22px] bg-card"
        >
          <span data-perf aria-hidden />
          <span data-ticket-glare aria-hidden />
          <span className="flex flex-col justify-between p-5">
            <span className="text-xs font-semibold text-muted-foreground">
              {starts
                ? course.batchStarts! <= today
                  ? t("ticketStarted")
                  : t("ticketStarts")
                : t("ticketNew")}
            </span>
            {starts ? (
              <span className="font-display text-2xl leading-none font-semibold">
                {starts.day}
                <span className="block text-sm">{starts.month}</span>
              </span>
            ) : (
              /* No start date entered yet: say it is open, not a lone "batch". */
              <span className="font-display text-2xl leading-none font-semibold">
                {t("ticketOpen")}
                <span className="mbs-1.5 flex items-center gap-1.5 font-sans text-xs font-medium text-muted-foreground">
                  <span aria-hidden data-live-dot />
                  {t("ticketEnrolling")}
                </span>
              </span>
            )}
          </span>
          <span className="p-5 ps-6">
            <span className="block text-xs font-semibold text-muted-foreground">
              {t("ticketNewest")}
            </span>
            <span className="mbs-1 block font-display text-xl font-semibold">
              {course.short}
            </span>
            <span className="block text-sm text-muted-foreground">
              {course.subtitle}
            </span>
            <span className="mbs-4 flex items-end justify-between gap-3">
              <span className="tnum font-display text-lg font-semibold whitespace-nowrap">
                {when}
              </span>
              <span className="tnum font-semibold">
                {course.free ? null : inr(course.price)}
              </span>
            </span>
          </span>
        </span>
      </span>
    </Link>
  )
}
