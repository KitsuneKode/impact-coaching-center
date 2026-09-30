import { Archivo, IBM_Plex_Mono } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 16: Atlas. A topographic sheet in river-teal ink with one map-pin
 * pink. The route to each exam is a transit line; pick one and its stages,
 * batches and teachers light up. Colour: pale sheet, deep teal ink, one accent.
 * The four route colours are one cool family (teal, blue, sage) around the pink pin, used only on the map and its legend.
 */

const sans = Archivo({
  subsets: ["latin"],
  variable: "--at-sans",
  axes: ["wdth"],
})
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--at-mono",
})

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/atlas"

export const routeColour: Record<string, string> = {
  apsc: "#C81E64",
  adre: "#0E7C86",
  "assam-police-si": "#2E62B0",
  banking: "#4C9A6A",
}

export const tokens = {
  "--k-bg": "#EAF0EE",
  "--k-ink": "#0C2A30",
  "--k-muted": "#46616A",
  "--k-line": "rgba(12,42,48,0.14)",
  "--k-line-hi": "rgba(12,42,48,0.4)",
  "--k-card": "#FBFDFC",
  "--k-card-solid": "#FBFDFC",
  "--k-shadow":
    "0 0 0 1px rgba(12,42,48,0.16), 0 20px 34px -26px rgba(12,42,48,0.45)",
  "--k-tile": "#EEF4F2",
  "--k-chip": "#FBFDFC",
  "--k-hover": "#DCE9E5",
  "--k-on": "#0C2A30",
  "--k-on-ink": "#FFFFFF",
  "--k-accent": "#C81E64",
  "--k-accent-deep": "#9E1650",
  "--k-accent-ink": "#FFFFFF",
  "--k-btn": "#C81E64",
  "--k-btn-shadow": "0 12px 24px -14px rgba(200,30,100,0.75)",
  "--k-radius": "16px",
  "--k-inner": "10px",
  "--k-pill": "999px",
  "--k-scrim": "rgba(12,42,48,0.62)",
  "--k-frame": "#F4F8F6",
  "--k-icon-bg": "rgba(251,253,252,0.92)",
  "--k-paper": "#FBFDFC",
  "--k-paper-ink": "#0C2A30",
  "--k-paper-muted": "#46616A",
  "--k-paper-line": "rgba(12,42,48,0.12)",
  "--k-danger": "#B3261E",
  "--k-field": "#FBFDFC",
  "--k-book-a": "#C81E64",
  "--k-book-a-ink": "#FFFFFF",
  "--k-book-a-spine": "#9E1650",
  "--k-book-b": "#0C2A30",
  "--k-book-b-ink": "#FFFFFF",
  "--k-book-b-spine": "#061A1E",
  "--k-book-c": "#FBFDFC",
  "--k-book-c-ink": "#0C2A30",
  "--k-book-c-spine": "#D3E0DC",
  "--k-folder-back": "#9FC3BC",
  "--k-folder-front": "#0C2A30",
  "--k-folder-paper": "#FFFFFF",
  "--k-folder-ink": "#FFFFFF",
  "--k-folder-muted": "#A9C7C1",
  "--k-display-font": "var(--at-sans)",
  "--k-sans": "var(--at-sans)",
  "--k-label-font": "var(--at-mono)",
  "--k-label-tracking": "0.08em",
  "--k-label-weight": "500",
  "--k-h1-size": "clamp(2.2rem, 4.8vw, 4.2rem)",
  "--k-h1-weight": "800",
  "--k-h1-leading": "1.02",
  "--k-h1-tracking": "-0.03em",
  "--k-h2-size": "clamp(1.8rem, 3.4vw, 2.8rem)",
  "--k-h2-weight": "800",
  "--k-h2-tracking": "-0.028em",
  "--k-display-weight": "700",
  "--bk-shadow": "rgba(12,42,48,0.45)",
} as CSSProperties

export const themeCss = `
[data-theme="atlas"] { position: relative; }
[data-theme="atlas"] [data-k-h1], [data-theme="atlas"] [data-k-h2], [data-theme="atlas"] [data-k-display] { font-stretch: 118%; }
[data-theme="atlas"] [data-k-h1] { font-stretch: 125%; }
[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="atlas"] [data-k-logo] { border-radius: 12px; box-shadow: 0 0 0 1px var(--k-line-hi); }
[data-theme="atlas"] [data-k-brand] { font-stretch: 125%; font-weight: 800; font-size: 0.95rem; letter-spacing: -0.01em; }
[data-theme="atlas"] [data-k-tag] { padding: 4px 12px; font-size: 0.68rem; }
[data-theme="atlas"] [data-k-press] { transition: transform 0.16s var(--k-ease), background-color 0.2s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out; }

/* The sheet: contour rings from three summits, drifting at different speeds as you scroll. */
[data-at-contours] { position: fixed; inset: -10% 0; z-index: 0; pointer-events: none; opacity: 0.9; }
[data-at-contours] i { position: absolute; inset: 0; }
[data-at-contours] i:nth-child(1) { background: repeating-radial-gradient(ellipse 60% 48% at 18% 28%, transparent 0 26px, rgba(12,42,48,0.075) 26px 27px); }
[data-at-contours] i:nth-child(2) { background: repeating-radial-gradient(ellipse 52% 64% at 82% 52%, transparent 0 30px, rgba(12,42,48,0.06) 30px 31px); }
[data-at-contours] i:nth-child(3) { background: repeating-radial-gradient(ellipse 70% 40% at 46% 92%, transparent 0 34px, rgba(14,124,134,0.09) 34px 35px); }
@keyframes at-drift-a { to { transform: translateY(-6%); } }
@keyframes at-drift-b { to { transform: translateY(5%); } }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-at-contours] i:nth-child(1) { animation: at-drift-a linear both; animation-timeline: scroll(root block); }
    [data-at-contours] i:nth-child(2) { animation: at-drift-b linear both; animation-timeline: scroll(root block); }
    [data-at-contours] i:nth-child(3) { animation: at-drift-a linear both; animation-timeline: scroll(root block); }
  }
}
[data-theme="atlas"] main, [data-theme="atlas"] footer, [data-theme="atlas"] [data-k-header] { position: relative; z-index: 1; }

/* Map furniture */
[data-at-mono] { font-family: var(--at-mono), monospace; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--k-muted); font-variant-numeric: tabular-nums; }
[data-at-frame] { position: relative; }
[data-at-frame]::before, [data-at-frame]::after { content: ""; position: absolute; z-index: 2; width: 18px; height: 18px; pointer-events: none; border: 0 solid var(--k-ink); }
[data-at-frame]::before { top: -6px; left: -6px; border-top-width: 2px; border-left-width: 2px; }
[data-at-frame]::after { right: -6px; bottom: -6px; border-right-width: 2px; border-bottom-width: 2px; }

@media (prefers-reduced-motion: reduce) { [data-at-contours] i { animation: none !important; } }
`
