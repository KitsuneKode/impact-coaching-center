import {
  IconArrowRight,
  IconArrowUpRight,
  IconChevronRight,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ExamDateList } from "@/components/marketing/exam-dates"
import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor, buttonVariants } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { facultyBySlug, schedules, tracks } from "@/lib/brand"
import { splitCalendar } from "@/lib/calendar"
import { inr, lineup } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"
import { examDates } from "@/lib/catalog-server"
import { contactHref } from "@/lib/contact"
import { examBySlug, exams, pick } from "@/lib/exams"
import { alternatesFor, openGraphFor } from "@/lib/site"

/* Dates come from the calendar, re-read hourly. */
export const revalidate = 3600

export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/exams/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const exam = examBySlug(slug)
  if (!exam) return {}
  const title = pick(exam.name, locale)
  const description = pick(exam.summary, locale)
  return {
    title,
    description,
    alternates: alternatesFor(`/exams/${exam.slug}`, locale),
    openGraph: openGraphFor(`/exams/${exam.slug}`, title, description, locale),
  }
}

function checkedOn(iso: string, locale: string) {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString(
    locale === "as" ? "as-IN-u-nu-latn" : "en-IN",
    { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }
  )
}

/** One exam, as its conducting body describes it, then ICT's batch for it. */
export default async function ExamGuidePage({
  params,
}: PageProps<"/[locale]/exams/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const exam = examBySlug(slug)
  if (!exam) notFound()

  const t = await getTranslations("Exams")
  const content = await contentFor(locale)
  const track = tracks.find((item) => item.slug === exam.track)!
  const course = lineup(await liveCourses(), track.exam).flagship
  const schedule = course?.timing
    ? { when: course.timing }
    : course
      ? schedules[course.id]
      : undefined
  const people = track.faculty.map(facultyBySlug)
  const calendar = await examDates()
  const tc = await getTranslations("Calendar")
  const upcoming = splitCalendar(
    calendar.dates.filter((date) => date.exam === exam.slug),
    calendar.today
  ).upcoming.slice(0, 4)

  return (
    <main>
      <section className="pt-26 pb-12 md:pt-30 md:pb-16">
        <div className="container-page">
          <nav aria-label={t("breadcrumb")}>
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link href="/exams" className="hover:text-foreground">
                  {t("exams")}
                </Link>
              </li>
              <IconChevronRight size={14} stroke={1.75} aria-hidden />
              <li aria-current="page" className="text-foreground">
                {pick(exam.name, locale)}
              </li>
            </ol>
          </nav>
          <h1 className="type-display mt-8 max-w-[56rem]">
            <span className="text-foreground">{pick(exam.name, locale)}.</span>{" "}
            <span className="text-muted-foreground">
              {pick(exam.summary, locale)}
            </span>
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            {t("conductedBy", { body: pick(exam.body, locale) })}{" "}
            {t("checked", { date: checkedOn(exam.checked, locale) })}
          </p>
        </div>
      </section>

      <Section size="sm" className="border-t border-border">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="type-lede">
              <span className="text-foreground">{tc("guideDates")}</span>
            </h2>
            <Link
              href="/exams/calendar"
              className="link mt-3 inline-flex items-center gap-1 text-sm"
            >
              {tc("fullCalendar")}
              <IconArrowRight size={14} stroke={1.75} aria-hidden />
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <ExamDateList
              dates={upcoming}
              today={calendar.today}
              locale={locale}
              showExam={false}
            />
          ) : (
            <p className="text-[0.9375rem] text-muted-foreground">
              {tc("guideNone")}
            </p>
          )}
        </div>
      </Section>

      {/* The stages, as a numbered sequence. */}
      <Section size="sm" className="border-t border-border">
        <p className="type-label">{t("stages")}</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {exam.stages.map((stage, index) => (
            <Reveal key={stage.name.en} delay={index * 0.05}>
              <li className="flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-frame md:p-7">
                <span className="tnum text-sm text-muted-foreground">
                  {t("stage", { n: index + 1 })}
                </span>
                <h2 className="mt-1 text-xl leading-snug font-bold">
                  {pick(stage.name, locale)}
                </h2>
                {stage.facts ? (
                  <p className="tnum mt-3 rounded-control bg-secondary px-3 py-2 text-[0.9375rem] font-bold">
                    {pick(stage.facts, locale)}
                  </p>
                ) : null}
                <ul className="mt-4 space-y-2.5">
                  {stage.points.map((point) => (
                    <li
                      key={point.en}
                      className="tnum flex gap-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-foreground/40"
                      />
                      {pick(point, locale)}
                    </li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">{t("changes")}</p>
      </Section>

      {exam.eligibility ? (
        <Section size="sm" className="border-t border-border">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="type-lede">
              <span className="text-foreground">{t("eligibility")}</span>
            </h2>
            <ul>
              {exam.eligibility.map((line) => (
                <li
                  key={line.en}
                  className="tnum border-t border-border py-4 text-[0.9375rem] leading-relaxed first:border-t-0 first:pt-0"
                >
                  {pick(line, locale)}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      {exam.papers.length > 0 ? (
        <Section size="sm" className="border-t border-border">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="type-lede">
              <span className="text-foreground">{t("papers")}</span>
            </h2>
            <ul>
              {exam.papers.map((paper) => (
                <li key={paper.href}>
                  <a
                    href={paper.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="row-link group text-[0.9375rem] hover:text-foreground"
                  >
                    {pick(paper.label, locale)}
                    <IconArrowUpRight
                      size={16}
                      stroke={1.75}
                      aria-hidden
                      className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      {/* ICT's batch for this exam. */}
      {course ? (
        <Section size="sm" className="border-t border-border">
          <div className="rounded-card bg-surface p-7 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
              <div>
                <h2 className="type-lede">
                  <span className="text-foreground">{t("prepare")}.</span>{" "}
                  <span className="text-muted-foreground">
                    {t("prepareRest")}
                  </span>
                </h2>
                <p className="mt-6 text-xl font-bold">{course.short}</p>
                <p className="tnum mt-1 text-muted-foreground">
                  {[
                    schedule ? content.phrase(schedule.when) : null,
                    content.track(track.slug).duration,
                    course.free ? null : inr(course.price),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-5 flex -space-x-2">
                  {people.map((person) => (
                    <span
                      key={person.slug}
                      title={person.called}
                      className="relative size-10 overflow-hidden rounded-full bg-card ring-2 ring-surface"
                    >
                      <Image
                        src={person.portrait}
                        alt={person.called}
                        fill
                        sizes="40px"
                        className="object-cover object-top"
                      />
                    </span>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/courses/${course.slug}`}
                    className={buttonVariants({ size: "lg" })}
                  >
                    {t("seeCourse")}
                    <IconArrowRight data-nudge stroke={1.75} />
                  </Link>
                  <ButtonAnchor
                    href={contactHref({ kind: "track", exam: track.exam })}
                    target="_blank"
                    variant="secondary"
                    size="lg"
                  >
                    {t("enquire")}
                  </ButtonAnchor>
                </div>
              </div>
              <ul className="grid gap-2">
                <li>
                  <Link href="/resources" className="row-link text-[0.9375rem]">
                    {t("freeMaterial")}
                    <IconArrowRight size={16} stroke={1.75} aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="row-link text-[0.9375rem]">
                    {t("books")}
                    <IconArrowRight size={16} stroke={1.75} aria-hidden />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      <Section size="sm" className="border-t border-border">
        <p className="type-label">{t("sources")}</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {exam.sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link inline-flex items-center gap-1"
              >
                {pick(source.label, locale)}
                <IconArrowUpRight size={14} stroke={1.75} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  )
}
