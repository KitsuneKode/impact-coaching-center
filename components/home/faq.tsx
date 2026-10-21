import { IconBrandWhatsapp, IconPlus } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { useContent } from "@/i18n/content"
import { contactHref } from "@/lib/contact"
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
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Beside the list on wide screens, so it stays in view while reading. */}
        <div className="grid content-start gap-4 lg:sticky lg:inset-bs-[calc(var(--header-height)+2rem)] lg:col-span-4 lg:self-start">
          <h2 id="faq-heading" className="type-display">
            {heading ?? t("questions")}
          </h2>
          <p className="max-w-[34ch] text-pretty text-muted-foreground">
            {t("faqLede")}
          </p>
          <a
            href={contactHref({ kind: "question" })}
            target="_blank"
            rel="noreferrer noopener"
            data-press
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-secondary ps-4 pe-5 text-sm font-semibold"
          >
            <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
            {t("faqAsk")}
          </a>
        </div>
        <div data-faq-list className="lg:col-span-8">
          {faqs.map((item, index) => (
            <details key={item.q} name="faq" open={index === 0} data-faq>
              <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-lg font-semibold text-balance">
                {item.q}
                <span
                  aria-hidden
                  data-faq-icon
                  className="mbs-0.5 grid size-8 flex-none place-items-center rounded-full"
                >
                  <IconPlus size={16} stroke={2} />
                </span>
              </summary>
              <p className="max-w-[62ch] pe-14 pbe-6 text-pretty text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
