"use client"

import { IconCheck, IconShoppingBagPlus } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { useOpenCartIfShop } from "@/components/commerce/shop-shell"
import { track } from "@/lib/analytics"
import { useCartActions } from "@/lib/cart-store"
import { LANGUAGES, type Language, type PublicBundle } from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

/**
 * A set's price per language, each one a button that puts that set in the
 * cart from the list, without opening the set's page. A language that is
 * off shows as unavailable and does nothing.
 */
export function SetBuy({
  slug,
  title,
  variants,
}: {
  slug: string
  title: string
  variants: PublicBundle["variants"]
}) {
  const t = useTranslations("Shop")
  const { add } = useCartActions()
  const openCart = useOpenCartIfShop()
  const router = useRouter()
  const [added, setAdded] = useState<Language | null>(null)

  const buy = (language: Language) => {
    track({ name: "add_to_cart", slug })
    add({ slug, language })
    setAdded(language)
    window.setTimeout(() => setAdded(null), 1400)
    toast.success(t("addedToast", { title }), {
      action: {
        label: t("viewCart"),
        // In the shop the cart opens in place; elsewhere checkout shows it.
        onClick: openCart ?? (() => router.push("/checkout")),
      },
    })
  }

  return (
    <span className="relative z-10 flex flex-wrap gap-2">
      {LANGUAGES.map((language) => {
        const variant = variants[language]
        const name = language === "as" ? t("assameseSet") : t("englishSet")
        if (!variant.available)
          return (
            <span
              key={language}
              data-set-price
              data-off=""
              className="tnum inline-flex flex-col rounded-2xl ps-4 pe-4 pbs-2 pbe-2"
            >
              <span className="text-xs text-muted-foreground">{name}</span>
              <span className="pbs-1 text-sm font-medium">
                {t("notAvailable")}
              </span>
            </span>
          )
        const done = added === language
        return (
          <button
            key={language}
            type="button"
            data-set-price
            data-press
            data-added={done || undefined}
            onClick={() => buy(language)}
            aria-label={t("addSetAria", { set: name, title })}
            className="tnum inline-flex items-center gap-3 rounded-2xl ps-4 pe-3 pbs-2 pbe-2 text-start"
          >
            <span className="flex flex-col">
              <span className="text-xs text-muted-foreground">{name}</span>
              <span className="font-display text-lg font-semibold">
                {formatPaise(variant.pricePaise)}
              </span>
            </span>
            <span
              aria-hidden
              data-set-add
              className="grid size-9 place-items-center rounded-full"
            >
              {done ? (
                <IconCheck size={17} stroke={2.25} />
              ) : (
                <IconShoppingBagPlus size={17} stroke={1.75} />
              )}
            </span>
          </button>
        )
      })}
    </span>
  )
}
