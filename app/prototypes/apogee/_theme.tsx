import { Geist, Geist_Mono } from "next/font/google"
import type { CSSProperties } from "react"

/**
 * Prototype 28: Apogee. The highest point of the orbit: a black sky, a planet's
 * edge catching the sun, one headline set very large.
 * One accent, amber, drawn from the ICT gold turned warmer so it reads as sunlight.
 * Corners are 10px on controls and full on the badge; lines are 1px at 9% white.
 * Text pairs measured: ivory on page 17.6:1, muted on page 7.4:1, amber on page 10.2:1,
 * dark ink on amber 9.1:1.
 */

const sans = Geist({ subsets: ["latin"], variable: "--ap-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--ap-mono" })

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/apogee"

export const tokens = {
  "--k-bg": "#060606",
  "--k-ink": "#F4F1EA",
  "--k-muted": "#A39F96",
  "--k-line": "rgba(255,255,255,0.09)",
  "--k-line-hi": "rgba(255,255,255,0.22)",
  "--k-card": "#0C0B0A",
  "--k-card-solid": "#0C0B0A",
  "--k-shadow":
    "inset 0 1px 0 rgba(255,196,130,0.26), 0 0 0 1px rgba(255,255,255,0.06), 0 40px 70px -46px #000",
  "--k-tile": "#15130F",
  "--k-chip": "rgba(255,255,255,0.05)",
  "--k-hover": "rgba(242,162,74,0.1)",
  "--k-on": "#F2A24A",
  "--k-on-ink": "#1A0E03",
  "--k-accent": "#F2A24A",
  "--k-accent-deep": "#C97A2B",
  "--k-accent-ink": "#1A0E03",
  "--k-btn": "linear-gradient(180deg, #F7B766 0%, #EE9A3A 100%)",
  "--k-btn-shadow":
    "0 14px 30px -16px rgba(242,162,74,0.6), inset 0 1px 0 rgba(255,255,255,0.45)",
  "--k-radius": "14px",
  "--k-inner": "10px",
  "--k-pill": "10px",
  "--k-chip-radius": "8px",
  "--k-scrim": "rgba(2,2,2,0.76)",
  "--k-frame": "#0C0B0A",
  "--k-icon-bg": "rgba(255,255,255,0.07)",
  "--k-paper": "#F4F1EA",
  "--k-paper-ink": "#0C0B0A",
  "--k-paper-muted": "#57524A",
  "--k-paper-line": "rgba(12,11,10,0.14)",
  "--k-danger": "#FF9C86",
  "--k-field": "rgba(255,255,255,0.06)",
  "--k-book-a": "#1B1813",
  "--k-book-a-ink": "#F2A24A",
  "--k-book-a-spine": "#0C0B0A",
  "--k-book-b": "#F2A24A",
  "--k-book-b-ink": "#1A0E03",
  "--k-book-b-spine": "#C97A2B",
  "--k-book-c": "#F4F1EA",
  "--k-book-c-ink": "#0C0B0A",
  "--k-book-c-spine": "#D5CFC2",
  "--k-folder-back": "#2A251D",
  "--k-folder-front": "#15130F",
  "--k-folder-paper": "#F4F1EA",
  "--k-folder-ink": "#F4F1EA",
  "--k-folder-muted": "#A39F96",
  "--k-display-font": "var(--ap-sans)",
  "--k-sans": "var(--ap-sans)",
  "--k-label-font": "var(--ap-mono)",
  "--k-label-tracking": "0.14em",
  "--k-label-weight": "500",
  "--k-h1-size": "clamp(2.7rem, 6.3vw, 6.4rem)",
  "--k-h1-weight": "600",
  "--k-h1-leading": "0.96",
  "--k-h1-tracking": "-0.045em",
  "--k-h2-size": "clamp(2.2rem, 4.4vw, 3.8rem)",
  "--k-h2-weight": "600",
  "--k-h2-leading": "1.02",
  "--k-h2-tracking": "-0.035em",
  "--k-display-weight": "600",
  "--k-fact": "#D8D2C4",
  "--bk-shadow": "rgba(0,0,0,0.7)",
} as CSSProperties

