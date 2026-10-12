import { getTranslations, setRequestLocale } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import { exams, pick } from "@/lib/exams"
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import type { CSSProperties } from "react"

import { Enquire } from "@/components/marketing/enquire"
import { Faq } from "@/components/marketing/faq"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Lede, Section } from "@/components/ui/section"
import {
  brand,
  contact,
  facultyBySlug,
  formatPhone,
  lectureStill,
  schedules,
  tracks,
} from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { inr, lineup } from "@/lib/courses"
import { liveCourse, liveCourses } from "@/lib/courses-server"
import { alternatesFor, openGraphFor, siteUrl } from "@/lib/site"

/* Courses come from ClassPlus every few hours; a new one gets its page on
   first visit and every page refreshes within the quarter hour. */
export const revalidate = 900

export async function generateStaticParams() {
  return (await liveCourses())
    .filter((course) => course.track)
    .map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const course = await liveCourse(slug)
  if (!course) return {}
  const t = await getTranslations({ locale, namespace: "CourseDetail" })
  const { phrase } = await contentFor(locale)
  const price = course.free ? t("freeLower") : inr(course.price)
  const title = t("titleSuffix", { course: course.short, price })
  const subtitle = course.subtitle ? `: ${phrase(course.subtitle)}` : ""
  const description = `${course.short}${subtitle}. ${course.features
    .slice(0, 3)
    .join(". ")}. ${t("descSuffix")}`
  return {
    title,
    description,
    alternates: alternatesFor(`/courses/${course.slug}`, locale),
    openGraph: openGraphFor(
      `/courses/${course.slug}`,
      title,
      description,
      locale
    ),
  }
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/** Enrolment counts are social proof only when they are large enough to be. */
const LEARNERS_WORTH_SHOWING = 20

export default async function CoursePage({
  params,
}: PageProps<"/[locale]/courses/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const course = await liveCourse(slug)
  if (!course?.track) notFound()

  const track = tracks.find((t) => t.exam === course.track)
  const legacy = schedules[course.id]
  const schedule = course.timing
    ? { when: course.timing, days: undefined, note: undefined }
    : legacy
  const people = (track?.faculty ?? []).map(facultyBySlug)
  const { flagship, also, free } = lineup(await liveCourses(), course.track)
  const siblings = [flagship, ...also, free].filter(
    (c): c is NonNullable<typeof c> => c !== undefined && c.id !== course.id
  )
  const saving = course.mrp - course.price
  const t = await getTranslations("CourseDetail")
  const tf = await getTranslations("Fees")
  const th = await getTranslations("Hero")
  const tc = await getTranslations("Courses")
  const content = await contentFor(locale)
  const { phrase } = content
  const trackNames = track ? content.track(track.slug) : null
  const guides = exams.filter((exam) => exam.track === track?.slug)

  /* Course schema, so search can show the price beside the result */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.short,
    description: course.subtitle || course.features.slice(0, 2).join(". "),
    provider: {
      "@type": "EducationalOrganization",
      name: brand.legalName,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      category: course.free ? "Free" : "Paid",
      price: course.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Blended",
      location: `${brand.legalName}, North Lakhimpur, Assam`,
      ...(schedule
        ? {
            courseSchedule: { "@type": "Schedule", description: schedule.when },
          }
        : {}),
    },
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ---- hero ---- */}
      <section className="pt-26 pb-16 md:pt-30 md:pb-20">
        <div className="container-page">
          <nav aria-label={t("breadcrumb")} className="enter" style={delay(0)}>
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  {t("courses")}
                </Link>
              </li>
              {track ? (
                <>
                  <IconChevronRight size={14} stroke={1.75} aria-hidden />
                  <li>{trackNames?.exam}</li>
                </>
              ) : null}
              <IconChevronRight size={14} stroke={1.75} aria-hidden />
              <li aria-current="page" className="text-foreground">
                {course.short}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <div>
              <h1 className="enter type-display" style={delay(60)}>
                <span className="text-foreground">{course.short}.</span>
                {course.subtitle ? (
                  <span className="text-muted-foreground">
                    {" "}
                    {phrase(course.subtitle)}.
                  </span>
                ) : null}
              </h1>

              <div
                className="enter mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1"
                style={delay(140)}
              >
                <span className="tnum text-[2.5rem] leading-none font-medium tracking-[-0.03em]">
                  {course.free ? t("free") : inr(course.price)}
                </span>
                {saving > 0 ? (
                  <>
                    <span className="tnum text-muted-foreground line-through">
                      {inr(course.mrp)}
                    </span>
                    <span className="tnum rounded-control bg-highlight/35 px-2 py-0.5 text-sm font-medium">
                      {t("save", { amount: inr(saving) })}
                    </span>
                  </>
                ) : null}
              </div>
              <p
                className="enter mt-3 text-sm text-muted-foreground"
                style={delay(160)}
              >
                {course.free ? t("freeNote") : tf("note")}
              </p>

              {schedule ? (
                <ul
                  className="enter mt-6 flex flex-wrap gap-2"
                  style={delay(200)}
                >
                  <li className="inline-flex items-center gap-1.5 rounded-control border border-border bg-card px-3 py-1.5 text-sm shadow-frame">
                    <IconClock
                      size={15}
                      stroke={1.75}
                      className="text-muted-foreground"
                    />
                    {phrase(schedule.when)}
                  </li>
                  {schedule.days ? (
                    <li className="inline-flex items-center gap-1.5 rounded-control border border-border bg-card px-3 py-1.5 text-sm shadow-frame">
                      <IconCalendar
                        size={15}
                        stroke={1.75}
                        className="text-muted-foreground"
                      />
                      {phrase(schedule.days)}
                    </li>
                  ) : null}
                  {schedule.note ? (
                    <li className="inline-flex items-center rounded-control bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                      {phrase(schedule.note)}
                    </li>
                  ) : null}
                </ul>
              ) : null}

              <div
                className="enter mt-8 flex flex-wrap gap-3"
                style={delay(260)}
              >
                <ButtonAnchor
                  href={contactHref({
                    kind: "course",
                    courseName: course.short,
                  })}
                  target="_blank"
                  size="lg"
                >
                  {course.free
                    ? t("joinFree", { course: course.short })
                    : t("enrol", { course: course.short })}
                  <IconArrowRight data-nudge stroke={1.75} />
                </ButtonAnchor>
                <ButtonAnchor
                  href={contactHref({ kind: "call" })}
                  variant="secondary"
                  size="lg"
                >
                  <IconPhone stroke={1.6} />
                  <span className="tnum">{formatPhone(contact.phones[0])}</span>
                </ButtonAnchor>
              </div>

              {guides.length > 0 ? (
                <p
                  className="enter mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm"
                  style={delay(280)}
                >
                  {guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/exams/${guide.slug}`}
                      className="link"
                    >
                      {t("howExam")}: {pick(guide.name, locale)}
                    </Link>
                  ))}
                </p>
              ) : null}

              {course.learners >= LEARNERS_WORTH_SHOWING ? (
                <p
                  className="enter mt-5 text-sm text-muted-foreground"
                  style={delay(300)}
                >
                  <span className="tnum font-medium text-foreground">
                    {course.learners}
                  </span>{" "}
                  {t("learners")}
                </p>
              ) : null}
            </div>

            {course.cover ? (
              <figure className="enter" style={delay(180)}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface shadow-lift ring-1 ring-border">
                  <Image
                    src={course.cover}
                    alt={t("posterAlt", { course: course.short })}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 42vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  {t("posterCaption")}
                </figcaption>
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---- what the fee buys ---- */}
      <Section size="sm" className="border-t border-border">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <Lede
              label={t("includedLabel")}
              claim={t("includedClaim")}
              rest={t("includedRest")}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {course.features.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-[0.9375rem] leading-snug"
                >
                  <IconCheck
                    size={18}
                    stroke={2}
                    aria-hidden
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* ---- who teaches it ---- */}
      {people.length > 0 ? (
        <Section size="sm" className="border-t border-border">
          <Reveal>
            <Lede
              label={t("teachersLabel")}
              claim={t("teachersClaim")}
              rest={t("teachersRest")}
            />
          </Reveal>
          <Reveal
            delay={0.08}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {people.map((person) => (
              <VideoDialog
                key={person.slug}
                id={person.lecture}
                title={th("videoTitle", {
                  called: person.called,
                  teaches: content.teaches(person.slug),
                })}
                subtitle={th("videoSubtitle")}
                className="flex w-full items-center gap-4 rounded-card border border-border bg-card p-4 shadow-frame transition-shadow hover:shadow-lift"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-[0.75rem] bg-surface">
                  <Image
                    src={person.portrait}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{person.called}</span>
                  <span className="block text-sm text-muted-foreground">
                    {content.teaches(person.slug)}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm underline-offset-4 group-hover:underline">
                    {t("watchClass")}
                    <IconPlayerPlayFilled size={11} />
                  </span>
                </span>
              </VideoDialog>
            ))}
          </Reveal>

          {track ? (
            <Reveal delay={0.12}>
              <VideoDialog
                id={track.sample.id}
                title={tc("sampleTitle", { exam: trackNames?.exam ?? "" })}
                subtitle={tc("sampleSubtitle")}
                className="mt-4 flex w-full items-center gap-5 rounded-card border border-border bg-card p-4 shadow-frame transition-shadow hover:shadow-lift"
              >
                <span className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-control bg-surface">
                  <Image
                    src={lectureStill(track.sample.id)}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-9 place-items-center rounded-full bg-white/95 shadow-frame">
                      <IconPlayerPlayFilled className="size-4" />
                    </span>
                  </span>
                </span>
                <span>
                  <span className="block font-medium">{t("sampleFull")}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t("sampleNote")}
                  </span>
                </span>
              </VideoDialog>
            </Reveal>
          ) : null}
        </Section>
      ) : null}

      {/* ---- the rest of the track ---- */}
      {siblings.length > 0 && track ? (
        <Section size="sm" className="border-t border-border">
          <Reveal>
            <Lede
              label={t("moreIn", { exam: trackNames?.exam ?? track.exam })}
              claim={t("otherWays")}
            />
          </Reveal>
          <Reveal
            delay={0.08}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {siblings.map((other) => (
              <Link
                key={other.id}
                href={`/courses/${other.slug}`}
                className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-frame transition-shadow hover:shadow-lift"
              >
                {other.cover ? (
                  <span className="relative aspect-[4/3] bg-surface">
                    <Image
                      src={other.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 92vw, 30vw"
                      className="object-cover"
                    />
                  </span>
                ) : null}
                <span className="flex flex-1 items-end justify-between gap-3 p-5">
                  <span>
                    <span className="block font-medium">{other.short}</span>
                    {other.subtitle ? (
                      <span className="block text-sm text-muted-foreground">
                        {phrase(other.subtitle)}
                      </span>
                    ) : null}
                  </span>
                  <span className="tnum shrink-0 font-medium">
                    {other.free ? t("free") : inr(other.price)}
                  </span>
                </span>
              </Link>
            ))}
          </Reveal>
        </Section>
      ) : null}

      <Faq courses={await liveCourses()} />
      <Enquire />
    </main>
  )
}
