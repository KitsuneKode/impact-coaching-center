"use client"

import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconClock,
  IconCompass,
  IconRefresh,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

import { DialogClose, DialogTitle } from "@/components/ui/dialog"
import { Link } from "@/i18n/navigation"
import { contactHref } from "@/lib/contact"
import {
  answersInEnglish,
  FINDER_EXAMS,
  FINDER_MODES,
  FINDER_STAGES,
  FINDER_TIMES,
  freeToTry,
  recommend,
  type FinderAnswers,
  type FinderPick,
} from "@/lib/course-finder"
import { track } from "@/lib/analytics"
import { inr, type Course } from "@/lib/courses"
import type { DayBatch } from "@/components/marketing/course-board"
import { timeOfDay } from "@/lib/course-finder"

const STEPS = [
  { key: "exam", options: FINDER_EXAMS },
  { key: "stage", options: FINDER_STAGES },
  { key: "time", options: FINDER_TIMES },
  { key: "mode", options: FINDER_MODES },
] as const

type StepKey = (typeof STEPS)[number]["key"]
const KEYS = "ABCD"

/**
 * Four question cards, then the course that fits: its hours, its price
 * against the list price and what that saves, the reasons it was picked,
 * the exam's free workshop to try first and two more worth a look. It lives in a dialog over the
 * course list (course-board.tsx), which holds the answers, so they sort the
 * list and are still there next time. A tap answers and moves on; keys A
 * to D answer, Enter goes on, and Back keeps every answer. The card glides
 * to each question's height.
 */
