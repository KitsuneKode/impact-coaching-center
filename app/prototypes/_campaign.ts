import { batchDay } from "./_kit/batch-day"
import type { Campaign } from "./_promos"
import {
  courses,
  nextBatch,
  offer,
  rupees,
  reviews,
  thumb,
  whatsapp,
} from "./_data"

/**
 * One sample campaign for the promotions kit. The words and the offer come
 * from what ICT already publishes; the code and the end date are samples, and
 * the pages say so. In the live site these come from the admin.
 */
const victor = courses.find((c) => c.name === nextBatch.name)

/** ICT's own promotional Shorts, from its YouTube channel; all allow embedding. */
const promoShorts = [
  {
    id: "ICvIqOER2og",
    name: "Free APSC coaching",
    meta: "ASSIST scholarship test",
  },
  { id: "z2WO0TSau2Y", name: "ADRE full course", meta: "From the ICT channel" },
  {
    id: "YBk4koza6Is",
    name: "Warrior mock tests",
    meta: "APSC Prelims series",
  },
  { id: "o8tEkkeHKcQ", name: "Target Batch", meta: "Bank, SSC and Railway" },
  { id: "pJdfEqqHcQE", name: "ASSIST 4.0", meta: "Impact scholarship test" },
].map((v) => ({ ...v, still: thumb(v.id), bare: true }))

export const campaign: Campaign = {
  tag: "Free workshop",
  headline: "Start with a free workshop.",
  body: "Pay only when you pick a batch. Kouxal for APSC and ABHIGYAN for banking, SSC and Railway are both free on the ICT app.",
  cta: offer.cta,
  href: whatsapp,
  // The workshop poster carries past dates; ICT adds a current one in the admin.
  image: null,
  imageAlt: "",
  reels: [
    ...promoShorts,
    ...reviews.slice(0, 2).map((r) => ({
      id: r.id,
      still: r.image,
      name: r.name,
      meta: `${r.exam}, ${r.batch}`,
    })),
  ],
  coupon: "FIRSTCLASS",
  price: victor?.price ? rupees(victor.price) : null,
  was: victor?.mrp ? rupees(victor.mrp) : null,
  secondary: "See the batches",
}

export const menuItems = [
  {
    label: "Scholarships",
    note: "Through ICT's ASSIST test.",
    href: "#",
  },
  {
    label: "The ICT app",
    note: "Every class recorded, on Google Play.",
    href: "#",
  },
  {
    label: "Free notes",
    note: "Six folders, one mobile number to open them.",
    href: "#",
  },
]

/** A sample end date, three and a half days from now, for the countdown. */
export function sampleEndsAt() {
  return Date.now() + (3 * 24 + 14) * 3_600_000 + 22 * 60_000
}

/** The announcement bar's copy: the batch that starts next, linked to its course page. */
export function barCampaign(base: string): Campaign {
  return {
    ...campaign,
    tag: "New batch",
    headline: `Day ${batchDay(nextBatch.startsOn)}: ${nextBatch.name}.`,
    body: `${nextBatch.exam}, ${nextBatch.timing}, for ${nextBatch.forWho}.`,
    cta: "See the batch",
    href: victor ? `${base}${victor.href}` : `${base}/courses`,
  }
}

/** The Offers menu, with each row pointing inside the theme it appears in. */
export function siteMenuItems(base: string) {
  return menuItems.map((m, i) => ({
    ...m,
    href: [`${base}/assist`, `${base}/contact`, `${base}/notes`][i] ?? base,
  }))
}
