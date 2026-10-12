import { useTranslations } from "next-intl"

import { useContent } from "@/i18n/content"
import { fillFees, type Course } from "@/lib/courses"

/** Questions, all open in a grid, with FAQ structured data for search. */
export function Faq({ courses }: { courses: readonly Course[] }) {
  const t = useTranslations("Pulse")
  const faqs = useContent().faqs.map((item) => ({
    q: item.q,
    a: fillFees(item.a, courses),
  }))
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="container-page">
        <h2 id="faq-heading" className="type-display mbe-10">
          {t("questions")}
        </h2>
        <dl className="grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_var(--border)]"
            >
              <dt className="font-semibold">{item.q}</dt>
              <dd className="mbs-2 text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
