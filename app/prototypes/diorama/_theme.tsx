import { Instrument_Sans, Martian_Mono } from "next/font/google"

/**
 * Prototype 23: Diorama. The Sapphire and Bronze palette (sapphire hue 258,
 * bronze a gold pulled toward orange) on warm pearl, drawn as isometric line
 * models: the classroom, the library, the app and the books, each on its own
 * plinth, each one you can lift. The page sits on a faint isometric grid, like
 * a drafting table.
 */

const sans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--dm-sans",
})
const mono = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--dm-mono",
})

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/diorama"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

/** Lines at 30 and 150 degrees, the isometric lattice. */
const GRID =
  "repeating-linear-gradient(30deg, rgba(23,74,146,0.07) 0 1px, transparent 1px 34.64px), repeating-linear-gradient(150deg, rgba(23,74,146,0.07) 0 1px, transparent 1px 34.64px)"

export const tokens = {}

export const themeCss = `
[data-theme="diorama"] {
  ${vars({
    "--k-bg": "#F8F7F2",
    "--k-ink": "#000624",
    "--k-muted": "#3C4966",
    "--k-line": "rgba(0,6,36,0.12)",
    "--k-line-hi": "rgba(0,6,36,0.9)",
    "--k-card": "#FFFFFF",
    "--k-card-solid": "#FFFFFF",
    "--k-shadow": "0 0 0 1.25px #000624, 4px 4px 0 0 #000624",
    "--k-tile": "#F2F0EA",
    "--k-chip": "#FFFFFF",
    "--k-hover": "#E9EEF8",
    "--k-on": "#174A92",
    "--k-on-ink": "#FFFFFF",
    "--k-accent": "#C99065",
    "--k-accent-deep": "#713F11",
    "--k-accent-ink": "#000624",
    "--k-btn": "#174A92",
    "--k-btn-shadow": "0 0 0 1.25px #000624, 3px 3px 0 0 #000624",
    "--k-scrim": "rgba(0,6,36,0.6)",
    "--k-frame": "#F2F0EA",
    "--k-icon-bg": "rgba(255,255,255,0.92)",
    "--k-paper": "#FFFFFF",
    "--k-paper-ink": "#000624",
    "--k-paper-muted": "#3C4966",
    "--k-paper-line": "rgba(0,6,36,0.14)",
    "--k-danger": "#A63A24",
    "--k-field": "#FFFFFF",
    "--k-fact": "#174A92",
    "--k-book-a": "#174A92",
    "--k-book-a-ink": "#FFFFFF",
    "--k-book-a-spine": "#002153",
    "--k-book-b": "#C99065",
    "--k-book-b-ink": "#000624",
    "--k-book-b-spine": "#A97248",
    "--k-book-c": "#FFFFFF",
    "--k-book-c-ink": "#000624",
    "--k-book-c-spine": "#E4E1D8",
    "--k-folder-back": "#E3A97D",
    "--k-folder-front": "#174A92",
    "--k-folder-paper": "#FFFFFF",
    "--k-folder-ink": "#FFFFFF",
    "--k-folder-muted": "#B6D3FE",
    "--bk-shadow": "rgba(0,6,36,0.4)",
    "--k-radius": "14px",
    "--k-inner": "10px",
    "--k-pill": "10px",
    "--k-chip-radius": "10px",
    "--k-display-font": "var(--dm-sans)",
    "--k-sans": "var(--dm-sans)",
    "--k-mono": "var(--dm-mono)",
    "--k-label-font": "var(--dm-mono)",
    "--k-label-tracking": "0.04em",
    "--k-label-weight": "400",
    "--k-h1-size": "clamp(2.5rem, 4.6vw, 4.4rem)",
    "--k-h1-weight": "600",
    "--k-h1-leading": "0.98",
    "--k-h1-tracking": "-0.04em",
    "--k-h2-size": "clamp(2rem, 3.8vw, 3.3rem)",
    "--k-h2-weight": "600",
    "--k-h2-leading": "1",
    "--k-h2-tracking": "-0.035em",
    "--k-display-weight": "600",
    "--dm-grid": GRID,
  })}
  background: var(--k-bg);
}

[data-theme="diorama"] [data-k-nav] { background: color-mix(in oklab, #F8F7F2 86%, transparent); box-shadow: 0 1.25px 0 #000624; }
[data-theme="diorama"] [data-k-navlink] { padding: 9px 12px; border-radius: 10px; font-size: 0.9rem; font-weight: 500; color: #000624; white-space: nowrap; transition: background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-theme="diorama"] [data-k-navlink]:hover { background: #E9EEF8; } }
[data-theme="diorama"] [data-k-brand] { font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
[data-theme="diorama"] [data-k-logo] { border-radius: 10px; box-shadow: 0 0 0 1.25px #000624, 2px 2px 0 0 #000624; }
[data-theme="diorama"] [data-k-progress] { background: #C99065; height: 3px; }
[data-theme="diorama"] [data-k-outline] { background: #FFFFFF; box-shadow: 0 0 0 1.25px #000624, 3px 3px 0 0 #000624; font-weight: 600; }
[data-theme="diorama"] [data-k-btn] { color: #FFFFFF; font-weight: 600; }
/* Buttons sit on their shadow and press down into it */
[data-theme="diorama"] [data-k-press] { transition: transform 0.12s ease-out, box-shadow 0.12s ease-out; }
[data-theme="diorama"] [data-k-press]:active { transform: translate(3px, 3px); box-shadow: 0 0 0 1.25px #000624, 0 0 0 0 #000624; }
@media (hover: hover) and (pointer: fine) {
  [data-theme="diorama"] [data-k-btn]:hover { filter: none; background: #2F62AC; }
  [data-theme="diorama"] [data-k-outline]:hover { background: #E9EEF8; }
}
[data-theme="diorama"] [data-k-card] { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
[data-theme="diorama"] a[data-k-card]:hover { transform: translate(-2px, -2px); box-shadow: 0 0 0 1.25px #000624, 6px 6px 0 0 #000624; }
[data-theme="diorama"] [data-k-tile] { box-shadow: 0 0 0 1.25px rgba(0,6,36,0.18); }
[data-theme="diorama"] [data-k-photo] { outline: 1.25px solid #000624; outline-offset: -1px; }

[data-dm-mono] { font-family: var(--dm-mono), monospace; font-size: 0.68rem; letter-spacing: 0.04em; text-transform: uppercase; }
[data-dm-grid] { background-image: var(--dm-grid); }

/* ---------- Hero campus ---------- */
[data-dm-hero] { position: relative; isolation: isolate; }
[data-dm-hero]::before { content: ""; position: absolute; inset: -68px 0 0 0; z-index: -1; background-image: var(--dm-grid);
  -webkit-mask-image: radial-gradient(80% 90% at 70% 40%, #000 30%, transparent 80%); mask-image: radial-gradient(80% 90% at 70% 40%, #000 30%, transparent 80%); }
[data-dm-campus] { position: relative; }
[data-dm-campus] svg { width: 100%; height: auto; overflow: visible; }
[data-dm-island] { cursor: pointer; outline: none; }
[data-dm-lift] { transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1); }
[data-dm-island] [data-iso-shade] { transform-box: fill-box; transform-origin: center; transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.5s ease-out; }
[data-dm-island]:hover [data-dm-lift], [data-dm-island]:focus-visible [data-dm-lift] { transform: translateY(-14px); }
[data-dm-island]:hover [data-iso-shade], [data-dm-island]:focus-visible [data-iso-shade] { transform: translateY(14px) scale(0.82); opacity: 0.08; }
@keyframes dm-drop { from { opacity: 0; transform: translateY(-40px); } }
@media (prefers-reduced-motion: no-preference) {
  [data-dm-drop] { animation: dm-drop 0.9s cubic-bezier(0.34, 1.25, 0.64, 1) both; animation-delay: var(--d, 0s); }
}
[data-dm-tag] { position: absolute; transform: translate(-50%, -100%); display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; white-space: nowrap; pointer-events: none;
  background: #FFFFFF; box-shadow: 0 0 0 1.25px #000624, 2px 2px 0 0 #000624; font-size: 0.8rem; font-weight: 600; transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1); }
[data-dm-tag][data-below] { transform: translate(-50%, 45%); }
[data-dm-tag] i { display: block; width: 8px; height: 8px; border-radius: 2px; background: var(--dot); box-shadow: 0 0 0 1px #000624; }
[data-dm-campus]:has([data-dm-island="0"]:is(:hover, :focus-visible)) [data-dm-tag="0"],
[data-dm-campus]:has([data-dm-island="1"]:is(:hover, :focus-visible)) [data-dm-tag="1"],
[data-dm-campus]:has([data-dm-island="2"]:is(:hover, :focus-visible)) [data-dm-tag="2"],
[data-dm-campus]:has([data-dm-island="3"]:is(:hover, :focus-visible)) [data-dm-tag="3"] { transform: translate(-50%, calc(-100% - 14px)); }
[data-dm-campus]:has([data-dm-island="3"]:is(:hover, :focus-visible)) [data-dm-tag="3"][data-below] { transform: translate(-50%, 45%); }

/* Models in cards float a little when the card is pointed at */
[data-dm-model] svg { width: 100%; height: auto; overflow: visible; }
[data-dm-model] svg > g { transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1); }
@media (hover: hover) and (pointer: fine) { a:hover [data-dm-model] svg > g { transform: translateY(-8px); } }
[data-dm-stage] { background-color: #EEF2FA; background-image: var(--dm-grid); border-bottom: 1.25px solid #000624; }

/* Closing */
[data-dm-closing] { position: relative; overflow: hidden; border-radius: 18px; color: #FFFFFF; background-color: #174A92;
  background-image: repeating-linear-gradient(30deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 34.64px), repeating-linear-gradient(150deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 34.64px);
  box-shadow: 0 0 0 1.25px #000624, 6px 6px 0 0 #000624; }
[data-dm-light] { background: #FFFFFF; color: #000624; box-shadow: 0 0 0 1.25px #000624, 3px 3px 0 0 #000624; }

[data-theme="diorama"] [data-gf] { border-top: 1.25px solid #000624; --gf-word-lit: linear-gradient(180deg, #4C80CD, #174A92); --gf-word: rgba(23,74,146,0.08); --gf-word-weight: 700; }
[data-theme="diorama"] [data-gf-box] { box-shadow: 0 0 0 1.25px #000624; }
[data-theme="diorama"] [data-gf-seal] { box-shadow: 0 0 0 1.25px #000624, 2px 2px 0 0 #000624; background: #FFFFFF; }

[data-k-faq] summary { list-style: none; }
`
