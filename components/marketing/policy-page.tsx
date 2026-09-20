import type { CSSProperties } from "react"

import { Section } from "@/components/ui/section"
import type { PolicyDocument } from "@/lib/policies"

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/** 20 September 2026, not 2026-09-20, for a reader rather than a machine. */
function readableDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * One renderer for all four policy documents.
 *
 * An unapproved document says so at the top, in words rather than only in
 * metadata: AGENTS.md requires a placeholder to be impossible to mistake for
 * approved content, and a `noindex` tag is invisible to the person reading it.
 */
export function PolicyPage({ document: doc }: { document: PolicyDocument }) {
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="enter type-display max-w-208" style={delay(0)}>
          <span className="text-foreground">{doc.title}</span>
        </h1>
        <p
          className="enter type-lede mt-4 max-w-160 text-muted-foreground"
          style={delay(60)}
        >
          {doc.description}
        </p>

        {doc.approved ? (
          <p
            className="enter mt-6 text-sm text-muted-foreground"
            style={delay(90)}
          >
            Last updated {readableDate(doc.updated)}.
          </p>
        ) : (
          <div
            className="enter mt-8 max-w-160 rounded-card border border-highlight bg-highlight/20 p-5"
            style={delay(90)}
          >
            <p className="text-sm font-medium text-foreground">
              Draft — not yet approved by Impact Career Tutorials
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This wording describes how the website works today and has not
              been signed off. It is not a contract. For anything that matters,
              speak to ICT directly. Drafted {readableDate(doc.updated)}.
            </p>
          </div>
        )}

        <div className="mt-14 max-w-160">
          {doc.sections.map((section, index) => (
            <section
              key={section.heading}
              className={index > 0 ? "mt-10" : undefined}
            >
              <h2 className="text-lg font-medium text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Section>
    </main>
  )
}
