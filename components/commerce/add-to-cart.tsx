"use client"

import { useTranslations } from "next-intl"

import { IconCheck, IconShoppingBag } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { useCartActions } from "@/lib/cart-store"
import type { Language } from "@/lib/catalog"
import { cn } from "@/lib/utils"

/**
 * Adds one copy and confirms twice: the label briefly reads "Added" where the
 * eye already is, and a toast offers the cart without taking the page away.
 */
export function AddToCart({
  slug,
  language,
  title,
  disabled,
  onOpenCart,
  className,
  size = "md",
}: {
  slug: string
  language: Language
  title: string
  disabled?: boolean
  onOpenCart?: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const t = useTranslations("Shop")
  const { add } = useCartActions()
  const [added, setAdded] = useState(false)

  return (
    <Button
      size={size}
      className={cn("min-w-36", className)}
      disabled={disabled}
      onClick={() => {
        track({ name: "add_to_cart", slug })
        add({ slug, language })
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1400)
        toast.success(t("addedToast", { title }), {
          action: onOpenCart
            ? { label: t("viewCart"), onClick: onOpenCart }
            : undefined,
        })
      }}
    >
      {/* keyed, so each state enters with the swap animation in app/pulse.css */}
      <span key={added ? "added" : "add"} data-swap="each" className="contents">
        {added ? (
          <>
            <IconCheck stroke={2} aria-hidden />
            <span>{t("added")}</span>
          </>
        ) : (
          <>
            <IconShoppingBag stroke={1.75} aria-hidden />
            <span>{t("addToCart")}</span>
          </>
        )}
      </span>
    </Button>
  )
}
