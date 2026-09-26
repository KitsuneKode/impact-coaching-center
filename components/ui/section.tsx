import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Vertical rhythm for the whole page, set once. Sections never pick their own
 * padding.
 */
const pad = {
  sm: "py-16 md:py-20",
  md: "py-16 md:py-24",
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

/** The two-tone lede, kobbe's signature and ours. */
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
  const type = { md: "type-lede", lg: "type-display", xl: "type-display" }[size]

  return (
    <div
      className={cn(
        "max-w-[44rem]",
        size !== "md" && "max-w-[56rem]",
        className
      )}
    >
      {label ? <p className="type-label mb-4">{label}</p> : null}
      <Heading className={type}>
        <span className="text-foreground">{claim}</span>
        {rest ? <span className="text-muted-foreground"> {rest}</span> : null}
        {link ? (
          <>
            {" "}
            <a
              href={link.href}
              className="link font-medium whitespace-nowrap"
              {...(link.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
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
