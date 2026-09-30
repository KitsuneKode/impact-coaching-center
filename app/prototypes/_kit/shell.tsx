import {
  IconArrowRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconPhone,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

import { bookCss } from "../_book"
import {
  enquiryCss,
  examGuideCss,
  finderCss,
  folderBrowserCss,
  grandFooterCss,
  mobileMenuCss,
  promoCss,
  routeMapCss,
} from "../_block-css"
import { contact, links, offer, phone, place, tel, whatsapp } from "../_data"
import { folderCss } from "../_folder"
import { MobileMenu } from "../_mobile-menu"
import { PrototypeSwitcher, type PrototypeSlug } from "../_switcher"
import { kitCss } from "./css"
import { container, external } from "./shared"

/**
 * The frame every kit theme wears: header, footer, floating call to action,
 * prototype switcher and the shared block styles. A theme passes its tokens,
 * its font classes and its own css, and gets courses, exams, books, notes,
 * results, contact and the promotions kit for free.
 */
export function KitShell({
  slug,
  theme,
  base,
  tokens,
  fontClass,
  themeCss,
  brand,
  children,
  decoration,
  headerExtra,
  footer,
}: {
  slug: PrototypeSlug
  theme: string
  base: string
  tokens: CSSProperties
  fontClass: string
  themeCss: string
  brand: string
  children: ReactNode
  decoration?: ReactNode
  headerExtra?: ReactNode
  /** replaces the plain footer */
  footer?: ReactNode
}) {
  const navLinks = [
    { href: `${base}/courses`, label: "Courses" },
    { href: `${base}/exams`, label: "Exams" },
    { href: `${base}/books`, label: "Books" },
    { href: `${base}/notes`, label: "Free notes" },
    { href: `${base}/results`, label: "Results" },
    { href: `${base}/contact`, label: "Contact" },
  ]
  return (
    <div
      data-kit
      data-theme={theme}
      style={tokens}
      className={`${fontClass} min-h-[100dvh] antialiased`}
    >
      <style>
        {kitCss +
          bookCss +
          folderCss +
          examGuideCss +
          enquiryCss +
          mobileMenuCss +
          folderBrowserCss +
          promoCss +
          finderCss +
          routeMapCss +
          grandFooterCss +
          themeCss}
      </style>
      {decoration}

      <header data-k-nav data-k-header className="sticky top-0 z-40">
        <div className={`${container} flex h-[68px] items-center gap-6`}>
          <Link href={base} className="flex items-center gap-3">
            <span
              data-k-logo
              className="grid size-10 place-items-center bg-white"
            >
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
            </span>
            <span data-k-brand className="hidden sm:inline">
              {brand}
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="ml-auto hidden items-center gap-0.5 text-sm md:flex"
          >
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} data-k-navlink>
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href={tel}
            data-k-press
            data-k-outline
            className="ml-auto hidden h-11 items-center gap-2 px-4 text-sm font-semibold whitespace-nowrap tabular-nums sm:inline-flex md:ml-0"
          >
            <IconPhone aria-hidden size={16} stroke={1.75} />
            {phone}
          </a>
          {headerExtra ? (
            <div className="ml-auto sm:ml-0">{headerExtra}</div>
          ) : null}
          <div className={headerExtra ? "" : "ml-auto sm:ml-0"}>
            <MobileMenu links={navLinks} />
          </div>
        </div>
        <span aria-hidden data-k-progress />
      </header>

      {children}

      {footer ?? (
        <footer className="pt-6 pb-28 text-sm text-[var(--k-muted)]">
          <div
            className={`${container} flex flex-wrap items-center gap-x-8 gap-y-3`}
          >
            <address className="not-italic">
              {place.street}, {place.city}, {place.region} {place.pin}
            </address>
            {contact.phones.map((p) => (
              <a key={p} href={`tel:${p}`} data-k-link className="tabular-nums">
                {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
              </a>
            ))}
            <a href={`mailto:${contact.email}`} data-k-link>
              {contact.email}
            </a>
            <div className="flex gap-1 md:ml-auto">
              {[
                {
                  href: links.youtube,
                  label: "YouTube",
                  Icon: IconBrandYoutube,
                },
                {
                  href: links.instagram,
                  label: "Instagram",
                  Icon: IconBrandInstagram,
                },
                {
                  href: links.facebook,
                  label: "Facebook",
                  Icon: IconBrandFacebook,
                },
                {
                  href: links.play,
                  label: "Google Play",
                  Icon: IconBrandGooglePlay,
                },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  {...external}
                  aria-label={label}
                  data-k-press
                  data-k-ghost
                  className="grid size-11 place-items-center"
                >
                  <Icon aria-hidden size={19} stroke={1.5} />
                </a>
              ))}
            </div>
            <nav
              aria-label="Policies"
              className="flex w-full flex-wrap gap-x-6 gap-y-1"
            >
              {[
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
                ["/refunds", "Refunds"],
                ["/shipping", "Shipping"],
                ["/contact", "Contact"],
                [`${base}/promos`, "Promotions kit"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href!}
                  data-k-link
                  className="inline-flex min-h-11 items-center"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <p className="w-full">Prototype for review. Not the live site.</p>
          </div>
        </footer>
      )}

      <a
        href={whatsapp}
        {...external}
        data-k-press
        data-k-btn
        className="fixed bottom-[76px] left-4 z-40 inline-flex h-12 items-center gap-2 px-5 text-sm shadow-2xl md:hidden"
      >
        {offer.short}
        <IconArrowRight aria-hidden size={16} stroke={2} />
      </a>

      <PrototypeSwitcher current={slug} />
    </div>
  )
}
