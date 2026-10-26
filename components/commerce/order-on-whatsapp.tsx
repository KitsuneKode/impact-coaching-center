"use client"

import { IconBrandWhatsapp } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useTranslations } from "next-intl"

import { api } from "@/convex/_generated/api"
import { ButtonAnchor } from "@/components/ui/button"
import { contactHref } from "@/lib/contact"
import { cn } from "@/lib/utils"

/**
 * "online" until the server says otherwise: the buttons keep their shape
 * either way, so a late answer swaps a label rather than moving the page.
 */
export function useShopMode() {
  return useQuery(api.payments.shopMode) ?? "online"
}

/** While payments are off: the same order, started on WhatsApp instead. */
export function OrderOnWhatsApp({
  sets,
  className,
  size = "md",
}: {
  /** e.g. "APSC Foundation Set (English set) × 1" */
  sets: string[]
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const t = useTranslations("Shop")
  return (
    <ButtonAnchor
      size={size}
      href={contactHref({ kind: "books", sets })}
      target="_blank"
      className={cn("min-w-36", className)}
    >
      <IconBrandWhatsapp aria-hidden stroke={1.75} />
      <span>{t("orderOnWhatsApp")}</span>
    </ButtonAnchor>
  )
}
