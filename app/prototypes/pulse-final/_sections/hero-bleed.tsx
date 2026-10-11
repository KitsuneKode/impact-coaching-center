import { place } from "../../_data"
import { WordRoll } from "../../pulse/_client"
import { bleedDurations, heroCopy, heroWords } from "../_content"
import { container } from "../_theme"
import { BatchTicket } from "./batch-ticket"
import { PhotoWall } from "./photo-wall"
import { PrimaryCta, WhatsFree } from "./primary-cta"
import { SiteHeader } from "./site-header"

/**
 * Hero B, "Full photo wall". Rollcall's composition in Pulse's colours: five
 * columns of ICT's own photographs cover the whole hero under a blue-into-ink
 * scrim, the headline anchors the bottom left and the ticket floats right.
 */
export function HeroBleed() {
  return (
    <section
      id="top"
      data-pf-hero
      data-pf-bleed
      aria-label="Introduction"
      className="relative overflow-hidden bg-[var(--pu-ink)] text-white"
    >
      <div data-pf-bleedwall aria-hidden>
        <PhotoWall
          cols={5}
          durations={bleedDurations}
          sizes="(min-width: 768px) 21vw, 34vw"
          priority
        />
      </div>
      <div className="relative">
        <SiteHeader tone="overlay" />
        <div
          className={`${container} flex min-h-[calc(100svh-120px)] flex-col justify-end gap-8 pt-6 pb-36 md:min-h-[calc(100svh-124px)] lg:pt-3 lg:pb-44`}
        >
          <div>
            <p data-rise data-pf-pill>
              {place.city}, {place.region}
            </p>
            <h1
              data-rise
              style={{ animationDelay: "0.06s" }}
              className="mt-4 max-w-[12ch] text-[clamp(2.2rem,6vw,5rem)] leading-[1.02] font-semibold tracking-[-0.04em] lg:mt-2"
            >
              Coaching for
              <br />
              <WordRoll words={heroWords} />
            </h1>
            <div
              data-rise
              style={{ animationDelay: "0.12s" }}
              className="mt-5 flex flex-wrap items-end justify-between gap-8 lg:mt-3"
            >
              <div className="max-w-[46ch]">
                <p className="text-lg text-[var(--pu-on-blue)]">{heroCopy}</p>
                <p className="mt-2 text-sm text-white/80 lg:mt-1">
                  Every photo here is ours.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-4">
                  <PrimaryCta />
                  <WhatsFree tone="blue" />
                </div>
              </div>
              <BatchTicket className="hidden w-[380px] lg:block" />
            </div>
          </div>
          <div className="lg:hidden">
            <BatchTicket className="mx-auto max-w-[420px]" />
          </div>
        </div>
      </div>
    </section>
  )
}
