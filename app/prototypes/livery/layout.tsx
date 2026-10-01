import { IconArrowRight, IconPhone } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
} from "@tabler/icons-react"

import { bookCss } from "../_book"
import {
  enquiryCss,
  examGuideCss,
  folderBrowserCss,
  mobileMenuCss,
  promoCss,
} from "../_block-css"
import { contact, links, offer, phone, place, tel, whatsapp } from "../_data"
import { folderCss } from "../_folder"
import { barCampaign, campaign } from "../_campaign"
import { SitePromoLayer } from "../_kit/site-layer"
import { MobileMenu } from "../_mobile-menu"
import { PrototypeSwitcher } from "../_switcher"
import {
  base,
  container,
  css,
  display,
  external,
  navLinks,
  sans,
  tokens,
} from "./_shared"

export const metadata: Metadata = {
  title: { default: "Livery", template: "%s, Livery" },
}

export default function LiveryLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-lv
      style={tokens}
      className={`${display.variable} ${sans.variable} min-h-[100dvh]`}
    >
      <style>
        {css +
          bookCss +
          folderCss +
          examGuideCss +
          enquiryCss +
          mobileMenuCss +
          folderBrowserCss +
          promoCss}
      </style>
      <div aria-hidden data-lv-progress />

      <SitePromoLayer
        base={base}
        bar={barCampaign(base)}
        campaign={campaign}
        parts={{ bar: true, modal: true, reel: true }}
      />

      <header className="sticky top-0 z-40 bg-[var(--lv-sky)]">
        <div className={`${container} flex h-[68px] items-center gap-6`}>
          <Link href={base} className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-white">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
            </span>
            <span data-lv-display className="hidden text-lg sm:inline">
              Impact Career Tutorials
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="ml-auto hidden items-center gap-0.5 text-sm font-semibold md:flex"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-[var(--lv-navy)] hover:text-white lg:px-4"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href={tel}
            data-lv-press
            data-lv-btn-line
            className="ml-auto hidden h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold whitespace-nowrap tabular-nums sm:inline-flex md:ml-0"
          >
            <IconPhone aria-hidden size={16} stroke={2} />
            {phone}
          </a>
          <div className="ml-auto sm:ml-0">
            <MobileMenu
              links={[...navLinks, { href: `${base}/assist`, label: "ASSIST" }]}
            />
          </div>
        </div>
      </header>

      {children}

      <footer className="pt-10 pb-28 text-sm text-[var(--lv-muted)]">
        <div
          className={`${container} flex flex-wrap items-center gap-x-8 gap-y-3`}
        >
          <address className="not-italic">
            {place.street}, {place.city}, {place.region} {place.pin}
          </address>
          {contact.phones.map((p) => (
            <a
              key={p}
              href={`tel:${p}`}
              className="tabular-nums hover:text-[var(--lv-ink)]"
            >
              {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
            </a>
          ))}
          <a
            href={`mailto:${contact.email}`}
            className="hover:text-[var(--lv-ink)]"
          >
            {contact.email}
          </a>
          <div className="flex gap-1 md:ml-auto">
            {[
              { href: links.youtube, label: "YouTube", Icon: IconBrandYoutube },
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
                data-lv-press
                className="grid size-11 place-items-center rounded-lg transition-colors hover:bg-[var(--lv-navy)] hover:text-white"
              >
                <Icon aria-hidden size={19} stroke={1.75} />
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
                className="inline-flex min-h-11 items-center hover:text-[var(--lv-ink)]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="w-full">Prototype for review. Not the live site.</p>
        </div>
      </footer>

      <a
        href={whatsapp}
        {...external}
        data-lv-press
        data-lv-btn
        className="fixed bottom-[76px] left-4 z-40 inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-bold shadow-2xl md:hidden"
      >
        {offer.short}
        <IconArrowRight aria-hidden size={16} stroke={2.25} />
      </a>

      <PrototypeSwitcher current="livery" />
    </div>
  )
}
