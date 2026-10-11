import { WordRoll } from "../../pulse/_client"
import { heroCopy, heroWords, wallDurations } from "../_content"
import { container } from "../_theme"
import { BatchTicket } from "./batch-ticket"
import { PhotoWall } from "./photo-wall"
import { PrimaryCta, WhatsFree } from "./primary-cta"
import { SiteHeader } from "./site-header"

/**
 * Hero A, "Blue field". Pulse's blue hero untouched on the left; on the right
 * a tilted wall of ICT's own photos drifts, fading into the blue so the text
 * keeps its clean field. Below lg the wall is a band under the copy.
 */
export function HeroWall() {
  return (
    <section
      id="top"
      data-pf-hero
      aria-label="Introduction"
      className="relative overflow-hidden bg-[var(--pu-blue)] text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 -right-1/4 size-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]"
      />
      <div data-pf-sidewall aria-hidden className="hidden lg:block">
        <PhotoWall
          cols={3}
          durations={wallDurations}
          sizes="(min-width: 1024px) 17vw, 34vw"
          priority
        />
      </div>
      <SiteHeader tone="blue" />
      <div
        className={`${container} relative grid gap-10 pt-10 pb-16 md:pt-14 lg:grid-cols-12 lg:items-end lg:gap-14 lg:pb-24`}
      >
        <div className="lg:col-span-6">
          <h1
            data-rise
            className="text-[clamp(2.1rem,4.6vw,3.9rem)] leading-[1.04] font-semibold tracking-[-0.04em]"
          >
            Coaching for
            <br />
            <WordRoll words={heroWords} />
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.1s" }}
            className="mt-7 max-w-[46ch] text-lg text-[var(--pu-on-blue)]"
          >
            {heroCopy}
          </p>
          <div
            data-rise
            style={{ animationDelay: "0.2s" }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <PrimaryCta />
            <WhatsFree tone="blue" />
          </div>
        </div>
        <div className="hidden lg:col-span-6 lg:block">
          <BatchTicket className="max-w-[420px] lg:-ml-4" />
        </div>
      </div>
      <div className="relative lg:hidden">
        <div data-pf-band aria-hidden>
          <PhotoWall cols={3} durations={wallDurations} sizes="34vw" />
        </div>
        <div className="relative z-10 -mt-44 px-5 pb-40">
          <BatchTicket className="mx-auto max-w-[420px]" />
        </div>
      </div>
    </section>
  )
}
