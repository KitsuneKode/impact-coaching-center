import {
  IconArrowRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconFileText,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import { Mona_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

import { bookCss, type BookTones } from "../_book"
import { folderCss, type FolderTones } from "../_folder"
import { contact, links, offer, phone, place, tel, whatsapp } from "../_data"
import { Magnetic } from "../_fx"
import { HomeMenu, HomePromos } from "../_kit/home-extras"
import { PrototypeSwitcher } from "../_switcher"
import { tokens as siteTokens } from "./_site"

/**
 * Prototype 5: Lamp. A dark study room lit by one warm lamp.
 * Colour: committed dark. Cool ink ground, amber (the logo's nib) is the only
 * light source: the lamp, the primary CTA, spotlight borders, serials.
 */

export const sans = Mona_Sans({
  axes: ["wdth"],
  subsets: ["latin"],
  variable: "--lp-sans",
})

export const tokens = {
  "--lp-bg": "#07090E",
  "--lp-card": "#0D1118",
  "--lp-line": "rgba(226,232,242,0.08)",
  "--lp-line-hi": "rgba(226,232,242,0.16)",
  "--lp-text": "#ECEFF4",
  "--lp-muted": "#98A1B1",
  "--lp-amber": "#F5B544",
  "--lp-amber-hi": "#FFC761",
  "--lp-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
} as CSSProperties

export const css = `
[data-lp] { interpolate-size: allow-keywords; }
[data-lp] ::selection { background: var(--lp-amber); color: var(--lp-bg); }
[data-lp] :focus-visible { outline: 2px solid var(--lp-amber); outline-offset: 3px; }
[data-lp] a { text-underline-offset: 0.22em; }
[data-lp] .[font-stretch:112%] tracking-[-0.03em] { font-stretch: 112%; letter-spacing: -0.03em; }

@keyframes lp-open { from { transform: scaleX(0.35); opacity: 0.4; } to { transform: none; opacity: 1; } }
@keyframes lp-rise { from { opacity: 0; transform: translateY(14px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
[data-lamp] { position: absolute; inset-inline: 0; top: 0; height: 34rem; pointer-events: none; overflow: hidden; }
[data-lamp-cone] { position: absolute; left: 50%; top: 7.5rem; width: 64rem; height: 26rem; margin-left: -32rem;
  background: conic-gradient(from 118deg at 50% -3rem, rgba(245,181,68,0.55) 0deg, rgba(245,181,68,0.1) 28deg, transparent 50deg, transparent 74deg, rgba(245,181,68,0.1) 96deg, rgba(245,181,68,0.55) 124deg, transparent 124deg);
  -webkit-mask-image: radial-gradient(60% 100% at 50% 0%, #000 30%, transparent 100%); mask-image: radial-gradient(60% 100% at 50% 0%, #000 30%, transparent 100%);
  transform-origin: 50% 0; animation: lp-open 1.2s var(--lp-ease) 0.1s both; }
[data-lamp-glow] { position: absolute; left: 50%; top: 5.5rem; width: 30rem; height: 8rem; margin-left: -15rem; border-radius: 50%;
  background: var(--lp-amber); opacity: 0.22; filter: blur(56px); transform-origin: 50% 50%; animation: lp-open 1.2s var(--lp-ease) 0.1s both; }
[data-lamp-bar] { position: absolute; left: 50%; top: 7.5rem; width: 26rem; height: 2px; margin-left: -13rem; border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--lp-amber-hi) 20%, var(--lp-amber-hi) 80%, transparent);
  box-shadow: 0 0 24px 2px rgba(245,181,68,0.55); animation: lp-open 1.2s var(--lp-ease) 0.1s both; }
[data-lp-dots] { position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(226,232,242,0.07) 1px, transparent 1px); background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(70% 60% at 50% 30%, #000, transparent 80%); mask-image: radial-gradient(70% 60% at 50% 30%, #000, transparent 80%); }
[data-lamp="end"] [data-lamp-cone] { height: 17rem; opacity: 0.75; }
[data-lamp-on] { position: absolute; inset: 0; }
@keyframes lp-flicker { 0% { opacity: 0; } 6% { opacity: 0.75; } 10% { opacity: 0.08; } 17% { opacity: 0.9; } 21% { opacity: 0.35; } 34%, 100% { opacity: 1; } }
[data-lamp="hero"] [data-lamp-on] { animation: lp-flicker 1.3s linear 0.15s both; }
@keyframes lp-dim { to { opacity: 0.3; } }
@keyframes lp-warm { from { opacity: 0.08; transform: scaleX(0.55); } to { opacity: 1; transform: none; } }
@supports (animation-timeline: view()) {
  [data-lamp="hero"] { animation: lp-dim linear both; animation-timeline: scroll(root); animation-range: 0 70vh; }
  [data-lamp="end"] [data-lamp-on] { transform-origin: 50% 7.5rem; animation: lp-warm linear both; animation-timeline: view(); animation-range: entry 10% cover 40%; }
  [data-lamp="end"] [data-lamp-cone], [data-lamp="end"] [data-lamp-glow], [data-lamp="end"] [data-lamp-bar] { animation: none; }
}
[data-lp] [data-rise] { animation: lp-rise 0.9s var(--lp-ease) both; }

[data-lp] [data-press] { transition: transform 0.16s var(--lp-ease), background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease; }
[data-lp] [data-press]:active { transform: scale(0.97); }
[data-lp] [data-primary] { box-shadow: 0 0 0 1px rgba(255,214,140,0.5) inset, 0 8px 30px -8px rgba(245,181,68,0.6); }
@media (hover: hover) {
  [data-lp] [data-primary]:hover { background-color: var(--lp-amber-hi); box-shadow: 0 0 0 1px rgba(255,214,140,0.7) inset, 0 10px 40px -6px rgba(245,181,68,0.75); }
  [data-lp] [data-ghost]:hover { background-color: rgba(226,232,242,0.06); }
  [data-lp] [data-quiet]:hover { color: var(--lp-text); }
}
[data-lp] [data-quiet] { transition: color 0.15s ease; }

[data-spot] { position: relative; isolation: isolate; }
[data-spot]::before, [data-spot]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
[data-spot]::before { z-index: 3; padding: 1px;
  background: radial-gradient(360px circle at var(--sx, 50%) var(--sy, 50%), rgba(245,181,68,0.7), transparent 45%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
[data-spot]::after { z-index: 0; background: radial-gradient(520px circle at var(--sx, 50%) var(--sy, 50%), rgba(245,181,68,0.06), transparent 45%); }
[data-lp-bento]:hover [data-spot]::before, [data-lp-bento]:hover [data-spot]::after { opacity: 1; }

[data-lp-face] img { filter: grayscale(1) brightness(0.85) contrast(1.05); transition: filter 0.4s var(--lp-ease), transform 0.5s var(--lp-ease); }
[data-lp-face] { transition: opacity 0.3s ease, filter 0.3s ease; }
@media (hover: hover) {
  [data-lp-faces]:has([data-lp-face]:hover) [data-lp-face]:not(:hover) { opacity: 0.4; filter: blur(2px); }
  [data-lp-face]:hover img { filter: none; transform: scale(1.03); }
}
@media (hover: none) { [data-lp-face] img { filter: none; } }

@keyframes lp-marquee { to { transform: translateX(-50%); } }
[data-lp-marquee] { -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
[data-lp-track] { animation: lp-marquee 80s linear infinite; }
[data-lp-marquee]:hover [data-lp-track], [data-lp-marquee]:focus-within [data-lp-track] { animation-play-state: paused; }
[data-lp-thumb] { transition: transform 0.3s var(--lp-ease), box-shadow 0.3s ease; }
[data-lp-thumb-link]:hover [data-lp-thumb] { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--lp-line-hi), 0 20px 40px -20px rgba(245,181,68,0.35); }

@property --lp-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes lp-spin { to { --lp-angle: 360deg; } }
[data-lp-beam] { position: relative; }
[data-lp-beam]::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  background: conic-gradient(from var(--lp-angle), transparent 0 72%, rgba(245,181,68,0.9) 88%, transparent 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
  animation: lp-spin 7s linear infinite; }

[data-lp] details::details-content { block-size: 0; overflow: hidden; transition: block-size 0.3s var(--lp-ease), content-visibility 0.3s allow-discrete; }
[data-lp] details[open]::details-content { block-size: auto; }
[data-lp] summary::-webkit-details-marker { display: none; }
[data-lp] details [data-plus] { transition: transform 0.25s var(--lp-ease); }
[data-lp] details[open] [data-plus] { transform: rotate(45deg); }

@media (prefers-reduced-motion: reduce) {
  [data-lp-track], [data-lp-beam]::before, [data-lamp], [data-lamp-on] { animation: none !important; }
  [data-lp-marquee] { overflow-x: auto; }
}
`

export const bookTones: BookTones = {
  primary: { bg: "#F5B544", ink: "#1A1206", spine: "#C98E27" },
  highlight: { bg: "#E9ECF2", ink: "#0B0F16", spine: "#BCC2CD" },
  muted: { bg: "#1B2230", ink: "#ECEFF4", spine: "#111722" },
}

/** Manila folders under the lamp. */
export const folderTones: FolderTones = {
  back: "#B9832A",
  front: "#F5B544",
  paper: "#F4F1EA",
  ink: "#1A1206",
  muted: "#5C4414",
}

export const external = {
  target: "_blank",
  rel: "noreferrer noopener",
} as const
export const container = "mx-auto w-full max-w-[1200px] px-5 md:px-8"
export const h2 =
  "[font-stretch:112%] tracking-[-0.03em] text-balance text-[2.1rem] leading-[1.04] font-semibold md:text-5xl"
export const card =
  "overflow-hidden rounded-[28px] bg-[var(--lp-card)] shadow-[inset_0_0_0_1px_var(--lp-line)]"

export function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Magnetic>
      <a
        data-press
        data-primary
        href={whatsapp}
        {...external}
        className={`group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--lp-amber)] px-6 font-semibold text-[var(--lp-bg)] ${className}`}
      >
        {offer.cta}
        <IconArrowRight
          aria-hidden
          size={18}
          stroke={2}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </a>
    </Magnetic>
  )
}

