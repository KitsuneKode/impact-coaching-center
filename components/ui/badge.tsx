import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * Small labels. `verified` is the only place green appears, reserved for a
 * result that can be checked in the official APSC PDF. Using it decoratively
 * would empty it of meaning.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "border-border bg-card text-muted-foreground",
        solid: "border-transparent bg-secondary text-foreground",
        verified: "border-verified/25 bg-verified/8 text-verified",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
