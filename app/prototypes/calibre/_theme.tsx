import { Bodoni_Moda, Jost } from "next/font/google"

/**
 * Prototype 22: Calibre. The Sovereign palette (navy hue 255, antique gold
 * hue 84) finished like a watch: a sunray navy dial whose light band turns
 * toward the pointer, applied gold indices, azurage sub-dials and brushed
 * gold plates. Metal is built from three layers: a banded gradient for the
 * reflected room, anisotropic noise for the brushing, and a specular spot
 * that follows the light.
 */

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--cb-display",
})
const sans = Jost({ subsets: ["latin"], variable: "--cb-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/calibre"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

/** Horizontal brushing: noise stretched along x, grey so it only adds grain under a blend. */
const BRUSH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.003 0.85' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

/** Polished gold: the bands are the room reflected in it. */
const GOLD =
  "linear-gradient(100deg, #8A6714 0%, #F2CC7E 18%, #D7B265 34%, #FFF1C9 50%, #BD994C 66%, #E8C877 82%, #8A6714 100%)"

export const tokens = {}

export const themeCss = `
[data-theme="calibre"] {
  ${vars({
    "--k-bg": "#000820",
    "--k-ink": "#F8F3E6",
    "--k-muted": "#ACB8CB",
    "--k-line": "rgba(172,184,203,0.14)",
    "--k-line-hi": "rgba(215,178,101,0.38)",
    "--k-card": "linear-gradient(180deg, #0D2441 0%, #00132F 100%)",
    "--k-card-solid": "#0D2441",
    "--k-shadow":
      "inset 0 1px 0 rgba(248,243,230,0.06), inset 0 0 0 1px rgba(215,178,101,0.22), 0 40px 60px -40px rgba(0,0,0,0.9)",
    "--k-tile": "#00102A",
    "--k-chip": "rgba(248,243,230,0.04)",
    "--k-hover": "rgba(215,178,101,0.1)",
    "--k-on": GOLD,
    "--k-on-ink": "#000820",
    "--k-accent": "#D7B265",
    "--k-accent-deep": "#D7B265",
    "--k-accent-ink": "#000820",
    "--k-btn": `${GOLD} 0 0 / 220% 100%`,
    "--k-btn-shadow":
      "inset 0 1px 0 rgba(255,250,235,0.7), inset 0 -1px 0 rgba(90,60,0,0.45), 0 16px 30px -16px rgba(215,178,101,0.55)",
    "--k-scrim": "rgba(0,8,32,0.8)",
    "--k-frame": "#00062A",
    "--k-icon-bg": "rgba(0,8,32,0.62)",
    "--k-paper": "#F8F3E6",
    "--k-paper-ink": "#000820",
    "--k-paper-muted": "#354E6E",
    "--k-paper-line": "rgba(0,8,32,0.12)",
    "--k-danger": "#F2A08F",
    "--k-field": "#00102A",
    "--k-fact": "#8CC0D6",
    "--k-book-a": "#213957",
    "--k-book-a-ink": "#F8F3E6",
    "--k-book-a-spine": "#0D2441",
    "--k-book-b": "#D7B265",
    "--k-book-b-ink": "#000820",
    "--k-book-b-spine": "#BD994C",
    "--k-book-c": "#F8F3E6",
    "--k-book-c-ink": "#000820",
    "--k-book-c-spine": "#D8CFB6",
    "--k-folder-back": "#213957",
    "--k-folder-front": "#0D2441",
    "--k-folder-paper": "#F8F3E6",
    "--k-folder-ink": "#F8F3E6",
    "--k-folder-muted": "#ACB8CB",
    "--bk-shadow": "rgba(0,0,0,0.8)",
    "--k-radius": "18px",
    "--k-inner": "12px",
    "--k-pill": "999px",
    "--k-chip-radius": "999px",
    "--k-display-font": "var(--cb-display)",
    "--k-sans": "var(--cb-sans)",
    "--k-mono": "var(--cb-sans)",
    "--k-label-font": "var(--cb-sans)",
    "--k-label-tracking": "0.22em",
    "--k-label-weight": "500",
    "--k-h1-size": "clamp(2.6rem, 4.7vw, 4.6rem)",
    "--k-h1-weight": "500",
    "--k-h1-leading": "1.02",
    "--k-h1-tracking": "-0.02em",
    "--k-h2-size": "clamp(2.1rem, 3.9vw, 3.4rem)",
    "--k-h2-weight": "500",
    "--k-h2-leading": "1.05",
    "--k-h2-tracking": "-0.015em",
    "--k-display-weight": "500",
    "--cb-gold": GOLD,
    "--cb-brush": BRUSH,
  })}
  font-feature-settings: "lnum" 1;
  background:
    radial-gradient(80% 50% at 78% -10%, rgba(33,57,87,0.75), transparent 62%),
    radial-gradient(50% 36% at 0% 42%, rgba(13,36,65,0.6), transparent 70%),
    var(--k-bg);
}

[data-k-navlink] { padding: 10px 11px; border-radius: 999px; font-weight: 500; font-size: 0.74rem; letter-spacing: 0.12em; white-space: nowrap; text-transform: uppercase; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
[data-theme="calibre"] [data-k-nav] { background: color-mix(in oklab, #000820 80%, transparent); box-shadow: 0 1px 0 rgba(215,178,101,0.18); }
[data-theme="calibre"] [data-k-logo] { border-radius: 999px; background: #F8F3E6; box-shadow: 0 0 0 2px #000820, 0 0 0 3.5px #D7B265; }
[data-theme="calibre"] [data-k-brand] { font-family: var(--cb-display), serif; font-weight: 500; font-size: 1.15rem; letter-spacing: 0.01em; white-space: nowrap; }
@media (max-width: 1180px) { [data-theme="calibre"] [data-k-brand] { display: none; } }
[data-theme="calibre"] [data-k-progress] { background: var(--cb-gold); }
[data-theme="calibre"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px var(--k-line-hi); font-weight: 500; letter-spacing: 0.02em; }
[data-theme="calibre"] [data-k-photo] { outline: 1px solid rgba(215,178,101,0.3); outline-offset: -1px; }
[data-theme="calibre"] [data-k-tag] { padding: 5px 12px; font-size: 0.66rem; color: var(--k-accent); }
[data-theme="calibre"] main, [data-theme="calibre"] footer, [data-theme="calibre"] [data-k-header] { position: relative; z-index: 1; }

/* Buttons are polished gold: the reflection slides across on hover. */
[data-theme="calibre"] [data-k-btn], [data-theme="calibre"] [data-pm-btn]:not([data-quiet]), [data-theme="calibre"] [data-eq-btn]:not([data-quiet]):not(:disabled), [data-theme="calibre"] [data-fb-read] {
  background: var(--k-btn); letter-spacing: 0.02em; transition: background-position 0.9s var(--k-ease), transform 0.16s var(--k-ease); }
@media (hover: hover) and (pointer: fine) {
  [data-theme="calibre"] [data-k-btn]:hover, [data-theme="calibre"] [data-pm-btn]:not([data-quiet]):hover, [data-theme="calibre"] [data-eq-btn]:not([data-quiet]):hover, [data-theme="calibre"] [data-fb-read]:hover { background-position: 100% 0; filter: none; }
}

/* Gold type: the same bands, clipped to the letters, drifting slowly. */
[data-cb-gilt] { background: var(--cb-gold); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; font-style: italic; padding: 0 0.06em 0.08em 0; }
@keyframes cb-drift { from { background-position: 0 0; } to { background-position: 100% 0; } }
@media (prefers-reduced-motion: no-preference) { [data-cb-gilt] { animation: cb-drift 10s ease-in-out infinite alternate; } }

[data-cb-label] { font-family: var(--cb-sans), sans-serif; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--k-accent); }

/* ---------- The dial ---------- */
[data-cb-dial] { --ang: 210deg; position: relative; aspect-ratio: 1; width: 100%; border-radius: 999px; isolation: isolate; container-type: inline-size;
  box-shadow: 0 0 0 1px rgba(215,178,101,0.55), 0 0 0 9px #06122B, 0 0 0 10px rgba(215,178,101,0.32), 0 60px 90px -40px rgba(0,0,0,0.95), 0 0 120px -20px rgba(54,96,175,0.35); }
/* Sunray: fine radial brushing, and the two bright wedges a real dial throws toward the light. */
[data-cb-face] { position: absolute; inset: 0; border-radius: inherit; overflow: hidden;
  background:
    repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.028) 0deg 0.35deg, rgba(0,0,0,0.05) 0.35deg 0.7deg),
    conic-gradient(from var(--ang) at 50% 50%, rgba(140,176,226,0.42) 0deg, transparent 38deg, transparent 142deg, rgba(140,176,226,0.3) 180deg, transparent 218deg, transparent 322deg, rgba(140,176,226,0.42) 360deg),
    radial-gradient(circle at 50% 50%, #17396A 0%, #0D2441 46%, #061734 100%); }
[data-cb-face]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,4,16,0.55) 100%); }
@property --ang { syntax: "<angle>"; inherits: true; initial-value: 210deg; }
[data-cb-dial] { transition: --ang 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
@media (hover: none) and (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) { [data-cb-dial] { animation: cb-sweep linear both; animation-timeline: scroll(root block); } }
}
@keyframes cb-sweep { from { --ang: 150deg; } to { --ang: 510deg; } }

[data-cb-stop="hi"] { stop-color: #FFF1C9; } [data-cb-stop="mid"] { stop-color: #D7B265; } [data-cb-stop="lo"] { stop-color: #8A6714; }
[data-cb-tick] { stroke: #D7B265; } [data-cb-tick="short"] { stroke-opacity: 0.4; } [data-cb-tick="long"] { stroke-opacity: 0.9; }
[data-cb-ring] { fill: none; stroke: rgba(215,178,101,0.14); }
[data-cb-track] { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
[data-cb-arc] { fill: none; stroke-linecap: butt; cursor: pointer; transition: stroke-width 0.3s var(--k-ease), opacity 0.3s ease-out; opacity: 0.42; }
[data-cb-arc][data-on] { opacity: 1; stroke-width: 15; }
@media (hover: hover) and (pointer: fine) { [data-cb-arc]:hover { opacity: 0.8; } }

/* Applied indices: small gold batons, bevelled, catching the light. */
[data-cb-index] { position: absolute; left: 50%; top: 50%; width: 2.6cqw; height: 7.4cqw; margin: -3.7cqw 0 0 -1.3cqw; border-radius: 1px;
  transform: rotate(calc(var(--i) * 30deg)) translateY(-31.5cqw);
  background: linear-gradient(90deg, #7F5D00, #FFF1C9 38%, #D7B265 55%, #8A6714); box-shadow: 0 1px 2px rgba(0,0,0,0.6); }
[data-cb-index][data-twelve] { width: 5.6cqw; margin-left: -2.8cqw; background: linear-gradient(90deg, #7F5D00, #FFF1C9 22%, #D7B265 30%, #000820 30% 70%, #D7B265 70%, #FFF1C9 78%, #8A6714); }
[data-cb-print] { position: absolute; left: 0; right: 0; text-align: center; pointer-events: none; }
[data-cb-print="brand"] { top: 27%; font-family: var(--cb-display), serif; font-size: 4.2cqw; letter-spacing: 0.26em; font-weight: 600; color: #F8F3E6; }
[data-cb-print="town"] { top: 34%; font-family: var(--cb-sans), sans-serif; font-size: 1.9cqw; letter-spacing: 0.36em; text-transform: uppercase; color: #D7B265; }
[data-cb-window] { position: absolute; left: 50%; top: 62%; transform: translateX(-50%); min-width: 34cqw; padding: 1.4cqw 2.6cqw; border-radius: 1.2cqw; text-align: center;
  background: linear-gradient(180deg, #F8F3E6, #E9E1CB); color: #000820; box-shadow: inset 0 1px 3px rgba(0,0,0,0.55), 0 0 0 0.5cqw #06122B, 0 0 0 0.75cqw rgba(215,178,101,0.7); }
[data-cb-window] b { display: block; font-family: var(--cb-display), serif; font-weight: 600; font-size: 3.4cqw; line-height: 1.1; }
[data-cb-window] span { display: block; font-size: 2.1cqw; letter-spacing: 0.12em; text-transform: uppercase; color: #354E6E; font-variant-numeric: tabular-nums; }

/* Hands: dauphine gold for hours and minutes, a thin seconds hand with a counterweight. */
[data-cb-hand] { position: absolute; left: 50%; bottom: 50%; transform-origin: 50% 100%; border-radius: 99px 99px 2px 2px; transform: rotate(var(--rot, 0deg));
  transition: transform 1.4s cubic-bezier(0.65, 0, 0.35, 1); filter: drop-shadow(0 6px 5px rgba(0,0,0,0.5)); }
[data-cb-hand="h"] { width: 3.2cqw; height: 22cqw; margin-left: -1.6cqw; clip-path: polygon(50% 0, 100% 78%, 50% 100%, 0 78%); background: linear-gradient(90deg, #FFF1C9 0 50%, #BD994C 50%); }
[data-cb-hand="m"] { width: 2.6cqw; height: 33cqw; margin-left: -1.3cqw; clip-path: polygon(50% 0, 100% 82%, 50% 100%, 0 82%); background: linear-gradient(90deg, #FFF1C9 0 50%, #BD994C 50%); }
[data-cb-sec] { position: absolute; left: 50%; top: 50%; width: 0.5cqw; height: 44cqw; margin: -34cqw 0 0 -0.25cqw; transform-origin: 50% 34cqw; background: #D7B265; border-radius: 1px; }
[data-cb-sec]::after { content: ""; position: absolute; left: 50%; bottom: -1cqw; width: 2.2cqw; height: 5cqw; margin-left: -1.1cqw; border-radius: 1cqw; background: #D7B265; }
@keyframes cb-tick { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: no-preference) { [data-cb-sec] { animation: cb-tick 60s linear infinite; animation-delay: var(--sec-delay, 0s); } }
[data-cb-pin] { position: absolute; left: 50%; top: 50%; width: 4cqw; height: 4cqw; margin: -2cqw 0 0 -2cqw; border-radius: 999px; background: radial-gradient(circle at 35% 30%, #FFF1C9, #BD994C 55%, #634800); box-shadow: 0 2px 4px rgba(0,0,0,0.6); }

[data-cb-strip] { border-block: 1px solid rgba(215,178,101,0.2); }
[data-cb-batch] { display: grid; gap: 4px; width: 100%; height: 100%; padding: 14px 16px; border-radius: 14px; text-align: left; color: var(--k-muted);
  transition: background-color 0.2s ease-out, color 0.2s ease-out, box-shadow 0.2s ease-out; }
[data-cb-batch][aria-pressed="true"] { color: var(--k-ink); background: rgba(215,178,101,0.08); box-shadow: inset 0 0 0 1px rgba(215,178,101,0.4); }
@media (hover: hover) and (pointer: fine) { [data-cb-batch]:hover { color: var(--k-ink); } }
[data-cb-batch] time { font-variant-numeric: tabular-nums; color: var(--k-accent); font-size: 0.8rem; letter-spacing: 0.08em; }

/* ---------- Sub-dials: azurage rings, a hand that sweeps once ---------- */
[data-cb-sub] { position: relative; aspect-ratio: 1; width: 100%; max-width: 220px; border-radius: 999px; margin-inline: auto;
  background:
    repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px),
    radial-gradient(circle at 50% 38%, #10284B, #04112A 80%);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(215,178,101,0.4), 0 0 0 6px #030C22, 0 0 0 7px rgba(215,178,101,0.22); }
[data-cb-sub]::before { content: ""; position: absolute; inset: 8%; border-radius: 999px;
  background: repeating-conic-gradient(from -135deg, rgba(215,178,101,0.8) 0deg 0.9deg, transparent 0.9deg 13.5deg);
  -webkit-mask: radial-gradient(closest-side, transparent 86%, #000 87%, #000 96%, transparent 97%); mask: radial-gradient(closest-side, transparent 86%, #000 87%, #000 96%, transparent 97%);
  clip-path: polygon(50% 50%, 0 100%, 0 0, 100% 0, 100% 100%); }
[data-cb-subhand] { position: absolute; left: 50%; bottom: 50%; width: 3px; height: 38%; margin-left: -1.5px; transform-origin: 50% 100%; background: linear-gradient(#FFF1C9, #BD994C); border-radius: 2px; }
[data-cb-subhand]::after { content: ""; position: absolute; left: 50%; bottom: -5px; width: 10px; height: 10px; margin-left: -5px; border-radius: 999px; background: radial-gradient(circle at 35% 30%, #FFF1C9, #BD994C 60%, #634800); }

/* ---------- Brushed gold plates ---------- */
[data-cb-plate] { position: relative; overflow: hidden; border-radius: 16px; color: #1D1200;
  background:
    radial-gradient(520px circle at var(--lx, 28%) var(--ly, 18%), rgba(255,250,232,0.62), transparent 58%),
    var(--cb-brush),
    linear-gradient(100deg, #A9822B, #F2CC7E 22%, #D7B265 40%, #FFF1C9 53%, #BD994C 68%, #E8C877 84%, #9E7A2B);
  background-size: auto, 600px 300px, 100% 100%;
  background-blend-mode: soft-light, overlay, normal;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(80,55,0,0.55), inset 0 0 0 1px rgba(127,93,0,0.5), 0 40px 70px -36px rgba(0,0,0,0.95); }
[data-cb-engrave] { color: #2A1D00; text-shadow: 0 1px 0 rgba(255,246,214,0.6), 0 -1px 0 rgba(60,40,0,0.25); }
[data-cb-serial] { font-family: var(--cb-display), serif; font-weight: 600; font-size: clamp(5rem, 11vw, 8.5rem); line-height: 0.8; font-variant-numeric: lining-nums; color: transparent;
  background: linear-gradient(180deg, #5A4200, #2A1D00); -webkit-background-clip: text; background-clip: text; filter: drop-shadow(0 1px 0 rgba(255,246,214,0.7)); }

/* ---------- Faculty in bezels ---------- */
[data-cb-bezel] { position: relative; display: block; aspect-ratio: 1; border-radius: 999px; padding: 9%; }
[data-cb-bezel]::before { content: ""; position: absolute; inset: 0; border-radius: 999px;
  background: repeating-conic-gradient(from 0deg, rgba(215,178,101,0.75) 0deg 1deg, transparent 1deg 6deg), radial-gradient(circle, transparent 60%, #06122B 61%);
  -webkit-mask: radial-gradient(closest-side, transparent 88%, #000 89%, #000 99%, transparent 100%); mask: radial-gradient(closest-side, transparent 88%, #000 89%, #000 99%, transparent 100%);
  transition: transform 0.9s cubic-bezier(0.34, 1.2, 0.64, 1); }
@media (hover: hover) and (pointer: fine) { [data-cb-face-link]:hover [data-cb-bezel]::before { transform: rotate(30deg); } }
[data-cb-bezel] > span { position: relative; display: block; height: 100%; border-radius: 999px; overflow: hidden; box-shadow: 0 0 0 1px rgba(215,178,101,0.6), 0 0 0 5px #06122B, 0 0 0 6px rgba(215,178,101,0.25); }

/* ---------- Closing panel ---------- */
[data-cb-closing] { position: relative; overflow: hidden; border-radius: 28px; isolation: isolate;
  background:
    repeating-conic-gradient(from 0deg at 50% 120%, rgba(255,255,255,0.025) 0deg 0.4deg, transparent 0.4deg 0.8deg),
    radial-gradient(90% 90% at 50% 120%, #1E4478, #0D2441 45%, #000E27);
  box-shadow: inset 0 0 0 1px rgba(215,178,101,0.35), 0 50px 80px -50px rgba(0,0,0,0.9); }
[data-cb-closing]::after { content: ""; position: absolute; left: 50%; bottom: -60%; width: 110%; aspect-ratio: 1; transform: translateX(-50%); border-radius: 999px; z-index: -1;
  background: repeating-radial-gradient(circle, transparent 0 46px, rgba(215,178,101,0.14) 46px 47px); -webkit-mask-image: linear-gradient(transparent, #000 60%); mask-image: linear-gradient(transparent, #000 60%); }

[data-theme="calibre"] [data-gf] { --gf-word-lit: linear-gradient(100deg, #8A6714, #F2CC7E 30%, #FFF1C9 50%, #BD994C 70%, #8A6714); --gf-word: rgba(215,178,101,0.13); --gf-word-weight: 500; }
[data-theme="calibre"] [data-gf-word-base] { background: linear-gradient(180deg, rgba(242,204,126,0.2), rgba(215,178,101,0.04)); -webkit-background-clip: text; background-clip: text; color: transparent; }
[data-theme="calibre"] [data-gf-head] { color: var(--k-accent); letter-spacing: 0.22em; }

[data-k-faq] summary { list-style: none; }
@media (prefers-reduced-motion: reduce) { [data-cb-hand] { transition: none; } }
`
