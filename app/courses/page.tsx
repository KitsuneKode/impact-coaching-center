import { IconArrowRight, IconClock } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Enquire } from "@/components/marketing/enquire"
import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { schedules, tracks } from "@/lib/brand"
import { courseById, inr, type CatalogueCourse } from "@/lib/catalogue"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Courses and fees",
  description:
    "Every live course at Impact Career Tutorials with its current fee: APSC (Lakhya 2027, PRAGATI 2027), ADRE and Assam Police (VICTOR 8.0), and Banking, SSC and Railway (Radiant 2.0, Diamond 3.0), plus free workshops.",
  alternates: { canonical: "/courses" },
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

function CourseTile({
  course,
  flagship,
}: {
  course: CatalogueCourse
  flagship: boolean
}) {
  const schedule = schedules[course.id]
  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border bg-card shadow-frame transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        flagship ? "border-foreground/15" : "border-border"
      )}
    >
      {course.cover ? (
        <span className="relative aspect-[4/3] bg-surface">
          <Image
            src={course.cover}
            alt={`${course.short} course poster`}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </span>
      ) : null}

      <span className="flex flex-1 flex-col p-5">
        {flagship ? (
          <span className="mb-2 self-start rounded-control bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Main course
          </span>
        ) : null}
        <span className="block text-[1.0625rem] font-medium">
          {course.short}
        </span>
        {course.subtitle ? (
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {course.subtitle}
          </span>
        ) : null}

        {schedule ? (
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconClock size={14} stroke={1.75} />
            {schedule.when}
          </span>
        ) : null}

        <span className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="flex items-baseline gap-2">
            <span className="tnum text-[1.375rem] leading-none font-medium tracking-[-0.02em]">
              {course.free ? "Free" : inr(course.price)}
            </span>
            {course.mrp > course.price ? (
              <span className="tnum text-sm text-muted-foreground line-through">
                {inr(course.mrp)}
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            Details
            <IconArrowRight
              size={15}
              stroke={1.75}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </span>
      </span>
    </Link>
  )
}

/**
 * Every live course, grouped by exam, priced from ICT's own catalogue.
 *
 * It mirrors the structure of ICT's Classplus storefront on purpose, so the
 * owner recognises their own offering, and fixes what that storefront does
 * not do: group by the exam a student is actually preparing for, and show the
 * timing, which the store omits.
 */
export default function CoursesPage() {
  return (
    <main>
      <section className="pt-26 pb-10 md:pt-30">
        <div className="container-page">
          <h1 className="enter type-display max-w-[48rem]" style={delay(0)}>
            <span className="text-foreground">Courses and fees.</span>
            <span className="text-muted-foreground">
              {" "}
              Every live course, priced exactly as the ICT app charges.
            </span>
          </h1>
          <nav
            aria-label="Find a course by exam"
            className="enter mt-8 flex flex-wrap gap-2"
            style={delay(80)}
          >
            <a
              href="#apsc"
              className="rounded-control border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-frame transition-colors hover:bg-secondary"
            >
              APSC
            </a>
            <a
              href="#adre"
              className="rounded-control border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-frame transition-colors hover:bg-secondary"
            >
              ADRE and Assam Police
            </a>
            <a
              href="#banking"
              className="rounded-control border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-frame transition-colors hover:bg-secondary"
            >
              Banking, SSC and Railway
            </a>
          </nav>
        </div>
      </section>

      {tracks.map((track, index) => {
        const ids = [track.flagshipId, ...track.alsoIds, track.freeId].filter(
          (id): id is number => id !== null
        )
        const list = ids.map(courseById).filter((c) => c !== undefined)
        return (
          <Section
            key={track.slug}
            id={track.slug}
            size="sm"
            className={index > 0 ? "border-t border-border" : undefined}
          >
            <Reveal>
              <Lede
                label={track.exam}
                claim={`${track.full}.`}
                rest={`${track.covers}.`}
              />
            </Reveal>
            <Reveal
              delay={0.08}
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {list.map((course) => (
                <CourseTile
                  key={course.id}
                  course={course}
                  flagship={course.id === track.flagshipId}
                />
              ))}
            </Reveal>
          </Section>
        )
      })}

      <Enquire />
    </main>
  )
}
