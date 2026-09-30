import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 20: Vesper. Ink and champagne, after hours.
 * Champagne is the ICT gold with its chroma drawn down to 0.06 so it reads as
 * metal, not colour. It sits on a near-black navy with warm ivory text, and the
 * only cool note is steel blue for facts. 60-30-10: ink page, ivory and steel
 * for words, champagne for the one thing to press. Corners are nearly square
 * and lines are hairlines, so the page feels engraved rather than rounded.
 * Text pairs measured: ivory on ink 18.0:1, muted on ink 9.9:1, champagne on
 * ink 13.0:1, ink on champagne 13.0:1, steel on ink 6.3:1.
 */

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--vs-display",
})
const sans = Geist({ subsets: ["latin"], variable: "--vs-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--vs-mono" })

export const fontClass = `${display.variable} ${sans.variable} ${mono.variable}`
export const base = "/prototypes/vesper"

export const tokens = {
  "--k-bg": "#000820",
  "--k-ink": "#F8F3E6",
  "--k-muted": "#ACB8CB",
  "--k-line": "rgba(225,207,165,0.14)",
  "--k-line-hi": "rgba(225,207,165,0.36)",
  "--k-card": "#00132F",
  "--k-card-solid": "#00132F",
  "--k-shadow":
    "0 0 0 1px rgba(225,207,165,0.14), 0 34px 60px -36px rgba(0,0,0,0.9)",
  "--k-tile": "#0A1D3B",
  "--k-chip": "rgba(248,243,230,0.05)",
  "--k-hover": "rgba(225,207,165,0.11)",
  "--k-on": "#E1CFA5",
  "--k-on-ink": "#000820",
  "--k-accent": "#E1CFA5",
  "--k-accent-deep": "#AE9D73",
  "--k-accent-ink": "#000820",
  "--k-btn": "linear-gradient(180deg, #EBDDB9 0%, #E1CFA5 100%)",
  "--k-btn-shadow":
    "0 16px 30px -18px rgba(225,207,165,0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
  "--k-radius": "6px",
  "--k-inner": "4px",
  "--k-pill": "3px",
  "--k-chip-radius": "3px",
  "--k-scrim": "rgba(0,4,16,0.74)",
  "--k-frame": "#00132F",
  "--k-icon-bg": "rgba(248,243,230,0.08)",
  "--k-paper": "#F8F3E6",
  "--k-paper-ink": "#000820",
  "--k-paper-muted": "#354E6E",
  "--k-paper-line": "rgba(0,8,32,0.14)",
  "--k-danger": "#FF9F8B",
  "--k-field": "rgba(248,243,230,0.06)",
  "--k-book-a": "#0D2441",
  "--k-book-a-ink": "#E1CFA5",
  "--k-book-a-spine": "#00132F",
  "--k-book-b": "#E1CFA5",
  "--k-book-b-ink": "#000820",
  "--k-book-b-spine": "#AE9D73",
  "--k-book-c": "#F8F3E6",
  "--k-book-c-ink": "#000820",
  "--k-book-c-spine": "#D9D0BA",
  "--k-folder-back": "#1B3556",
  "--k-folder-front": "#0D2441",
  "--k-folder-paper": "#F8F3E6",
  "--k-folder-ink": "#F8F3E6",
  "--k-folder-muted": "#ACB8CB",
  "--k-display-font": "var(--vs-display)",
  "--k-sans": "var(--vs-sans)",
  "--k-label-font": "var(--vs-mono)",
  "--k-label-tracking": "0.16em",
  "--k-label-weight": "500",
  "--k-h1-size": "clamp(3.1rem, 8vw, 7.2rem)",
  "--k-h1-weight": "400",
  "--k-h1-leading": "0.94",
  "--k-h1-tracking": "-0.028em",
  "--k-h2-size": "clamp(2.3rem, 4.6vw, 4rem)",
  "--k-h2-weight": "400",
  "--k-h2-leading": "1",
  "--k-h2-tracking": "-0.022em",
  "--k-display-weight": "400",
  "--k-fact": "#8FA9CB",
  "--bk-shadow": "rgba(0,0,0,0.7)",
} as CSSProperties

