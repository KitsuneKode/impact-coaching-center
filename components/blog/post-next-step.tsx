import { IconArrowRight, IconBrandWhatsapp } from "@tabler/icons-react"
import { getTranslations } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { tracks } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { latestEditions } from "@/lib/course-finder"
import { inr, lineup } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"

/**
 * The end of a post, for the reader it convinced: the exam's batch
 * enrolling now, its price against the list price, and its free workshop
 * to try first. A post about no one exam offers the free workshop and the
 * courses. Prices come from ICT's ClassPlus store, as on the courses page.
 */
export async function PostNextStep({
  exam,
  locale,
}: {
  exam?: string
  locale: string
}) {
  const t = await getTranslations("BlogPage")
  const content = await contentFor(locale)
  const track = exam ? tracks.find((tr) => tr.exam === exam) : undefined
  const current = latestEditions(await liveCourses())
  const { flagship, free } = track
    ? lineup(current, track.exam)
    : { flagship: undefined, free: undefined }
  const saved =
    flagship && flagship.mrp > flagship.price
      ? flagship.mrp - flagship.price
      : 0
  const workshop = contactHref({ kind: "workshop" })

  return (
    <aside
      aria-labelledby="next-step"
      data-post-next
      className="grid gap-5 rounded-[28px] p-6 sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold text-primary">
          {track
            ? t("nextFor", { exam: content.track(track.slug).exam })
            : t("nextGeneral")}
        </p>
        <h2
          id="next-step"
          className="mbs-1 font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance"
        >
          {flagship ? flagship.short : t("nextHeading")}
        </h2>
        {flagship?.subtitle ? (
          <p className="mbs-1 text-muted-foreground">
            {content.phrase(flagship.subtitle)}
          </p>
        ) : !flagship ? (
          <p className="mbs-1 max-w-[52ch] text-pretty text-muted-foreground">
            {t("nextBody")}
          </p>
        ) : null}
      </div>

      {flagship ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="tnum font-display text-3xl font-semibold tracking-[-0.02em]">
            {inr(flagship.price)}
          </span>
          {saved ? (
            <>
              <s className="tnum text-muted-foreground">{inr(flagship.mrp)}</s>
              <span data-finder-save className="tnum">
                {t("save", {
                  amount: inr(saved),
                  pct: Math.round((saved / flagship.mrp) * 100),
                })}
              </span>
            </>
          ) : null}
          {flagship.timing ? (
            <span className="text-sm text-muted-foreground">
              {flagship.timing}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={flagship ? `/courses/${flagship.slug}` : "/courses"}
          data-cta="amber"
          data-press
          className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
        >
          {flagship
            ? t("seeCourse", { name: flagship.short })
            : t("seeCourses")}
          <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
        </Link>
        {free ? (
          <Link href={`/courses/${free.slug}`} data-finder-ghost data-press>
            {t("tryFree", { name: free.short })}
          </Link>
        ) : (
          <a
            href={workshop}
            target="_blank"
            rel="noreferrer noopener"
            data-finder-ghost
            data-press
          >
            <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
            {t("workshop")}
          </a>
        )}
      </div>
    </aside>
  )
}
