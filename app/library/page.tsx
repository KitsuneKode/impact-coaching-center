import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { CSSProperties } from "react"

import { ButtonAnchor, ButtonLink } from "@/components/ui/button"
import { DraftNotice } from "@/components/ui/draft-notice"
import { Section } from "@/components/ui/section"
import { contact, formatPhone, place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { libraryApproved, libraryFacts, libraryUpdated } from "@/lib/library"
import { openGraphFor } from "@/lib/site"

const title = "The library at ICT"
const description =
  "The library and study space at Impact Career Tutorials in North Lakhimpur: WiFi, study material, and a culture of group study."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/library" },
  openGraph: openGraphFor("/library", title, description),
  ...(libraryApproved ? {} : { robots: { index: false, follow: true } }),
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

const drafted = new Date(`${libraryUpdated}T00:00:00Z`).toLocaleDateString(
  "en-IN",
  { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
)

/** Deliberately thin. */
export default function LibraryPage() {
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="enter type-display max-w-208" style={delay(0)}>
          <span className="text-foreground">A place to actually study.</span>{" "}
          <span className="text-muted-foreground">
            Most of preparation is hours in a chair.
          </span>
        </h1>

        {libraryApproved ? null : (
          <div className="enter mt-8" style={delay(60)}>
            <DraftNotice drafted={drafted}>
              This page lists only what ICT has already published about the
              library. Plans, timings, seat numbers and rules have not been
              confirmed yet, so they are not shown rather than guessed. Ask and
              ICT will tell you.
            </DraftNotice>
          </div>
        )}

        <div className="mt-14 max-w-160">
          {libraryFacts.map((fact, index) => (
            <section
              key={fact.heading}
              className={index > 0 ? "mt-10" : undefined}
            >
              <h2 className="text-lg font-medium text-foreground">
                {fact.heading}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {fact.body}
              </p>
            </section>
          ))}

          <section className="mt-14 rounded-card border border-border bg-surface p-6 md:p-8">
            <h2 className="text-lg font-medium text-foreground">
              Ask about a seat
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Timings, whether a seat can be held for you, and what access costs
              if you are not enrolled — ICT will answer these directly. The
              centre is on {place.spoken}, {place.city}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonAnchor
                href={contactHref({ kind: "workshop" })}
                target="_blank"
                size="lg"
              >
                <IconBrandWhatsapp stroke={1.6} />
                Ask on WhatsApp
              </ButtonAnchor>
              <ButtonAnchor
                href={contactHref({ kind: "call" })}
                variant="secondary"
                size="lg"
              >
                Call{" "}
                <span className="tnum">{formatPhone(contact.phones[0])}</span>
              </ButtonAnchor>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                All contact details
              </ButtonLink>
            </div>
          </section>
        </div>
      </Section>
    </main>
  )
}
