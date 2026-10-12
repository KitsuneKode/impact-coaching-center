"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { AccountMenu } from "@/components/account/account-menu"
import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { Link, usePathname } from "@/i18n/navigation"
import { brand, contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { NAV_LINKS } from "./nav-links"
import { SiteMenu } from "./site-menu"

/**
 * Pulse's header, on every page. At the top it floats over the page, in white
 * over a blue hero; once a 1px sentinel scrolls away it turns into a frosted
 * paper bar. Its negative margin lets each hero start underneath it, so
 * nothing reflows. The states live in globals.css under "Site header".
 */
export function SiteHeader() {
  const t = useTranslations("Nav")
  const [stuck, setStuck] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const phone = formatPhone(contact.phones[0])
  const path = usePathname()

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) =>
      setStuck(!entry!.isIntersecting)
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px" />
      <header data-site-header data-stuck={stuck || undefined}>
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

          <div data-site-tools>
            <LocaleSwitch />
            <AccountMenu />
          </div>

          <a
            href={contactHref({ kind: "call" })}
            aria-label={t("call")}
            data-site-phone
            className="tnum text-sm font-medium whitespace-nowrap"
          >
            {phone}
          </a>
          <SiteMenu phone={phone} />
        </div>
      </header>
    </>
  )
}
