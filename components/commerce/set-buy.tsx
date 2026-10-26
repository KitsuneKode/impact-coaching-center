"use client"

import {
  IconBrandWhatsapp,
  IconCheck,
  IconShoppingBagPlus,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { useShopMode } from "@/components/commerce/order-on-whatsapp"
import { useOpenCartIfShop } from "@/components/commerce/shop-shell"
import { track } from "@/lib/analytics"
import { contactHref } from "@/lib/contact"
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
  sample = false,
}: {
  slug: string
  title: string
  variants: PublicBundle["variants"]
  /** A placeholder set: prices show, nothing goes in the cart. */
  sample?: boolean
}) {
  const t = useTranslations("Shop")
  const { add } = useCartActions()
  const openCart = useOpenCartIfShop()
  const router = useRouter()
  const [added, setAdded] = useState<Language | null>(null)
  const whatsapp = useShopMode() === "whatsapp"

  const buy = (language: Language) => {
    // At the cap nothing goes in; the cart has already said why.
    if (!add({ slug, language })) return
    track({ name: "add_to_cart", slug })
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
    <span className="relative z-10 grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
      {LANGUAGES.map((language) => {
        const variant = variants[language]
        const name = language === "as" ? t("assameseSet") : t("englishSet")
        if (sample && variant.available)
          return (
            <span
              key={language}
              data-set-price
              data-off=""
              title={t("sampleNotOnSale")}
              className="tnum inline-flex min-w-0 flex-col rounded-2xl ps-4 pe-4 pbs-2 pbe-2"
            >
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {name}
              </span>
              <span className="font-display text-lg font-semibold">
                {formatPaise(variant.pricePaise)}
              </span>
            </span>
          )
        if (!variant.available)
          return (
            <span
              key={language}
              data-set-price
              data-off=""
              className="tnum inline-flex min-w-0 flex-col rounded-2xl ps-4 pe-4 pbs-2 pbe-2"
            >
              <span className="text-xs text-muted-foreground">{name}</span>
              <span className="pbs-1 text-sm font-medium">
                {t("notAvailable")}
              </span>
            </span>
          )
        const done = added === language
        // Payments off: the same price, ordered on WhatsApp.
        if (whatsapp)
          return (
            <a
              key={language}
              href={contactHref({
                kind: "books",
                sets: [t("setOf", { set: title, language: name }) + " × 1"],
              })}
              target="_blank"
              rel="noreferrer noopener"
              data-set-price
              data-press
              aria-label={`${t("orderOnWhatsApp")}: ${name}, ${title}`}
              className="tnum inline-flex min-w-0 items-center justify-between gap-2 rounded-2xl ps-3.5 pe-2.5 pbs-2 pbe-2 text-start sm:gap-3 sm:ps-4 sm:pe-3"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  {name}
                </span>
                <span className="font-display text-lg font-semibold">
                  {formatPaise(variant.pricePaise)}
                </span>
              </span>
              <span
                aria-hidden
                data-set-add
                className="grid size-8 flex-none place-items-center rounded-full sm:size-9"
              >
                <IconBrandWhatsapp size={17} stroke={1.75} />
              </span>
            </a>
          )
        return (
          <button
            key={language}
            type="button"
            data-set-price
            data-press
            data-added={done || undefined}
            onClick={() => buy(language)}
            aria-label={t("addSetAria", { set: name, title })}
            className="tnum inline-flex min-w-0 items-center justify-between gap-2 rounded-2xl ps-3.5 pe-2.5 pbs-2 pbe-2 text-start sm:gap-3 sm:ps-4 sm:pe-3"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {name}
              </span>
              <span className="font-display text-lg font-semibold">
                {formatPaise(variant.pricePaise)}
              </span>
            </span>
            <span
              aria-hidden
              data-set-add
              className="grid size-8 flex-none place-items-center rounded-full sm:size-9"
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
