import { Plus_Jakarta_Sans, Sora } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 18: Meridian. Royal blue and gold on a cool white page.
 * Split-complementary: an antique gold (about 84 degrees, low chroma) against
 * the two blues either side of its opposite, a calm cobalt (262) and azure
 * (225). Neutrals are a warm pearl so the gold and the page share a temperature. 60-30-10: a cool
 * white page, royal and navy as the structure, gold as the one spotlight.
 * Azure is for facts (timings, counts, info) and never for actions. Every
 * text pair was checked: cobalt on white 6.1:1, navy on gold 9.9:1, deep gold
 * on white 6.1:1, azure on white 5.9:1.
 */

const display = Sora({ subsets: ["latin"], variable: "--mr-display" })
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--mr-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/meridian"

const GOLD_BTN = "linear-gradient(180deg, #E3C27C 0%, #D7B265 100%)"

export const tokens = {
  "--k-bg": "#F8F7F2",
  "--k-ink": "#000820",
  "--k-muted": "#354E6E",
  "--k-line": "rgba(0,8,32,0.11)",
  "--k-line-hi": "rgba(0,8,32,0.3)",
  "--k-card": "#FFFFFF",
  "--k-card-solid": "#FFFFFF",
  "--k-shadow":
    "0 0 0 1px rgba(0,8,32,0.09), 0 26px 44px -30px rgba(0,8,32,0.5)",
  "--k-tile": "#F8F7F2",
  "--k-chip": "#FFFFFF",
  "--k-hover": "#DCE9FF",
  "--k-on": "#3660AF",
  "--k-on-ink": "#FFFFFF",
  "--k-accent": "#D7B265",
  "--k-accent-deep": "#7F5D00",
  "--k-accent-ink": "#000820",
  "--k-btn": GOLD_BTN,
  "--k-btn-shadow":
    "0 14px 26px -14px rgba(127,93,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
  "--k-radius": "22px",
  "--k-inner": "14px",
  "--k-pill": "999px",
  "--k-scrim": "rgba(0,8,32,0.6)",
  "--k-frame": "#F7FAFF",
  "--k-icon-bg": "rgba(255,255,255,0.9)",
  "--k-paper": "#FFFFFF",
  "--k-paper-ink": "#000820",
  "--k-paper-muted": "#354E6E",
  "--k-paper-line": "rgba(0,8,32,0.12)",
  "--k-danger": "#A63A24",
  "--k-field": "#FFFFFF",
  "--k-book-a": "#3660AF",
  "--k-book-a-ink": "#FFFFFF",
  "--k-book-a-spine": "#214895",
  "--k-book-b": "#D7B265",
  "--k-book-b-ink": "#000820",
  "--k-book-b-spine": "#BD994C",
  "--k-book-c": "#FFFFFF",
  "--k-book-c-ink": "#000820",
  "--k-book-c-spine": "#DCE9FF",
  "--k-folder-back": "#B9D2FE",
  "--k-folder-front": "#214895",
  "--k-folder-paper": "#FFFFFF",
  "--k-folder-ink": "#FFFFFF",
  "--k-folder-muted": "#DCE9FF",
  "--k-display-font": "var(--mr-display)",
  "--k-sans": "var(--mr-sans)",
  "--k-label-font": "var(--mr-sans)",
  "--k-label-tracking": "0.1em",
  "--k-label-weight": "700",
  "--k-h1-size": "clamp(2.4rem, 5vw, 4.3rem)",
  "--k-h1-weight": "700",
  "--k-h1-leading": "1.04",
  "--k-h1-tracking": "-0.035em",
  "--k-h2-size": "clamp(1.85rem, 3.5vw, 2.9rem)",
  "--k-h2-weight": "700",
  "--k-h2-tracking": "-0.03em",
  "--k-display-weight": "600",
  "--k-fact": "#2B6C83",
  "--bk-shadow": "rgba(0,8,32,0.45)",
} as CSSProperties

