"use client"

import { IconPhone } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { useHeadroom } from "@/hooks/use-headroom"
import { AccountMenu } from "@/components/account/account-menu"
import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { Link, usePathname } from "@/i18n/navigation"
import { brand, contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { NAV_LINKS } from "./nav-links"
import { SiteSearch } from "@/components/site/site-search"
import { SiteMenu } from "./site-menu"

/**
 * Pulse's header, on every page. At the top it floats over the page, in white
 * over a blue hero. Scrolled, it shrinks into a floating paper bar that
 * stays; the promo strip above it folds away while you read down and comes
 * back when you scroll up. Its negative margin lets each hero start underneath it, so
 * nothing reflows. The states live in globals.css under "Site header".
 */
export function SiteHeader() {
  const t = useTranslations("Nav")
  const headroom = useHeadroom({
    keep: "[data-site-header],[data-promo-strip]",
  })
  const phone = formatPhone(contact.phones[0])
  const path = usePathname()

  return (
    <>
      <header data-site-header data-stuck={headroom !== "top" || undefined}>
        <div data-site-header-row className="container-page">
          <Link
            href="/"
            aria-label={t("home", { name: brand.legalName })}
            className="flex flex-none items-center gap-3"
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
            <span className="hidden font-display text-sm font-semibold xl:inline">
              {brand.legalName}
            </span>
          </Link>

          <nav aria-label={t("sections")} data-site-nav>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  path === link.href || path.startsWith(`${link.href}/`)
                    ? "page"
                    : undefined
                }
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <SiteSearch />

          <div data-site-tools>
            <LocaleSwitch />
            <AccountMenu />
          </div>

          {/*
            The number stays in the header on every width: for ICT's students a
            call is the most common next step. The name starts with the
            visible number (WCAG 2.5.3); "Call" is for screen readers.
          */}
          <a
            href={contactHref({ kind: "call" })}
            data-site-phone
            className="tnum inline-flex min-h-11 items-center gap-1.5 text-sm font-medium whitespace-nowrap"
          >
            <IconPhone
              aria-hidden
              size={16}
              stroke={1.75}
              className="hidden sm:block"
            />
            <span className="sr-only">{t("callPrefix")} </span>
            {phone}
          </a>
          <SiteMenu phone={phone} />
        </div>
      </header>
    </>
  )
}
