"use client"

import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconCompass,
  IconRefresh,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

import { BatchTicket } from "@/components/home/batch-ticket"
import { Link } from "@/i18n/navigation"
import { contactHref } from "@/lib/contact"
import {
  answersInEnglish,
  FINDER_EXAMS,
  FINDER_MODES,
  FINDER_STAGES,
  FINDER_TIMES,
  recommend,
  type FinderAnswers,
} from "@/lib/course-finder"
import { track } from "@/lib/analytics"
import { inr, type Course } from "@/lib/courses"

const STEPS = [
  { key: "exam", options: FINDER_EXAMS },
  { key: "stage", options: FINDER_STAGES },
  { key: "time", options: FINDER_TIMES },
  { key: "mode", options: FINDER_MODES },
] as const

type StepKey = (typeof STEPS)[number]["key"]
const KEYS = "ABCD"

/**
 * Four question cards, then the course that fits, shown as the site's batch
 * ticket with the reasons it was picked. A tap answers and moves on; keys A
 * to D answer, Enter goes on, and Back keeps every answer. The card glides
 * to each question's height.
 */
export function CourseFinder({
  courses,
  exams,
  today,
}: {
  courses: Course[]
  /** Track slug to the exam's name in this language. */
  exams: Record<string, { exam: string; label: string }>
  today: string
}) {
  const t = useTranslations("Finder")
  const pulse = useTranslations("Pulse")
  const id = useId()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<FinderAnswers>({})
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
    setAnswers((current) => ({ ...current, [key]: value }))
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
  const [best, ...others] = picks
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
    <section
      aria-labelledby={`${id}-kicker`}
      id="finder"
      data-finder
      className="container-page scroll-mt-28 pbe-20"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <p id={`${id}-kicker`} className="type-label">
            {t("kicker")}
          </p>
          <h2 className="type-display mbs-3 max-w-[16ch] text-balance">
            {t("title")}
          </h2>
        </div>

        <div className="lg:col-span-8">
          <div data-finder-card ref={card}>
            <header className="flex items-center gap-3">
              <span
                data-finder-badge
                className="grid size-9 place-items-center rounded-xl"
              >
                <IconCompass aria-hidden size={18} stroke={1.75} />
              </span>
              <span className="font-semibold">{t("label")}</span>
              <span className="ms-auto flex items-center gap-2 text-sm text-muted-foreground">
                <span className="tnum" aria-live="polite">
                  {t("progress", {
                    n: Math.min(answered.length, STEPS.length),
                    total: STEPS.length,
                  })}
                </span>
                <ProgressRing value={answered.length / STEPS.length} />
              </span>
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
                        <div className="mbs-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
                          <BatchTicket
                            course={best.course as Course}
                            today={today}
                            className="max-w-[420px]"
                          />
                          <ul className="grid gap-2 text-sm">
                            {best.reasons.map((reason) => (
                              <li
                                key={reason}
                                className="flex items-center gap-2"
                              >
                                <IconCheck
                                  aria-hidden
                                  size={16}
                                  stroke={2.25}
                                  className="flex-none text-primary"
                                />
                                {t(`why.${reason}`, { exam: examLabel ?? "" })}
                              </li>
                            ))}
                            {answers.mode === "app" ? (
                              <li className="text-muted-foreground">
                                {t("appNote")}
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      ) : null}

                      <div className="mbs-6 flex flex-wrap items-center gap-3">
                        {best ? (
                          <Link
                            href={`/courses/${best.course.slug}`}
                            data-cta="amber"
                            data-press
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-foreground"
                          >
                            {t("see")}
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
                          <IconBrandWhatsapp
                            aria-hidden
                            size={18}
                            stroke={1.75}
                          />
                          {t("ask")}
                        </a>
                        <button
                          type="button"
                          data-finder-ghost
                          data-press
                          onClick={() => {
                            setAnswers({})
                            go(0)
                          }}
                        >
                          <IconRefresh aria-hidden size={18} stroke={1.75} />
                          {t("again")}
                        </button>
                      </div>

                      {others.length ? (
                        <div className="mbs-8">
                          <h4 className="type-label">{t("also")}</h4>
                          <ul className="mbs-3 grid gap-2 sm:grid-cols-2">
                            {others.map(({ course }) => (
                              <li key={course.slug}>
                                <Link
                                  href={`/courses/${course.slug}`}
                                  data-finder-alt
                                  data-press
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate font-semibold">
                                      {course.short}
                                    </span>
                                    {course.subtitle ? (
                                      <span className="block truncate text-sm text-muted-foreground">
                                        {course.subtitle}
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="tnum ms-auto font-semibold">
                                    {course.free
                                      ? pulse("free")
                                      : inr(course.price)}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </m.div>
                  ) : (
                    <Question
                      key={STEPS[step]!.key}
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
        </div>
      </div>
    </section>
  )
}

function Question({
  id,
  stepKey,
  options,
  value,
  focusOnMount,
  motion,
  onAnswer,
}: {
  id: string
  stepKey: StepKey
  options: readonly string[]
  value: string | undefined
  focusOnMount: (node: HTMLElement | null) => void
  motion: Record<string, object>
  onAnswer: (value: string, advance: boolean) => void
}) {
  const t = useTranslations("Finder")
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
            <label key={option} htmlFor={inputId} data-finder-option>
              <input
                id={inputId}
                type="radio"
                name={`${id}-${stepKey}`}
                value={option}
                checked={value === option}
                onChange={() => onAnswer(option, false)}
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
