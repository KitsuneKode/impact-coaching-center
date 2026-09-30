import { todayIst } from "@/lib/calendar"
import { IconArrowRight, IconChevronRight } from "@tabler/icons-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { Lexend_Zetta, Schibsted_Grotesk } from "next/font/google"
import type { CSSProperties } from "react"

import type { BookTones } from "../_book"
import { offer, whatsapp } from "../_data"
import type { FolderTones } from "../_folder"
import { Magnetic } from "../_fx"

export const display = Lexend_Zetta({
  subsets: ["latin"],
  variable: "--cc-display-font",
})
export const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--cc-sans",
})

export const tokens = {
  "--cc-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(0,0,0,0.6)",
  /* the shared exam guide and enquiry form take their look from these */
  "--eg-ink": "var(--cc-ink)",
  "--eg-muted": "var(--cc-muted)",
  "--eg-line": "var(--cc-edge)",
  "--eg-card":
    "radial-gradient(130% 110% at 0% 0%, var(--cc-p1) 0%, var(--cc-p2) 72%)",
  "--eg-shadow":
    "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px var(--cc-edge), 0 30px 50px -34px rgba(0,0,0,0.75)",
  "--eg-tile": "rgba(0,0,0,0.22)",
  "--eg-chip": "rgba(255,255,255,0.04)",
  "--eg-chip-hover": "rgba(255,255,255,0.1)",
  "--eg-on": "linear-gradient(180deg, var(--cc-a1), var(--cc-a2))",
  "--eg-on-ink": "var(--cc-on-a)",
  "--eg-accent": "var(--cc-a1)",
  "--eg-accent-ink": "var(--cc-on-a)",
  "--eg-display": "var(--cc-display-font), var(--cc-sans), sans-serif",
  "--eg-radius": "999px",
  "--eg-panel-radius": "28px",
  "--eg-inner-radius": "16px",
  "--eq-ink": "var(--cc-ink)",
  "--eq-muted": "var(--cc-muted)",
  "--eq-line": "var(--cc-edge-strong)",
  "--eq-field": "rgba(0,0,0,0.26)",
  "--eq-hover": "rgba(255,255,255,0.1)",
  "--eq-accent": "var(--cc-a1)",
  "--eq-accent-ink": "var(--cc-on-a)",
  "--eq-danger": "#FF9C92",
  "--eq-radius": "16px",
  "--eq-btn-radius": "999px",
  "--eq-btn-shadow":
    "inset 0 1px 0 rgba(255,255,255,0.38), 0 12px 26px -12px rgba(var(--cc-glow), 0.75)",
  "--fb-ink": "var(--cc-ink)",
  "--fb-muted": "var(--cc-muted)",
  "--fb-line": "var(--cc-edge)",
  "--fb-line-hi": "var(--cc-edge-strong)",
  "--fb-card": "rgba(255,255,255,0.04)",
  "--fb-card-on": "rgba(255,255,255,0.09)",
  "--fb-accent": "var(--cc-a1)",
  "--fb-accent-ink": "var(--cc-on-a)",
  "--fb-accent-deep": "var(--cc-a2)",
  "--fb-display": "var(--cc-display-font), var(--cc-sans), sans-serif",
  "--fb-paper": "#EEF1FA",
  "--fb-paper-ink": "#0B1230",
  "--fb-paper-muted": "#4C567D",
  "--fb-paper-line": "rgba(11,18,48,0.1)",
  "--fb-radius": "20px",
  "--fb-btn-radius": "999px",
  "--fb-btn-shadow":
    "inset 0 1px 0 rgba(255,255,255,0.38), 0 12px 26px -12px rgba(var(--cc-glow), 0.75)",
  "--mm-ink": "var(--cc-ink)",
  "--mm-line": "var(--cc-edge)",
  "--mm-bg": "color-mix(in oklab, var(--cc-bg) 94%, transparent)",
  "--mm-btn-bg": "rgba(255,255,255,0.04)",
  "--mm-accent": "var(--cc-a1)",
  "--mm-display": "var(--cc-display-font), var(--cc-sans), sans-serif",
  "--pm-ink": "var(--cc-ink)",
  "--pm-muted": "var(--cc-muted)",
  "--pm-line": "var(--cc-edge)",
  "--pm-line-hi": "var(--cc-edge-strong)",
  "--pm-card":
    "radial-gradient(130% 110% at 0% 0%, var(--cc-p1) 0%, var(--cc-p2) 72%)",
  "--pm-card-solid": "var(--cc-p2)",
  "--pm-shadow":
    "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px var(--cc-edge), 0 30px 50px -34px rgba(0,0,0,0.75)",
  "--pm-tile": "rgba(0,0,0,0.22)",
  "--pm-tab": "rgba(255,255,255,0.04)",
  "--pm-tab-on": "rgba(255,255,255,0.09)",
  "--pm-hover": "rgba(255,255,255,0.09)",
  "--pm-accent": "var(--cc-a1)",
  "--pm-accent-ink": "var(--cc-on-a)",
  "--pm-btn": "linear-gradient(180deg, var(--cc-a1), var(--cc-a2))",
  "--pm-btn-shadow":
    "inset 0 1px 0 rgba(255,255,255,0.38), 0 12px 26px -12px rgba(var(--cc-glow), 0.75)",
  "--pm-display": "var(--cc-display-font), var(--cc-sans), sans-serif",
  "--pm-radius": "28px",
  "--pm-inner": "18px",
  "--pm-pill": "999px",
  "--pm-bar-radius": "28px",
  "--pm-scrim": "rgba(3, 6, 20, 0.72)",
  "--pm-frame": "var(--cc-bg)",
  "--pm-icon-bg": "rgba(0,0,0,0.35)",
} as CSSProperties

