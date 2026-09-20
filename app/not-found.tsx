import { IconArrowRight, IconBrandWhatsapp } from "@tabler/icons-react"
import type { CSSProperties } from "react"

import { ButtonAnchor, ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { contactHref } from "@/lib/contact"

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/**
 * The page for a URL that does not exist.
 *
 * Most 404s apologise and stop, which leaves the visitor to press Back and
 * usually leave. This one admits the page is gone in one sentence and then
 * spends the rest of the screen on the three places that actually answer why
 * someone arrived: the courses, the results, and a person on WhatsApp.
 *
 * Every destination here is a route that exists. A 404 that links to another
 * 404 is the worst version of this page.
 */
export default function NotFound() {
  return (
    <main>
      <section className="pt-26 pb-10 md:pt-30">
        <div className="container-page">
          <p className="enter type-label mb-4" style={delay(0)}>
            404
          </p>
          <h1 className="enter type-display max-w-208" style={delay(60)}>
            <span className="text-foreground">
              That page is not here any more.
            </span>
            <span className="text-muted-foreground">
              {" "}
              The address may have changed, or it may never have existed. Here
              is everything the site actually has, and someone to ask if it is
              none of these.
            </span>
          </h1>
        </div>
      </section>

      <Section size="sm" className="border-t border-border">
        <div
          className="enter grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3"
          style={delay(140)}
        >
          <NotFoundLink
            href="/courses"
            title="Courses"
            detail="APSC, ADRE, Assam Police, banking, SSC and railway batches, with fees and what each one includes."
          />
          <NotFoundLink
            href="/success-stories"
            title="Results"
            detail="What the commission published, what ICT published, and the officers who have taught at the centre."
          />
          <NotFoundLink
            href="/"
            title="Start again"
            detail="The homepage, with the current batches and the fastest way to reach the centre."
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href="/courses" size="lg">
            See the courses
            <IconArrowRight stroke={1.6} aria-hidden="true" />
          </ButtonLink>
          <ButtonAnchor
            href={contactHref({ kind: "workshop" })}
            target="_blank"
            variant="secondary"
            size="lg"
          >
            <IconBrandWhatsapp stroke={1.6} aria-hidden="true" />
            Ask on WhatsApp
          </ButtonAnchor>
        </div>
      </Section>
    </main>
  )
}

function NotFoundLink({
  href,
  title,
  detail,
}: {
  href: string
  title: string
  detail: string
}) {
  return (
    <ButtonLink
      href={href}
      variant="ghost"
      size="lg"
      className="h-auto min-h-44 flex-col items-start justify-start gap-2 rounded-none bg-card p-6 text-left whitespace-normal"
    >
      <span className="type-label text-muted-foreground">{title}</span>
      <span className="text-[0.9375rem] leading-relaxed font-normal text-foreground">
        {detail}
      </span>
    </ButtonLink>
  )
}
