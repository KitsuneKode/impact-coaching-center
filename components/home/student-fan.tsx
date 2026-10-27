import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { StudentFanDeck } from "@/components/home/student-fan-deck"
import { Link } from "@/i18n/navigation"
import { Reveal } from "@/components/motion/reveal"
import { studentReviews } from "@/lib/stories"

/** Five students fanned out like a hand of cards; each plays its Short in place
 * (student-fan-deck.tsx). */
export function StudentFan() {
  const t = useTranslations("Pulse")
  const voices = useTranslations("Voices")
  return (
    <section
      id="voices"
      aria-labelledby="voices-heading"
      className="overflow-x-clip pbe-20 md:pbe-28"
    >
      <div className="container-page text-center">
        <Reveal>
          <h2 id="voices-heading" className="type-display mx-auto max-w-[18ch]">
            {t("voicesHeading")}
          </h2>
        </Reveal>
      </div>
      <StudentFanDeck reviews={studentReviews.slice(0, 5)} />
      <p className="container-page mbs-6 text-center">
        <Link
          href="/success-stories#voices"
          data-press
          data-cta="ghost-paper"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold"
        >
          {voices("hearAll", { count: studentReviews.length })}
          <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
        </Link>
      </p>
    </section>
  )
}