export function CallCta() {
  return (
    <a
      data-press
      data-ghost
      href={tel}
      className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium text-[var(--lp-text)] tabular-nums shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
    >
      <IconPhone aria-hidden size={18} stroke={1.75} />
      Call {phone}
    </a>
  )
}

export function NotesCta() {
  return (
    <Link
      data-press
      data-ghost
      href="/prototypes/lamp/notes"
      className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium text-[var(--lp-text)] shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
    >
      <IconFileText aria-hidden size={18} stroke={1.75} />
      Read free notes
    </Link>
  )
}

export function Play({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-[var(--lp-amber)] text-[var(--lp-bg)] shadow-[0_0_0_6px_rgba(245,181,68,0.18)] transition-transform duration-300 ease-out group-hover:scale-105 ${
        size === "lg" ? "size-16" : "size-10"
      }`}
    >
      <IconPlayerPlayFilled
        aria-hidden
        size={size === "lg" ? 24 : 16}
        className="translate-x-px"
      />
    </span>
  )
}

/** Lamp's page frame: fonts, tokens, header and footer, shared by every Lamp page. */
export function LampShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-lp
      style={tokens}
      className={`${sans.variable} min-h-[100dvh] bg-[var(--lp-bg)] font-[family-name:var(--lp-sans)] text-[var(--lp-text)] antialiased`}
    >
      <style>{css + bookCss + folderCss}</style>

      <HomePromos slug="lamp" tokens={siteTokens} />

      <header className="sticky top-0 z-40 border-b border-[var(--lp-line)] bg-[rgba(7,9,14,0.72)] backdrop-blur-xl">
        <div className={`${container} flex h-16 items-center gap-8`}>
          <Link
            href="/prototypes/lamp"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="grid size-9 place-items-center rounded-[10px] bg-[#F4F6FA]">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
            </span>
            <span className="hidden text-[15px] leading-tight font-semibold tracking-[-0.03em] [font-stretch:112%] sm:block">
              Impact Career
              <span className="block font-normal text-[var(--lp-muted)]">
                Tutorials
              </span>
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-7 text-sm text-[var(--lp-muted)] md:flex"
          >
            <Link data-quiet href="/prototypes/lamp#courses">
              Courses
            </Link>
            <Link data-quiet href="/prototypes/lamp#books">
              Books and notes
            </Link>
            <Link data-quiet href="/prototypes/lamp#teachers">
              Teachers
            </Link>
            <Link data-quiet href="/prototypes/lamp#questions">
              Questions
            </Link>
            <Link data-quiet href="/prototypes/lamp/notes">
              Free notes
            </Link>
            <Link data-quiet href="/prototypes/lamp/contact">
              Contact
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-5">
            <a
              data-quiet
              href={tel}
              className="hidden text-sm text-[var(--lp-muted)] tabular-nums lg:inline"
            >
              {phone}
            </a>
            <a
              data-press
              data-primary
              href={whatsapp}
              {...external}
              className="inline-flex h-10 items-center rounded-full bg-[var(--lp-amber)] px-4 text-sm font-semibold whitespace-nowrap text-[var(--lp-bg)]"
            >
              {offer.cta}
            </a>
          </div>
          <HomeMenu slug="lamp" tokens={siteTokens} />
        </div>
      </header>

      {children}

      <footer className="border-t border-[var(--lp-line)] pt-12 pb-28 text-sm text-[var(--lp-muted)]">
        <div className={`${container} grid gap-8 md:grid-cols-12`}>
          <div className="md:col-span-5">
            <p className="font-semibold text-[var(--lp-text)]">
              Impact Career Tutorials
            </p>
            <address className="mt-3 not-italic">
              {place.street}, {place.city}, {place.region} {place.pin}
            </address>
            <a
              data-quiet
              href={place.maps}
              {...external}
              className="mt-2 inline-block underline"
            >
              Open in Google Maps
            </a>
          </div>
          <div className="grid gap-1 md:col-span-4">
            {contact.phones.map((p) => (
              <a key={p} data-quiet href={`tel:${p}`} className="tabular-nums">
                {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
              </a>
            ))}
            <a data-quiet href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </div>
          <div className="flex gap-2 md:col-span-3 md:justify-end">
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
                data-press
                data-ghost
                className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--lp-line)]"
              >
                <Icon aria-hidden size={18} stroke={1.75} />
              </a>
            ))}
          </div>
          <p className="md:col-span-12">
            Prototype for review. Not the live site.
          </p>
        </div>
      </footer>

      <PrototypeSwitcher current="lamp" />
    </div>
  )
}
