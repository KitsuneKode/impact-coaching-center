import { IconArrowRight, IconClock, IconUsers } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"

import { Ask } from "@/components/home/ask"
import { CourseBoard, type DayBatch } from "@/components/marketing/course-board"
import { PageHead } from "@/components/site/page-head"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { facultyBySlug, schedules, tracks } from "@/lib/brand"
import { parseTiming } from "@/lib/batch-time"
import { type Course, inr, lineup } from "@/lib/courses"
import { liveCourses, todayInIndia } from "@/lib/courses-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "CoursesPage" })
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    alternates: alternatesFor("/courses", locale),
    openGraph: openGraphFor("/courses", title, description, locale),
  }
}

/** Every live course, grouped by exam, straight from ICT's ClassPlus store. */
export default async function CoursesPage({
  params,
}: PageProps<"/[locale]/courses">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Pulse")
  const fees = await getTranslations("Fees")
  const nav = await getTranslations("Nav")
  const board = await getTranslations("Board")
  const content = await contentFor(locale)
  const courses = await liveCourses()

  const groups = tracks.flatMap((track) => {
    const { flagship, also, free } = lineup(courses, track.exam)
    const items = [flagship, ...also, free].filter((c) => c !== undefined)
    return items.length ? [{ track, items }] : []
  })

  // Batches with a readable time, for the day timeline.
  const day: DayBatch[] = courses.flatMap((course) => {
    const poster = schedules[course.id]
    const when = course.timing ?? poster?.when
    const span = parseTiming(when)
    const track = tracks.find((tr) => tr.exam === course.track)
    if (!span || !when || !track) return []
    return [
      {
        ...span,
        slug: course.slug,
        name: course.short,
        exam: content.track(track.slug).exam,
        when,
        days: poster?.days ? content.phrase(poster.days) : undefined,
        note: poster?.note ? content.phrase(poster.note) : undefined,
        price: course.free ? t("free") : inr(course.price),
      },
    ]
  })

  const finderCourses = courses.map((course) => ({
    ...course,
    subtitle: course.subtitle ? content.phrase(course.subtitle) : "",
    timing: course.timing ?? schedules[course.id]?.when,
  }))
  const exams = Object.fromEntries(
    tracks.map((track) => [
      track.slug,
      { exam: track.exam, label: content.track(track.slug).exam },
    ])
  )
  const students = courses.reduce((sum, course) => sum + course.learners, 0)

  return (
    <main>
      <PageHead
        trail={[{ label: nav("courses") }]}
        title={t("coursesTitle")}
        lede={`${fees("note")} ${fees("scholarship")}`}
      >
        {students >= PROOF_FROM ? (
          <p className="tnum mbs-5 flex items-center gap-2 text-sm font-medium">
            <IconUsers
              aria-hidden
              size={18}
              stroke={1.75}
              className="text-primary"
            />
            {board("studentsAll", { count: roundDown(students) })}
          </p>
        ) : null}
      </PageHead>

      <CourseBoard
        finder={finderCourses}
        exams={exams}
        today={await todayInIndia()}
        day={day}
        groups={groups.map(({ track, items }) => ({
          slug: track.slug,
          exam: track.exam,
          label: content.track(track.slug).exam,
          head: <TrackHead slug={track.slug} />,
          slugs: items.map((course) => course.slug),
        }))}
        cards={Object.fromEntries(
          courses.map((course) => [
            course.slug,
            <CourseCard key={course.slug} course={course} />,
          ])
        )}
      />

      <Ask />
    </main>
  )
}

/** Counts below this read as "nobody joined"; the site says nothing then. */
const PROOF_FROM = 25
/** 1,284 reads as "1,200+": a count that is true however the day goes. */
const roundDown = (n: number) =>
  n >= 1000 ? Math.floor(n / 100) * 100 : n >= 100 ? Math.floor(n / 10) * 10 : n

