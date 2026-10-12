import { useTranslations } from "next-intl"
import { Reveal } from "@/components/motion/reveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Section } from "@/components/ui/section"
import { useContent } from "@/i18n/content"
import { tracks } from "@/lib/brand"
import { inr, lineup, type Course } from "@/lib/courses"

/** Replace {apsc} and {apscFee} style marks with each exam's lead course. */
function fillFees(text: string, courses: readonly Course[]) {
  let out = text
  for (const track of tracks) {
    const lead = lineup(courses, track.exam).flagship
    out = out
      .replaceAll(`{${track.slug}}`, lead?.short ?? track.exam)
      .replaceAll(`{${track.slug}Fee}`, lead ? inr(lead.price) : "")
  }
  return out
}

/**
 * Objection handling. Each question here is one a parent or a working
 * aspirant asks before they enquire: cost, risk, time, language, distance.
 * Answering them on the page removes the reasons to leave it.
 */
export function Faq({ courses }: { courses: readonly Course[] }) {
  const t = useTranslations("Faq")
  // Fees are written as {apscFee} and the like, filled from the live courses.
  const faqs = useContent().faqs.map((item) => ({
    q: item.q,
    a: fillFees(item.a, courses),
  }))
  // The same questions and answers the accordion shows, for search engines.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
  return (
    <Section id="questions">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <h2 className="type-lede max-w-[28rem]">
            <span className="text-foreground">{t("claim")}</span>
            <span className="text-muted-foreground"> {t("rest")}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion>
            {faqs.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  )
}
