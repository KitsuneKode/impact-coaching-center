import { IconArrowRight, IconArrowUpRight, IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Lede, Section } from "@/components/ui/section"
import {
  courseDemoHref,
  courseFeeHref,
  courses,
  facultyBySlug,
  lectureStill,
  offer,
  youtubeWatch,
  type Course,
} from "@/lib/brand"
import { cn } from "@/lib/utils"

function startsLabel(iso: string) {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  })
}

function views(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K views` : `${n} views`
}

/** Overlapping monochrome avatars, then the names. Answers "who teaches this?" */
function TaughtBy({ course }: { course: Course }) {
  const people = course.faculty.map(facultyBySlug)
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {people.map((person) => (
          <span
            key={person.slug}
            className="relative size-8 overflow-hidden rounded-full bg-surface ring-2 ring-card"
          >
            <Image
              src={person.portrait}
              alt=""
              fill
              sizes="32px"
              className="object-cover object-top grayscale"
            />
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {people.map((person) => person.called).join(", ")}
      </p>
    </div>
  )
}

/**
 * The fee row. No fee is published on any ICT channel, so until the owner
 * supplies one the row turns the gap into the next step: a WhatsApp message
 * that already names the course. When `fee` is set, the number appears instead.
 */
function FeeRow({ course, featured }: { course: Course; featured?: boolean }) {
  return (
    <div className="mt-auto flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm">
        {course.fee ? (
          <>
            <span className="text-muted-foreground">Fee </span>
            <span className="font-medium">{course.fee}</span>
          </>
        ) : (
          <a
            href={courseFeeHref(course)}
            target="_blank"
            rel="noreferrer noopener"
            className="link inline-flex items-center gap-0.5 font-medium"
          >
            Get the fee
            <IconArrowUpRight size={14} stroke={1.75} />
          </a>
        )}
      </div>
      <ButtonAnchor
        href={courseDemoHref(course)}
        target="_blank"
        variant={featured ? "primary" : "secondary"}
        size="md"
      >
        {offer.short}
        <IconArrowRight data-nudge stroke={1.75} />
      </ButtonAnchor>
    </div>
  )
}

function SampleClass({ course, large }: { course: Course; large?: boolean }) {
  return (
    <a
      href={youtubeWatch(course.sample.id)}
      target="_blank"
      rel="noreferrer noopener"
      className={cn("group/sample flex items-center gap-4", large && "flex-col items-stretch gap-3")}
    >
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-[0.625rem] bg-surface ring-1 ring-border",
          large ? "aspect-video w-full" : "aspect-video w-28"
        )}
      >
        <Image
          src={lectureStill(course.sample.id)}
          alt=""
          fill
          sizes={large ? "(max-width: 1024px) 90vw, 36vw" : "112px"}
          className="object-cover grayscale-[0.85] transition-[filter,transform] duration-500 ease-out group-hover/sample:scale-[1.03] group-hover/sample:grayscale-0"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/10 transition-colors group-hover/sample:bg-black/0">
          <span
            className={cn(
              "grid place-items-center rounded-full bg-white/95 text-foreground shadow-frame",
              large ? "size-12" : "size-8"
            )}
          >
            <IconPlayerPlayFilled className={large ? "size-5" : "size-3.5"} />
          </span>
        </span>
      </span>
      <span className="text-sm">
        <span className="font-medium group-hover/sample:underline">Watch a sample {course.exam} class</span>
        <span className="text-muted-foreground">, {views(course.sample.views)} on YouTube</span>
      </span>
    </a>
  )
}

export function Courses() {
  const [apsc, ...rest] = courses

  return (
    <Section id="courses">
      <Reveal>
        <Lede
          label="Courses"
          claim="Three tracks, one classroom."
          rest="Every batch is taught on DC Bungalow Road and recorded to the ICT app the same day, so a missed class is never a lost one."
        />
      </Reveal>

      {/* three courses, three cells: one feature beside two stacked */}
      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
        <article className="flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-frame md:p-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="type-display">{apsc.exam}</h3>
              <p className="mt-1 text-muted-foreground">
                {apsc.full}. {apsc.covers}.
              </p>
            </div>
            <span className="shrink-0 rounded-control bg-secondary px-2.5 py-1 text-sm">{apsc.duration}</span>
          </header>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {apsc.batches.map((batch) => (
              <div key={batch.name}>
                <dt className="text-sm font-medium tracking-wide">{batch.name}</dt>
                <dd className="text-sm text-muted-foreground">{batch.note}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7">
            <SampleClass course={apsc} large />
          </div>

          <div className="mt-7 mb-7">
            <TaughtBy course={apsc} />
          </div>

          <FeeRow course={apsc} featured />
        </article>
        </Reveal>

        <Reveal delay={0.08} className="grid gap-4 lg:col-span-5">
          {rest.map((course) => (
            <article
              key={course.slug}
              className="flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-frame md:p-7"
            >
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="type-lede">{course.exam}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{course.covers}.</p>
                </div>
                <span className="shrink-0 rounded-control bg-secondary px-2.5 py-1 text-sm">
                  {course.duration}
                </span>
              </header>

              {course.startsOn && course.batches[0] ? (
                <p className="mt-5 rounded-control bg-highlight/25 px-3 py-2.5 text-sm">
                  <span className="font-medium">{course.batches[0].name}</span> starts{" "}
                  {startsLabel(course.startsOn)}, {course.batches[0].note}.
                </p>
              ) : null}

              <div className="mt-5">
                <SampleClass course={course} />
              </div>

              <div className="mt-5 mb-6">
                <TaughtBy course={course} />
              </div>

              <FeeRow course={course} />
            </article>
          ))}
        </Reveal>
      </div>
    </Section>
  )
}
