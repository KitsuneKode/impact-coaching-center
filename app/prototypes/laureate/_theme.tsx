import { Cormorant_Garamond, Manrope } from "next/font/google"

/**
 * Prototype 19: Laureate. The candidate. ICT's antique gold on an Oxford navy
 * with warm ivory, in light and dark, built from the strongest idea in each
 * earlier design: Meridian's batch finder, Atlas's route map, Sovereign's
 * merit list and foil, Notebook's first-week checklist, Clearcoat's circular
 * light-and-dark reveal, and the autoplaying video reel.
 *
 * Palette (OKLCH, hue and chroma held): navy hue 255 chroma 0.06, antique gold
 * hue 84 chroma 0.105, ivory hue 88. Complementary pair, gold held to about a
 * tenth of the surface, neutrals warm so they share gold's temperature.
 * Route colours are the same family: gold and three blues.
 */

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--lr-display",
})
const sans = Manrope({ subsets: ["latin"], variable: "--lr-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/laureate"

const FOIL =
  "linear-gradient(110deg, #F7E4B0 0%, #F2CC7E 24%, #D7B265 50%, #BD994C 70%, #E8C877 88%, #F7E4B0 100%) 0 0 / 240% 100%"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

/** Ivory and navy: the light page. */
const light = {
  "--k-bg": "#F8F5EC",
  "--k-ink": "#000820",
  "--k-muted": "#354E6E",
  "--k-line": "rgba(0,8,32,0.11)",
  "--k-line-hi": "rgba(127,93,0,0.4)",
  "--k-card": "#FFFEFA",
  "--k-card-solid": "#FFFEFA",
  "--k-shadow":
    "0 0 0 1px rgba(0,8,32,0.08), 0 26px 44px -32px rgba(0,8,32,0.5)",
  "--k-tile": "#F3EEDF",
  "--k-chip": "#FFFEFA",
  "--k-hover": "#EFE6CC",
  "--k-on": "#0D2441",
  "--k-on-ink": "#F8F3E6",
  "--k-accent": "#D7B265",
  "--k-accent-deep": "#7F5D00",
  "--k-accent-ink": "#000820",
  "--k-btn": FOIL,
  "--k-btn-shadow":
    "0 14px 26px -14px rgba(127,93,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
  "--k-scrim": "rgba(0,8,32,0.6)",
  "--k-frame": "#FBF9F3",
  "--k-icon-bg": "rgba(255,254,250,0.9)",
  "--k-paper": "#FFFEFA",
  "--k-paper-ink": "#000820",
  "--k-paper-muted": "#354E6E",
  "--k-paper-line": "rgba(0,8,32,0.12)",
  "--k-danger": "#A63A24",
  "--k-field": "#FFFEFA",
  "--k-fact": "#2B6C83",
  "--k-book-a": "#0D2441",
  "--k-book-a-ink": "#F8F3E6",
  "--k-book-a-spine": "#000820",
  "--k-book-b": "#D7B265",
  "--k-book-b-ink": "#000820",
  "--k-book-b-spine": "#BD994C",
  "--k-book-c": "#FFFEFA",
  "--k-book-c-ink": "#000820",
  "--k-book-c-spine": "#E2D9BF",
  "--k-folder-back": "#D8CFB0",
  "--k-folder-front": "#0D2441",
  "--k-folder-paper": "#FFFEFA",
  "--k-folder-ink": "#F8F3E6",
  "--k-folder-muted": "#ACB8CB",
  "--bk-shadow": "rgba(0,8,32,0.45)",
  "--lr-foil-text":
    "linear-gradient(100deg, #7F5D00 0%, #A9822B 38%, #8A6714 68%, #B58E32 100%)",
  "--lr-rank": "linear-gradient(180deg, #A9822B, #7F5D00)",
  "--lr-route-apsc": "#B58E32",
  "--lr-route-adre": "#3660AF",
  "--lr-route-police": "#2B6C83",
  "--lr-route-banking": "#6782A5",
  "--lr-rosette": "rgba(127,93,0,0.06)",
}

/** Navy and ivory: the dark page. */
const dark = {
  "--k-bg": "#000820",
  "--k-ink": "#F8F3E6",
  "--k-muted": "#ACB8CB",
  "--k-line": "rgba(172,184,203,0.16)",
  "--k-line-hi": "rgba(215,178,101,0.4)",
  "--k-card": "linear-gradient(180deg, #0D2441 0%, #00132F 100%)",
  "--k-card-solid": "#0D2441",
  "--k-shadow":
    "inset 0 0 0 1px rgba(215,178,101,0.32), inset 0 0 0 6px #08193F, inset 0 0 0 7px rgba(215,178,101,0.13), 0 30px 50px -30px rgba(0,8,32,0.95)",
  "--k-tile": "#00102A",
  "--k-chip": "rgba(255,255,255,0.04)",
  "--k-hover": "rgba(215,178,101,0.11)",
  "--k-on": FOIL,
  "--k-on-ink": "#000820",
  "--k-accent-deep": "#BD994C",
  "--k-btn-shadow":
    "0 14px 28px -14px rgba(215,178,101,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
  "--k-scrim": "rgba(0,8,32,0.78)",
  "--k-frame": "#00062A",
  "--k-icon-bg": "rgba(0,8,32,0.62)",
  "--k-paper": "#F8F3E6",
  "--k-danger": "#F2A08F",
  "--k-field": "#00102A",
  "--k-fact": "#8CC0D6",
  "--k-book-a": "#213957",
  "--k-book-a-ink": "#F8F3E6",
  "--k-book-a-spine": "#0D2441",
  "--k-book-c": "#F8F3E6",
  "--k-book-c-spine": "#D8CFB6",
  "--k-folder-back": "#213957",
  "--k-folder-front": "#0D2441",
  "--k-folder-paper": "#F8F3E6",
  "--bk-shadow": "rgba(0,8,32,0.8)",
  "--lr-foil-text":
    "linear-gradient(100deg, #F7E4B0 0%, #F2CC7E 30%, #D7B265 55%, #F2CC7E 78%, #F7E4B0 100%)",
  "--lr-rank": "linear-gradient(180deg, #F7E4B0, #D7B265 55%, #BD994C)",
  "--lr-route-apsc": "#D7B265",
  "--lr-route-adre": "#6F9DF2",
  "--lr-route-police": "#82C2DC",
  "--lr-route-banking": "#85A1C5",
  "--lr-rosette": "rgba(215,178,101,0.07)",
}

/** No inline tokens: the theme lives in the stylesheet so the dark mode can override it. */
export const tokens = {}

export const themeCss = `
[data-theme="laureate"] {
  ${vars({
    "--k-radius": "16px",
    "--k-inner": "10px",
    "--k-pill": "10px",
    "--k-chip-radius": "10px",
    "--k-display-font": "var(--lr-display)",
    "--k-sans": "var(--lr-sans)",
    "--k-label-font": "var(--lr-sans)",
    "--k-label-tracking": "0.16em",
    "--k-label-weight": "700",
    "--k-h1-size": "clamp(2.6rem, 5.6vw, 5rem)",
    "--k-h1-weight": "600",
    "--k-h1-leading": "1.02",
    "--k-h1-tracking": "-0.012em",
    "--k-h2-size": "clamp(2rem, 3.8vw, 3.2rem)",
    "--k-h2-weight": "600",
    "--k-h2-leading": "1.05",
    "--k-h2-tracking": "-0.01em",
    "--k-display-weight": "600",
  })}
  ${vars(light)}
  font-feature-settings: "lnum" 1;
  background: radial-gradient(70% 46% at 86% -6%, color-mix(in oklab, var(--k-accent) 14%, transparent), transparent 62%), var(--k-bg);
}
[data-mode="dark"] [data-theme="laureate"] {
  ${vars(dark)}
  background: radial-gradient(70% 46% at 86% -8%, rgba(33, 57, 87, 0.7), transparent 62%), radial-gradient(60% 40% at 6% 40%, rgba(13, 36, 65, 0.55), transparent 64%), var(--k-bg);
}

[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; font-size: 0.875rem; letter-spacing: 0.02em; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="laureate"] [data-k-nav] { background: color-mix(in oklab, var(--k-bg) 82%, transparent); box-shadow: 0 1px 0 var(--k-line-hi); }
[data-theme="laureate"] [data-k-logo] { border-radius: 999px; background: #F8F3E6; box-shadow: 0 0 0 2px var(--k-bg), 0 0 0 3px var(--k-accent); }
[data-theme="laureate"] [data-k-brand] { font-family: var(--lr-display), serif; font-weight: 600; font-size: 1.25rem; letter-spacing: 0.01em; }
[data-theme="laureate"] [data-k-progress] { background: linear-gradient(90deg, #BD994C, #F7E4B0); }
[data-theme="laureate"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px var(--k-line-hi); font-weight: 600; }
[data-theme="laureate"] [data-k-tag] { padding: 5px 12px; font-size: 0.66rem; color: var(--k-accent-deep); box-shadow: inset 0 0 0 1px var(--k-line-hi); }
[data-theme="laureate"] [data-k-tile] { box-shadow: inset 0 0 0 1px var(--k-line); }
[data-theme="laureate"] [data-k-photo] { outline: 1px solid var(--k-line-hi); outline-offset: -1px; }
[data-theme="laureate"] [data-k-avatar] { outline: 1px solid var(--k-line-hi); box-shadow: 0 0 0 2px var(--k-bg); }

/* Foil: the sheen slides across a button on hover, once. */
[data-theme="laureate"] [data-k-btn], [data-theme="laureate"] [data-pm-btn]:not([data-quiet]), [data-theme="laureate"] [data-eq-btn]:not([data-quiet]):not(:disabled), [data-theme="laureate"] [data-fb-read] {
  background: var(--k-btn); transition: background-position 0.75s var(--k-ease), transform 0.16s var(--k-ease), filter 0.2s ease-out; }
@media (hover: hover) and (pointer: fine) {
  [data-theme="laureate"] [data-k-btn]:hover, [data-theme="laureate"] [data-pm-btn]:not([data-quiet]):hover, [data-theme="laureate"] [data-eq-btn]:not([data-quiet]):hover, [data-theme="laureate"] [data-fb-read]:hover { background-position: 100% 0; filter: none; }
}
[data-lr-foil] { background: var(--lr-foil-text); -webkit-background-clip: text; background-clip: text; color: transparent; font-style: italic; padding-right: 0.06em; background-size: 200% 100%; }
@keyframes lr-sheen { from { background-position: 0 0; } to { background-position: 100% 0; } }
@media (prefers-reduced-motion: no-preference) { [data-lr-foil] { animation: lr-sheen 9s ease-in-out infinite alternate; } }

/* The rosette behind the page, like security print. */
[data-lr-rosette] { position: fixed; z-index: 0; top: -22vmax; right: -18vmax; width: 70vmax; height: 70vmax; pointer-events: none;
  background:
    repeating-conic-gradient(from 0deg at 50% 50%, var(--lr-rosette) 0deg 0.6deg, transparent 0.6deg 4deg),
    repeating-radial-gradient(circle at 50% 50%, transparent 0 22px, var(--lr-rosette) 22px 23px);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 68%); mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 68%); }
@keyframes lr-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: no-preference) { [data-lr-rosette] { animation: lr-turn 260s linear infinite; } }
[data-theme="laureate"] main, [data-theme="laureate"] footer, [data-theme="laureate"] [data-k-header] { position: relative; z-index: 1; }

/* Cards catch a pool of light under the pointer. */
[data-theme="laureate"] [data-k-card] { isolation: isolate; }
[data-theme="laureate"] [data-k-card]::after { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; opacity: 0;
  background: radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklab, var(--k-accent) 20%, transparent), transparent 60%); transition: opacity 0.3s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-theme="laureate"] [data-k-card]:hover::after { opacity: 1; } }

/* Gold hairline with a diamond */
[data-lr-rule] { display: flex; align-items: center; gap: 14px; color: var(--k-accent); }
[data-lr-rule]::before, [data-lr-rule]::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--k-line-hi)); }
[data-lr-rule]::after { background: linear-gradient(270deg, transparent, var(--k-line-hi)); }
[data-lr-rule] i { width: 7px; height: 7px; transform: rotate(45deg); background: var(--k-accent); }

/* Seal: a gold ring turning slowly round the ICT mark */
[data-lr-seal] { position: relative; display: grid; place-items: center; width: 80px; height: 80px; border-radius: 999px; background: #F8F3E6; box-shadow: inset 0 0 0 1px var(--k-line); }
[data-lr-seal]::before { content: ""; position: absolute; inset: -6px; border-radius: 999px; background: conic-gradient(from 0deg, #F7E4B0, #BD994C, #F2CC7E, #D7B265, #F7E4B0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); }
[data-lr-seal]::after { content: ""; position: absolute; inset: -13px; border-radius: 999px; border: 1px dashed var(--k-line-hi); }
@media (prefers-reduced-motion: no-preference) { [data-lr-seal]::after { animation: lr-turn 40s linear infinite; } }

/* Merit list */
[data-lr-rank] { font-family: var(--lr-display), serif; font-weight: 600; font-size: clamp(3.4rem, 8vw, 6.4rem); line-height: 0.85; font-variant-numeric: lining-nums tabular-nums; background: var(--lr-rank); -webkit-background-clip: text; background-clip: text; color: transparent; }
[data-lr-arch] { border-radius: 999px 999px 8px 8px; }
[data-lr-row] { position: relative; transition: background-color 0.2s ease-out; }
[data-lr-row]::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, transparent, var(--k-accent), transparent); transform: scaleY(0); transition: transform 0.3s var(--k-ease); }
@media (hover: hover) and (pointer: fine) { [data-lr-row]:hover::before { transform: scaleY(1); } [data-lr-row]:hover { background: var(--k-hover); } }

/* Underline that draws itself under a key phrase */
[data-lr-draw] { background: linear-gradient(var(--k-accent), var(--k-accent)) no-repeat 0 100% / 100% 3px; padding-bottom: 0.06em; }
@keyframes lr-draw { from { background-size: 0% 3px; } to { background-size: 100% 3px; } }
@media (prefers-reduced-motion: no-preference) { [data-lr-draw] { animation: lr-draw 1.1s var(--k-ease) 0.5s both; } }

/* Checklist box: an empty ring that fills with foil when ticked */
[data-lr-check] { display: grid; place-items: center; width: 26px; height: 26px; flex: none; border-radius: 8px; color: var(--k-accent-ink); box-shadow: inset 0 0 0 1.5px var(--k-line-hi); transition: background 0.2s ease-out, box-shadow 0.2s ease-out; }
input:checked + [data-lr-check] { background: var(--k-btn); box-shadow: none; }

/* Light and dark: the new mode grows from the switch you pressed. */
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; animation: lr-reveal 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
@keyframes lr-reveal { from { clip-path: circle(0 at var(--vt-x, 50%) var(--vt-y, 50%)); } to { clip-path: circle(150vmax at var(--vt-x, 50%) var(--vt-y, 50%)); } }
[data-lr-toggle] { display: grid; place-items: center; width: 44px; height: 44px; border-radius: var(--k-pill); color: var(--k-ink); box-shadow: inset 0 0 0 1px var(--k-line-hi); transition: transform 0.16s var(--k-ease), background-color 0.2s ease-out; }
[data-lr-toggle]:active { transform: scale(0.96); }
@media (hover: hover) and (pointer: fine) { [data-lr-toggle]:hover { background: var(--k-hover); } }
@media (prefers-reduced-motion: reduce) { [data-lr-rosette], [data-lr-seal]::after, [data-lr-foil], [data-lr-draw] { animation: none; } }
`