/** An exam's heading in the list: the name, what it covers, who teaches it. */
async function TrackHead({ slug }: { slug: (typeof tracks)[number]["slug"] }) {
  const t = await getTranslations("Pulse")
  const content = await contentFor(await getLocale())
  const track = tracks.find((tr) => tr.slug === slug)!
  const names = content.track(slug)
  const teachers = track.faculty.map(facultyBySlug)
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        <h2 id={`${slug}-heading`} className="type-display-sm">
          {names.exam}
        </h2>
        <p className="mbs-2 max-w-[60ch] text-muted-foreground">
          {names.full}. {names.covers}. {names.duration}.
        </p>
      </div>
      <ul className="flex items-center" aria-label={t("faculty")}>
        {teachers.map((teacher, k) => (
          <li key={teacher.slug} className={k ? "-ms-2.5" : undefined}>
            <span
              data-avatar
              className="relative block size-10 overflow-clip rounded-full"
              title={`${teacher.name}, ${content.teaches(teacher.slug)}`}
            >
              <Image
                src={teacher.portrait}
                alt={`${teacher.name}, ${content.teaches(teacher.slug)}`}
                fill
                sizes="40px"
                className="object-cover object-top"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** One course as a poster card: what it is, when it runs, who joined, the fee. */
async function CourseCard({ course }: { course: Course }) {
  const t = await getTranslations("Pulse")
  const board = await getTranslations("Board")
  const content = await contentFor(await getLocale())
  const legacy = schedules[course.id]
  const trackOf = tracks.find((tr) => tr.exam === course.track)
  const exam = trackOf ? content.track(trackOf.slug).exam : undefined
  const when = course.timing
    ? course.timing
    : legacy?.when
      ? `${content.phrase(legacy.when)}${legacy.days ? `, ${content.phrase(legacy.days)}` : ""}`
      : undefined
  return (
    <Link
      href={`/courses/${course.slug}`}
      data-course-card
      // Phones: a row, the poster small beside the name, so 26 courses
      // read as a list rather than a 10,000px column of posters.
      className="max-sm:grid max-sm:grid-cols-[7.5rem_minmax(0,1fr)] max-sm:rounded-[20px]"
    >
      <span
        data-course-poster
        className="relative block aspect-[16/9] overflow-clip max-sm:m-3 max-sm:me-0 max-sm:self-start max-sm:rounded-xl"
      >
        {course.cover ? (
          <Image
            src={course.cover}
            alt={t("poster", { name: course.short })}
            fill
            sizes="(min-width: 1024px) 34rem, (min-width: 640px) 50vw, 8rem"
            className="object-cover object-top"
          />
        ) : null}
      </span>
      <span className="flex flex-1 flex-col p-5 max-sm:p-3">
        <span className="block font-display text-xl font-semibold tracking-[-0.02em] text-balance max-sm:text-base">
          {course.short}
        </span>
        {course.subtitle ? (
          <span className="mbs-1 line-clamp-2 block text-muted-foreground max-sm:line-clamp-1 max-sm:text-sm">
            {content.phrase(course.subtitle)}
          </span>
        ) : null}
        <span className="tnum mbs-4 flex flex-wrap gap-2 text-sm max-sm:mbs-2 max-sm:text-xs">
          {exam ? <span data-course-chip>{exam}</span> : null}
          {/* No timing on file: say nothing rather than "ask" on every card. */}
          {when ? (
            <span data-course-chip>
              <IconClock aria-hidden size={15} stroke={1.75} />
              {when}
            </span>
          ) : null}
          {course.learners >= PROOF_FROM ? (
            <span data-course-chip>
              <IconUsers aria-hidden size={15} stroke={1.75} />
              {board("students", { count: roundDown(course.learners) })}
            </span>
          ) : null}
        </span>
        <span className="mbs-auto flex items-end justify-between gap-4 pbs-5 max-sm:pbs-2">
          <span className="tnum">
            <span className="font-display text-2xl font-semibold max-sm:text-lg">
              {course.free ? t("free") : inr(course.price)}
            </span>
            {!course.free && course.mrp > course.price ? (
              <s className="ms-2 text-sm text-muted-foreground">
                {inr(course.mrp)}
              </s>
            ) : null}
            {course.offlineFee ? (
              <span className="block text-sm text-muted-foreground">
                {t("offline", { fee: inr(course.offlineFee) })}
              </span>
            ) : null}
          </span>
          <span
            data-row-go
            className="grid size-11 flex-none place-items-center rounded-full max-sm:size-9"
          >
            <IconArrowRight aria-hidden size={18} stroke={2} />
          </span>
        </span>
      </span>
    </Link>
  )
}
