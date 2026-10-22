"use client"

import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconCompass,
  IconSparkles,
  IconX,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { type ReactNode, useEffect, useState } from "react"

import { CourseFinder } from "@/components/marketing/course-finder"
import {
  rememberAnswers,
  useFinderAnswers,
} from "@/components/marketing/finder-memory"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Span } from "@/lib/batch-time"
import { rankAll } from "@/lib/course-finder"
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
 * Every course, with the finder a step away. Untouched, the list goes exam
 * by exam under a slim strip offering the finder; the finder opens in a
 * dialog (a sheet on phones), and once answered the same cards line up
 * best fit first, with why, and the strip shows the answers to change or
 * clear. Answers are kept on this device. Courses for other exams stay at
 * the end instead of disappearing; the exam filter narrows either view.
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
  const answers = useFinderAnswers()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const sorted = Object.values(answers).some(Boolean)

  // Links to /courses#finder (the menu, the home page) open it.
  useEffect(() => {
    const check = () => {
      if (window.location.hash === "#finder") setOpen(true)
    }
    const first = window.setTimeout(check)
    window.addEventListener("hashchange", check)
    return () => {
      window.clearTimeout(first)
      window.removeEventListener("hashchange", check)
    }
  }, [])
  const close = (next: boolean) => {
    setOpen(next)
    if (!next && window.location.hash === "#finder")
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search
      )
  }
  const showMatches = () => {
    close(false)
    document
      .getElementById("all-courses")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
      <Dialog open={open} onOpenChange={close}>
        <DialogContent
          showCloseButton={false}
          data-finder-dialog
          // A sheet from the bottom edge on a phone, centred above that.
          className="gap-0 bg-transparent p-0 ring-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 sm:max-w-[40rem] max-sm:data-open:slide-in-from-bottom-8"
        >
          <CourseFinder
            courses={finder}
            exams={exams}
            today={today}
            day={day}
            total={total}
            answers={answers}
            onAnswers={rememberAnswers}
            onShowMatches={showMatches}
          />
        </DialogContent>
      </Dialog>
      <section
        id="all-courses"
        aria-labelledby="all-courses-heading"
        className="container-page scroll-mt-28 pbe-20"
      >
        {/* The finder, offered in one line; answered, the answers. */}
        <div
          id="finder"
          data-finder-strip
          data-answered={sorted || undefined}
          className="scroll-mt-40"
        >
          <span
            data-finder-badge
            className="grid size-11 flex-none place-items-center rounded-2xl"
          >
            {sorted ? (
              <IconSparkles aria-hidden size={20} stroke={1.75} />
            ) : (
              <IconCompass aria-hidden size={20} stroke={1.75} />
            )}
          </span>
          {sorted ? (
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t("sorted")}</p>
              <ul className="mbs-2 flex flex-wrap gap-1.5">
                {(["exam", "stage", "time", "mode"] as const).map((key) =>
                  answers[key] ? (
                    <li key={key} data-finder-answer>
                      {why(`a.${key}.${answers[key]}`)}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{why("kicker")}</p>
              <p className="text-sm text-pretty text-muted-foreground">
                {why("stripNote")}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {sorted ? (
              <>
                <button
                  type="button"
                  data-finder-ghost
                  data-press
                  onClick={() => setOpen(true)}
                >
                  <IconAdjustmentsHorizontal
                    aria-hidden
                    size={18}
                    stroke={1.75}
                  />
                  {why("editAnswers")}
                </button>
                <button
                  type="button"
                  data-press
                  onClick={() => rememberAnswers({})}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <IconX aria-hidden size={16} stroke={2} />
                  {t("byExam")}
                </button>
              </>
            ) : (
              <button
                type="button"
                data-finder-next
                data-press
                onClick={() => setOpen(true)}
              >
                {why("start")}
                <IconArrowRight aria-hidden size={18} stroke={2} />
              </button>
            )}
          </div>
        </div>

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
