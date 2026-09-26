import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** Surfaces. Every one is 16px (--radius-card). */
const cardVariants = cva(
  "rounded-card transition-[transform,box-shadow,border-color] duration-300 ease-out",
  {
    variants: {
      variant: {
        frame: "border border-border bg-card shadow-frame",
        panel: "bg-surface",
        outline: "border border-border",
      },
      interactive: {
        true: "hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5",
        false: "",
      },
    },
    defaultVariants: { variant: "frame", interactive: false },
  }
)

function Card({
  className,
  variant,
  interactive,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  )
}

export { Card, cardVariants }
