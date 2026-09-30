import { Bricolage_Grotesque, Caveat, Hanken_Grotesk } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 15: Notebook. A study notebook: cool graph paper, blue-black ink,
 * one highlighter yellow. Buttons are stickers that push down; key words get
 * a marker sweep; batches sit on a planner. Colour: paper and ink, one accent.
 */

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--nb-display",
  axes: ["opsz", "wdth"],
})
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--nb-sans" })
const hand = Caveat({ subsets: ["latin"], variable: "--nb-hand" })

export const fontClass = `${display.variable} ${sans.variable} ${hand.variable}`
export const base = "/prototypes/notebook"

export const tokens = {
  "--k-bg": "#EDF1F8",
  "--k-ink": "#101B4D",
  "--k-muted": "#4B5788",
  "--k-line": "rgba(16,27,77,0.14)",
  "--k-line-hi": "rgba(16,27,77,0.42)",
  "--k-card": "#FFFFFF",
  "--k-card-solid": "#FFFFFF",
  "--k-shadow": "0 0 0 1.5px #101B4D, 5px 6px 0 rgba(16,27,77,0.13)",
  "--k-tile": "#F3F6FC",
  "--k-chip": "#FFFFFF",
  "--k-hover": "#FFF3B0",
  "--k-on": "#101B4D",
  "--k-on-ink": "#FFFFFF",
  "--k-accent": "#FFE14D",
  "--k-accent-deep": "#8A6A00",
  "--k-accent-ink": "#101B4D",
  "--k-btn": "#FFE14D",
  "--k-btn-shadow": "0 0 0 1.5px #101B4D, 3px 3px 0 #101B4D",
  "--k-radius": "10px",
  "--k-inner": "6px",
  "--k-pill": "8px",
  "--k-scrim": "rgba(16,27,77,0.55)",
  "--k-frame": "#F6F8FC",
  "--k-icon-bg": "rgba(255,255,255,0.92)",
  "--k-paper": "#FFFFFF",
  "--k-paper-ink": "#101B4D",
  "--k-paper-muted": "#4B5788",
  "--k-paper-line": "rgba(16,27,77,0.14)",
  "--k-danger": "#B3261E",
  "--k-field": "#FFFFFF",
  "--k-book-a": "#FFE14D",
  "--k-book-a-ink": "#101B4D",
  "--k-book-a-spine": "#E0BF1F",
  "--k-book-b": "#101B4D",
  "--k-book-b-ink": "#FFFFFF",
  "--k-book-b-spine": "#0A1236",
  "--k-book-c": "#FFFFFF",
  "--k-book-c-ink": "#101B4D",
  "--k-book-c-spine": "#D5DCEF",
  "--k-folder-back": "#C3CEEC",
  "--k-folder-front": "#101B4D",
  "--k-folder-paper": "#FFFFFF",
  "--k-folder-ink": "#FFFFFF",
  "--k-folder-muted": "#B7C2E6",
  "--k-display-font": "var(--nb-display)",
  "--k-sans": "var(--nb-sans)",
  "--k-label-font": "var(--nb-sans)",
  "--k-label-tracking": "0.08em",
  "--k-label-weight": "700",
  "--k-h1-size": "clamp(2.3rem, 5vw, 4.4rem)",
  "--k-h1-weight": "800",
  "--k-h1-leading": "1.02",
  "--k-h1-tracking": "-0.035em",
  "--k-h2-size": "clamp(1.9rem, 3.6vw, 3rem)",
  "--k-h2-weight": "800",
  "--k-h2-tracking": "-0.03em",
  "--k-display-weight": "700",
  "--bk-shadow": "rgba(16,27,77,0.45)",
} as CSSProperties