export const bookTones: BookTones = {
  primary: { bg: "#3B72EE", ink: "#FFFFFF", spine: "#2A56BF" },
  highlight: { bg: "#E9EEFB", ink: "#0B1230", spine: "#C4CEEB" },
  muted: { bg: "#111A3C", ink: "#E9EEFB", spine: "#0A1128" },
}

export const folderTones: FolderTones = {
  back: "var(--cc-p2)",
  front: "var(--cc-p1)",
  paper: "#EEF1FA",
  ink: "#FFFFFF",
  muted: "var(--cc-muted)",
}

export const css = `
@property --cc-bg { syntax: "<color>"; inherits: true; initial-value: #070A14; }
@property --cc-p1 { syntax: "<color>"; inherits: true; initial-value: #1E2955; }
@property --cc-p2 { syntax: "<color>"; inherits: true; initial-value: #0D1331; }
@property --cc-a1 { syntax: "<color>"; inherits: true; initial-value: #5A6BEA; }
@property --cc-a2 { syntax: "<color>"; inherits: true; initial-value: #3846C8; }

[data-cc] {
  --cc-bg: #070A14; --cc-p1: #1E2955; --cc-p2: #0D1331; --cc-a1: #5A6BEA; --cc-a2: #3846C8; --cc-on-a: #FFFFFF;
  --cc-ink: #ECEFFA; --cc-muted: #A7B0D2; --cc-edge: rgba(160,175,255,0.16); --cc-edge-strong: rgba(190,200,255,0.34);
  --cc-glow: 110,125,255;
  background: var(--cc-bg); color: var(--cc-ink);
  font-family: var(--cc-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; scroll-behavior: smooth;
  transition: --cc-bg 0.7s var(--cc-ease), --cc-p1 0.7s var(--cc-ease), --cc-p2 0.7s var(--cc-ease), --cc-a1 0.7s var(--cc-ease), --cc-a2 0.7s var(--cc-ease);
}
[data-cc][data-finish="portimao"] {
  --cc-bg: #050B1F; --cc-p1: #1E52C8; --cc-p2: #0A2469; --cc-a1: #3B72EE; --cc-a2: #1E50D2;
  --cc-muted: #C2D2F4; --cc-edge: rgba(150,190,255,0.3); --cc-edge-strong: rgba(180,210,255,0.5); --cc-glow: 90,150,255;
}
[data-cc][data-finish="gentian"] {
  --cc-bg: #090C11; --cc-p1: #4C5E72; --cc-p2: #1F2833; --cc-a1: #B4C6DB; --cc-a2: #8CA3BE; --cc-on-a: #0A0E14;
  --cc-muted: #C6D0DC; --cc-edge: rgba(190,205,225,0.26); --cc-edge-strong: rgba(210,222,238,0.5); --cc-glow: 200,214,234;
  --cc-ink: #F0F3F7;
}
[data-cc] ::selection { background: var(--cc-a1); color: var(--cc-on-a); }
[data-cc] :focus-visible { outline: 2px solid var(--cc-a1); outline-offset: 3px; }
[data-cc] h1, [data-cc] h2, [data-cc] h3 { text-wrap: balance; }
[data-cc] p { text-wrap: pretty; }

[data-cc-display] { font-family: var(--cc-display-font), var(--cc-sans), sans-serif; }
[data-cc-wide] { font-family: var(--cc-display-font), var(--cc-sans), sans-serif; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 300; }
[data-cc-h2] { font-size: clamp(1.75rem, 3.4vw, 2.75rem); line-height: 1.06; font-weight: 500; letter-spacing: -0.03em; }

/* Painted panel with a clear coat: top sheen always, a pool of light under the pointer. */
[data-cc-panel] { position: relative; isolation: isolate; color: var(--cc-ink);
  background: radial-gradient(130% 110% at 0% 0%, var(--cc-p1) 0%, var(--cc-p2) 72%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px var(--cc-edge), 0 30px 50px -34px rgba(0,0,0,0.75); }
[data-cc-panel]::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), transparent 36%), linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.045) 48%, transparent 58%); }
[data-cc-panel]::after { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; opacity: 0;
  background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), rgba(255,255,255,0.17), transparent 58%);
  transition: opacity 0.3s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-cc-panel]:hover::after { opacity: 1; } }

[data-cc-tile] { background: rgba(0,0,0,0.22); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05); }
[data-cc-tag] { font-family: var(--cc-display-font), sans-serif; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 300; box-shadow: inset 0 0 0 1px var(--cc-edge-strong); }
[data-cc-avatar] { outline: 1px solid oklch(1 0 0 / 0.14); outline-offset: -1px; box-shadow: 0 0 0 2px var(--cc-p2); }
[data-cc-photo] { outline: 1px solid oklch(1 0 0 / 0.1); outline-offset: -1px; }

[data-cc-press] { transition: transform 0.16s var(--cc-ease), background-color 0.2s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out; }
[data-cc-press]:active { transform: scale(0.96); }
[data-cc-btn] { color: var(--cc-on-a); background: linear-gradient(180deg, var(--cc-a1), var(--cc-a2));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.38), 0 12px 26px -12px rgba(var(--cc-glow), 0.75); }
[data-cc-outline] { background: rgba(255,255,255,0.04); box-shadow: inset 0 0 0 1px var(--cc-edge-strong); }
[data-cc-ghost] { color: var(--cc-muted); }
[data-cc-option] { background: rgba(255,255,255,0.03); box-shadow: inset 0 0 0 1px var(--cc-edge); }
[data-cc-option][data-on] { background: rgba(255,255,255,0.09); box-shadow: inset 0 0 0 1.5px var(--cc-edge-strong), 0 14px 30px -18px rgba(var(--cc-glow), 0.8); }
[data-cc-option]:has(input:focus-visible) { outline: 2px solid var(--cc-a1); outline-offset: 3px; }
[data-cc-tab] { color: var(--cc-ink); }
[data-cc-tab-fill] { background: linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05)); box-shadow: inset 0 0 0 1px var(--cc-edge-strong), inset 0 1px 0 rgba(255,255,255,0.16); }
@media (hover: hover) and (pointer: fine) {
  [data-cc-btn]:hover { filter: brightness(1.1); }
  [data-cc-outline]:hover, [data-cc-ghost]:hover, [data-cc-option]:hover, [data-cc-tab]:not([data-on]):hover { background: rgba(255,255,255,0.09); }
  [data-cc-ghost]:hover { color: var(--cc-ink); }
  [data-cc-lift] { transition: transform 0.35s var(--cc-ease); }
  [data-cc-lift]:hover { transform: translateY(-4px); }
}

[data-orb] { box-shadow: inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.45), 0 4px 10px -3px rgba(0,0,0,0.6); }
[data-orb="midnight"] { background: radial-gradient(circle at 32% 26%, #4C5A9E 0, #151C48 46%, #05081A 100%); }
[data-orb="portimao"] { background: radial-gradient(circle at 32% 26%, #A6C8FF 0, #2F6DF0 42%, #0B2A80 100%); }
[data-orb="gentian"] { background: radial-gradient(circle at 32% 26%, #E7EEF7 0, #8095AD 44%, #2A3542 100%); }

/* Paint flake: fixed, non-interactive, never on a scrolling container. */
[data-cc-grain] { position: fixed; inset: 0; z-index: 40; pointer-events: none; opacity: 0.06; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
[data-cc-nav] { background: color-mix(in oklab, var(--cc-bg) 72%, transparent); backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 1px 0 var(--cc-edge); }
@media (prefers-reduced-transparency: reduce) { [data-cc-nav] { background: var(--cc-bg); backdrop-filter: none; -webkit-backdrop-filter: none; } }

@keyframes cc-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: no-preference) { [data-rise] { animation: cc-rise 0.8s var(--cc-ease) both; } }
@media (prefers-reduced-motion: reduce) { [data-cc] { transition: none; } [data-cc-panel]::after { transition: none; } }

[data-cc-faq] summary { list-style: none; cursor: pointer; }
[data-cc-faq] summary::-webkit-details-marker { display: none; }
[data-cc-faq] { interpolate-size: allow-keywords; }
[data-cc-faq]::details-content { block-size: 0; overflow: hidden; transition: block-size 0.3s var(--cc-ease), content-visibility 0.3s allow-discrete; }
[data-cc-faq][open]::details-content { block-size: auto; }
[data-cc-faq][open] [data-plus] { transform: rotate(45deg); }
[data-plus] { transition: transform 0.25s var(--cc-ease); }
[data-cc-snap] { scrollbar-width: none; }
[data-cc-snap]::-webkit-scrollbar { display: none; }

/* Finish change: the new paint grows from the orb you pressed. */
[data-vt], [data-vt] * { transition: none !important; }
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; animation: cc-reveal 0.75s cubic-bezier(0.23, 1, 0.32, 1) both; }
@keyframes cc-reveal { from { clip-path: circle(0 at var(--vt-x, 50%) var(--vt-y, 50%)); } to { clip-path: circle(150vmax at var(--vt-x, 50%) var(--vt-y, 50%)); } }

/* Reading position, drawn by the scroll itself: no script. */
[data-cc-progress] { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; transform-origin: 0 50%; transform: scaleX(0);
  background: linear-gradient(90deg, var(--cc-a2), var(--cc-a1)); }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-cc-progress] { animation: cc-progress linear both; animation-timeline: scroll(root block); }
  }
}
@keyframes cc-progress { to { transform: scaleX(1); } }
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

export function JoinCta({ className = "" }: { className?: string }) {
  return (
    <Magnetic>
      <a
        href={whatsapp}
        {...external}
        data-cc-press
        data-cc-btn
        className={`group inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold whitespace-nowrap ${className}`}
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

export const base = "/prototypes/clearcoat"

export const navLinks = [
  { href: `${base}/courses`, label: "Courses" },
  { href: `${base}/exams`, label: "Exams" },
  { href: `${base}/books`, label: "Books" },
  { href: `${base}/notes`, label: "Free notes" },
  { href: `${base}/results`, label: "Results" },
  { href: `${base}/contact`, label: "Contact" },
]

/** Panels, tiles and cards share one radius scale: 28 outer, 20 inner, pill for actions. */
export const card = "cc-panel rounded-[28px]"

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
    <section className={`${container} relative pt-8 pb-12 md:pt-12 md:pb-16`}>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--cc-muted)]"
      >
        <Link
          href={base}
          className="transition-colors hover:text-[var(--cc-ink)]"
        >
          Home
        </Link>
        {trail.map((t) => (
          <span key={t.label} className="flex items-center gap-1.5">
            <IconChevronRight aria-hidden size={14} stroke={1.75} />
            {t.href ? (
              <Link
                href={t.href}
                className="transition-colors hover:text-[var(--cc-ink)]"
              >
                {t.label}
              </Link>
            ) : (
              <span className="text-[var(--cc-ink)]">{t.label}</span>
            )}
          </span>
        ))}
      </nav>
      <h1
        data-cc-display
        className="mt-8 max-w-[22ch] text-[clamp(1.8rem,3.6vw,3.1rem)] leading-[1.12] font-light tracking-[-0.025em]"
      >
        {title}
      </h1>
      {lede && (
        <p className="mt-5 max-w-[56ch] text-lg text-[var(--cc-muted)]">
          {lede}
        </p>
      )}
      {children}
    </section>
  )
}
