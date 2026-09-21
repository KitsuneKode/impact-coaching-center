import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * One CTA definition for the whole site.
 *
 * `primary` is ink on near-white (about 15:1), the way kobbe.io does it: the
 * darkest thing on a calm page is the thing to press. `secondary` is a quiet
 * surface for the second action. Every control uses --radius-control.
 *
 * Arrow icons marked `data-nudge` slide a little on hover, a small cue that the
 * button goes somewhere.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-control",
    "font-medium whitespace-nowrap select-none",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg[data-nudge]]:transition-transform [&_svg[data-nudge]]:duration-200 hover:[&_svg[data-nudge]]:translate-x-0.5",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-frame hover:bg-primary/88",
        secondary:
          "border border-border bg-card text-foreground shadow-frame hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        link: "px-0 text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground",
      },
      size: {
        sm: "h-9 px-3.5 text-sm [&_svg]:size-4",
        md: "h-11 px-4.5 text-[0.9375rem] [&_svg]:size-[18px]",
        lg: "h-12 px-5.5 text-[0.9375rem] [&_svg]:size-[18px]",
        icon: "size-10 [&_svg]:size-5",
        /* Added for registry components that ask for it (sidebar, sheet).
           Additive - no existing call site changes size. */
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

/** In-page and internal navigation. */
function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return (
    <Link
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

/** External destinations: wa.me, tel:, Play Store, YouTube, the APSC PDF. */
function ButtonAnchor({
  className,
  variant,
  size,
  target,
  rel,
  ...props
}: ComponentProps<"a"> & ButtonVariants) {
  return (
    <a
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      target={target}
      rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
      {...props}
    />
  )
}

export { Button, ButtonLink, ButtonAnchor, buttonVariants }