export function CourseFinder({
  courses,
  exams,
  day = [],
  total,
  answers,
  onAnswers,
  onShowMatches,
}: {
  courses: Course[]
  /** Track slug to the exam's name in this language. */
  exams: Record<string, { exam: string; label: string }>
  today: string
  /** Batches with readable hours, drawn on the time question. */
  day?: DayBatch[]
  /** How many courses the list below holds. */
  total?: number
  answers: FinderAnswers
  /** Every answer as it is given, so the list below can re-sort. */
  onAnswers: (answers: FinderAnswers) => void
  /** Close the finder and show the list, best fit first. */
  onShowMatches: () => void
}) {
  const t = useTranslations("Finder")
  const board = useTranslations("Board")
  const id = useId()
  const reduce = useReducedMotion()
  // Opened with every answer given, it goes straight to the result.
  const [step, setStep] = useState(() =>
    STEPS.every(({ key }) => answers[key]) ? STEPS.length : 0
  )
  const [direction, setDirection] = useState(1)
  const done = step === STEPS.length

  /* The card's height follows its content, measured, so it can glide. */
  const inner = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)
  useLayoutEffect(() => {
    const node = inner.current
    if (!node) return
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /*
   * Each new question (or the result) takes focus as it mounts, so keyboard
   * and screen-reader users follow; never on the first render.
   */
  const moved = useRef(false)
  const focusOnMount = (node: HTMLElement | null) => {
    if (node && moved.current) node.focus({ preventScroll: true })
  }

  function go(next: number) {
    moved.current = true
    setDirection(next > step ? 1 : -1)
    setStep(Math.max(0, Math.min(STEPS.length, next)))
  }

  function answer(key: StepKey, value: string, advance: boolean) {
    onAnswers({ ...answers, [key]: value })
    // A tap answers and moves on after a beat, so the choice is seen.
    if (advance) window.setTimeout(() => go(step + 1), reduce ? 0 : 220)
  }

  function onKeyDown(event: KeyboardEvent) {
    if (done || event.altKey || event.ctrlKey || event.metaKey) return
    const current = STEPS[step]!
    const index = KEYS.indexOf(event.key.toUpperCase())
    if (index !== -1 && index < current.options.length) {
      event.preventDefault()
      answer(current.key, current.options[index]!, false)
      const input = document.getElementById(`${id}-${current.key}-${index}`)
      input?.focus()
    } else if (event.key === "Enter" && answers[current.key]) {
      event.preventDefault()
      go(step + 1)
    }
  }

  /* Keys work while focus is anywhere inside the card. */
  const card = useRef<HTMLDivElement>(null)
  const keys = useRef(onKeyDown)
  useEffect(() => {
    keys.current = onKeyDown
  })
  useEffect(() => {
    const node = card.current
    const listener = (event: KeyboardEvent) => keys.current(event)
    node?.addEventListener("keydown", listener)
    return () => node?.removeEventListener("keydown", listener)
  }, [])

  const examOf = Object.fromEntries(
    Object.entries(exams).map(([slug, value]) => [slug, value.exam])
  )
  const picks = done ? recommend(courses, answers, examOf) : []
  const [best] = picks
  // A paid best fit comes with its exam's free workshop to try first.
  const tryFree =
    best && !best.course.free ? freeToTry(courses, answers, examOf) : null
  const others = picks
    .slice(1)
    .filter((pick) => pick.course.slug !== tryFree?.course.slug)
    .slice(0, 2)
  useEffect(() => {
    if (done)
      track({
        name: "finder_completed",
        exam: answers.exam ?? "unsure",
        matched: Boolean(best),
      })
    // Once per finish, not on every answer change after it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])
  const examLabel =
    answers.exam && answers.exam !== "unsure"
      ? exams[answers.exam]?.label
      : undefined

  const answered = STEPS.filter(({ key }) => answers[key])
  const motion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 18 * direction },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -18 * direction },
      }

  return (
    <div data-finder-card ref={card}>
      <header className="flex items-center gap-3">
        <span
          data-finder-badge
          className="grid size-9 place-items-center rounded-xl"
        >
          <IconCompass aria-hidden size={18} stroke={1.75} />
        </span>
        <DialogTitle className="font-semibold">{t("label")}</DialogTitle>
        <span className="ms-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span className="tnum" aria-live="polite">
            {t("progress", {
              n: Math.min(answered.length, STEPS.length),
              total: STEPS.length,
            })}
          </span>
          <ProgressRing value={answered.length / STEPS.length} />
        </span>
        <DialogClose
          aria-label={t("close")}
          className="-me-1.5 grid size-10 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <IconX aria-hidden size={18} stroke={2} />
        </DialogClose>
      </header>

      {answered.length && !done ? (
        <ul data-finder-trail className="mbs-4 flex flex-wrap gap-2">
          {answered.map(({ key }) => {
            const index = STEPS.findIndex((s) => s.key === key)
            const label = t(`a.${key}.${answers[key]}`)
            return (
              <li key={key}>
                <button
                  type="button"
                  data-finder-chip
                  aria-current={index === step || undefined}
                  aria-label={t("change", { answer: label })}
                  onClick={() => go(index)}
                >
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div data-finder-body style={{ height }} className="mbs-5">
        <div ref={inner}>
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <m.div
                key="result"
                {...motion}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              >
                <h3
                  ref={focusOnMount}
                  tabIndex={-1}
                  className="font-display text-xl font-semibold outline-none"
                >
                  {best ? t("best") : t("none")}
                </h3>
                {best ? (
                  <div className="mbs-5 grid grid-cols-[minmax(0,1fr)] gap-4">
                    <FitCard
                      pick={best}
                      reason={(r) => t(`why.${r}`, { exam: examLabel ?? "" })}
                      appNote={answers.mode === "app" ? t("appNote") : null}
                    />
                    {tryFree ? (
                      <ShortPick pick={tryFree} label={t("tryFree")} />
                    ) : null}
                    {others.length ? (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("also")}
                        </p>
                        <ul className="mbs-2 grid grid-cols-[minmax(0,1fr)] gap-2">
                          {others.map((pick) => (
                            <li key={pick.course.slug}>
                              <ShortPick pick={pick} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mbs-6 flex flex-wrap items-center gap-3">
                  {best ? (
                    <Link
                      href={`/courses/${best.course.slug}`}
                      data-cta="amber"
                      data-press
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
                    >
                      {t("seeNamed", { name: best.course.short })}
                      <IconArrowRight
                        data-nudge
                        aria-hidden
                        size={18}
                        stroke={2}
                      />
                    </Link>
                  ) : null}
                  <a
                    href={contactHref({
                      kind: "finder",
                      answers: answersInEnglish(answers),
                      courseName: best?.course.short,
                    })}
                    target="_blank"
                    rel="noreferrer"
                    data-finder-ghost
                    data-press
                  >
                    <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
                    {t("ask")}
                  </a>
                  <button
                    type="button"
                    data-finder-ghost
                    data-press
                    onClick={() => {
                      onAnswers({})
                      go(0)
                    }}
                  >
                    <IconRefresh aria-hidden size={18} stroke={1.75} />
                    {t("again")}
                  </button>
                </div>

                {total ? (
                  <button
                    type="button"
                    data-press
                    onClick={onShowMatches}
                    className="mbs-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary"
                  >
                    {board("seeAll", { count: total })}
                    <IconArrowDown aria-hidden size={18} stroke={2} />
                  </button>
                ) : null}
              </m.div>
            ) : (
              <Question
                key={STEPS[step]!.key}
                day={STEPS[step]!.key === "time" ? day : undefined}
                id={id}
                stepKey={STEPS[step]!.key}
                options={STEPS[step]!.options}
                value={answers[STEPS[step]!.key]}
                focusOnMount={focusOnMount}
                motion={motion}
                onAnswer={(value, advance) =>
                  answer(STEPS[step]!.key, value, advance)
                }
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {!done ? (
        <footer className="mbs-6 flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              data-finder-ghost
              data-press
              onClick={() => go(step - 1)}
            >
              <IconArrowLeft aria-hidden size={18} stroke={1.75} />
              {t("back")}
            </button>
          ) : null}
          <button
            type="button"
            data-finder-next
            data-press
            disabled={!answers[STEPS[step]!.key]}
            onClick={() => go(step + 1)}
            className="ms-auto"
          >
            {step === STEPS.length - 1 ? t("finish") : t("next")}
            <kbd aria-hidden>↵</kbd>
          </button>
        </footer>
      ) : null}
    </div>
  )
}

function Question({
  id,
  day,
  stepKey,
  options,
  value,
  focusOnMount,
  motion,
  onAnswer,
}: {
  id: string
  day?: DayBatch[]
  stepKey: StepKey
  options: readonly string[]
  value: string | undefined
  focusOnMount: (node: HTMLElement | null) => void
  motion: Record<string, object>
  onAnswer: (value: string, advance: boolean) => void
}) {
  const t = useTranslations("Finder")
  // The option under the pointer or in focus, previewed on the day strip.
  const [preview, setPreview] = useState<string | undefined>(undefined)
  return (
    <m.fieldset
      {...motion}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="min-w-0"
    >
      <legend
        ref={focusOnMount}
        tabIndex={-1}
        className="font-display text-xl font-semibold text-balance outline-none sm:text-2xl"
      >
        {t(`q.${stepKey}.title`)}
      </legend>
      <p className="mbs-1 text-sm text-muted-foreground">
        {t(`q.${stepKey}.note`)}
      </p>
      <div className="mbs-5 grid gap-2">
        {options.map((option, index) => {
          const inputId = `${id}-${stepKey}-${index}`
          return (
            <label
              key={option}
              htmlFor={inputId}
              data-finder-option
              onPointerEnter={() => setPreview(option)}
              onPointerLeave={() => setPreview(undefined)}
            >
              <input
                id={inputId}
                type="radio"
                name={`${id}-${stepKey}`}
                value={option}
                checked={value === option}
                onChange={() => onAnswer(option, false)}
                onFocus={() => setPreview(option)}
                onBlur={() => setPreview(undefined)}
                // A pointer tap also moves on; arrow keys only choose.
                onClick={(event) => {
                  if (event.detail > 0) onAnswer(option, true)
                }}
                className="sr-only"
              />
              <kbd aria-hidden data-finder-key>
                {KEYS[index]}
              </kbd>
              <span>{t(`a.${stepKey}.${option}`)}</span>
            </label>
          )
        })}
      </div>
      {day && day.length > 1 ? (
        <DayStrip
          day={day}
          value={preview ?? value}
          onPick={(time) => onAnswer(time, false)}
        />
      ) : null}
    </m.fieldset>
  )
}

/** How much is answered, as a ring that fills. */
function ProgressRing({ value }: { value: number }) {
  const r = 8
  const length = 2 * Math.PI * r
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="size-5 -rotate-90"
      data-finder-ring
    >
      <circle cx="10" cy="10" r={r} fill="none" strokeWidth="2.5" />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - value)}
      />
    </svg>
  )
}

/* The day drawn 6 AM to 10 PM; ticks every three hours. */
const FROM = 6
const TO = 22
const at = (h: number) => `${((h - FROM) / (TO - FROM)) * 100}%`
const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`

/**
 * Every batch on one day's line, under the time question: the bars in the
 * part of the day picked (or pointed at) light up, with a count of what
 * fits, so the answer shows what it leaves. A tap on a bar answers with its
 * part of the day. The options above carry the same choice for keyboards
 * and screen readers, so the bars stay out of the tab order.
 */
function DayStrip({
  day,
  value,
  onPick,
}: {
  day: DayBatch[]
  value?: string
  onPick: (time: string) => void
}) {
  const t = useTranslations("Finder")
  const fits = day.filter(
    (batch) =>
      value === "any" ||
      (value !== undefined && timeOfDay(batch.when) === value)
  ).length
  const lanes: number[] = []
  const laneOf = new Map<string, number>()
  for (const batch of [...day].sort((a, b) => a.start - b.start)) {
    let lane = lanes.findIndex((end) => end <= batch.start)
    if (lane === -1) lane = lanes.push(0) - 1
    lanes[lane] = batch.end
    laneOf.set(batch.slug, lane)
  }
  return (
    <div className="mbs-6">
      <div
        className="relative rounded-2xl bg-secondary"
        style={{ blockSize: `${lanes.length * 1.75 + 0.75}rem` }}
      >
        {day.map((batch) => {
          const lit =
            value === "any" ||
            (value !== undefined && timeOfDay(batch.when) === value)
          return (
            <button
              key={batch.slug}
              type="button"
              tabIndex={-1}
              data-day-bar
              data-lit={lit || undefined}
              title={`${batch.name}, ${batch.when}`}
              aria-label={`${batch.name}, ${batch.when}`}
              onClick={() => {
                const time = timeOfDay(batch.when)
                if (time) onPick(time)
              }}
              className="absolute flex h-6 cursor-pointer items-center overflow-clip rounded-lg ps-2 text-[0.6875rem] font-semibold whitespace-nowrap"
              style={{
                insetInlineStart: at(batch.start),
                inlineSize: `calc(${at(batch.end)} - ${at(batch.start)})`,
                insetBlockStart: `${(laneOf.get(batch.slug) ?? 0) * 1.75 + 0.375}rem`,
              }}
            >
              {batch.name}
            </button>
          )
        })}
      </div>
      <div
        aria-hidden
        className="tnum relative mbs-2 h-4 text-xs text-muted-foreground"
      >
        {[6, 9, 12, 15, 18, 21].map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 max-sm:nth-[even]:hidden"
            style={{ insetInlineStart: at(h) }}
          >
            {hourLabel(h)}
          </span>
        ))}
      </div>
      <p aria-live="polite" className="mbs-3 min-h-5 text-sm font-medium">
        {value ? t("dayCount", { count: fits }) : null}
      </p>
    </div>
  )
}

/** Today's price against the list price, and what the difference saves. */
function Price({ course, large }: { course: Course; large?: boolean }) {
  const t = useTranslations("Finder")
  if (course.free)
    return (
      <span
        className={`font-display font-semibold text-primary ${large ? "text-3xl" : "text-base"}`}
      >
        {t("free")}
      </span>
    )
  const saved = course.mrp > course.price ? course.mrp - course.price : 0
  return (
    <span className="grid justify-items-end gap-1 text-end">
      <span className="flex items-baseline gap-2">
        {saved ? (
          <s className="tnum text-sm text-muted-foreground">
            {inr(course.mrp)}
          </s>
        ) : null}
        <span
          className={`tnum font-display font-semibold tracking-[-0.02em] ${large ? "text-3xl" : "text-base"}`}
        >
          {inr(course.price)}
        </span>
      </span>
      {saved && large ? (
        <span data-finder-save className="tnum">
          {t("save", {
            amount: inr(saved),
            pct: Math.round((saved / course.mrp) * 100),
          })}
        </span>
      ) : null}
    </span>
  )
}

/** The best fit: what it is, when it runs, what it costs, and why it came up. */
function FitCard({
  pick,
  reason,
  appNote,
}: {
  pick: FinderPick
  reason: (reason: FinderPick["reasons"][number]) => string
  appNote: string | null
}) {
  const course = pick.course as Course
  return (
    <div
      data-finder-fit
      className="grid min-w-0 gap-4 rounded-[22px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance">
            {course.short}
          </p>
          {course.subtitle ? (
            <p className="mbs-1 text-pretty text-muted-foreground">
              {course.subtitle}
            </p>
          ) : null}
          {course.timing ? (
            <p className="mbs-3 inline-flex items-center gap-1.5 rounded-full bg-card ps-3 pe-3 pbs-1 pbe-1 text-sm font-medium">
              <IconClock aria-hidden size={15} stroke={1.75} />
              {course.timing}
            </p>
          ) : null}
        </div>
        <Price course={course} large />
      </div>
      <ul className="grid gap-1.5 border-t border-border pbs-4 text-sm sm:grid-cols-2">
        {pick.reasons.map((r) => (
          <li key={r} className="flex items-center gap-2">
            <IconCheck
              aria-hidden
              size={16}
              stroke={2.25}
              className="flex-none text-primary"
            />
            {reason(r)}
          </li>
        ))}
        {appNote ? (
          <li className="text-muted-foreground sm:col-span-2">{appNote}</li>
        ) : null}
      </ul>
    </div>
  )
}

/** One more course in a line: the free workshop to try, or another fit. */
function ShortPick({ pick, label }: { pick: FinderPick; label?: string }) {
  const course = pick.course as Course
  return (
    <Link
      href={`/courses/${course.slug}`}
      data-finder-short
      data-press
      className="group flex items-center gap-4 rounded-2xl ps-4 pe-4 pbs-3 pbe-3"
    >
      <span className="min-w-0 flex-1">
        {label ? (
          <span className="block text-xs font-semibold tracking-[0.06em] text-primary uppercase">
            {label}
          </span>
        ) : null}
        <span className="block truncate font-semibold">
          {course.short}
          {course.subtitle ? (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {course.subtitle}
            </span>
          ) : null}
        </span>
        {course.timing ? (
          <span className="block text-sm text-muted-foreground">
            {course.timing}
          </span>
        ) : null}
      </span>
      <Price course={course} />
      <IconArrowRight
        data-nudge
        aria-hidden
        size={16}
        stroke={2}
        className="flex-none text-muted-foreground"
      />
    </Link>
  )
}
