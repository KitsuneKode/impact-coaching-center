import { todayIst } from "@/lib/calendar"
import { IconArrowRight, IconChevronRight } from "@tabler/icons-react"
import { Barlow, Big_Shoulders } from "next/font/google"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

import type { BookTones } from "../_book"
import { offer, whatsapp } from "../_data"
import type { FolderTones } from "../_folder"
import { Magnetic } from "../_fx"

/**
 * Prototype 14: Livery. A powder-blue racing livery: one orange stripe, navy
 * ink, condensed numerals. Batches sit on a timing tower, the newest batch
 * on a pit board. Colour: sky and paper for ground, navy for ink and boards,
 * orange as the single accent.
 */

export const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--lv-display-font",
})
export const sans = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--lv-sans",
})

export const tokens = {
  "--lv-sky": "#86BFEA",
  "--lv-sky-deep": "#5FA3D6",
  "--lv-paper": "#EEF5FB",
  "--lv-card": "#FFFFFF",
  "--lv-navy": "#0B1F3A",
  "--lv-navy-2": "#12294A",
  "--lv-ink": "#0B1F3A",
  "--lv-muted": "#46607E",
  "--lv-on-sky": "#1B3657",
  "--lv-on-navy": "#A9C4E0",
  "--lv-orange": "#F2621F",
  "--lv-line": "rgba(11,31,58,0.14)",
  "--lv-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(11,31,58,0.55)",
  /* the shared exam guide and enquiry form take their look from these */
  "--eg-ink": "var(--lv-ink)",
  "--eg-muted": "var(--lv-muted)",
  "--eg-line": "var(--lv-line)",
  "--eg-card": "#FFFFFF",
  "--eg-shadow":
    "0 0 0 1px var(--lv-line), 0 18px 36px -28px rgba(11,31,58,0.5)",
  "--eg-tile": "var(--lv-paper)",
  "--eg-chip": "#FFFFFF",
  "--eg-chip-hover": "#E1EDF8",
  "--eg-on": "var(--lv-navy)",
  "--eg-on-ink": "#FFFFFF",
  "--eg-accent": "var(--lv-orange)",
  "--eg-accent-ink": "var(--lv-navy)",
  "--eg-display": "var(--lv-display-font), var(--lv-sans), sans-serif",
  "--eg-radius": "8px",
  "--eg-panel-radius": "14px",
  "--eg-inner-radius": "10px",
  "--eq-ink": "var(--lv-ink)",
  "--eq-muted": "var(--lv-muted)",
  "--eq-line": "rgba(11,31,58,0.3)",
  "--eq-field": "#FFFFFF",
  "--eq-hover": "#E1EDF8",
  "--eq-accent": "var(--lv-orange)",
  "--eq-accent-ink": "var(--lv-navy)",
  "--eq-danger": "#B3261E",
  "--eq-radius": "8px",
  "--eq-btn-radius": "8px",
  "--eq-btn-shadow":
    "0 10px 22px -10px rgba(242,98,31,0.75), inset 0 -3px 0 rgba(11,31,58,0.18)",
  "--fb-ink": "var(--lv-ink)",
  "--fb-muted": "var(--lv-muted)",
  "--fb-line": "var(--lv-line)",
  "--fb-line-hi": "rgba(11,31,58,0.35)",
  "--fb-card": "#FFFFFF",
  "--fb-card-on": "#EAF3FB",
  "--fb-accent": "var(--lv-orange)",
  "--fb-accent-ink": "var(--lv-navy)",
  "--fb-accent-deep": "#C74E14",
  "--fb-display": "var(--lv-display-font), var(--lv-sans), sans-serif",
  "--fb-paper": "#FFFFFF",
  "--fb-paper-ink": "#0B1F3A",
  "--fb-paper-muted": "#46607E",
  "--fb-paper-line": "rgba(11,31,58,0.12)",
  "--fb-radius": "12px",
  "--fb-btn-radius": "8px",
  "--fb-btn-shadow":
    "0 10px 22px -10px rgba(242,98,31,0.75), inset 0 -3px 0 rgba(11,31,58,0.18)",
  "--mm-ink": "var(--lv-ink)",
  "--mm-line": "var(--lv-line)",
  "--mm-bg": "var(--lv-sky)",
  "--mm-btn-bg": "rgba(255,255,255,0.45)",
  "--mm-accent": "var(--lv-navy)",
  "--mm-display": "var(--lv-display-font), var(--lv-sans), sans-serif",
  "--mm-radius": "8px",
  "--pm-ink": "var(--lv-ink)",
  "--pm-muted": "var(--lv-muted)",
  "--pm-line": "var(--lv-line)",
  "--pm-line-hi": "rgba(11,31,58,0.35)",
  "--pm-card": "#FFFFFF",
  "--pm-card-solid": "#FFFFFF",
  "--pm-shadow":
    "0 0 0 1px var(--lv-line), 0 18px 36px -28px rgba(11,31,58,0.5)",
  "--pm-tile": "var(--lv-paper)",
  "--pm-tab": "#FFFFFF",
  "--pm-tab-on": "#EAF3FB",
  "--pm-hover": "#E1EDF8",
  "--pm-accent": "var(--lv-orange)",
  "--pm-accent-ink": "var(--lv-navy)",
  "--pm-btn": "var(--lv-orange)",
  "--pm-btn-shadow":
    "0 10px 22px -10px rgba(242,98,31,0.75), inset 0 -3px 0 rgba(11,31,58,0.18)",
  "--pm-display": "var(--lv-display-font), var(--lv-sans), sans-serif",
  "--pm-radius": "14px",
  "--pm-inner": "10px",
  "--pm-pill": "8px",
  "--pm-bar-radius": "12px",
  "--pm-scrim": "rgba(11, 31, 58, 0.6)",
  "--pm-frame": "var(--lv-paper)",
  "--pm-icon-bg": "rgba(255,255,255,0.85)",
} as CSSProperties

