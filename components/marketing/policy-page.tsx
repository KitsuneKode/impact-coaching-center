import type { CSSProperties } from "react"
import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { proseComponents } from "@/components/marketing/markdown-body"
import { DraftNotice } from "@/components/ui/draft-notice"
import { Section } from "@/components/ui/section"
import {
  markersAsLinks,
  policyMarkers,
  type PolicyDocument,
} from "@/lib/policies"

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
 * A marker as the reader sees it: highlighted, and labelled in words so the
 * difference between "proposed" and "to fill" does not rest on colour alone.
 */
function Marker({
  kind,
  children,
}: {
  kind: "proposed" | "fill"
  children: React.ReactNode
}) {
  return kind === "proposed" ? (
    <mark className="rounded-sm bg-highlight/35 [box-decoration-break:clone] px-1 text-foreground">
      <span className="mr-1 text-[0.6875rem] font-semibold tracking-wide text-foreground/70 uppercase">
        Proposed
      </span>
      {children}
    </mark>
  ) : (
    <mark className="rounded-sm border border-dashed border-foreground/40 bg-transparent [box-decoration-break:clone] px-1 text-foreground">
      <span className="mr-1 text-[0.6875rem] font-semibold tracking-wide text-foreground/70 uppercase">
        ICT to fill
      </span>
      <span className="italic">{children}</span>
    </mark>
  )
}

const components: Components = {
  ...proseComponents,
  /* Marker links are policy-only: they render the highlighted spans above. */
  a: ({ href, children }) => {
    if (href === "#proposed" || href === "#fill")
      return (
        <Marker kind={href === "#proposed" ? "proposed" : "fill"}>
          {children}
        </Marker>
      )
    return (
      <a
        href={href}
        className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
      >
        {children}
      </a>
    )
  },
}

/** One renderer for every policy document. */
export function PolicyPage({ document: doc }: { document: PolicyDocument }) {
  const markers = policyMarkers(doc.body)
  const proposed = markers.filter((m) => m.kind === "proposed").length
  const toFill = markers.length - proposed

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
          <div className="enter mt-8" style={delay(90)}>
            <DraftNotice drafted={readableDate(doc.updated)}>
              This wording has not been signed off and is not a contract. For
              anything that matters, speak to ICT directly.
              {markers.length > 0
                ? ` ${proposed} proposed ${proposed === 1 ? "value needs" : "values need"} ICT to confirm, and ${toFill} ${toFill === 1 ? "detail is" : "details are"} left for ICT to fill in; both are highlighted below.`
                : null}
            </DraftNotice>
          </div>
        )}

        <div className="mt-14 max-w-160">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={components}
            skipHtml
          >
            {markersAsLinks(doc.body)}
          </Markdown>
        </div>
      </Section>
    </main>
  )
}
