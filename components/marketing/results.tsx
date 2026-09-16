import { IconArrowUpRight, IconCircleCheckFilled } from "@tabler/icons-react"

import { Reveal } from "@/components/motion/reveal"
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider"
import { Lede, Section } from "@/components/ui/section"
import Link from "next/link"

import { links, selections, testimonials } from "@/lib/brand"

type Testimonial = (typeof testimonials)[number]

/**
 * One officer, one card. The serial is the proof, so it is the largest thing
 * on the card and it is the number printed in the commission's own result,
 * never a rank ICT's marketing has claimed elsewhere.
 */
export function SelectionCard({
  person,
}: {
  person: (typeof selections)[number]
}) {
  return (
    <article className="flex flex-col rounded-card border border-border bg-card p-6 shadow-frame md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="tnum text-[3rem] leading-none font-medium tracking-[-0.04em]">
            {person.serial}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Serial in the APSC CCE 2022 result
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-verified/25 bg-verified/8 px-2.5 py-1 text-xs font-medium text-verified">
          <IconCircleCheckFilled size={14} aria-hidden />
          Verified
        </span>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-[1.0625rem] font-medium">{person.name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{person.post}</p>
      </div>
    </article>
  )
}

function QuoteCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full w-[min(82vw,24rem)] flex-col rounded-card border border-border bg-card p-6 shadow-frame">
      <blockquote className="text-[0.9875rem] leading-relaxed text-foreground">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="truncate text-xs text-muted-foreground">{item.role}</p>
        </div>
        {item.verified ? (
          <IconCircleCheckFilled
            size={15}
            className="shrink-0 text-verified"
            aria-hidden
          />
        ) : null}
      </figcaption>
    </figure>
  )
}

/**
 * Results: the numbers first, then the voices.
 *
 * The officer cards carry the checkable facts; the rail carries what people
 * said. Quotes appear once, in the rail, so nothing is repeated between them.
 */
export function Results() {
  return (
    <Section id="results" bleed className="overflow-hidden">
      <div className="container-page">
        <Reveal>
          <Lede
            label="Results"
            claim="Two officers on the APSC CCE 2022 list prepared here."
            rest="Both names are in the commission's own result, published on 17 January 2024."
            link={{
              href: links.apscResultPdf,
              label: "Open the result",
              external: true,
            }}
          />
        </Reveal>

        <Reveal
          delay={0.08}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl"
        >
          {selections.map((person) => (
            <SelectionCard key={person.serial} person={person} />
          ))}
        </Reveal>
      </div>

      <Reveal
        delay={0.12}
        className="mt-12 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      >
        <InfiniteSlider gap={16} speed={28} speedOnHover={4}>
          {testimonials.map((item) => (
            <QuoteCard
              key={`${item.name}-${item.quote.slice(0, 20)}`}
              item={item}
            />
          ))}
        </InfiniteSlider>
      </Reveal>

      <div className="container-page">
        <Reveal delay={0.16}>
          <Link
            href="/success-stories"
            className="link mt-10 inline-flex items-center gap-1 text-sm"
          >
            Student reviews, officers who taught here, and how we check each
            claim
            <IconArrowUpRight size={14} stroke={1.75} />
          </Link>
        </Reveal>
      </div>
    </Section>
  )
}