export const themeCss = `
@property --vx { syntax: "<length-percentage>"; inherits: true; initial-value: 62%; }
@property --vy { syntax: "<length-percentage>"; inherits: true; initial-value: 36%; }

[data-k-navlink] { padding: 10px 13px; border-radius: 3px; font-size: 0.7rem; font-family: var(--vs-mono), monospace; text-transform: uppercase; letter-spacing: 0.14em; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="vesper"] [data-k-nav] { background: rgba(0, 8, 32, 0.82); }
[data-theme="vesper"] [data-k-logo] { border-radius: 3px; box-shadow: 0 0 0 1px var(--k-line-hi); }
[data-theme="vesper"] [data-k-brand] { font-family: var(--vs-display), serif; font-size: 1.3rem; letter-spacing: 0; }
[data-theme="vesper"] [data-k-progress] { height: 1px; background: #E1CFA5; }
[data-theme="vesper"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px var(--k-line-hi); font-weight: 500; }
[data-theme="vesper"] [data-k-tag] { padding: 5px 10px; font-size: 0.62rem; box-shadow: inset 0 0 0 1px var(--k-line-hi); border-radius: 2px; }
[data-theme="vesper"] [data-k-photo] { outline: 1px solid rgba(225, 207, 165, 0.16); outline-offset: -1px; }
[data-theme="vesper"] [data-k-tile] { box-shadow: inset 0 0 0 1px var(--k-line); }
[data-theme="vesper"] [data-k-btn], [data-theme="vesper"] [data-eq-btn]:not([data-quiet]), [data-theme="vesper"] [data-pm-btn]:not([data-quiet]), [data-theme="vesper"] [data-fb-read] { font-weight: 600; letter-spacing: 0.01em; }

/* A film of grain, so the ink is not a flat fill. */
[data-vs-grain] { position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E"); }
[data-vs-main] { position: relative; z-index: 2; }

/* The lamp: the headline is steel in the dark and champagne where the light falls. */
[data-vs-hero] { --vx: 62%; --vy: 36%; position: relative; }
[data-vs-moon] { position: absolute; z-index: 0; right: clamp(0px, 5vw, 80px); top: clamp(24px, 6vw, 96px); width: clamp(180px, 30vw, 430px); aspect-ratio: 1; border-radius: 999px; pointer-events: none;
  background: radial-gradient(circle at 34% 30%, rgba(255, 247, 223, 0.09), rgba(225, 207, 165, 0.03) 46%, rgba(225, 207, 165, 0) 70%); box-shadow: inset 0 0 0 1px rgba(225, 207, 165, 0.2); }
[data-vs-moon]::before { content: ""; position: absolute; inset: -34px; border-radius: 999px; box-shadow: 0 0 0 1px rgba(225, 207, 165, 0.1); }
[data-vs-moon]::after { content: ""; position: absolute; left: 12%; top: 14%; width: 7px; height: 7px; border-radius: 999px; background: #E1CFA5; box-shadow: 0 0 18px 4px rgba(225, 207, 165, 0.55); }
@media (max-width: 639px) { [data-vs-moon] { top: 88px; right: 4px; width: 118px; } [data-vs-moon]::before { inset: -18px; } }
@keyframes vs-float { from { transform: translateY(0); } to { transform: translateY(14px); } }
@media (prefers-reduced-motion: no-preference) { [data-vs-moon] { animation: vs-float 9s ease-in-out infinite alternate; } }
[data-vs-hero] > *:not([data-vs-moon]) { position: relative; z-index: 1; }
[data-vs-lit] { color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: radial-gradient(circle 380px at var(--vx) var(--vy), #FFF7DF 0%, #E1CFA5 24%, rgba(143, 169, 203, 0.62) 60%, rgba(143, 169, 203, 0.4) 100%); }
@keyframes vs-sweep { from { --vx: 6%; --vy: 70%; } to { --vx: 62%; --vy: 36%; } }
@media (prefers-reduced-motion: no-preference) {
  [data-vs-hero]:not([data-lit]) { animation: vs-sweep 2.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
  [data-vs-hero][data-lit] { transition: --vx 0.28s cubic-bezier(0.23, 1, 0.32, 1), --vy 0.28s cubic-bezier(0.23, 1, 0.32, 1); }
}
[data-vs-italic] { font-style: italic; }

/* Hairlines that draw themselves in as a chapter opens. */
[data-vs-rule] { display: block; height: 1px; background: var(--k-line-hi); transform-origin: 0 50%; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-vs-rule] { animation: vs-draw linear both; animation-timeline: view(); animation-range: entry 0% entry 90%; }
  }
}
@keyframes vs-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* Chapter numerals and the rail that follows you down the page. */
[data-vs-chapter] { font-family: var(--vs-mono), monospace; font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--k-accent-deep); }
[data-vs-rail] { display: none; }
@media (min-width: 1320px) {
  [data-vs-rail] { display: block; position: fixed; z-index: 30; left: 20px; top: 50%; transform: translateY(-50%); }
  [data-vs-rail] ol { display: grid; gap: 2px; }
  [data-vs-rail] a { position: relative; display: flex; align-items: center; gap: 10px; min-height: 30px; padding: 0 8px; border-radius: 3px; color: #6F84A0;
    font-family: var(--vs-mono), monospace; font-size: 0.66rem; letter-spacing: 0.14em; transition: color 0.2s ease-out; }
  [data-vs-rail] a::before { content: ""; width: 10px; height: 1px; background: currentColor; transition: width 0.35s cubic-bezier(0.23, 1, 0.32, 1); }
  [data-vs-rail] a[data-on] { color: #E1CFA5; }
  [data-vs-rail] a[data-on]::before { width: 22px; }
  [data-vs-rail] [data-vs-label] { position: absolute; left: 100%; margin-left: 8px; padding: 5px 9px; border-radius: 3px; white-space: nowrap; pointer-events: none;
    background: #0D2441; box-shadow: inset 0 0 0 1px var(--k-line-hi); color: var(--k-ink); opacity: 0; transform: translateX(-4px); transition: opacity 0.18s ease-out, transform 0.18s ease-out; text-transform: uppercase; }
  [data-vs-rail] a:hover [data-vs-label], [data-vs-rail] a:focus-visible [data-vs-label] { opacity: 1; transform: none; }
}

/* Roll of honour */
[data-vs-serial] { font-family: var(--vs-display), serif; font-size: clamp(6rem, 15vw, 12.5rem); line-height: 0.8; letter-spacing: -0.04em; color: transparent; -webkit-text-stroke: 1px #E1CFA5; font-variant-numeric: lining-nums; }
@media (hover: hover) and (pointer: fine) { [data-vs-honour]:hover [data-vs-serial] { color: #E1CFA5; } }
[data-vs-serial] { transition: color 0.5s cubic-bezier(0.23, 1, 0.32, 1); }

/* Faculty roll: names as an index, the portrait follows the pointer. */
[data-vs-row] { position: relative; display: grid; grid-template-columns: 2.6rem 1fr auto; align-items: baseline; gap: 12px; width: 100%; padding: 22px 0; text-align: left; border-top: 1px solid var(--k-line);
  transition: padding 0.35s cubic-bezier(0.23, 1, 0.32, 1); }
[data-vs-row] [data-vs-name] { font-family: var(--vs-display), serif; font-size: clamp(2rem, 4.4vw, 3.6rem); line-height: 1; color: #6F84A0; transition: color 0.3s ease-out, transform 0.4s cubic-bezier(0.23, 1, 0.32, 1); transform-origin: 0 60%; }
@media (hover: hover) and (pointer: fine) { [data-vs-row]:hover { padding-left: 12px; } [data-vs-row]:hover [data-vs-name] { color: var(--k-ink); } }
[data-vs-row][aria-expanded="true"] [data-vs-name] { color: #E1CFA5; font-style: italic; }
[data-vs-panel] { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
[data-vs-panel][data-open] { grid-template-rows: 1fr; }
[data-vs-panel] > div { overflow: hidden; }
[data-vs-float] { position: absolute; left: 0; top: 0; z-index: 5; width: 210px; aspect-ratio: 3 / 4; pointer-events: none; overflow: hidden; border-radius: 3px; box-shadow: 0 30px 50px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--k-line-hi); }
[data-vs-float] img { transition: opacity 0.22s ease-out; }

/* Catalogue: a title, a dotted leader, a price. */
[data-vs-cat] { display: block; padding: 20px 0; border-top: 1px solid var(--k-line); transition: padding 0.35s cubic-bezier(0.23, 1, 0.32, 1); }
[data-vs-cat] [data-vs-line] { display: flex; align-items: baseline; gap: 14px; }
[data-vs-cat] [data-vs-leader] { flex: 1; min-width: 24px; transform: translateY(-0.28em); border-bottom: 1px dotted var(--k-line-hi); }
[data-vs-cat] [data-vs-title] { font-family: var(--vs-display), serif; font-size: clamp(1.5rem, 2.6vw, 2.2rem); line-height: 1.05; transition: color 0.2s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-vs-cat]:hover, [data-vs-cat]:focus-visible { padding-left: 10px; } [data-vs-cat]:hover [data-vs-title] { color: #E1CFA5; } }
[data-vs-cat][data-on] [data-vs-title] { color: #E1CFA5; }
[data-vs-stage] { position: sticky; top: 96px; }
[data-vs-plate] { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; transform: translateY(10px) scale(0.985); transition: opacity 0.3s ease-out, transform 0.45s cubic-bezier(0.23, 1, 0.32, 1); pointer-events: none; }
[data-vs-plate][data-on] { opacity: 1; transform: none; pointer-events: auto; }
@media (prefers-reduced-motion: reduce) { [data-vs-plate], [data-vs-row], [data-vs-cat], [data-vs-panel] { transition: none; } }

/* Routes read on ink: four lines that are all distinct from champagne and ivory. */
[data-theme="vesper"] { --vs-route-apsc: #E1CFA5; --vs-route-adre: #8FB1DC; --vs-route-police: #86BBC7; --vs-route-banking: #F8F3E6; }
`