export const themeCss = `
[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; font-size: 0.9rem; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="meridian"] [data-k-nav] { background: rgba(240, 245, 254, 0.86); }
[data-theme="meridian"] [data-k-logo] { border-radius: 12px; box-shadow: 0 0 0 1px var(--k-line), 0 6px 14px -8px rgba(0, 8, 32, 0.4); }
[data-theme="meridian"] [data-k-brand] { font-family: var(--mr-display), sans-serif; font-weight: 700; font-size: 0.95rem; letter-spacing: -0.02em; }
[data-theme="meridian"] [data-k-progress] { background: linear-gradient(90deg, #3660AF, #D7B265); }
[data-theme="meridian"] [data-k-outline] { background: #fff; box-shadow: inset 0 0 0 1.5px var(--k-line-hi); font-weight: 600; }
[data-theme="meridian"] [data-k-tag] { padding: 5px 12px; font-size: 0.68rem; background: #DCE9FF; color: #214895; box-shadow: none; }
[data-theme="meridian"] [data-k-photo] { outline: 1px solid rgba(0, 8, 32, 0.1); outline-offset: -1px; }
[data-theme="meridian"] [data-k-tile] { box-shadow: inset 0 0 0 1px var(--k-line); }
[data-theme="meridian"] [data-k-btn], [data-theme="meridian"] [data-eq-btn]:not([data-quiet]), [data-theme="meridian"] [data-pm-btn]:not([data-quiet]), [data-theme="meridian"] [data-fb-read] { font-weight: 700; }

/* The hero: a royal field with the sun at high noon behind it. */
[data-mr-hero] { position: relative; overflow: hidden; color: #fff; background:
  radial-gradient(44% 70% at 88% 4%, rgba(144, 183, 255, 0.34), transparent 62%),
  radial-gradient(70% 90% at 0% 100%, #214895, transparent 60%),
  linear-gradient(160deg, #3660AF 0%, #214895 58%, #0A317C 100%); }
[data-mr-hero]::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1.4px); background-size: 26px 26px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 85%); mask-image: linear-gradient(180deg, #000, transparent 85%); }
[data-mr-hero] [data-k-outline] { background: transparent; color: #fff; box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.55); }
@media (hover: hover) and (pointer: fine) { [data-mr-hero] [data-k-outline]:hover { background: rgba(255, 255, 255, 0.12); } }
[data-mr-hero] [data-k-muted] { color: #DCE9FF; }
[data-mr-sun] { position: absolute; right: 8%; top: -180px; width: 420px; height: 420px; border-radius: 999px; pointer-events: none;
  background: radial-gradient(circle at 40% 40%, rgba(220, 233, 255, 0.42), rgba(144, 183, 255, 0.16) 45%, transparent 68%); }
@keyframes mr-breathe { from { transform: scale(1); opacity: 0.85; } to { transform: scale(1.06); opacity: 1; } }
@media (prefers-reduced-motion: no-preference) { [data-mr-sun] { animation: mr-breathe 7s ease-in-out infinite alternate; } }
[data-mr-mark] { color: #fff; padding: 0 0.1em; margin: 0 -0.1em; -webkit-box-decoration-break: clone; box-decoration-break: clone; background: linear-gradient(transparent 82%, #D7B265 82%, #D7B265 95%, transparent 95%); }

/* Medals: a gold ring for a rank, drawn in CSS */
[data-mr-medal] { position: relative; display: grid; place-items: center; width: 116px; height: 116px; border-radius: 999px; flex: none;
  background: radial-gradient(circle at 34% 28%, #F7E4B0, #D7B265 62%, #BD994C); color: #000820; box-shadow: 0 16px 28px -14px rgba(127, 93, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.6); }
[data-mr-medal]::after { content: ""; position: absolute; inset: 7px; border-radius: 999px; border: 1.5px solid rgba(0, 8, 32, 0.35); }
[data-mr-ring] { padding: 4px; border-radius: 999px; background: conic-gradient(from 210deg, #F7E4B0, #D7B265, #BD994C, #E3C27C, #F7E4B0); }
@media (prefers-reduced-motion: reduce) { [data-mr-sun] { animation: none; } }
`
