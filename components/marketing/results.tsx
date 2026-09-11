import { IconCircleCheckFilled } from "@tabler/icons-react"

import { Reveal } from "@/components/motion/reveal"
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider"
import { Lede, Section } from "@/components/ui/section"
import { links, testimonials } from "@/lib/brand"

type Testimonial = (typeof testimonials)[number]

function QuoteCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full w-[min(82vw,24rem)] flex-col rounded-card border border-border bg-card p-6 shadow-frame">
      {/* quoted whole: trimming a real student's words would misrepresent them */}
      <blockquote className="text-[0.9875rem] leading-relaxed text-foreground">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="truncate text-xs text-muted-foreground">{item.role}</p>
        </div>
        {item.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-verified">
            <IconCircleCheckFilled size={15} aria-hidden />
            On the APSC list
          </span>
        ) : null}
      </figcaption>
    </figure>
  )
}

/**
 * Results. The one marquee on the page.
 *
 * An auto-advancing rail says "there is more than fits here" without arrows
 * to hunt for, and slows almost to a stop on hover so a quote can be read.
 * InfiniteSlider collapses it to a plain scroller under reduced motion.
 */
export function Results() {
  return (
    <Section id="results" bleed className="overflow-hidden">
      <div className="container-page">
        <Reveal>
          <Lede
            label="Results"
            claim="Two officers on the APSC CCE 2022 list prepared here."
            rest="Priyanka Saikia is in the Assam Police Service and Amitesh Rajkhowa in the Assam Urban Administrative Service. Both names are in the commission's own result."
            link={{ href: links.apscResultPdf, label: "Open the result", external: true }}
          />
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-12 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <InfiniteSlider gap={16} speed={28} speedOnHover={4}>
          {testimonials.map((item) => (
            <QuoteCard key={`${item.name}-${item.quote.slice(0, 20)}`} item={item} />
          ))}
        </InfiniteSlider>
      </Reveal>
    </Section>
  )
}