export const themeCss = `
[data-theme="notebook"] {
  background-color: var(--k-bg);
  background-image:
    linear-gradient(rgba(60, 92, 170, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(60, 92, 170, 0.11) 1px, transparent 1px);
  background-size: 28px 28px;
  background-attachment: local;
}
[data-theme="notebook"] [data-k-nav] { background: rgba(237, 241, 248, 0.9); box-shadow: 0 1.5px 0 var(--k-ink); }
[data-theme="notebook"] [data-k-logo] { border-radius: 6px; box-shadow: 0 0 0 1.5px var(--k-ink), 2px 2px 0 var(--k-ink); }
[data-theme="notebook"] [data-k-brand] { font-family: var(--nb-display), sans-serif; font-weight: 800; font-size: 1.05rem; letter-spacing: -0.02em; }
[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="notebook"] [data-k-progress] { height: 3px; background: var(--k-ink); }

/* Stickers: a hard offset shadow that closes when you press. */
[data-theme="notebook"] [data-k-btn] { font-weight: 700; }
[data-theme="notebook"] [data-k-outline] { box-shadow: 0 0 0 1.5px var(--k-ink); background: #fff; font-weight: 600; }
[data-theme="notebook"] [data-k-press] { transition: transform 0.12s var(--k-ease), box-shadow 0.12s var(--k-ease), background-color 0.2s ease-out, filter 0.2s ease-out; }
[data-theme="notebook"] [data-k-btn]:active { transform: translate(3px, 3px); box-shadow: 0 0 0 1.5px var(--k-ink), 0 0 0 var(--k-ink); }
[data-theme="notebook"] [data-k-outline]:active { transform: translate(2px, 2px); }
[data-theme="notebook"] [data-pm-btn]:active, [data-theme="notebook"] [data-eq-btn]:active, [data-theme="notebook"] [data-fb-read]:active { transform: translate(3px, 3px); box-shadow: 0 0 0 1.5px var(--k-ink), 0 0 0 var(--k-ink); }
[data-theme="notebook"] [data-eq-btn], [data-theme="notebook"] [data-pm-btn], [data-theme="notebook"] [data-fb-read] { font-weight: 700; }
[data-theme="notebook"] [data-k-tag] { padding: 4px 10px; background: var(--k-accent); color: var(--k-ink); box-shadow: 0 0 0 1.5px var(--k-ink); border-radius: 6px; font-size: 0.72rem; }
[data-theme="notebook"] [data-k-tile] { background: #F3F6FC; box-shadow: inset 0 0 0 1.5px var(--k-line-hi); }
[data-theme="notebook"] [data-k-photo] { outline: 1.5px solid var(--k-ink); outline-offset: -1.5px; }
[data-theme="notebook"] [data-k-avatar] { outline: 1.5px solid var(--k-ink); box-shadow: none; }
[data-theme="notebook"] [data-k-card] { border: 0; }
[data-theme="notebook"] [data-pm-frame-top] b { font-family: var(--nb-hand); font-size: 1rem; }

/* Marker sweep: the highlight draws itself as the words scroll into view. */
[data-nb-mark] { background: linear-gradient(transparent 58%, var(--k-accent) 58%, var(--k-accent) 92%, transparent 92%) no-repeat 0 0 / 100% 100%; padding: 0 0.12em; margin: 0 -0.12em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
@keyframes nb-sweep { from { background-size: 0% 100%; } to { background-size: 100% 100%; } }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-nb-mark] { animation: nb-sweep linear both; animation-timeline: view(); animation-range: entry 10% cover 34%; }
  }
}

/* Hand notes, tape, tilt and ruled paper */
[data-nb-hand] { font-family: var(--nb-hand), cursive; font-size: 1.35rem; line-height: 1.1; color: var(--k-muted); font-weight: 600; }
[data-nb-tilt] { transform: rotate(var(--nb-r, -1.2deg)); transition: transform 0.35s var(--k-ease), box-shadow 0.35s var(--k-ease); }
@media (hover: hover) and (pointer: fine) { [data-nb-tilt]:hover { transform: rotate(0deg) translateY(-6px); } }
[data-nb-tape] { position: relative; }
[data-nb-tape]::before { content: ""; position: absolute; top: -12px; left: 50%; z-index: 2; width: 84px; height: 24px; transform: translateX(-50%) rotate(var(--nb-tape, -3deg));
  background: rgba(255, 225, 77, 0.78); box-shadow: 0 1px 0 rgba(16, 27, 77, 0.12); }
[data-nb-ruled] { position: relative; background-color: #fff;
  background-image: repeating-linear-gradient(to bottom, transparent 0 31px, rgba(60, 92, 170, 0.28) 31px 32px); background-position: 0 12px; }
[data-nb-ruled]::before { content: ""; position: absolute; top: 0; bottom: 0; left: 44px; width: 1.5px; background: #E5484D; opacity: 0.75; }
[data-nb-hole] { position: absolute; left: 12px; width: 14px; height: 14px; border-radius: 999px; background: var(--k-bg); box-shadow: inset 0 1px 2px rgba(16, 27, 77, 0.35); }

/* Checklist ticks draw as the list scrolls in. */
[data-nb-check] { display: grid; place-items: center; width: 26px; height: 26px; flex: none; border-radius: 6px; background: #fff; box-shadow: 0 0 0 1.5px var(--k-ink); }
[data-nb-check] svg { color: var(--k-ink); }
@keyframes nb-tick { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-nb-check] svg { animation: nb-tick linear both; animation-timeline: view(); animation-range: entry 20% cover 30%; }
  }
}

/* Planner */
[data-nb-planner] { overflow-x: auto; }
[data-nb-bar] { transition: transform 0.16s var(--k-ease), box-shadow 0.16s var(--k-ease); }
@media (hover: hover) and (pointer: fine) { [data-nb-bar]:hover { transform: translateY(-2px); box-shadow: 0 0 0 1.5px var(--k-ink), 3px 4px 0 var(--k-ink); } }
[data-nb-bar]:active { transform: translate(2px, 2px); }
[data-nb-now] { position: absolute; top: 0; bottom: 0; width: 0; border-left: 2px dashed #E5484D; pointer-events: none; }
[data-nb-now] span { position: absolute; top: -6px; left: 6px; font-family: var(--nb-hand); font-size: 1.05rem; color: #E5484D; white-space: nowrap; }

/* Sticky notes */
[data-nb-note] { transition: transform 0.3s var(--k-ease), box-shadow 0.3s var(--k-ease); box-shadow: 0 1px 0 rgba(16, 27, 77, 0.2), 0 14px 20px -14px rgba(16, 27, 77, 0.55); }
[data-nb-note]::after { content: ""; position: absolute; right: 0; bottom: 0; width: 34px; height: 34px; background: linear-gradient(135deg, transparent 50%, rgba(16, 27, 77, 0.14) 50%); transition: width 0.25s var(--k-ease), height 0.25s var(--k-ease); }
@media (hover: hover) and (pointer: fine) { [data-nb-note]:hover::after { width: 46px; height: 46px; } }

/* Circled result mark, wobbly like a pen */
[data-nb-circle] { display: inline-grid; place-items: center; min-width: 4.2rem; aspect-ratio: 1; padding: 0.4rem; border: 3px solid #E5484D; border-radius: 52% 48% 55% 45% / 46% 54% 46% 54%; transform: rotate(-6deg); color: #E5484D; }

@media (prefers-reduced-motion: reduce) { [data-nb-tilt], [data-nb-note], [data-nb-bar] { transition: none; } }
`