export const bookTones: BookTones = {
  primary: { bg: "#F2621F", ink: "#0B1F3A", spine: "#C74E14" },
  highlight: { bg: "#86BFEA", ink: "#0B1F3A", spine: "#5FA3D6" },
  muted: { bg: "#FFFFFF", ink: "#0B1F3A", spine: "#D3DEE9" },
}

export const folderTones: FolderTones = {
  back: "#5FA3D6",
  front: "#0B1F3A",
  paper: "#FFFFFF",
  ink: "#FFFFFF",
  muted: "#A9C4E0",
}

export const css = `
[data-lv] { background: var(--lv-paper); color: var(--lv-ink); font-family: var(--lv-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
[data-lv] ::selection { background: var(--lv-orange); color: var(--lv-navy); }
[data-lv] :focus-visible { outline: 3px solid var(--lv-navy); outline-offset: 3px; }
[data-lv] [data-dark] :focus-visible, [data-lv] [data-lv-tower] :focus-visible, [data-lv] [data-lv-strip] :focus-visible { outline-color: #fff; }
[data-lv] h1, [data-lv] h2, [data-lv] h3 { text-wrap: balance; }
[data-lv] p { text-wrap: pretty; }

[data-lv-display] { font-family: var(--lv-display-font), var(--lv-sans), sans-serif; font-weight: 800; text-transform: uppercase; letter-spacing: 0.005em; line-height: 0.95; }
[data-lv-h2] { font-family: var(--lv-display-font), sans-serif; font-weight: 800; text-transform: uppercase; font-size: clamp(2.3rem, 4.8vw, 4rem); line-height: 0.94; letter-spacing: 0; }

[data-lv-press] { transition: transform 0.16s var(--lv-ease), background-color 0.2s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out; }
[data-lv-press]:active { transform: scale(0.96); }
[data-lv-btn] { background: var(--lv-orange); color: var(--lv-navy); box-shadow: 0 10px 22px -10px rgba(242,98,31,0.75), inset 0 -3px 0 rgba(11,31,58,0.18); }
[data-lv-btn-navy] { background: var(--lv-navy); color: #fff; }
[data-lv-btn-line] { box-shadow: inset 0 0 0 2px var(--lv-navy); }
[data-lv-chip] { background: var(--lv-card); box-shadow: inset 0 0 0 1.5px var(--lv-line); color: var(--lv-ink); }
[data-lv-chip][data-on] { background: var(--lv-navy); color: #fff; box-shadow: none; }
@media (hover: hover) and (pointer: fine) {
  [data-lv-btn]:hover { filter: brightness(1.06); }
  [data-lv-btn-navy]:hover { background: var(--lv-navy-2); }
  [data-lv-btn-line]:hover { background: rgba(11,31,58,0.07); }
  [data-lv-chip]:not([data-on]):hover { background: #E1EDF8; }
}

/* Racing stripe: an orange bar between two navy pinstripes. */
[data-lv-stripe] { display: block; height: 22px; background:
  linear-gradient(var(--lv-navy), var(--lv-navy)) 0 0 / 100% 3px no-repeat,
  linear-gradient(var(--lv-orange), var(--lv-orange)) 0 6px / 100% 10px no-repeat,
  linear-gradient(var(--lv-navy), var(--lv-navy)) 0 19px / 100% 3px no-repeat; }
[data-lv-hero-stripe] { position: absolute; top: 0; bottom: 0; right: 7%; width: 96px; transform-origin: top; transform: skewX(-12deg);
  background: linear-gradient(90deg, var(--lv-navy) 0 4px, transparent 4px 16px, var(--lv-orange) 16px 76px, transparent 76px 88px, var(--lv-navy) 88px 92px); }
@keyframes lv-paint { from { transform: skewX(-12deg) scaleY(0); } to { transform: skewX(-12deg) scaleY(1); } }
@media (prefers-reduced-motion: no-preference) { [data-lv-hero-stripe] { animation: lv-paint 0.9s var(--lv-ease) 0.1s both; } }

/* Lap progress: the stripe fills as you read down the page, drawn by the scroll itself. */
[data-lv-progress] { position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 4px; background: var(--lv-orange); transform-origin: 0 50%; transform: scaleX(0); pointer-events: none; }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-lv-progress] { animation: lv-progress linear both; animation-timeline: scroll(root block); }
  }
}
@keyframes lv-progress { to { transform: scaleX(1); } }

[data-lv-checker] { background: conic-gradient(var(--lv-navy) 25%, #fff 0 50%, var(--lv-navy) 0 75%, #fff 0) 0 0 / 24px 24px; }
[data-lv-board] { background: var(--lv-navy); color: #fff; box-shadow: 0 30px 50px -28px rgba(11,31,58,0.8), 0 0 0 5px #fff; }

[data-lv-tower] { background: var(--lv-navy); box-shadow: 0 30px 50px -34px rgba(11,31,58,0.7); }
[data-lv-row] + [data-lv-row] { box-shadow: inset 0 1px 0 rgba(255,255,255,0.09); }
[data-lv-row] { position: relative; transition: background-color 0.2s ease-out; }
[data-lv-row]::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--lv-orange); transform: scaleY(0); transition: transform 0.25s var(--lv-ease); }
@media (hover: hover) and (pointer: fine) { [data-lv-row]:hover { background: var(--lv-navy-2); } [data-lv-row]:hover::before { transform: scaleY(1); } }

[data-lv-card] { background: var(--lv-card); box-shadow: 0 0 0 1px var(--lv-line), 0 18px 36px -28px rgba(11,31,58,0.5); }
[data-lv-photo] { outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px; }

/* Drivers: strips that open on hover or focus, stacked on a phone. */
[data-lv-strips] { display: grid; gap: 12px; }
[data-lv-strip] { position: relative; overflow: hidden; min-height: 340px; border-radius: 14px; background: var(--lv-navy); }
[data-lv-strip] img { transition: filter 0.4s var(--lv-ease), transform 0.6s var(--lv-ease); }
[data-lv-strip] [data-more] { transition: opacity 0.3s ease-out, transform 0.35s var(--lv-ease); }
@media (min-width: 768px) {
  [data-lv-strips] { display: flex; height: 540px; }
  [data-lv-strip] { flex: 1 1 0; min-height: 0; transition: flex-grow 0.55s var(--lv-ease); }
  [data-lv-strip] [data-more] { opacity: 0; transform: translateY(10px); pointer-events: none; }
  [data-lv-strip]:hover, [data-lv-strip]:focus-within { flex-grow: 3.4; }
  [data-lv-strip]:hover [data-more], [data-lv-strip]:focus-within [data-more] { opacity: 1; transform: none; pointer-events: auto; }
  [data-lv-strip] [data-name] { white-space: nowrap; }
}
@media (hover: hover) and (pointer: fine) { [data-lv-strip] img { filter: grayscale(0.9) contrast(1.05); } [data-lv-strip]:hover img, [data-lv-strip]:focus-within img { filter: none; transform: scale(1.03); } }
@media (prefers-reduced-motion: reduce) { [data-lv-strip] { transition: none; } }

@keyframes lv-marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: no-preference) { [data-lv-track] { animation: lv-marquee 38s linear infinite; } }

@keyframes lv-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: no-preference) { [data-rise] { animation: lv-rise 0.8s var(--lv-ease) both; } }
`