export const themeCss = `
[data-theme="apogee"] { --ap-y: clamp(150px, 25vh, 260px); }
[data-theme="apogee"] ::selection { background: #F2A24A; color: #1A0E03; }

/* The header lies on the sky and takes a glass back only once the page moves. */
[data-theme="apogee"] [data-k-nav] { box-shadow: none; background: rgba(6, 6, 6, 0.6); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-theme="apogee"] [data-k-nav] { background: rgba(6, 6, 6, 0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); animation: ap-glass linear both; animation-timeline: scroll(root); animation-range: 0 140px; }
  }
}
@keyframes ap-glass { to { background: rgba(6, 6, 6, 0.66); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); } }
[data-theme="apogee"] [data-k-progress] { height: 1px; background: #F2A24A; }
[data-theme="apogee"] [data-k-brand] { display: none; }
[data-theme="apogee"] [data-k-header] nav { margin-inline: auto; }
[data-theme="apogee"] [data-k-logo] { border-radius: 9px; }
[data-k-navlink] { padding: 10px 16px; border-radius: 8px; font-size: 0.92rem; font-weight: 500; letter-spacing: -0.01em; color: #B9B5AB; transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: rgba(255, 255, 255, 0.06); } }
[data-theme="apogee"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px var(--k-line-hi); font-weight: 500; }
[data-theme="apogee"] [data-k-tag] { padding: 5px 11px; font-size: 0.64rem; border-radius: 999px; box-shadow: inset 0 0 0 1px var(--k-line-hi); }
[data-theme="apogee"] [data-k-photo] { outline: 1px solid rgba(255, 255, 255, 0.1); outline-offset: -1px; }
[data-theme="apogee"] [data-k-tile] { box-shadow: inset 0 0 0 1px var(--k-line); }
[data-theme="apogee"] [data-k-btn], [data-theme="apogee"] [data-eq-btn]:not([data-quiet]), [data-theme="apogee"] [data-pm-btn]:not([data-quiet]), [data-theme="apogee"] [data-fb-read] { font-weight: 600; letter-spacing: -0.01em; }
[data-theme="apogee"] [data-k-h1], [data-theme="apogee"] [data-k-h2] { text-wrap: balance; }

/* The sky: stars on a canvas, a beam from above, the planet's edge and the sun on it. */
[data-ap-hero] { --ap-x: 0; --ap-y-px: 0; position: relative; isolation: isolate; overflow: hidden; margin-top: -68px; min-height: 100dvh; display: flex; flex-direction: column; justify-content: flex-end; background: #060606; }
[data-ap-stars] { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; }
[data-ap-beam] { position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 26% 62% at 62% -8%, rgba(176, 142, 72, 0.5), rgba(120, 100, 52, 0.16) 46%, transparent 74%); }
[data-ap-glow] { position: absolute; z-index: 1; pointer-events: none; left: 50%; top: calc(100% - var(--ap-y)); width: min(92vw, 1500px); height: 34vh; transform: translate3d(calc(-50% + var(--ap-x) * -22px), -64%, 0);
  background: radial-gradient(ellipse 50% 52% at 50% 64%, rgba(255, 152, 72, 0.5), rgba(255, 120, 40, 0.13) 46%, transparent 72%); }
[data-ap-planet] { position: absolute; z-index: 1; pointer-events: none; left: 50%; top: calc(100% - var(--ap-y)); width: max(150vw, 1700px); aspect-ratio: 1; border-radius: 50%; background: #050505;
  transform: translate3d(calc(-50% + var(--ap-x) * -14px), 0, 0); }
[data-ap-planet]::before { content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from -34deg at 50% 50%, transparent 0deg, rgba(255, 190, 120, 0.1) 10deg, rgba(255, 200, 140, 0.9) 27deg, #FFE6BF 34deg, rgba(255, 200, 140, 0.9) 41deg, rgba(255, 190, 120, 0.1) 58deg, transparent 68deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px)); mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px)); }
[data-ap-planet]::after { content: ""; position: absolute; inset: -2.6%; border-radius: 50%; border: 1px solid rgba(255, 170, 96, 0.16);
  -webkit-mask: linear-gradient(180deg, #000 0%, transparent 26%); mask: linear-gradient(180deg, #000 0%, transparent 26%); }
[data-ap-ghost] { position: absolute; z-index: 2; left: -1vw; bottom: -0.17em; margin: 0; pointer-events: none; user-select: none; font-size: clamp(9rem, 28vw, 31rem); font-weight: 700; line-height: 0.8; letter-spacing: -0.065em; color: transparent;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.012) 78%); -webkit-background-clip: text; background-clip: text; }
[data-ap-bar] { position: absolute; z-index: 4; top: 72px; left: 0; right: 0; }
[data-ap-content] { position: relative; z-index: 3; padding-top: 140px; padding-bottom: calc(var(--ap-y) * 0.95); }
[data-ap-badge] { display: inline-flex; align-items: center; gap: 4px; padding: 4px; border-radius: 999px; font-size: 0.82rem; background: rgba(255, 255, 255, 0.06); box-shadow: inset 0 0 0 1px var(--k-line); transition: background-color 0.18s ease-out; }
[data-ap-badge] b { padding: 5px 12px; border-radius: 999px; font-weight: 500; background: rgba(255, 255, 255, 0.08); }
[data-ap-badge] span { padding: 5px 12px 5px 8px; color: #D2CEC4; }
@media (hover: hover) and (pointer: fine) { [data-ap-badge]:hover { background: rgba(255, 255, 255, 0.1); } }
[data-ap-side] { max-width: 21rem; }
[data-ap-cta] { display: inline-flex; align-items: center; gap: 12px; height: 52px; padding: 0 20px 0 6px; border-radius: 12px; font-weight: 500; letter-spacing: -0.01em; white-space: nowrap; background: rgba(12, 11, 10, 0.72); box-shadow: inset 0 0 0 1px var(--k-line-hi); transition: background-color 0.18s ease-out, scale 0.12s ease-out; }
[data-ap-cta]:active { scale: 0.96; }
@media (hover: hover) and (pointer: fine) { [data-ap-cta]:hover { background: rgba(28, 25, 20, 0.9); } }
[data-ap-cta] > span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 8px; background: #F2A24A; color: #1A0E03; }

@keyframes ap-rise { from { transform: translate3d(calc(-50% + var(--ap-x) * -14px), 18vh, 0); } to { transform: translate3d(calc(-50% + var(--ap-x) * -14px), 0, 0); } }
@keyframes ap-rise-glow { from { opacity: 0; transform: translate3d(calc(-50% + var(--ap-x) * -22px), -34%, 0); } to { opacity: 1; transform: translate3d(calc(-50% + var(--ap-x) * -22px), -64%, 0); } }
@keyframes ap-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ap-in { from { opacity: 0; transform: translateY(18px); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
@media (prefers-reduced-motion: no-preference) {
  [data-ap-planet] { animation: ap-rise 2.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
  [data-ap-glow] { animation: ap-rise-glow 2.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
  [data-ap-stars], [data-ap-beam] { animation: ap-fade 1.8s ease-out both; }
  [data-ap-ghost] { animation: ap-fade 2.4s ease-out 0.5s both; }
  [data-ap-in] { animation: ap-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
}
@media (max-width: 767px) {
  [data-theme="apogee"] { --ap-y: clamp(90px, 14vh, 140px); }
  [data-ap-content] { padding-top: 200px; }
  [data-ap-planet] { width: 260vw; }
  [data-ap-ghost] { font-size: 34vw; }
}

/* Every section after the sky: rim-lit panels, one amber hairline. */
[data-ap-rim] { position: relative; }
[data-ap-rim]::before { content: ""; position: absolute; left: 12%; right: 12%; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 200, 140, 0.7), transparent); pointer-events: none; }
[data-ap-serial] { font-size: clamp(7rem, 17vw, 14rem); font-weight: 700; line-height: 0.82; letter-spacing: -0.06em; color: transparent; background: linear-gradient(180deg, #F7B766 0%, rgba(242, 162, 74, 0.55) 55%, rgba(242, 162, 74, 0.08) 100%); -webkit-background-clip: text; background-clip: text; font-variant-numeric: lining-nums tabular-nums; transition: filter 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
@media (hover: hover) and (pointer: fine) { [data-ap-honour]:hover [data-ap-serial] { filter: brightness(1.18); } }
[data-ap-rail] { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; --ap-gutter: max(20px, calc((100vw - 1240px) / 2 + 32px)); padding: 4px var(--ap-gutter) 28px; scroll-padding-inline: var(--ap-gutter); scrollbar-width: none; overscroll-behavior-x: contain; }
[data-ap-rail]::-webkit-scrollbar { display: none; }
[data-ap-person] { flex: 0 0 min(76vw, 300px); scroll-snap-align: start; }
@media (hover: hover) and (pointer: fine) { [data-ap-person]:hover [data-ap-frame] { box-shadow: 0 0 0 1px rgba(242, 162, 74, 0.7), 0 30px 60px -30px rgba(242, 162, 74, 0.35); } }
[data-ap-frame] { transition: box-shadow 0.3s ease-out; }
[data-theme="apogee"] { --ap-route-apsc: #F2A24A; --ap-route-adre: #8FB1DC; --ap-route-police: #86BBC7; --ap-route-banking: #F4F1EA; }
`
