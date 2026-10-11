import { Figtree, Unbounded } from "next/font/google"
import type { CSSProperties } from "react"

import type { BookTones } from "../_book"
import type { FolderTones } from "../_folder"
import { islandTokens } from "../pulse/_island"

/**
 * Pulse, final. The direction chosen for the site: Pulse's blue, amber and
 * ink — Unbounded display over Figtree — with ICT's own photographs moving
 * behind the hero. Sections read `var(--pu-*)`; the kit's shared blocks read
 * the `--k-*` island tokens merged into `tokens`.
 */

const display = Unbounded({ subsets: ["latin"], variable: "--pu-display" })
const sans = Figtree({ subsets: ["latin"], variable: "--pu-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/pulse-final"
/** This prototype has no sub-pages yet; course and site links point at Pulse's. */
export const siteBase = "/prototypes/pulse"

export const container = "mx-auto w-full max-w-[1240px] px-5 md:px-8"
export const external = {
  target: "_blank",
  rel: "noreferrer noopener",
} as const
export const h2 =
  "text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]"

export const tokens = {
  "--pu-blue": "#1F5FD1",
  "--pu-blue-deep": "#17479E",
  "--pu-paper": "#F5F7FB",
  "--pu-card": "#FFFFFF",
  "--pu-ink": "#0B1633",
  "--pu-muted": "#51607C",
  "--pu-on-blue": "#D5E2FA",
  "--pu-line": "rgba(11,22,51,0.1)",
  "--pu-amber": "#FFC24A",
  "--pu-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(8,24,70,0.55)",
  ...islandTokens,
} as CSSProperties

export const bookTones: BookTones = {
  primary: { bg: "#FFC24A", ink: "#0B1633", spine: "#D9A032" },
  highlight: { bg: "#FFFFFF", ink: "#0B1633", spine: "#D4DCEB" },
  muted: { bg: "#0B1633", ink: "#F5F7FB", spine: "#060D22" },
}

export const folderTones: FolderTones = {
  back: "#17479E",
  front: "#1F5FD1",
  paper: "#FFFFFF",
  ink: "#FFFFFF",
  muted: "#D5E2FA",
}

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export const css = `
[data-pf] ::selection { background: var(--pu-amber); color: var(--pu-ink); }
[data-pf] :focus-visible { outline: 2px solid var(--pu-amber); outline-offset: 3px; }
[data-pf] h1, [data-pf] h2, [data-pf] h3 { font-family: var(--pu-display); text-wrap: balance; }
[data-pf] p { text-wrap: pretty; }
[data-pf] [data-press] { transition: transform 0.16s var(--pu-ease), background-color 0.2s ease, box-shadow 0.2s ease; }
[data-pf] { -webkit-tap-highlight-color: transparent; }
[data-pf] [data-press]:active { transform: scale(0.96); }
[data-pf-panel] { transition: transform 0.16s var(--pu-ease); }
[data-pf-panel]:active { transform: scale(0.985); }
[data-pf] [data-ticket-wrap]:active { transform: scale(0.98); }
[data-pf-cardbtn] { transition: transform 0.16s var(--pu-ease); }
[data-pf-cardbtn]:active { transform: scale(0.98); }
[data-pf] [data-fd-hover] { transition: transform 0.16s var(--pu-ease); }
[data-pf] [data-fd-hover]:active { transform: scale(0.97); }
/* A hairline keeps light-surface images from bleeding into the card. */
[data-pf-frame] { outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px; }
@media (hover: hover) and (pointer: fine) {
  [data-pf] [data-amber]:hover { background-color: #FFD06E; box-shadow: 0 12px 30px -10px rgba(255,194,74,0.7); }
  [data-pf] [data-blue]:hover { background-color: var(--pu-blue-deep); }
}
@keyframes pf-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes pf-ticket { from { opacity: 0; transform: translateY(30px) rotate(4deg); } to { opacity: 1; transform: rotate(-3deg); } }
[data-pf] [data-rise] { animation: pf-rise 0.9s var(--pu-ease) both; }
[data-pf] [data-hero-ticket] { transform: rotate(-3deg); animation: pf-ticket 1s var(--pu-ease) 0.3s both; }
/* The sticky header: frosted paper once it sticks, tone text on the hero before. */
[data-pf-header] { transition: background-color 0.2s var(--pu-ease), color 0.2s var(--pu-ease), box-shadow 0.2s var(--pu-ease); }
[data-pf-header][data-stuck] { background-color: rgb(245 247 251 / 0.86); backdrop-filter: saturate(140%) blur(14px); -webkit-backdrop-filter: saturate(140%) blur(14px); box-shadow: 0 1px 0 var(--pu-line); color: var(--pu-ink); }
[data-pf-header][data-stuck] [data-pf-hdr-row] > nav, [data-pf-header][data-stuck] [data-pf-hdr-row] > nav a { color: var(--pu-muted); }
@media (hover: hover) and (pointer: fine) { [data-pf-header][data-stuck] [data-pf-hdr-row] > nav a:hover { color: var(--pu-ink); } }
@media (prefers-reduced-motion: reduce) { [data-pf-header] { transition: none; } }
/* The shadow only lifts the header row's own text; it never reaches the menu panel. */
[data-pf] [data-pf-hdr="light"]:not([data-stuck]) [data-pf-hdr-row] > *:not([data-pf-menu]) { text-shadow: 0 1px 10px rgba(11,22,51,0.6), 0 0 22px rgba(11,22,51,0.35); }
/* The menu button: ink-on-ring by default (paper + stuck), a white chip on light hero tones. */
[data-pf-menu-btn] { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 999px; color: var(--pu-ink); box-shadow: inset 0 0 0 1px var(--pu-line); transition: background-color 0.2s var(--pu-ease), box-shadow 0.2s var(--pu-ease); }
[data-pf-header][data-pf-hdr="light"]:not([data-stuck]) [data-pf-menu-btn] { background-color: #FFFFFF; box-shadow: none; }

/* Tickets: two notches where the stub tears off. */
[data-ticket] { --cut: 30%; -webkit-mask: radial-gradient(circle 14px at var(--cut) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 14px at var(--cut) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
  mask: radial-gradient(circle 14px at var(--cut) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 14px at var(--cut) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat; }
[data-ticket] [data-perf] { position: absolute; top: 18px; bottom: 18px; left: var(--cut); border-left: 2px dashed currentColor; opacity: 0.25; }
@media (max-width: 767px) { [data-ticket] { --cut: 0%; -webkit-mask: none; mask: none; } [data-ticket] [data-perf] { display: none; } }
[data-ticket-wrap] { filter: drop-shadow(0 18px 30px rgba(11,22,51,0.14)); transition: transform 0.35s var(--pu-ease), filter 0.35s var(--pu-ease); }
@media (hover: hover) and (pointer: fine) { [data-ticket-wrap]:hover { transform: translateY(-4px); filter: drop-shadow(0 26px 40px rgba(11,22,51,0.2)); } }

@keyframes pf-marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: no-preference) {
  [data-pf-track] { animation: pf-marquee 40s linear infinite; }
}

/* Flip cards for teachers. */
[data-flip] { perspective: 1000px; }
[data-flip-inner] { position: relative; transform-style: preserve-3d; transition: transform 0.45s cubic-bezier(0.77,0,0.175,1); }
[data-flip-face] { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
[data-flip-back] { position: absolute; inset: 0; transform: rotateY(180deg); }
[data-flipped] [data-flip-inner] { transform: rotateY(180deg); }

/* ---- Photo wall: columns of ICT photographs drifting up and down ---- */
[data-pf-wall] { display: grid; height: 100%; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); gap: 14px; }
[data-pf-col] { display: grid; gap: 14px; align-content: start; will-change: transform; }
[data-pf-col] > span { position: relative; display: block; aspect-ratio: 3 / 4; overflow: hidden; border-radius: 18px; background: var(--pu-blue-deep); }
[data-pf-col] img { object-fit: cover; filter: grayscale(0.3) contrast(1.04); }
@keyframes pf-up { to { transform: translateY(-50%); } }
@keyframes pf-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
@media (prefers-reduced-motion: no-preference) {
  [data-pf-col] { animation: pf-up var(--dur, 60s) linear infinite; }
  [data-pf-col]:nth-child(even) { animation-name: pf-down; }
}

/* Hero A: the wall bleeds off the right edge and fades into the blue field. */
@media (min-width: 1024px) {
  [data-pf-sidewall] { position: absolute; top: -14%; bottom: -14%; right: -9%; width: 54%; transform: rotate(-6deg); }
  [data-pf-sidewall]::before { content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background: linear-gradient(90deg, var(--pu-blue) 0%, rgba(31,95,209,0) 58%),
      linear-gradient(180deg, rgba(23,71,158,0.55), rgba(23,71,158,0.12) 34%, transparent 62%); }
  [data-pf-sidewall]::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: rgba(31,95,209,0.28); mix-blend-mode: multiply; }
}
/* Hero A, below lg: the wall is a band under the text, fading top and bottom. */
[data-pf-band] { position: relative; height: 300px; overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
  mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent); }
[data-pf-band] [data-pf-wall] { position: absolute; inset: -12% -5%; transform: rotate(-6deg); }
[data-pf-band]::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: rgba(31,95,209,0.28); mix-blend-mode: multiply; }

/* Hero B: the wall is the hero, duotoned into ICT's deep blue so the photos
   never fight the type. Ink scrims hold the header and the text block. */
[data-pf-bleedwall] { position: absolute; inset: -4% -3%; transform: rotate(-4deg) scale(1.08); }
[data-pf-bleedwall] img { filter: grayscale(1) contrast(1.08); }
[data-pf-bleedwall]::after { content: ""; position: absolute; inset: 0; background: var(--pu-blue-deep); mix-blend-mode: multiply; opacity: 0.85; }
@media (max-width: 767px) { [data-pf-bleedwall] [data-pf-wall] { grid-template-columns: repeat(3, minmax(0, 1fr)); } [data-pf-bleedwall] [data-pf-col]:nth-child(n + 4) { display: none; } }
[data-pf-bleed]::before { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(11,22,51,0.5), transparent 30%),
    linear-gradient(180deg, transparent 35%, rgba(11,22,51,0.85) 72%, #0B1633 100%); }
@media (min-width: 1024px) {
  [data-pf-bleed]::before {
    background: linear-gradient(180deg, rgba(11,22,51,0.5), transparent 30%),
      linear-gradient(180deg, transparent 35%, rgba(11,22,51,0.7) 70%, #0B1633 100%),
      radial-gradient(130% 95% at 0% 100%, rgba(11,22,51,0.88), rgba(11,22,51,0.35) 55%, transparent 80%);
  }
}
[data-pf-pill] { display: inline-flex; align-items: center; min-height: 30px; padding: 0 16px; border-radius: 999px;
  font-weight: 600; font-size: 0.85rem; color: #FFFFFF; background: rgba(11,22,51,0.45);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }

/* Hero C: two ribbons of photos running through a blue panel. */
[data-pf-ribbon] { display: flex; gap: 14px; width: max-content; will-change: transform; }
[data-pf-ribbon] + [data-pf-ribbon] { margin-top: 14px; }
[data-pf-ribbon] > span { position: relative; display: block; height: 240px; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 16px; background: var(--pu-blue-deep); }
@media (max-width: 767px) { [data-pf-ribbon] > span { height: 180px; } }
[data-pf-ribbon] img { object-fit: cover; }
@media (prefers-reduced-motion: no-preference) {
  [data-pf-ribbon] { animation: pf-marquee var(--dur, 64s) linear infinite; }
  [data-pf-ribbon][data-rev] { animation-direction: reverse; }
}

/* Exam panels: one grainy colour field per track, stacking as you scroll. */
[data-pf-panel] { position: relative; overflow: hidden; isolation: isolate; border-radius: 32px;
  background: var(--pf-field); color: var(--pf-ink); }
[data-pf-panel]::before { content: ""; position: absolute; inset: 0; z-index: -1; background: ${GRAIN}; opacity: 0.5; mix-blend-mode: overlay; }
[data-pf-panel]::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(90% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 60%); }
[data-pf-tag] { display: inline-flex; align-items: center; min-height: 32px; padding: 0 14px; border-radius: 999px;
  box-shadow: inset 0 0 0 1px currentColor; font-weight: 600; font-size: 0.8rem; }
[data-pf-dim] { color: var(--pf-dim); }
[data-pf-mrp] { color: var(--pf-mrp); font-weight: 500; }
[data-pf-go] { background: var(--pf-btn); color: var(--pf-btn-ink); transition: transform 0.3s var(--pu-ease); }
@media (hover: hover) and (pointer: fine) { [data-pf-panel]:hover [data-pf-go] { transform: translateX(4px); } }
[data-pf-poster] { position: relative; display: block; overflow: hidden; border-radius: 20px; aspect-ratio: 4 / 3;
  transform: rotate(var(--tilt, 2deg));
  box-shadow: 0 30px 50px -24px rgba(11,22,51,0.5), 0 0 0 6px rgba(255,255,255,0.92);
  transition: transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1); }
@media (max-width: 767px) { [data-pf-poster] { aspect-ratio: 16 / 9; max-height: 190px; } }
@media (hover: hover) and (pointer: fine) { [data-pf-panel]:hover [data-pf-poster] { transform: rotate(0deg) scale(1.02); } }

/* The student fan: five review cards spread like a hand. */
[data-pf-fan] { position: relative; display: flex; justify-content: center; height: 420px; }
[data-pf-card] { position: absolute; top: 40px; left: 50%; margin-left: -115px; width: 230px; aspect-ratio: 9 / 13;
  overflow: hidden; border-radius: 22px; background: var(--pu-ink); color: #FFFFFF;
  box-shadow: 0 0 0 5px #FFFFFF, 0 30px 50px -24px rgba(8,24,70,0.5);
  transform: translateX(calc(var(--i) * 150px)) rotate(calc(var(--i) * 7deg)) translateY(calc(var(--a) * 22px));
  transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1); z-index: var(--z); }
[data-pf-card] img { object-fit: cover; object-position: 50% 30%; transform: scale(1.25); }
@media (hover: hover) and (pointer: fine) {
  [data-pf-fan]:hover [data-pf-card] { transform: translateX(calc(var(--i) * 190px)) rotate(calc(var(--i) * 4deg)) translateY(calc(var(--a) * 12px)); }
  [data-pf-fan] [data-pf-card]:hover { transform: translateX(calc(var(--i) * 190px)) rotate(0deg) translateY(-24px) scale(1.04); z-index: 20; }
}
[data-pf-card]:focus-within { transform: translateX(calc(var(--i) * 150px)) rotate(0deg) translateY(-24px) scale(1.04); z-index: 20; }
@media (max-width: 767px) {
  [data-pf-card] { width: 170px; margin-left: -85px; transform: translateX(calc(var(--i) * 70px)) rotate(calc(var(--i) * 7deg)) translateY(calc(var(--a) * 16px)); }
  [data-pf-card]:focus-within { transform: translateX(calc(var(--i) * 70px)) rotate(0deg) translateY(-20px) scale(1.04); z-index: 20; }
  [data-pf-fan] { height: 330px; }
}

/* The grand footer in Pulse's voice. */
[data-pf] [data-gf] { --gf-display: var(--pu-display); --gf-word-font: var(--pu-display); --gf-mono: var(--pu-sans);
  --gf-word-lit: linear-gradient(90deg, #1F5FD1, #FFC24A); --gf-word: rgba(11,22,51,0.07); --gf-word-weight: 600;
  --k-ease: var(--pu-ease); }
[data-pf] [data-gf-head] { font-weight: 600; }
[data-pf] [data-gf-word] { height: clamp(3.1rem, 11.5vw, 11.5rem); font-size: clamp(4.5rem, 17vw, 17rem); }
[data-pf] [data-gf] > div:last-child { padding-bottom: 7rem; }

/* The hero-options control only matters while the hero is on screen. */
[data-pf-pick] { transition: opacity 0.2s ease-out, transform 0.2s ease-out; }
[data-pf-pick][data-hidden] { opacity: 0; transform: translateY(8px); pointer-events: none; }
@media (prefers-reduced-motion: reduce) { [data-pf-pick] { transition: none; } }

/* The announcement strip: an ink band that collapses into the hero's top edge. */
[data-pf-strip] { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: 1fr; background: var(--pu-ink); color: #FFFFFF;
  transition: grid-template-rows 0.2s var(--pu-ease), opacity 0.2s var(--pu-ease); }
[data-pf-strip] p { text-wrap: nowrap; }
[data-pf-strip][data-hidden] { grid-template-rows: 0fr; opacity: 0; }
@media (prefers-reduced-motion: reduce) { [data-pf-strip] { transition: none; } }

/* Loops only run while their wall or strip is on screen. */
[data-offscreen] [data-pf-col], [data-offscreen] [data-pf-ribbon],
[data-offscreen][data-pf-track], [data-offscreen] [data-pf-track] { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  [data-flip-inner] { transition: none; }
  [data-pf] [data-hero-ticket] { animation: none; }
}
`
