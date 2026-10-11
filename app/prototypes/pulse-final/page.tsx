import type { Metadata } from "next"

import { grandFooterCss } from "../_block-css"
import { bookCss } from "../_book"
import { barCampaign, campaign } from "../_campaign"
import { shelf } from "../_data"
import { folderCss } from "../_folder"
import { KitIsland } from "../_kit/island"
import { SitePromoLayer } from "../_kit/site-layer"
import { PrototypeSwitcher } from "../_switcher"
import { islandTokens } from "../pulse/_island"
import type { HeroKey } from "./_content"
import { css, fontClass, tokens } from "./_theme"
import { Ask } from "./_sections/ask"
import { Books } from "./_sections/books"
import { ExamMarquee } from "./_sections/exam-marquee"
import { ExamStack } from "./_sections/exam-stack"
import { Faq } from "./_sections/faq"
import { Footer } from "./_sections/footer"
import { FreeFirst } from "./_sections/free-first"
import { HeroBleed } from "./_sections/hero-bleed"
import { HeroOptions } from "./_sections/hero-options"
import { HeroRibbons } from "./_sections/hero-ribbons"
import { HeroWall } from "./_sections/hero-wall"
import { JoinBand } from "./_sections/join-band"
import { LoopWatch } from "./_sections/loop-watch"
import { PromoStrip } from "./_sections/promo-strip"
import { Results } from "./_sections/results"
import { StudentFan } from "./_sections/student-fan"
import { Teachers } from "./_sections/teachers"

export const metadata: Metadata = { title: "Pulse, final" }

const heroes = {
  wall: HeroWall,
  bleed: HeroBleed,
  ribbons: HeroRibbons,
} as const

export default async function PulseFinal({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>
}) {
  const { hero: pick } = await searchParams
  const hero: HeroKey = pick === "bleed" || pick === "ribbons" ? pick : "wall"
  const Hero = heroes[hero]
  const { books, folders, samples } = await shelf()

  return (
    <div
      data-pf
      style={tokens}
      className={`${fontClass} min-h-[100dvh] bg-[var(--pu-paper)] font-[family-name:var(--pu-sans)] text-[var(--pu-ink)] antialiased`}
    >
      <style>{css + bookCss + folderCss + grandFooterCss}</style>

      <KitIsland theme="pulse" tokens={islandTokens}>
        <SitePromoLayer
          base="/prototypes/pulse-final"
          bar={{ ...barCampaign("/prototypes/pulse"), href: "#courses" }}
          campaign={campaign}
          parts={{ bar: false, modal: true, reel: true }}
          reelAfter="[data-pf-hero]"
          popup={{
            endSelector: "[data-pf-end]",
            engagedMs: 45_000,
            minDepth: 0.35,
          }}
        />
      </KitIsland>

      <PromoStrip c={barCampaign("/prototypes/pulse")} href="#courses" />

      <Hero />

      <ExamMarquee />

      <main>
        <ExamStack />
        <StudentFan />
        <FreeFirst folders={folders} samples={samples} />
        <Books books={books} samples={samples} />
        <Teachers />
        <Results />
        <Faq />
        <Ask />
        <JoinBand />
      </main>

      <Footer />

      <HeroOptions active={hero} />
      <PrototypeSwitcher current="pulse-final" />
      <LoopWatch />
    </div>
  )
}
