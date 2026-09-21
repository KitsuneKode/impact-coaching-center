import {
  IconArrowRight,
  IconArrowUpRight,
  IconPhone,
} from "@tabler/icons-react"
import Image from "next/image"
import type { CSSProperties } from "react"

import { BatchCountdown } from "@/components/marketing/batch-countdown"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { ButtonAnchor } from "@/components/ui/button"
import {
  contact,
  faculty,
  formatPhone,
  links,
  nextBatch,
  offer,
} from "@/lib/brand"
import { contactHref } from "@/lib/contact"

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

const startDate = new Date(`${nextBatch.startsOn}T00:00:00+05:30`)
const startLabel = startDate.toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
})
const startShort = startDate.toLocaleDateString("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
})

/**
 * Hero, rendered on the server with CSS-only entry so the headline paints on
 * the first frame (it is the LCP element, and most of this audience is on a
 * mid-range Android phone).
 *
 * Structure follows kobbe.io: a two-tone paragraph instead of a shouting
 * headline, then a full-width strip of people. Where kobbe draws townsfolk,
 * ICT shows the five teachers a student will actually sit in front of, each
 * linking to a full class they taught. For a coaching centre, the faculty is
 * the product.
 */
export function Hero() {
  return (
    <section className="relative pt-26 pb-16 md:pt-30 md:pb-24">
      <div className="container-page">
        {/* the one eyebrow on the page: a real, dated batch */}
        <a
          href={contactHref({ kind: "workshop" })}
          target="_blank"
          rel="noreferrer noopener"
          className="enter group inline-flex max-w-full items-center gap-2.5 rounded-control border border-border bg-card py-1.5 pr-2.5 pl-3 text-sm shadow-frame transition-colors hover:bg-secondary"
          style={delay(0)}
        >
          <span className="min-w-0 truncate">
            <span className="font-medium">{nextBatch.name}</span>
            <span className="text-muted-foreground">
              <span className="hidden sm:inline"> for {nextBatch.exam}</span> ·
              Start date: <span className="sm:hidden">{startShort}</span>
              <span className="hidden sm:inline">{startLabel}</span>
            </span>
          </span>
          <BatchCountdown />
          <IconArrowRight
            size={15}
            stroke={1.75}
            className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </a>

        {/*
         * The claim and the explanation were one h1 at section-heading size,
         * so they competed and neither won. Split: the claim gets the hero
         * scale and the ink, the explanation becomes a lede beneath it. Two
         * sizes where there was one is the whole of the hierarchy.
         *
         * Also better semantics - the heading is now the heading, rather than
         * a heading with a paragraph inside it.
         */}
        <h1 className="enter type-hero mt-7 max-w-5xl" style={delay(80)}>
          <span className="mark">Crack APSC</span> from North Lakhimpur.
        </h1>
        <p
          className="enter type-lede mt-5 max-w-3xl text-muted-foreground"
          style={delay(140)}
        >
          Classroom, night batch, and the ICT app, with faculty you can watch
          teach on YouTube before you pay anything.
        </p>

        <div
          className="enter mt-8 flex flex-wrap items-center gap-3"
          style={delay(180)}
        >
          <ButtonAnchor
            href={contactHref({ kind: "workshop" })}
            target="_blank"
            size="lg"
          >
            {offer.cta}
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
      </div>

      {/* ---- the people ---- */}
      <div className="container-page mt-14 md:mt-16">
        <div
          className="enter flex items-baseline justify-between gap-4"
          style={delay(300)}
        >
          <p className="type-label">The teachers you will sit in front of</p>
          <a
            href={links.youtube}
            target="_blank"
            rel="noreferrer noopener"
            className="link hidden items-center gap-1 text-sm sm:inline-flex"
          >
            Watch them teach
            <IconArrowUpRight size={14} stroke={1.75} />
          </a>
        </div>

        <ul className="-mx-5 mt-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {faculty.map((person, index) => (
            <li
              key={person.slug}
              className="enter w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-auto"
              style={delay(360 + index * 70)}
            >
              <VideoDialog
                id={person.lecture}
                title={`${person.called} teaching ${person.teaches}`}
                subtitle="A full class from the ICT channel"
                className="w-full"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface ring-1 ring-border md:aspect-[6/7]">
                  <Image
                    src={person.portrait}
                    alt={`${person.name}, ${person.teaches} faculty at Impact Career Tutorials`}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : undefined}
                    sizes="(max-width: 768px) 44vw, 18vw"
                    className="object-cover object-top contrast-[1.04] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute right-2.5 bottom-2.5 inline-flex size-8 translate-y-1 items-center justify-center rounded-[0.5rem] bg-white/90 text-foreground opacity-0 shadow-frame transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <IconArrowUpRight size={16} stroke={1.75} />
                  </span>
                </div>
                <p className="mt-3 text-[0.9375rem] font-medium tracking-tight">
                  {person.called}
                </p>
                <p className="text-sm text-muted-foreground">
                  {person.teaches}
                </p>
              </VideoDialog>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
