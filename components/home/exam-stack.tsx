import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import type { CSSProperties } from "react"

import { Reveal } from "@/components/motion/reveal"
import { useContent } from "@/i18n/content"
import { Link } from "@/i18n/navigation"
import { schedules, tracks } from "@/lib/brand"
import { inr, lineup, type Course } from "@/lib/courses"

/**
 * The three exams, each on its own grainy colour field, pinning one after
 * another as you scroll. Each panel is the exam's lead course from ClassPlus.
 */
export function ExamStack({ courses }: { courses: readonly Course[] }) {
  const t = useTranslations("Pulse")
  const content = useContent()
  const panels = tracks.flatMap((track) => {
    const course = lineup(courses, track.exam).flagship
    return course ? [{ track, course }] : []
  })

  return (
    <section
      id="courses"
      aria-labelledby="courses-heading"
      className="pbs-20 pbe-20 md:pbs-28 md:pbe-28"
    >
      <div className="container-page">
        <Reveal>
          <h2 id="courses-heading" className="type-display max-w-[18ch]">
            {t("stackLead")}{" "}
            <span className="text-muted-foreground">{t("stackRest")}</span>
          </h2>
        </Reveal>
        <div
          data-stack
          className="mbs-12"
          style={{ "--n": panels.length } as CSSProperties}
        >
          {panels.map(({ track, course }, i) => {
            const names = content.track(track.slug)
            const legacy = schedules[course.id]
            const when = course.timing ?? legacy?.when
            const days = course.timing ? undefined : legacy?.days
            return (
              <div
                key={track.slug}
                data-stack-item
                style={{ "--i": i } as CSSProperties}
              >
                <Link
                  href={`/courses/${course.slug}`}
                  data-panel={track.slug}
                  className="md:min-bs-[480px] grid items-center gap-8 p-7 sm:p-10 md:grid-cols-12 md:gap-10"
                >
                  <div className="md:col-span-7">
                    <div className="flex flex-wrap gap-2">
                      <span data-panel-tag>{names.duration}</span>
                      <span data-panel-tag>{course.short}</span>
                    </div>
                    <p className="mbs-8 font-display text-[clamp(1.6rem,1.15rem+2.1vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
                      {names.exam}. <span data-panel-dim>{names.covers}.</span>
                    </p>
                    <p className="mbs-6 max-w-[42ch] text-lg">
                      {names.full}.{" "}
                      {when ? `${when}${days ? `, ${days}` : ""}.` : ""}
                    </p>
                    <p className="mbs-8 flex flex-wrap items-center gap-4">
                      <span className="tnum font-display text-xl font-semibold">
                        {course.price ? inr(course.price) : t("askFee")}
                        {course.price && course.mrp > course.price ? (
                          <s data-panel-mrp className="ms-3 text-base">
                            {inr(course.mrp)}
                          </s>
                        ) : null}
                      </span>
                      <span
                        data-panel-go
                        className="grid size-11 place-items-center rounded-full"
                      >
                        <IconArrowRight aria-hidden size={18} stroke={2} />
                      </span>
                    </p>
                  </div>
                  {course.cover ? (
                    <div className="md:col-span-5">
                      <span data-panel-poster>
                        <Image
                          src={course.cover}
                          alt={t("coursePoster", { name: course.short })}
                          fill
                          sizes="(min-width: 768px) 420px, 90vw"
                          className="object-cover"
                        />
                      </span>
                    </div>
                  ) : null}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
