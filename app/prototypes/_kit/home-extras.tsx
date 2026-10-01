import type { CSSProperties } from "react"

import { MobileMenu } from "../_mobile-menu"
import { barCampaign, campaign } from "../_campaign"
import { KitIsland } from "./island"
import { SitePromoLayer } from "./site-layer"

/** The kit's pages, for a home page that keeps its own header. */
export const sitePages = (slug: string) => [
  { href: `/prototypes/${slug}/courses`, label: "Courses" },
  { href: `/prototypes/${slug}/exams`, label: "Exams" },
  { href: `/prototypes/${slug}/books`, label: "Books" },
  { href: `/prototypes/${slug}/notes`, label: "Free notes" },
  { href: `/prototypes/${slug}/results`, label: "Results" },
  { href: `/prototypes/${slug}/contact`, label: "Contact" },
]

/** The announcement bar, pop-up and reel on a home page with its own look. */
export function HomePromos({
  slug,
  tokens,
  bar = true,
}: {
  slug: string
  tokens: CSSProperties
  /** false where the header floats over the hero and a bar would collide */
  bar?: boolean
}) {
  const base = `/prototypes/${slug}`
  return (
    <KitIsland theme={slug} tokens={tokens}>
      <SitePromoLayer
        base={base}
        bar={barCampaign(base)}
        campaign={campaign}
        parts={{ bar, modal: true, reel: true }}
      />
    </KitIsland>
  )
}

/** The phone menu for a header that only had a desktop nav. */
export function HomeMenu({
  slug,
  tokens,
  top = 64,
}: {
  slug: string
  tokens: CSSProperties
  top?: number
}) {
  return (
    <KitIsland theme={slug} tokens={{ ...tokens, display: "contents" }}>
      <div className="md:hidden">
        <MobileMenu links={sitePages(slug)} top={top} />
      </div>
    </KitIsland>
  )
}