export const external = {
  target: "_blank",
  rel: "noreferrer noopener",
} as const
export const container = "mx-auto w-full max-w-[1240px] px-5 md:px-8"

/** Which day of the batch it is today in India, counting the start date as day 1. */
export function batchDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  const [ty, tm, td] = todayIst(Date.now()).split("-").map(Number)
  const gap =
    (Date.UTC(ty!, tm! - 1, td!) - Date.UTC(y!, m! - 1, d!)) / 86_400_000
  return Math.max(1, Math.round(gap) + 1)
}

export function JoinCta() {
  return (
    <Magnetic>
      <a
        href={whatsapp}
        {...external}
        data-lv-press
        data-lv-btn
        className="group inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold whitespace-nowrap"
      >
        {offer.cta}
        <IconArrowRight
          aria-hidden
          size={18}
          stroke={2.25}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </a>
    </Magnetic>
  )
}

export const base = "/prototypes/livery"

export const navLinks = [
  { href: `${base}/courses`, label: "Courses" },
  { href: `${base}/exams`, label: "Exams" },
  { href: `${base}/books`, label: "Books" },
  { href: `${base}/notes`, label: "Free notes" },
  { href: `${base}/results`, label: "Results" },
  { href: `${base}/contact`, label: "Contact" },
]

