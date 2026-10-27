import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ExamDateList } from "@/components/marketing/exam-dates"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
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
import { PageExam } from "@/components/site/page-exam"

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

  const name = pick(exam.name, locale)

  return (
    <main>
      <PageExam exam={track.exam} />
      <PageHead
        trail={[{ label: t("exams"), href: "/exams" }, { label: name }]}
        title={name}
        lede={pick(exam.summary, locale)}
      >
        <p className="mbs-5 text-sm text-muted-foreground">
          {t("conductedBy", { body: pick(exam.body, locale) })}{" "}
          {t("checked", { date: checkedOn(exam.checked, locale) })}
        </p>
      </PageHead>

      {/* ---- the next dates ---- */}
      <section
        aria-labelledby="dates-heading"
        className="container-page pbe-20"
      >
        <div className="grid gap-8 rounded-[28px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] md:p-9 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2
              id="dates-heading"
              className="font-display text-2xl font-semibold tracking-[-0.02em]"
            >
              {tc("guideDates")}
            </h2>
            <Link
              href="/exams/calendar"
              className="mbs-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline decoration-foreground/30 underline-offset-4"
            >
              {tc("fullCalendar")}
              <IconArrowRight aria-hidden size={14} stroke={2} />
            </Link>
          </div>
          <div className="min-w-0 lg:col-span-8">
            {upcoming.length > 0 ? (
              <ExamDateList
                dates={upcoming}
                today={calendar.today}
                locale={locale}
                showExam={false}
              />
            ) : (
              <p className="text-muted-foreground">{tc("guideNone")}</p>
            )}
          </div>
        </div>
      </section>

      {/* ---- the stages, in order ---- */}
      <section
        aria-labelledby="stages-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <h2 id="stages-heading" className="type-display">
            {t("stages")}
          </h2>
        </Reveal>
        <ol className="mbs-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
          {exam.stages.map((stage, index) => (
            <li key={stage.name.en}>
              <Reveal delay={index * 0.05} className="h-full">
                <div className="flex h-full flex-col rounded-[28px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] md:p-8">
                  <span
                    aria-hidden
                    className="tnum font-display text-5xl leading-none font-semibold text-primary"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mbs-4 font-display text-xl leading-snug font-semibold">
                    <span className="sr-only">
                      {t("stage", { n: index + 1 })}:{" "}
                    </span>
                    {pick(stage.name, locale)}
                  </h3>
                  {stage.facts ? (
                    <p className="tnum mbs-4 rounded-2xl bg-secondary ps-4 pe-4 pbs-2.5 pbe-2.5 font-semibold">
                      {pick(stage.facts, locale)}
                    </p>
                  ) : null}
                  <ul className="mbs-4 grid gap-2.5">
                    {stage.points.map((point) => (
                      <li
                        key={point.en}
                        className="tnum flex gap-3 text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="mbs-2.5 size-1.5 flex-none rounded-full bg-primary"
                        />
                        {pick(point, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mbs-6 text-sm text-muted-foreground">{t("changes")}</p>
      </section>

      {/* ---- who can sit it, and past papers ---- */}
      {exam.eligibility || exam.papers.length > 0 ? (
        <section className="container-page grid grid-cols-[repeat(auto-fit,minmax(min(100%,26rem),1fr))] gap-4 pbe-20 md:pbe-28">
          {exam.eligibility ? (
            <Reveal className="h-full">
              <div className="h-full rounded-[28px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] md:p-8">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">
                  {t("eligibility")}
                </h2>
                <ul className="mbs-5 grid">
                  {exam.eligibility.map((line) => (
                    <li
                      key={line.en}
                      className="tnum border-bs border-border pbs-4 pbe-4 first:border-bs-0 first:pbs-0"
                    >
                      {pick(line, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ) : null}
          {exam.papers.length > 0 ? (
            <Reveal delay={0.05} className="h-full">
              <div className="h-full rounded-[28px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] md:p-8">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">
                  {t("papers")}
                </h2>
                <ul className="mbs-4 grid gap-1">
                  {exam.papers.map((paper) => (
                    <li key={paper.href}>
                      <a
                        href={paper.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-sibling
                        className="flex items-center justify-between gap-4 rounded-2xl ps-4 pe-4 pbs-3 pbe-3"
                      >
                        {pick(paper.label, locale)}
                        <IconArrowUpRight
                          data-nudge
                          aria-hidden
                          size={16}
                          stroke={1.75}
                          className="flex-none"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ) : null}
        </section>
      ) : null}

      {/* ---- ICT's batch for this exam ---- */}
      {course ? (
        <section
          aria-labelledby="prepare-heading"
          className="container-page pbe-20 md:pbe-28"
        >
          <Reveal>
            <div className="grid gap-10 rounded-[32px] bg-primary p-7 text-white md:p-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <h2
                  id="prepare-heading"
                  className="font-display text-[clamp(1.6rem,1.2rem+1.8vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em] text-balance"
                >
                  {t("prepare")}.{" "}
                  <span className="text-on-primary">{t("prepareRest")}</span>
                </h2>
                <p className="mbs-6 font-display text-2xl font-semibold">
                  {course.short}
                </p>
                <p className="tnum mbs-1 text-on-primary">
                  {[
                    schedule ? content.phrase(schedule.when) : null,
                    content.track(track.slug).duration,
                    course.free ? null : inr(course.price),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <ul className="mbs-5 flex items-center">
                  {people.map((person, k) => (
                    <li key={person.slug} className={k ? "-ms-2.5" : undefined}>
                      <span
                        data-avatar
                        className="relative block size-11 overflow-clip rounded-full"
                        title={person.called}
                      >
                        <Image
                          src={person.portrait}
                          alt={person.called}
                          fill
                          sizes="44px"
                          className="object-cover object-top"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mbs-7 flex flex-wrap gap-3">
                  <Link
                    href={`/courses/${course.slug}`}
                    data-press
                    data-cta="amber"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
                  >
                    {t("seeCourse")}
                    <IconArrowRight
                      data-nudge
                      aria-hidden
                      size={18}
                      stroke={2}
                    />
                  </Link>
                  <a
                    href={contactHref({ kind: "track", exam: track.exam })}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-press
                    data-cta="ghost-blue"
                    className="inline-flex h-12 items-center rounded-full px-6 font-semibold"
                  >
                    {t("enquire")}
                  </a>
                </div>
              </div>
              <ul className="grid gap-2 lg:col-span-5">
                {[
                  { href: "/resources", label: t("freeMaterial") },
                  { href: "/books", label: t("books") },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-blue-row
                      className="flex items-center justify-between gap-4 rounded-2xl ps-5 pe-5 pbs-4 pbe-4 font-semibold"
                    >
                      {item.label}
                      <IconArrowRight
                        data-nudge
                        aria-hidden
                        size={18}
                        stroke={2}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* ---- where every fact above comes from ---- */}
      <section
        aria-labelledby="sources-heading"
        className="container-page pbe-20"
      >
        <h2
          id="sources-heading"
          className="text-sm font-semibold text-muted-foreground"
        >
          {t("sources")}
        </h2>
        <ul className="mbs-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {exam.sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-1 underline decoration-foreground/30 underline-offset-4"
              >
                {pick(source.label, locale)}
                <IconArrowUpRight aria-hidden size={14} stroke={1.75} />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
