import { IconPlus } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { useContent } from "@/i18n/content"
import { fillFees, type Course } from "@/lib/courses"

/**
 * Questions that open on a tap, one at a time, the first open to show how.
 * Every answer stays in the page, so search reads them all; the full set
 * carries FAQ structured data, and a page showing only the first few
 * (`limit`) leaves that to home.
 */
export function Faq({
  courses,
  heading,
  limit,
}: {
  courses: readonly Course[]
  heading?: string
  limit?: number
}) {
  const t = useTranslations("Pulse")
  const faqs = useContent()
    .faqs.slice(0, limit)
    .map((item) => ({ q: item.q, a: fillFees(item.a, courses) }))
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
  return (
    <section aria-labelledby="faq-heading" className="pbe-20 md:pbe-28">
      {limit ? null : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <div className="container-page">
        <h2 id="faq-heading" className="type-display mbe-10">
          {heading ?? t("questions")}
        </h2>
        <div className="grid items-start gap-3 md:grid-cols-2">
          {faqs.map((item, index) => (
            <details
              key={item.q}
              name="faq"
              open={index === 0}
              data-faq
              className="rounded-[22px] bg-card shadow-[0_0_0_1px_var(--border)]"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4 p-5 font-semibold sm:p-6">
                {item.q}
                <IconPlus
                  aria-hidden
                  size={18}
                  stroke={2}
                  data-faq-icon
                  className="mbs-0.5 flex-none text-muted-foreground"
                />
              </summary>
              <p className="ps-5 pe-5 pbe-5 text-muted-foreground sm:ps-6 sm:pe-6 sm:pbe-6">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
