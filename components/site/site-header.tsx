"use client"

import { IconPhone } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRef } from "react"

import { useDrawIn } from "@/hooks/use-draw-in"
import { useHeadroom } from "@/hooks/use-headroom"
import { AccountMenu } from "@/components/account/account-menu"
import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { Link } from "@/i18n/navigation"
import { brand, contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { SiteSearch } from "@/components/site/site-search"
import { HeaderCart } from "./header-cart"
import { SiteMenu } from "./site-menu"
import { SiteNav } from "./site-nav"

/**
 * Pulse's header, on every page. At the top: the name on the left, the
 * sections in a pill in the middle, search, language, account and phone on
 * the right; in white over a blue hero. Scrolled, on wide screens, it draws
 * in to one floating bar around the mark, the sections, search, account and
 * a call button (name, language and the number fold away); it stays; the promo strip above it folds away while you read down and comes
 * back when you scroll up. Its negative margin lets each hero start underneath it, so
 * nothing reflows. The states live in globals.css under "Site header".
 */
export function SiteHeader() {
  const t = useTranslations("Nav")
  const stuck = useHeadroom({
    keep: "[data-site-header],[data-promo-strip]",
  })
  const phone = formatPhone(contact.phones[0])
  const row = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  useDrawIn({ header, row, stuck })

  return (
    <>
      {/* data-stuck is set by useDrawIn, after it has measured. */}
      <header ref={header} data-site-header>
        <div data-site-header-row ref={row} className="container-page">
          <span aria-hidden data-site-bar-wrap>
            <span data-site-bar />
          </span>
          <Link
            href="/"
            aria-label={t("home", { name: brand.legalName })}
            data-flip
            className="relative flex flex-none items-center gap-3"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-white">
              <Image
                src={brand.mark}
                alt=""
                width={30}
                height={30}
                className="size-[30px]"
                priority
              />
            </span>
            <span
              data-fold
              data-brand-name
              className="font-display text-sm font-semibold"
            >
              {brand.legalName}
            </span>
          </Link>

          <SiteNav anchor={row} label={t("sections")} />

          <span data-flip className="flex">
            <SiteSearch />
          </span>
          <span data-flip className="flex">
            <HeaderCart />
          </span>

          {/* The account button slides on its own: the language switch
              opening up beside it must not shove it across the phone. */}
          <div data-site-tools className="relative">
            <span data-fold>
              <LocaleSwitch />
            </span>
            <span data-flip className="flex">
              <AccountMenu />
            </span>
          </div>

          {/*
            The number stays in the header on every width: for ICT's students a
            call is the most common next step. The name starts with the
            visible number (WCAG 2.5.3); "Call" is for screen readers.
          */}
          <a
            href={contactHref({ kind: "call" })}
            data-site-phone
            data-flip
            className="tnum relative inline-flex min-h-11 items-center gap-1.5 text-sm font-medium whitespace-nowrap"
          >
            <IconPhone
              aria-hidden
              size={16}
              stroke={1.75}
              className="hidden sm:block"
            />
            <span className="sr-only">
              {t("callPrefix")} {phone}
            </span>
            <span aria-hidden data-fold-lg>
              {phone}
            </span>
          </a>
          <span data-flip className="flex lg:hidden">
            <SiteMenu phone={phone} />
          </span>
        </div>
      </header>
    </>
  )
}
