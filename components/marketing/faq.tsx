import { Reveal } from "@/components/motion/reveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Section } from "@/components/ui/section"
import { faqs } from "@/lib/brand"

/**
 * Objection handling. Each question here is one a parent or a working
 * aspirant asks before they enquire: cost, risk, time, language, distance.
 * Answering them on the page removes the reasons to leave it.
 */
export function Faq() {
  return (
    <Section id="questions">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <h2 className="type-lede max-w-[28rem]">
            <span className="text-foreground">Questions.</span>
            <span className="text-muted-foreground">
              {" "}
              Fees, timings, language, and the app, answered in plain words.
            </span>
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
