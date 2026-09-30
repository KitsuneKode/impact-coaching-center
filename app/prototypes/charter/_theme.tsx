import { Figtree, Fraunces } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 21: Charter. Sapphire and bronze on a warm pearl page.
 * Bronze is the ICT gold pulled toward orange: warmer and quieter than yellow
 * gold, so it suits a heritage school without shouting. It is a fill and a
 * hairline, never small text on blue (bronze on sapphire is only 4.4:1), so on
 * blue the words are the lighter bronze (10.0:1) and on pearl the deep bronze
 * (8.1:1). 60-30-10: pearl page and white tiles, sapphire tiles, bronze.
 * The layout is a bento: every fact gets its own tile, sized by how much it
 * matters, and each tile has one small thing to do.
 * Measured: ink on pearl 18.6:1, sapphire on pearl 8.1:1, muted on pearl 7.9:1,
 * white on sapphire 11.9:1, ink on bronze 7.3:1.
 */

const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  variable: "--ch-display",
})
const sans = Figtree({ subsets: ["latin"], variable: "--ch-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/charter"

export const tokens = {
  "--k-bg": "#F8F7F2",
  "--k-ink": "#000624",
  "--k-muted": "#3A4D73",
  "--k-line": "rgba(0,6,36,0.1)",
  "--k-line-hi": "rgba(0,6,36,0.28)",
  "--k-card": "#FFFFFF",
  "--k-card-solid": "#FFFFFF",
  "--k-shadow":
    "0 0 0 1px rgba(0,6,36,0.07), 0 1px 2px rgba(0,6,36,0.04), 0 26px 44px -30px rgba(0,33,83,0.4)",
  "--k-tile": "#F1EFE7",
  "--k-chip": "#FFFFFF",
  "--k-hover": "#E8EEF8",
  "--k-on": "#174A92",
  "--k-on-ink": "#FFFFFF",
  "--k-accent": "#C99065",
  "--k-accent-deep": "#713F11",
  "--k-accent-ink": "#000624",
  "--k-btn": "linear-gradient(180deg, #DCA97F 0%, #C99065 100%)",
  "--k-btn-shadow":
    "0 14px 24px -14px rgba(113,63,17,0.55), inset 0 1px 0 rgba(255,255,255,0.45)",
  "--k-radius": "26px",
  "--k-inner": "16px",
  "--k-pill": "999px",
  "--k-scrim": "rgba(0,6,36,0.6)",
  "--k-frame": "#EEF3FB",
  "--k-icon-bg": "rgba(255,255,255,0.92)",
  "--k-paper": "#FFFFFF",
  "--k-paper-ink": "#000624",
  "--k-paper-muted": "#3A4D73",
  "--k-paper-line": "rgba(0,6,36,0.12)",
  "--k-danger": "#A63A24",
  "--k-field": "#FFFFFF",
  "--k-book-a": "#174A92",
  "--k-book-a-ink": "#FFFFFF",
  "--k-book-a-spine": "#002153",
  "--k-book-b": "#C99065",
  "--k-book-b-ink": "#000624",
  "--k-book-b-spine": "#A8744A",
  "--k-book-c": "#FFFFFF",
  "--k-book-c-ink": "#000624",
  "--k-book-c-spine": "#DCE6F6",
  "--k-folder-back": "#B9CDEE",
  "--k-folder-front": "#174A92",
  "--k-folder-paper": "#FFFFFF",
  "--k-folder-ink": "#FFFFFF",
  "--k-folder-muted": "#C7D6EE",
  "--k-display-font": "var(--ch-display)",
  "--k-sans": "var(--ch-sans)",
  "--k-label-font": "var(--ch-sans)",
  "--k-label-tracking": "0.12em",
  "--k-label-weight": "700",
  "--k-h1-size": "clamp(2.6rem, 5vw, 4.6rem)",
  "--k-h1-weight": "500",
  "--k-h1-leading": "1.02",
  "--k-h1-tracking": "-0.03em",
  "--k-h2-size": "clamp(1.9rem, 3.4vw, 3rem)",
  "--k-h2-weight": "500",
  "--k-h2-leading": "1.06",
  "--k-h2-tracking": "-0.028em",
  "--k-display-weight": "500",
  "--k-fact": "#174A92",
  "--bk-shadow": "rgba(0,33,83,0.5)",
} as CSSProperties

const DARK = `[data-ch-tile][data-tone="sapphire"], [data-ch-tile][data-tone="deep"], [data-ch-dark]`
const DARK_OUTLINE = DARK.split(", ")
  .map((s) => `${s} [data-k-outline]`)
  .join(", ")

export const themeCss = `
[data-theme="charter"] [data-k-display], [data-theme="charter"] [data-k-h1], [data-theme="charter"] [data-k-h2] { font-variation-settings: "SOFT" 70, "WONK" 0; font-optical-sizing: auto; font-variant-numeric: lining-nums; }
[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; font-size: 0.9rem; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="charter"] [data-k-nav] { background: rgba(248, 247, 242, 0.86); }
[data-theme="charter"] [data-k-logo] { border-radius: 14px; box-shadow: 0 0 0 1px var(--k-line), 0 6px 14px -8px rgba(0, 33, 83, 0.4); }
[data-theme="charter"] [data-k-brand] { font-family: var(--ch-display), serif; font-weight: 500; font-size: 1.05rem; letter-spacing: -0.01em; font-variation-settings: "SOFT" 70; }
[data-theme="charter"] [data-k-progress] { background: linear-gradient(90deg, #174A92, #C99065); }
[data-theme="charter"] [data-k-outline] { background: #fff; box-shadow: inset 0 0 0 1.5px var(--k-line-hi); font-weight: 600; }
[data-theme="charter"] [data-k-tag] { padding: 5px 12px; font-size: 0.66rem; background: #E8EEF8; color: #002153; box-shadow: none; }
[data-theme="charter"] [data-k-photo] { outline: 1px solid rgba(0, 6, 36, 0.1); outline-offset: -1px; }
[data-theme="charter"] [data-k-tile] { box-shadow: inset 0 0 0 1px var(--k-line); }
[data-theme="charter"] [data-k-btn], [data-theme="charter"] [data-eq-btn]:not([data-quiet]), [data-theme="charter"] [data-pm-btn]:not([data-quiet]), [data-theme="charter"] [data-fb-read] { font-weight: 700; }

/* On sapphire the tokens flip, so every shared block placed on a blue tile reads correctly. */
${DARK} { --k-ink: #FFFFFF; --k-muted: #C7D6EE; --k-line: rgba(255,255,255,0.16); --k-line-hi: rgba(255,255,255,0.42); --k-chip: rgba(255,255,255,0.08); --k-hover: rgba(255,255,255,0.14);
  --k-card-solid: #0A2E68; --k-tile: rgba(255,255,255,0.07); --k-on: #FEC396; --k-on-ink: #000624; --k-accent: #FEC396; --k-accent-deep: #FEC396; --k-accent-ink: #000624;
  --k-btn: linear-gradient(180deg, #FFD6B4 0%, #FEC396 100%); --k-btn-shadow: 0 14px 26px -14px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.6); --k-field: rgba(255,255,255,0.08);
  --eq-ink: #FFFFFF; --eq-muted: #C7D6EE; --eq-line: rgba(255,255,255,0.42); --eq-field: rgba(255,255,255,0.08); --eq-hover: rgba(255,255,255,0.14);
  --eq-accent: #FEC396; --eq-accent-ink: #000624; --eq-danger: #FFB4A4; --eq-btn-shadow: 0 14px 26px -14px rgba(0,0,0,0.6); color: #FFFFFF; }
${DARK_OUTLINE} { background: rgba(255,255,255,0.08); color: #fff; }

${DARK.split(", ")
  .map((x) => `${x} [data-k-tag]`)
  .join(", ")} { background: rgba(255,255,255,0.1); color: #FEC396; }
[data-ch-tile][data-tone="bronze"] [data-ch-label] { color: #000624; }
[data-ch-tile][data-flush] { padding: 0; }

/* Bento tiles */
[data-ch-tile] { position: relative; overflow: hidden; isolation: isolate; border-radius: 28px; padding: clamp(20px, 2.4vw, 32px); background: #fff; color: var(--k-ink);
  box-shadow: var(--k-shadow); transition: transform 0.4s var(--k-ease), box-shadow 0.4s var(--k-ease); }
[data-ch-tile][data-tone="pearl"] { background: #F1EFE7; box-shadow: inset 0 0 0 1px var(--k-line); }
[data-ch-tile][data-tone="sapphire"] { background: linear-gradient(158deg, #174A92 0%, #0A3573 56%, #002153 100%); box-shadow: 0 30px 50px -34px rgba(0, 33, 83, 0.75); }
[data-ch-tile][data-tone="deep"] { background: radial-gradient(70% 90% at 100% 100%, #0B3A7E 0%, transparent 62%), linear-gradient(170deg, #003478 0%, #002153 62%, #001638 100%); box-shadow: 0 30px 50px -34px rgba(0, 22, 56, 0.85); }
[data-ch-tile][data-tone="bronze"] { background: linear-gradient(158deg, #E2B08A 0%, #C99065 100%); color: #000624; box-shadow: 0 26px 44px -30px rgba(113, 63, 17, 0.55); }
[data-ch-tile]::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: 0; transition: opacity 0.35s ease-out;
  background: radial-gradient(360px circle at var(--sx, -400px) var(--sy, -400px), rgba(201, 144, 101, 0.16), transparent 62%); }
[data-ch-tile][data-tone="sapphire"]::before, [data-ch-tile][data-tone="deep"]::before { background: radial-gradient(380px circle at var(--sx, -400px) var(--sy, -400px), rgba(254, 195, 150, 0.16), transparent 62%); }
@media (hover: hover) and (pointer: fine) {
  [data-ch-tile]:hover::before { opacity: 1; }
  [data-ch-tile][data-lift]:hover { transform: translateY(-4px); }
}
[data-ch-label] { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--k-muted); }
[data-ch-num] { font-family: var(--ch-display), serif; font-variation-settings: "SOFT" 70; font-variant-numeric: lining-nums tabular-nums; font-weight: 500; letter-spacing: -0.04em; line-height: 0.9; }

/* A hairline bezel that turns very slowly behind the hero. */
[data-ch-rings] { position: absolute; z-index: -1; right: -230px; bottom: -270px; width: 660px; aspect-ratio: 1; border-radius: 999px; pointer-events: none;
  background: repeating-radial-gradient(circle at 50% 50%, transparent 0 52px, rgba(254, 195, 150, 0.16) 52px 53px); }
[data-ch-rings]::before { content: ""; position: absolute; inset: 22px; border-radius: 999px;
  background: repeating-conic-gradient(from 0deg, rgba(254, 195, 150, 0.34) 0 0.35deg, transparent 0.35deg 3deg);
  -webkit-mask-image: radial-gradient(circle, transparent 64%, #000 64.4%, #000 68%, transparent 68.4%); mask-image: radial-gradient(circle, transparent 64%, #000 64.4%, #000 68%, transparent 68.4%); }
@keyframes ch-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: no-preference) { [data-ch-rings]::before { animation: ch-turn 120s linear infinite; } }
[data-ch-em] { font-style: italic; color: #FEC396; }

/* Chips */
[data-ch-chip] { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 999px; font-size: 0.9rem; font-weight: 600; background: #fff; color: var(--k-ink); box-shadow: inset 0 0 0 1px var(--k-line-hi);
  transition: transform 0.16s var(--k-ease), background-color 0.2s ease-out, color 0.2s ease-out, box-shadow 0.2s ease-out; }
[data-ch-chip]:active { transform: scale(0.96); }
[data-ch-chip][data-on] { background: #174A92; color: #fff; box-shadow: none; }
@media (hover: hover) and (pointer: fine) { [data-ch-chip]:not([data-on]):hover { background: #E8EEF8; } }

/* Faculty cards that open as you point at them. */
[data-ch-fan] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
[data-ch-fan] > a { position: relative; display: block; overflow: hidden; border-radius: 22px; aspect-ratio: 3 / 4; background: #002153; }
[data-ch-fan] > a img { object-fit: cover; object-position: top; transition: transform 0.6s var(--k-ease); }
[data-ch-fan] > a::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 46%, rgba(0, 6, 36, 0.9)); pointer-events: none; }
[data-ch-fan] [data-ch-cap] { position: absolute; inset: auto 0 0 0; z-index: 1; padding: 16px; color: #fff; }
[data-ch-fan] [data-ch-cap] span:last-child { display: block; font-size: 0.82rem; color: #C7D6EE; }
@media (min-width: 900px) {
  [data-ch-fan] { display: flex; gap: 10px; height: 360px; }
  [data-ch-fan] > a { flex: 1 1 0; aspect-ratio: auto; transition: flex-grow 0.55s var(--k-ease); }
  [data-ch-fan] [data-ch-cap] span:last-child { opacity: 0; transform: translateY(6px); transition: opacity 0.25s ease-out, transform 0.4s var(--k-ease); }
  [data-ch-fan] > a:hover, [data-ch-fan] > a:focus-visible { flex-grow: 2.7; }
  [data-ch-fan] > a:hover [data-ch-cap] span:last-child, [data-ch-fan] > a:focus-visible [data-ch-cap] span:last-child { opacity: 1; transform: none; }
  [data-ch-fan] > a:hover img { transform: scale(1.04); }
}
@media (prefers-reduced-motion: reduce) { [data-ch-fan] > a, [data-ch-tile] { transition: none; } }
`