/** Top of every inner page: breadcrumb, title, one line of context. */
export function PageHead({
  trail,
  title,
  lede,
  children,
}: {
  trail: { label: string; href?: string }[]
  title: string
  lede?: string
  children?: ReactNode
}) {
  return (
    <section className={`${container} pt-8 pb-12 md:pt-12 md:pb-16`}>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-[var(--lv-muted)]"
      >
        <Link
          href={base}
          className="transition-colors hover:text-[var(--lv-ink)]"
        >
          Home
        </Link>
        {trail.map((t) => (
          <span key={t.label} className="flex items-center gap-1.5">
            <IconChevronRight aria-hidden size={14} stroke={2} />
            {t.href ? (
              <Link
                href={t.href}
                className="transition-colors hover:text-[var(--lv-ink)]"
              >
                {t.label}
              </Link>
            ) : (
              <span className="text-[var(--lv-ink)]">{t.label}</span>
            )}
          </span>
        ))}
      </nav>
      <h1
        data-lv-display
        className="mt-8 max-w-[18ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.92]"
      >
        {title}
      </h1>
      {lede && (
        <p className="mt-5 max-w-[56ch] text-lg font-medium text-[var(--lv-muted)]">
          {lede}
        </p>
      )}
      {children}
    </section>
  )
}
