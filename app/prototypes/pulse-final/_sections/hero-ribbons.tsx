import { WordRoll } from "../../pulse/_client"
import { heroCopy, heroWords, ribbonDurations } from "../_content"
import { container } from "../_theme"
import { BatchTicket } from "./batch-ticket"
import { PhotoRibbon, photos } from "./photo-wall"
import { PrimaryCta, WhatsFree } from "./primary-cta"
import { SiteHeader } from "./site-header"

/**
 * Hero C, "Photo ribbons". The calm version: a paper page with a centred
 * ink headline, and a blue panel below where two ribbons of ICT's own photos
 * run in opposite directions.
 */
export function HeroRibbons() {
  return (
    <section
      id="top"
      data-pf-hero
      aria-label="Introduction"
      className="relative overflow-hidden bg-[var(--pu-paper)] text-[var(--pu-ink)]"
    >
      <SiteHeader tone="paper" />
      <div className={`${container} pt-10 text-center md:pt-8`}>
        <h1
          data-rise
          className="mx-auto max-w-[16ch] text-[clamp(2.1rem,4.6vw,3.9rem)] leading-[1.04] font-semibold tracking-[-0.04em]"
        >
          Coaching for
          <br />
          {/* Amber on paper fails contrast; the roll keeps Pulse's blue here. */}
          <WordRoll words={heroWords} className="text-[var(--pu-blue)]" />
        </h1>
        <p
          data-rise
          style={{ animationDelay: "0.1s" }}
          className="mx-auto mt-4 max-w-[46ch] text-lg text-[var(--pu-muted)]"
        >
          {heroCopy}
        </p>
        <div
          data-rise
          style={{ animationDelay: "0.2s" }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <PrimaryCta />
          <WhatsFree tone="paper" />
        </div>
      </div>
      <div className={`${container} relative mt-10 pb-20 md:mt-6 md:pb-24`}>
        <div className="relative z-10 mx-auto -mb-12 max-w-[420px] lg:absolute lg:-top-24 lg:right-4 lg:m-0 lg:w-[380px]">
          <BatchTicket />
        </div>
        <div
          aria-hidden
          className="overflow-hidden rounded-[40px] bg-[var(--pu-blue)] py-8 md:py-12"
        >
          <PhotoRibbon
            set={photos.slice(0, 6)}
            dur={ribbonDurations[0]!}
            sizes="(min-width: 768px) 320px, 240px"
          />
          <PhotoRibbon
            set={photos.slice(6)}
            dur={ribbonDurations[1]!}
            reverse
            sizes="(min-width: 768px) 320px, 240px"
          />
        </div>
      </div>
    </section>
  )
}
