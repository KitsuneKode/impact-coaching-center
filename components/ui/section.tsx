import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Vertical rhythm for the whole page, set once. Sections never pick their own
 * padding.
 */
const pad = {
  sm: "py-16 md:py-20",
  md: "py-20 md:py-28",
  lg: "py-24 md:py-36",
} as const

function Section({
  className,
  size = "md",
  bleed = false,
  children,
  ...props
}: ComponentProps<"section"> & { size?: keyof typeof pad; bleed?: boolean }) {
  return (
    <section className={cn(pad[size], className)} {...props}>
      {bleed ? children : <div className="container-page">{children}</div>}
    </section>
  )
}

/**
 * The two-tone lede, kobbe's signature and ours.
 *
 * A quiet sentence-case label, then one paragraph: the first sentence is the
 * claim in ink, the rest is the explanation in grey, and an optional link at
 * the end goes to the proof. It replaces the shouting H2 so the page stays calm
 * and every section still reads in one breath.
 */
function Lede({
  label,
  claim,
  rest,
  link,
  as: Heading = "h2",
  size = "md",
  className,
}: {
  label?: string
  claim: ReactNode
  rest?: ReactNode
  link?: { href: string; label: string; external?: boolean }
  as?: "h1" | "h2" | "h3"
  size?: "md" | "lg" | "xl"
  className?: string
}) {
  const type = {
    md: "text-[1.1875rem] leading-[1.42] md:text-[1.3125rem]",
    lg: "text-[1.5rem] leading-[1.3] md:text-[1.875rem] md:leading-[1.28]",
    xl: "text-[1.875rem] leading-[1.2] md:text-[2.5rem] md:leading-[1.18]",
  }[size]

  return (
    <div className={cn("max-w-[42rem]", size === "xl" && "max-w-[54rem]", className)}>
      {label ? <p className="mb-3 text-sm text-muted-foreground">{label}</p> : null}
      <Heading className={cn("font-medium tracking-[-0.018em] text-balance", type)}>
        <span className="text-foreground">{claim}</span>
        {rest ? <span className="text-muted-foreground"> {rest}</span> : null}
        {link ? (
          <>
            {" "}
            <a
              href={link.href}
              className="link font-medium whitespace-nowrap"
              {...(link.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            >
              {link.label}
            </a>
          </>
        ) : null}
      </Heading>
    </div>
  )
}

export { Section, Lede }
