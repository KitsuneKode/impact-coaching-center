import { Classes } from "@/components/marketing/classes"
import { Courses } from "@/components/marketing/courses"
import { Enquire } from "@/components/marketing/enquire"
import { Faq } from "@/components/marketing/faq"
import { Fees } from "@/components/marketing/fees"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { Posters } from "@/components/marketing/posters"
import { ProofBar } from "@/components/marketing/proof-bar"
import { Results } from "@/components/marketing/results"

/*
 * The order follows the decision a visitor actually makes:
 *
 *   who teaches me, and is it real       Hero (faculty), ProofBar
 *   does it work                         Results
 *   what can I join                      Courses
 *   what do I get, what does it cost     Fees
 *   let me see for myself                Classes
 *   but what about...                    Faq
 *   how do I start                       Enquire (steps + form)
 *   last nudge                           FinalCta
 *
 * Every section uses a different layout family, so the page never settles into
 * a repeating rhythm: text over a people strip, a stat row, a marquee, an
 * asymmetric card grid, a two-panel pricing block, a split list, an accordion,
 * a split form, a one-line close.
 */
export default function Page() {
  return (
    <main id="top">
      <Hero />
      <ProofBar />
      <Results />
      <Posters />
      <Courses />
      <Fees />
      <Classes />
      <Faq />
      <Enquire />
      <FinalCta />
    </main>
  )
}
