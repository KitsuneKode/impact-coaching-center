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
import Link from "next/link"
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
  fees,
  formatPhone,
  lectureStill,
  listedCourseIds,
  schedules,
  trackForCourse,
} from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { catalogue, courseById, courseBySlug, inr } from "@/lib/catalogue"
import { siteUrl } from "@/lib/site"

/* only courses a track points at get a page; anything else is a 404 */
export const dynamicParams = false

export function generateStaticParams() {
  return catalogue
    .filter((course) => listedCourseIds.has(course.id))
    .map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const course = courseBySlug(slug)
  if (!course) return {}
  const price = course.free ? "free" : inr(course.price)
  return {
    title: `${course.short}, ${price}`,
    description: `${course.short}${course.subtitle ? `: ${course.subtitle}` : ""}. ${course.features
      .slice(0, 3)
      .join(". ")}. At Impact Career Tutorials, North Lakhimpur.`,
    alternates: { canonical: `/courses/${course.slug}` },
  }
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/** Enrolment counts are social proof only when they are large enough to be. */
const LEARNERS_WORTH_SHOWING = 20

export default async function CoursePage({
  params,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params
  const course = courseBySlug(slug)
  if (!course) notFound()

  const track = trackForCourse(course.id)
  const schedule = schedules[course.id]
  const people = (track?.faculty ?? []).map(facultyBySlug)
  const siblings = track
    ? [track.flagshipId, ...track.alsoIds, track.freeId]
        .filter((id): id is number => id !== null && id !== course.id)
        .map(courseById)
        .filter((c) => c !== undefined)
    : []
  const saving = course.mrp - course.price

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
          <nav aria-label="Breadcrumb" className="enter" style={delay(0)}>
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  Courses
                </Link>
              </li>
              {track ? (
                <>
                  <IconChevronRight size={14} stroke={1.75} aria-hidden />
                  <li>{track.exam}</li>
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
                    {course.subtitle}.
                  </span>
                ) : null}
              </h1>

              <div
                className="enter mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1"
                style={delay(140)}
              >
                <span className="tnum text-[2.5rem] leading-none font-medium tracking-[-0.03em]">
                  {course.free ? "Free" : inr(course.price)}
                </span>
                {saving > 0 ? (
                  <>
                    <span className="tnum text-muted-foreground line-through">
                      {inr(course.mrp)}
                    </span>
                    <span className="tnum rounded-control bg-highlight/35 px-2 py-0.5 text-sm font-medium">
                      Save {inr(saving)}
                    </span>
                  </>
                ) : null}
              </div>
              <p
                className="enter mt-3 text-sm text-muted-foreground"
                style={delay(160)}
              >
                {course.free
                  ? "No payment needed. Enrol on the ICT app."
                  : fees.note}
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
                    {schedule.when}
                  </li>
                  {schedule.days ? (
                    <li className="inline-flex items-center gap-1.5 rounded-control border border-border bg-card px-3 py-1.5 text-sm shadow-frame">
                      <IconCalendar
                        size={15}
                        stroke={1.75}
                        className="text-muted-foreground"
                      />
                      {schedule.days}
                    </li>
                  ) : null}
                  {schedule.note ? (
                    <li className="inline-flex items-center rounded-control bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                      {schedule.note}
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
                    ? `Join ${course.short} free`
                    : `Enrol in ${course.short}`}
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

              {course.learners >= LEARNERS_WORTH_SHOWING ? (
                <p
                  className="enter mt-5 text-sm text-muted-foreground"
                  style={delay(300)}
                >
                  <span className="tnum font-medium text-foreground">
                    {course.learners}
                  </span>{" "}
                  learners have enrolled on the ICT app.
                </p>
              ) : null}
            </div>

            {course.cover ? (
              <figure className="enter" style={delay(180)}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface shadow-lift ring-1 ring-border">
                  <Image
                    src={course.cover}
                    alt={`${course.short} course poster by Impact Career Tutorials`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 42vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  The course poster, as ICT publishes it.
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
              label="What is included"
              claim="In ICT's own words."
              rest="This list is taken from the course listing on ICT's app, the same one the checkout uses."
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
              label="Who teaches it"
              claim="Watch them teach before you enrol."
              rest="Every teacher on this course publishes full lectures on the ICT YouTube channel."
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
                title={`${person.called} teaching ${person.teaches}`}
                subtitle="A full class from the ICT channel"
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
                    {person.teaches}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm underline-offset-4 group-hover:underline">
                    Watch a class
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
                title={`Sample ${track?.exam ?? ""} class`}
                subtitle="From the ICT channel"
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
                  <span className="block font-medium">
                    Watch a full sample class
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    From the same syllabus, free.
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
              label={`More in ${track.exam}`}
              claim="Other ways to prepare."
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
                        {other.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <span className="tnum shrink-0 font-medium">
                    {other.free ? "Free" : inr(other.price)}
                  </span>
                </span>
              </Link>
            ))}
          </Reveal>
        </Section>
      ) : null}

      <Faq />
      <Enquire />
    </main>
  )
}
