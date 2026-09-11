import { IconArrowRight, IconArrowUpRight, IconCheck, IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Lede, Section } from "@/components/ui/section"
import { courseById, inr } from "@/lib/catalogue"
import {
  facultyBySlug,
  fees,
  lectureStill,
  offer,
  tracks,
  trackEnquiryHref,
  trackFreeHref,
  youtubeWatch,
  type Track,
} from "@/lib/brand"
import { cn } from "@/lib/utils"

function startsLabel(iso: string) {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  })
}

function views(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`
}

/**
 * A pricing card per track, priced from ICT's own catalogue.
 *
 * Name, price, list price and feature list all come from the Classplus
 * snapshot, so the card cannot disagree with the checkout. The strike-through
 * is ICT's real standing discount, not a manufactured one.
 *
 * The flagship track is an ink panel. On a page this light it does the job a
 * "most popular" ribbon usually does, without the ribbon.
 */
function TrackCard({ track, featured = false }: { track: Track; featured?: boolean }) {
  const course = courseById(track.flagshipId)
  if (!course) return null

  const free = track.freeId ? courseById(track.freeId) : null
  const also = track.alsoIds.map(courseById).filter(Boolean)
  const people = track.faculty.map(facultyBySlug)
  const muted = featured ? "text-white/60" : "text-muted-foreground"
  const rule = featured ? "border-white/15" : "border-border"

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-card p-6 md:p-7",
        featured
          ? "bg-primary text-primary-foreground shadow-lift"
          : "border border-border bg-card shadow-frame"
      )}
    >
      <header className="min-h-20">
        <div className="flex items-start justify-between gap-3">
          <h3 className="type-lede">{track.exam}</h3>
          <span
            className={cn(
              "shrink-0 rounded-control px-2.5 py-1 text-sm",
              featured ? "bg-white/10 text-white/80" : "bg-secondary text-muted-foreground"
            )}
          >
            {track.duration}
          </span>
        </div>
        <p className={cn("mt-1.5 text-sm", muted)}>{track.covers}</p>
      </header>

      <div className={cn("mt-6 border-t pt-6", rule)}>
        <p className={cn("text-sm", muted)}>{course.name.split(/\s*[-–]\s*/)[0]}</p>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="tnum text-[2rem] leading-none font-medium tracking-[-0.03em]">
            {inr(course.price)}
          </span>
          {course.mrp > course.price ? (
            <span className={cn("tnum text-sm line-through", muted)}>{inr(course.mrp)}</span>
          ) : null}
          <span className={cn("text-sm", muted)}>{fees.unit}</span>
        </p>
        <p className={cn("mt-2 text-sm leading-relaxed", muted)}>{fees.note}</p>
      </div>

      <ButtonAnchor
        href={trackEnquiryHref(track)}
        target="_blank"
        variant={featured ? "secondary" : "primary"}
        size="lg"
        className={cn("mt-5 w-full", featured && "border-transparent")}
      >
        Enrol for {track.exam}
        <IconArrowRight data-nudge stroke={1.75} />
      </ButtonAnchor>

      {free ? (
        <a
          href={trackFreeHref(track)}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "mt-3 inline-flex items-center justify-center gap-1 self-center text-sm underline underline-offset-4",
            featured ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Or start free with {free.name.split(/\s*[-–]\s*/)[0].trim()}
          <IconArrowUpRight size={14} stroke={1.75} />
        </a>
      ) : null}

      {/* what the fee buys, in ICT's own words from the listing */}
      <ul className={cn("mt-7 space-y-2.5 border-t pt-6", rule)}>
        {course.features.slice(0, 5).map((point) => (
          <li key={point} className="flex gap-2.5 text-sm leading-snug">
            <IconCheck
              size={16}
              stroke={2}
              aria-hidden
              className={cn("mt-0.5 shrink-0", featured ? "text-white/70" : "text-muted-foreground")}
            />
            {point}
          </li>
        ))}
      </ul>

      {also.length > 0 ? (
        <dl className={cn("mt-6 space-y-1.5 border-t pt-5", rule)}>
          <dt className={cn("text-sm", muted)}>Also in this track</dt>
          {also.map((other) => (
            <dd key={other!.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span>{other!.name.split(/\s*[-–]\s*/)[0].trim()}</span>
              <span className={cn("tnum shrink-0", muted)}>
                {other!.free ? "Free" : inr(other!.price)}
              </span>
            </dd>
          ))}
        </dl>
      ) : null}

      {track.startsOn ? (
        <p
          className={cn(
            "mt-5 rounded-control px-3 py-2 text-sm",
            featured ? "bg-white/10" : "bg-highlight/25"
          )}
        >
          Next batch starts {startsLabel(track.startsOn)}
        </p>
      ) : null}

      <div className={cn("mt-auto border-t pt-5", rule)}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {people.map((person) => (
              <span
                key={person.slug}
                className={cn(
                  "relative size-7 overflow-hidden rounded-full ring-2",
                  featured ? "bg-white/10 ring-primary" : "bg-surface ring-card"
                )}
              >
                <Image
                  src={person.portrait}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-cover object-top grayscale"
                />
              </span>
            ))}
          </div>
          <p className={cn("text-sm", muted)}>
            {people.map((person) => person.called).join(", ")}
          </p>
        </div>

        <a
          href={youtubeWatch(track.sample.id)}
          target="_blank"
          rel="noreferrer noopener"
          className="group/sample mt-4 flex items-center gap-3"
        >
          <span
            className={cn(
              "relative aspect-video w-16 shrink-0 overflow-hidden rounded-[0.5rem] ring-1",
              featured ? "ring-white/20" : "ring-border"
            )}
          >
            <Image
              src={lectureStill(track.sample.id)}
              alt=""
              fill
              sizes="64px"
              className="object-cover grayscale-[0.85] transition-[filter] duration-500 group-hover/sample:grayscale-0"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-5 place-items-center rounded-full bg-white/90 text-foreground">
                <IconPlayerPlayFilled className="size-2.5" />
              </span>
            </span>
          </span>
          <span className="text-sm">
            <span className="font-medium underline-offset-4 group-hover/sample:underline">
              Watch a sample class
            </span>
            <span className={cn("block", muted)}>{views(track.sample.views)} views</span>
          </span>
        </a>
      </div>
    </article>
  )
}

export function Courses() {
  return (
    <Section id="courses">
      <Reveal>
        <Lede
          label="Courses"
          claim="Three tracks, one classroom."
          rest="These are ICT's live courses and their current prices, the same ones the app charges. Every batch is taught on DC Bungalow Road and recorded to the app the same day."
        />
      </Reveal>

      <Reveal delay={0.08} className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
        {tracks.map((track) => (
          <TrackCard key={track.slug} track={track} featured={track.slug === "apsc"} />
        ))}
      </Reveal>

      <Reveal delay={0.14}>
        <p className="mt-6 text-sm text-muted-foreground">
          {fees.scholarship} {offer.promise}
        </p>
      </Reveal>
    </Section>
  )
}
