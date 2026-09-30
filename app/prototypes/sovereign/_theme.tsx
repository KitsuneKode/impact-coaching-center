import { Cormorant_Garamond, Manrope } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 17: Sovereign. Deep navy and gold, drawn like a charter.
 * Complementary pair: a true Oxford-style navy (hue 255, chroma 0.06) and an
 * antique gold (hue 84, chroma 0.105), so they sit opposite each other on the
 * wheel. The gold is a metal, not a highlighter: low chroma, warm ivory
 * neutrals to match its temperature. Gold is kept to about a tenth of the
 * surface (the 60-30-10 rule) and used as foil, hairline and seal, never as a
 * flat wash. Every ramp holds hue and chroma and steps lightness in OKLCH.
 * The serif is used because the brief is institutional and heritage: the
 * officer's rank, the merit list, the charter.
 */

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--sv-display",
})
const sans = Manrope({ subsets: ["latin"], variable: "--sv-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/sovereign"

const FOIL =
  "linear-gradient(110deg, #F7E4B0 0%, #F2CC7E 24%, #D7B265 50%, #BD994C 70%, #F2CC7E 88%, #F7E4B0 100%) 0 0 / 240% 100%"

export const tokens = {
  "--k-bg": "#000820",
  "--k-ink": "#F8F3E6",
  "--k-muted": "#ACB8CB",
  "--k-line": "rgba(172,184,203,0.16)",
  "--k-line-hi": "rgba(215,178,101,0.4)",
  "--k-card": "linear-gradient(180deg, #0D2441 0%, #00132F 100%)",
  "--k-card-solid": "#0D2441",
  "--k-shadow":
    "inset 0 0 0 1px rgba(215,178,101,0.34), inset 0 0 0 6px #00132F, inset 0 0 0 7px rgba(215,178,101,0.14), 0 30px 50px -30px rgba(0,8,32,0.95)",
  "--k-tile": "#00102A",
  "--k-chip": "rgba(255,255,255,0.03)",
  "--k-hover": "rgba(215,178,101,0.1)",
  "--k-on": FOIL,
  "--k-on-ink": "#000820",
  "--k-accent": "#D7B265",
  "--k-accent-deep": "#BD994C",
  "--k-accent-ink": "#000820",
  "--k-btn": FOIL,
  "--k-btn-shadow":
    "0 14px 28px -14px rgba(215,178,101,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
  "--k-radius": "6px",
  "--k-inner": "4px",
  "--k-pill": "4px",
  "--k-chip-radius": "4px",
  "--k-scrim": "rgba(0,8,32,0.78)",
  "--k-frame": "#000820",
  "--k-icon-bg": "rgba(0,8,32,0.62)",
  "--k-paper": "#F8F3E6",
  "--k-paper-ink": "#000820",
  "--k-paper-muted": "#354E6E",
  "--k-paper-line": "rgba(0,8,32,0.14)",
  "--k-danger": "#F2A08F",
  "--k-field": "#00102A",
  "--k-book-a": "#D7B265",
  "--k-book-a-ink": "#000820",
  "--k-book-a-spine": "#BD994C",
  "--k-book-b": "#213957",
  "--k-book-b-ink": "#F8F3E6",
  "--k-book-b-spine": "#0D2441",
  "--k-book-c": "#F8F3E6",
  "--k-book-c-ink": "#000820",
  "--k-book-c-spine": "#D8CFB6",
  "--k-folder-back": "#213957",
  "--k-folder-front": "#0D2441",
  "--k-folder-paper": "#F8F3E6",
  "--k-folder-ink": "#F8F3E6",
  "--k-folder-muted": "#ACB8CB",
  "--k-display-font": "var(--sv-display)",
  "--k-sans": "var(--sv-sans)",
  "--k-label-font": "var(--sv-sans)",
  "--k-label-tracking": "0.18em",
  "--k-label-weight": "700",
  "--k-h1-size": "clamp(2.7rem, 5.8vw, 5.2rem)",
  "--k-h1-weight": "600",
  "--k-h1-leading": "1.02",
  "--k-h1-tracking": "-0.012em",
  "--k-h2-size": "clamp(2rem, 4vw, 3.4rem)",
  "--k-h2-weight": "600",
  "--k-h2-leading": "1.04",
  "--k-h2-tracking": "-0.01em",
  "--k-display-weight": "600",
  "--bk-shadow": "rgba(0,8,32,0.8)",
} as CSSProperties

export const themeCss = `
[data-theme="sovereign"] { font-feature-settings: "lnum" 1; background:
  radial-gradient(70% 46% at 84% -8%, rgba(33, 57, 87, 0.7), transparent 62%),
  radial-gradient(60% 40% at 6% 40%, rgba(13, 36, 65, 0.55), transparent 64%),
  var(--k-bg); }
[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; font-size: 0.875rem; letter-spacing: 0.02em; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="sovereign"] [data-k-nav] { background: rgba(0, 8, 32, 0.78); box-shadow: 0 1px 0 rgba(215, 178, 101, 0.28); }
[data-theme="sovereign"] [data-k-logo] { border-radius: 999px; background: #F8F3E6; box-shadow: 0 0 0 2px #000820, 0 0 0 3px var(--k-accent); }
[data-theme="sovereign"] [data-k-brand] { font-family: var(--sv-display), serif; font-weight: 600; font-size: 1.25rem; letter-spacing: 0.01em; }
[data-theme="sovereign"] [data-k-progress] { background: linear-gradient(90deg, #BD994C, #F7E4B0); }
[data-theme="sovereign"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px var(--k-line-hi); font-weight: 600; }
[data-theme="sovereign"] [data-k-tag] { padding: 5px 12px; font-size: 0.66rem; color: #F7E4B0; box-shadow: inset 0 0 0 1px rgba(215, 178, 101, 0.5); }
[data-theme="sovereign"] [data-k-tile] { box-shadow: inset 0 0 0 1px var(--k-line); }
[data-theme="sovereign"] [data-k-photo] { outline: 1px solid rgba(215, 178, 101, 0.35); outline-offset: -1px; }
[data-theme="sovereign"] [data-k-avatar] { outline: 1px solid rgba(215, 178, 101, 0.6); box-shadow: 0 0 0 2px #000820; }
[data-theme="sovereign"] h1, [data-theme="sovereign"] h2 { font-optical-sizing: auto; }

/* Foil: the sheen slides across on hover, once. */
[data-theme="sovereign"] [data-k-btn], [data-theme="sovereign"] [data-pm-btn]:not([data-quiet]), [data-theme="sovereign"] [data-eq-btn]:not([data-quiet]):not(:disabled), [data-theme="sovereign"] [data-fb-read] {
  background: var(--k-btn); transition: background-position 0.75s var(--k-ease), transform 0.16s var(--k-ease), filter 0.2s ease-out; }
@media (hover: hover) and (pointer: fine) {
  [data-theme="sovereign"] [data-k-btn]:hover, [data-theme="sovereign"] [data-pm-btn]:not([data-quiet]):hover, [data-theme="sovereign"] [data-eq-btn]:not([data-quiet]):hover, [data-theme="sovereign"] [data-fb-read]:hover { background-position: 100% 0; filter: none; }
}
[data-sv-foil] { background: linear-gradient(100deg, #F7E4B0 0%, #F2CC7E 30%, #D7B265 55%, #F2CC7E 78%, #F7E4B0 100%) 0 0 / 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; font-style: italic; padding-right: 0.06em; }
@keyframes sv-sheen { from { background-position: 0 0; } to { background-position: 100% 0; } }
@media (prefers-reduced-motion: no-preference) { [data-sv-foil] { animation: sv-sheen 9s ease-in-out infinite alternate; } }

/* The rosette behind the page: a sunburst and rings, faint enough to read as paper security print. */
[data-sv-rosette] { position: fixed; z-index: 0; top: -22vmax; right: -18vmax; width: 70vmax; height: 70vmax; pointer-events: none; opacity: 0.9;
  background:
    repeating-conic-gradient(from 0deg at 50% 50%, rgba(215, 178, 101, 0.07) 0deg 0.6deg, transparent 0.6deg 4deg),
    repeating-radial-gradient(circle at 50% 50%, transparent 0 22px, rgba(215, 178, 101, 0.06) 22px 23px);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 68%); mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 68%); }
@keyframes sv-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: no-preference) { [data-sv-rosette] { animation: sv-turn 240s linear infinite; } }
[data-theme="sovereign"] main, [data-theme="sovereign"] footer, [data-theme="sovereign"] [data-k-header] { position: relative; z-index: 1; }

/* Gold hairline with a diamond in the middle */
[data-sv-rule] { display: flex; align-items: center; gap: 14px; color: var(--k-accent); }
[data-sv-rule]::before, [data-sv-rule]::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(215, 178, 101, 0.55)); }
[data-sv-rule]::after { background: linear-gradient(270deg, transparent, rgba(215, 178, 101, 0.55)); }
[data-sv-rule] i { width: 7px; height: 7px; transform: rotate(45deg); background: var(--k-accent); }

/* Seal: a gold ring turning slowly round the ICT mark */
[data-sv-seal] { position: relative; display: grid; place-items: center; width: 92px; height: 92px; border-radius: 999px; background: #F8F3E6; }
[data-sv-seal]::before { content: ""; position: absolute; inset: -7px; border-radius: 999px; background: conic-gradient(from 0deg, #F7E4B0, #BD994C, #F2CC7E, #D7B265, #F7E4B0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); }
[data-sv-seal]::after { content: ""; position: absolute; inset: -14px; border-radius: 999px; border: 1px dashed rgba(215, 178, 101, 0.5); }
@media (prefers-reduced-motion: no-preference) { [data-sv-seal]::after { animation: sv-turn 40s linear infinite; } }

/* Merit list */
[data-sv-rank] { font-family: var(--sv-display), serif; font-weight: 600; font-size: clamp(3.4rem, 8vw, 6.4rem); line-height: 0.85; font-variant-numeric: lining-nums tabular-nums;
  background: linear-gradient(180deg, #F7E4B0, #D7B265 55%, #BD994C); -webkit-background-clip: text; background-clip: text; color: transparent; }
[data-sv-arch] { border-radius: 999px 999px 4px 4px; }
[data-sv-row] { position: relative; }
[data-sv-row]::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, transparent, var(--k-accent), transparent); transform: scaleY(0); transition: transform 0.3s var(--k-ease); }
@media (hover: hover) and (pointer: fine) { [data-sv-row]:hover::before { transform: scaleY(1); } [data-sv-row]:hover { background: var(--k-hover); } }
@media (prefers-reduced-motion: reduce) { [data-sv-rosette], [data-sv-seal]::after { animation: none; } [data-sv-foil] { animation: none; } }
`
