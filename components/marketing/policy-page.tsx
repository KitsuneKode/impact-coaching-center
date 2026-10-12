import { useLocale, useTranslations } from "next-intl"
import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { proseComponents } from "@/components/marketing/markdown-body"
import { DraftNotice } from "@/components/ui/draft-notice"
import {
  markersAsLinks,
  policyMarkers,
  type PolicyDocument,
} from "@/lib/policies"

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
  const locale = useLocale()
  const t = useTranslations("Policy")

  return (
    // The document itself is English; only the notice above it is not.
    <main
      lang="en-IN"
      className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)] md:pbe-28"
    >
      <div className="mx-auto max-w-[46rem]">
        {locale === "en" ? null : (
          <p
            lang="as-IN"
            className="mbe-6 inline-flex rounded-full bg-secondary ps-4 pe-4 pbs-2 pbe-2 text-sm"
          >
            {t("englishOnly")}
          </p>
        )}
        <h1
          data-rise
          className="font-display text-[clamp(2rem,1.4rem+2.8vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance"
        >
          {doc.title}
        </h1>
        <p className="mbs-4 border-s-4 border-primary ps-5 text-xl text-pretty text-muted-foreground">
          {doc.description}
        </p>

        {doc.approved ? (
          <p className="mbs-6 text-sm text-muted-foreground">
            Last updated {readableDate(doc.updated)}.
          </p>
        ) : (
          <div className="mbs-8">
            <DraftNotice drafted={readableDate(doc.updated)}>
              This wording has not been signed off and is not a contract. For
              anything that matters, speak to ICT directly.
              {markers.length > 0
                ? ` ${proposed} proposed ${proposed === 1 ? "value needs" : "values need"} ICT to confirm, and ${toFill} ${toFill === 1 ? "detail is" : "details are"} left for ICT to fill in; both are highlighted below.`
                : null}
            </DraftNotice>
          </div>
        )}

        <div className="mbs-12">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={components}
            skipHtml
          >
            {markersAsLinks(doc.body)}
          </Markdown>
        </div>
      </div>
    </main>
  )
}
