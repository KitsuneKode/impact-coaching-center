"use client"

import { IconSparkles, IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { type ReactNode, useState } from "react"

import { CourseFinder } from "@/components/marketing/course-finder"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Span } from "@/lib/batch-time"
import { type FinderAnswers, rankAll } from "@/lib/course-finder"
import type { Course } from "@/lib/courses"

/** The exam alone scores 10; a good fit matches something more. */
const GOOD_FIT = 12

export type DayBatch = Span & {
  slug: string
  name: string
  exam: string
  /** As ICT writes it: "4 to 5:30 PM". */
  when: string
  days?: string
  note?: string
  price: string
}

type Group = {
  slug: string
  /** The exam as `tracks` names it, which courses carry as `track`. */
  exam: string
  label: string
  head: ReactNode
  slugs: string[]
}

/**
 * The finder and every course under it. Untouched, the list goes exam by
 * exam; once the finder has an answer, the same cards line up best fit
 * first, with why, and courses for other exams stay at the end instead of
 * disappearing. The exam filter narrows either view.
 */
export function CourseBoard({
  finder,
  exams,
  today,
  day,
  groups,
  cards,
}: {
  finder: Course[]
  exams: Record<string, { exam: string; label: string }>
  today: string
  day: DayBatch[]
  groups: Group[]
  /** Server-rendered course cards, by slug. */
  cards: Record<string, ReactNode>
}) {
  const t = useTranslations("Board")
  const why = useTranslations("Finder")
  const [answers, setAnswers] = useState<FinderAnswers>({})
  const [filter, setFilter] = useState("all")
  const sorted = Object.values(answers).some(Boolean)

  const examOf = Object.fromEntries(
    Object.entries(exams).map(([slug, value]) => [slug, value.exam])
  )
  const shownGroups = groups.filter(
    (group) => filter === "all" || group.slug === filter
  )
  const listed = new Set(shownGroups.flatMap((group) => group.slugs))
  const ranked = sorted
    ? rankAll(finder, answers, examOf).filter((pick) =>
        listed.has(pick.course.slug)
      )
    : []
  const examLabel =
    answers.exam && answers.exam !== "unsure"
      ? exams[answers.exam]?.label
      : undefined
  const total = groups.reduce((sum, group) => sum + group.slugs.length, 0)

  return (
    <>
      <CourseFinder
        courses={finder}
        exams={exams}
        today={today}
        day={day}
        total={total}
        onAnswers={setAnswers}
      />

      <section
        id="all-courses"
        aria-labelledby="all-courses-heading"
        className="container-page scroll-mt-28 pbe-20"
      >
        <div
          data-board-bar
          className="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-2 p-1.5"
        >
          <h2 id="all-courses-heading" className="sr-only">
            {t("heading")}
          </h2>
          <ToggleGroup
            aria-label={t("filter")}
            value={[filter]}
            onValueChange={(value) => {
              const next = value[0]
              if (next) setFilter(next)
            }}
            spacing={1}
            // Wraps on a phone, so every exam is in sight rather than
            // hidden past the edge of a row that scrolls.
            className="max-w-full flex-wrap rounded-[22px] bg-secondary p-1 sm:[scrollbar-width:none] sm:flex-nowrap sm:overflow-x-auto sm:rounded-full"
          >
            {[
              { value: "all", label: t("all", { count: total }) },
              ...groups.map((group) => ({
                value: group.slug,
                label: group.label,
              })),
            ].map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className="h-9 flex-none rounded-full px-4 text-sm font-medium whitespace-nowrap text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-[0_1px_3px_color-mix(in_oklch,var(--foreground)_14%,transparent)]"
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {sorted ? (
            <p className="flex items-center gap-2 text-sm font-medium">
              <IconSparkles
                aria-hidden
                size={16}
                stroke={1.75}
                className="text-primary"
              />
              <span className="max-sm:hidden">{t("sorted")}</span>
              <span className="sm:hidden">{t("best")}</span>
              <button
                type="button"
                data-press
                onClick={() => setAnswers({})}
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-muted-foreground hover:text-foreground"
              >
                <IconX aria-hidden size={14} stroke={2} />
                {t("byExam")}
              </button>
            </p>
          ) : null}
        </div>

        {sorted ? (
          <ol aria-label={t("sorted")} data-board-grid className="mbs-6">
            {ranked.map((pick, index) => {
              const own = !examOf[answers.exam ?? ""]
                ? true
                : pick.course.track === examOf[answers.exam ?? ""]
              // Courses for another exam say so on the card itself (its exam
              // chip); a label over each was noise.
              const label =
                index === 0
                  ? t("best")
                  : own && pick.score >= GOOD_FIT
                    ? t("good")
                    : undefined
              return (
                <li
                  key={pick.course.slug}
                  data-fit={index === 0 ? "best" : own ? "own" : "other"}
                  className="relative"
                >
                  <p className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-1 pbe-2 text-sm">
                    {label ? <span data-fit-label>{label}</span> : null}
                    {own
                      ? pick.reasons
                          .filter((reason) => reason !== "exam")
                          .map((reason) => (
                            <span
                              key={reason}
                              className="text-muted-foreground"
                            >
                              {why(`why.${reason}`, { exam: examLabel ?? "" })}
                            </span>
                          ))
                      : null}
                  </p>
                  {cards[pick.course.slug]}
                </li>
              )
            })}
          </ol>
        ) : (
          shownGroups.map((group) => (
            <section
              key={group.slug}
              id={group.slug}
              data-board-group
              aria-labelledby={`${group.slug}-heading`}
              className="scroll-mt-40 pbs-10"
            >
              {group.head}
              <ul data-board-grid className="mbs-6">
                {group.slugs.map((slug) => (
                  <li key={slug}>{cards[slug]}</li>
                ))}
              </ul>
            </section>
          ))
        )}
      </section>
    </>
  )
}
