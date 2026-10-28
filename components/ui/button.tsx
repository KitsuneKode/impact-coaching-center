import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** One CTA definition for the whole site. */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full",
    "font-medium whitespace-nowrap select-none",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg[data-nudge]]:transition-transform [&_svg[data-nudge]]:duration-200 hover:[&_svg[data-nudge]]:translate-x-0.5",
  ],
  {
    variants: {
      variant: {
        /* Primary and secondary are raised: their surface is a layer under
           the label (app/globals.css, "Raised buttons"), so a press sinks
           the plate while the words stay sharp. */
        primary: "text-primary-foreground",
        secondary: "text-foreground",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        link: "px-0 text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-[0.9375rem] font-semibold [&_svg]:size-[18px]",
        lg: "h-12 px-6 text-base font-semibold [&_svg]:size-[18px]",
        /* The visible square stays compact; the invisible ::after pad is
           what carries the 44px touch target. */
        icon: "size-10 after:absolute after:-inset-0.5 [&_svg]:size-5",
        /* Added for registry components that ask for it (sidebar, sheet).
           Additive - no existing call site changes size. */
        "icon-sm": "size-8 after:absolute after:-inset-1.5 [&_svg]:size-4",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants> & {
  /** A plain surface with no raise, for controls that sit like a field. */
  flat?: boolean
}

/** The raised material for primary and secondary; none for the rest. */
function raise(variant: ButtonVariants["variant"], flat?: boolean) {
  if (flat)
    return variant === "secondary"
      ? "flat-secondary"
      : !variant || variant === "primary"
        ? "flat-primary"
        : undefined
  if (!variant || variant === "primary") return "primary"
  if (variant === "secondary") return "secondary"
  return undefined
}

function Button({
  className,
  variant,
  size,
  flat,
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return (
    <button
      data-slot="button"
      data-raise={raise(variant, flat)}
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
  flat,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return (
    <Link
      data-slot="button"
      data-raise={raise(variant, flat)}
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
  flat,
  target,
  rel,
  ...props
}: ComponentProps<"a"> & ButtonVariants) {
  return (
    <a
      data-slot="button"
      data-raise={raise(variant, flat)}
      className={cn(buttonVariants({ variant, size }), className)}
      target={target}
      rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
      {...props}
    />
  )
}

export { Button, ButtonLink, ButtonAnchor, buttonVariants }
