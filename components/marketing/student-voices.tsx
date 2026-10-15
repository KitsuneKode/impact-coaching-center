import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { VoicesCarousel } from "@/components/marketing/voices-carousel"
import { Reveal } from "@/components/motion/reveal"
import { Link } from "@/i18n/navigation"
import { studentReviews } from "@/lib/stories"

/**
 * ICT's own student review videos, with the name and batch they print on each
 * card, in a centre-snapping carousel with an exam filter.
 */
export function StudentVoices({
  limit,
  heading,
  lead,
}: {
  limit?: number
  heading?: string
  lead?: string
}) {
  const t = useTranslations("Voices")
  const list = limit ? studentReviews.slice(0, limit) : studentReviews

  return (
    <section
      id="voices"
      aria-labelledby="voices-heading"
      className="pbe-20 md:pbe-28"
    >
      <div className="container-page">
        <Reveal>
          <h2 id="voices-heading" className="type-display max-w-[18ch]">
            {heading ?? t("claim")}
          </h2>
          <p className="mbs-3 max-w-[52ch] text-lg text-muted-foreground">
            {lead ?? t("rest")}
          </p>
        </Reveal>
      </div>
      <div className="mbs-8">
        <VoicesCarousel reviews={list} />
      </div>
      {limit && limit < studentReviews.length ? (
        <p className="container-page mbs-6">
          <Link
            href="/success-stories#voices"
            data-press
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 font-semibold"
          >
            {t("hearAll", { count: studentReviews.length })}
            <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
          </Link>
        </p>
      ) : null}
    </section>
  )
}
