import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google"

/**
 * Prototype 26: Rollcall. ICT's own photographs are the background: columns
 * of real classrooms and real teachers drift behind the headline. After
 * Animatoa: a floating pill nav, mono caps labels, two-tone headlines, and
 * one saturated, grainy colour panel per exam that stack as you scroll.
 */

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--rc-display",
})
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--rc-mono",
})

export const fontClass = `${display.variable} ${mono.variable}`
export const base = "/prototypes/rollcall"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export const tokens = {}

export const themeCss = `
[data-theme="rollcall"] {
  ${vars({
    "--k-bg": "#EDECE8",
    "--k-ink": "#141416",
    "--k-muted": "#56565E",
    "--k-line": "rgba(20,20,22,0.12)",
    "--k-line-hi": "rgba(20,20,22,0.3)",
    "--k-card": "#F7F6F3",
    "--k-card-solid": "#F7F6F3",
    "--k-shadow":
      "0 0 0 1px rgba(20,20,22,0.08), 0 24px 40px -30px rgba(20,20,22,0.4)",
    "--k-tile": "#E3E2DD",
    "--k-chip": "#F7F6F3",
    "--k-hover": "#DEDDD7",
    "--k-on": "#141416",
    "--k-on-ink": "#F7F6F3",
    "--k-accent": "#3E4FD8",
    "--k-accent-deep": "#2F3DB0",
    "--k-accent-ink": "#FFFFFF",
    "--k-btn": "#141416",
    "--k-btn-shadow": "0 8px 18px -10px rgba(20,20,22,0.7)",
    "--k-scrim": "rgba(20,20,22,0.62)",
    "--k-frame": "#E3E2DD",
    "--k-icon-bg": "rgba(247,246,243,0.92)",
    "--k-paper": "#FFFFFF",
    "--k-paper-ink": "#141416",
    "--k-paper-muted": "#56565E",
    "--k-paper-line": "rgba(20,20,22,0.14)",
    "--k-danger": "#B3261E",
    "--k-field": "#F7F6F3",
    "--k-fact": "#2F3DB0",
    "--k-book-a": "#3E4FD8",
    "--k-book-a-ink": "#FFFFFF",
    "--k-book-a-spine": "#2F3DB0",
    "--k-book-b": "#E8613C",
    "--k-book-b-ink": "#141416",
    "--k-book-b-spine": "#C94A28",
    "--k-book-c": "#F7F6F3",
    "--k-book-c-ink": "#141416",
    "--k-book-c-spine": "#DEDDD7",
    "--k-folder-back": "#D9B43B",
    "--k-folder-front": "#141416",
    "--k-folder-paper": "#FFFFFF",
    "--k-folder-ink": "#F7F6F3",
    "--k-folder-muted": "#B9B9C0",
    "--bk-shadow": "rgba(20,20,22,0.45)",
    "--k-radius": "28px",
    "--k-inner": "16px",
    "--k-pill": "999px",
    "--k-chip-radius": "999px",
    "--k-display-font": "var(--rc-display)",
    "--k-sans": "var(--rc-display)",
    "--k-mono": "var(--rc-mono)",
    "--k-label-font": "var(--rc-mono)",
    "--k-label-tracking": "0.08em",
    "--k-label-weight": "500",
    "--k-h1-size": "clamp(2.9rem, 7vw, 6.4rem)",
    "--k-h1-weight": "700",
    "--k-h1-leading": "0.92",
    "--k-h1-tracking": "-0.045em",
    "--k-h2-size": "clamp(2.2rem, 4.8vw, 4.2rem)",
    "--k-h2-weight": "700",
    "--k-h2-leading": "0.96",
    "--k-h2-tracking": "-0.04em",
    "--k-display-weight": "650",
    "--rc-grain": GRAIN,
  })}
  background: var(--k-bg);
  font-variation-settings: "wdth" 96;
}
/* Paper grain over the whole page, fixed so it never repaints on scroll */
[data-theme="rollcall"]::after { content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none; background: var(--rc-grain); opacity: 0.07; mix-blend-mode: multiply; }

/* A floating pill for the nav */
[data-theme="rollcall"] [data-k-nav] { background: transparent; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; padding-top: 10px; }
[data-theme="rollcall"] [data-k-nav] > div:first-child { max-width: 1000px; height: 56px; border-radius: 999px; padding-inline: 10px 10px; background: rgba(247,246,243,0.92);
  backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); box-shadow: 0 0 0 1px rgba(20,20,22,0.08), 0 12px 30px -16px rgba(20,20,22,0.45); }
[data-theme="rollcall"]:has([data-rc-hero]) [data-k-header] { margin-bottom: -76px; }
[data-theme="rollcall"] [data-k-navlink] { padding: 8px 12px; border-radius: 999px; font-family: var(--rc-mono), monospace; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #141416; white-space: nowrap; transition: background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-theme="rollcall"] [data-k-navlink]:hover { background: #E3E2DD; } }
[data-theme="rollcall"] [data-k-brand] { font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
@media (max-width: 1100px) { [data-theme="rollcall"] [data-k-brand] { display: none; } }
[data-theme="rollcall"] [data-k-logo] { border-radius: 999px; }
[data-theme="rollcall"] [data-k-header] [data-k-outline] { height: 40px; background: #141416; color: #F7F6F3; box-shadow: none; font-family: var(--rc-mono), monospace; font-size: 0.72rem; letter-spacing: 0.04em; }
[data-theme="rollcall"] [data-k-progress] { display: none; }
[data-theme="rollcall"] [data-k-btn] { color: #F7F6F3; font-family: var(--rc-mono), monospace; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
@media (hover: hover) and (pointer: fine) { [data-theme="rollcall"] [data-k-btn]:hover { filter: none; background: #2A2A2E; } }
[data-theme="rollcall"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1.5px #141416; font-family: var(--rc-mono), monospace; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }

[data-rc-mono] { font-family: var(--rc-mono), monospace; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; }
[data-rc-tag] { display: inline-flex; align-items: center; min-height: 30px; padding: 0 14px; border-radius: 999px; box-shadow: inset 0 0 0 1px currentColor; font-family: var(--rc-mono), monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; }
[data-rc-dim] { opacity: 0.45; }
[data-rc-cta] { font-family: var(--rc-mono), monospace; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }

/* ---------- Hero: the photo wall ---------- */
[data-rc-hero] { position: relative; min-height: 100svh; isolation: isolate; overflow: clip; color: #F7F6F3; background: #141416; }
[data-rc-wall] { position: absolute; inset: -4% -3%; z-index: -2; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; transform: rotate(-4deg) scale(1.08); }
@media (max-width: 768px) { [data-rc-wall] { grid-template-columns: repeat(3, minmax(0, 1fr)); } [data-rc-col]:nth-child(n + 4) { display: none; } }
[data-rc-col] { display: grid; gap: 14px; align-content: start; }
[data-rc-col] > span { position: relative; display: block; aspect-ratio: 3 / 4; overflow: hidden; border-radius: 18px; background: #26262A; }
[data-rc-col] img { object-fit: cover; filter: grayscale(0.35) contrast(1.05); }
@keyframes rc-up { to { transform: translateY(-50%); } }
@keyframes rc-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
@media (prefers-reduced-motion: no-preference) {
  [data-rc-col] { animation: rc-up var(--dur, 60s) linear infinite; }
  [data-rc-col]:nth-child(even) { animation-name: rc-down; }
}
[data-rc-hero]::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(180deg, rgba(20,20,22,0.55) 0%, rgba(20,20,22,0.35) 35%, rgba(20,20,22,0.82) 72%, #141416 100%), radial-gradient(70% 60% at 20% 80%, rgba(20,20,22,0.7), transparent 70%); }

/* ---------- Colour panels, grainy ---------- */
[data-rc-panel] { position: relative; overflow: hidden; isolation: isolate; border-radius: 32px; color: #141416; background: var(--rc-field); }
[data-rc-panel]::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--rc-grain); opacity: 0.55; mix-blend-mode: overlay; }
[data-rc-panel]::after { content: ""; position: absolute; inset: 0; z-index: -1; background: radial-gradient(90% 80% at 100% 0%, rgba(255,255,255,0.28), transparent 60%); }
[data-rc-poster] { position: relative; display: block; overflow: hidden; border-radius: 20px; aspect-ratio: 4 / 3; transform: rotate(var(--tilt, 2deg)); box-shadow: 0 30px 50px -24px rgba(20,20,22,0.6), 0 0 0 6px rgba(247,246,243,0.9);
  transition: transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1); }
@media (hover: hover) and (pointer: fine) { a:hover [data-rc-poster] { transform: rotate(0deg) scale(1.02); } }

/* ---------- Faces: a fan of student reviews ---------- */
[data-rc-fan] { position: relative; display: flex; justify-content: center; height: 420px; }
[data-rc-card] { position: absolute; top: 40px; left: 50%; margin-left: -115px; width: 230px; aspect-ratio: 9 / 13; overflow: hidden; border-radius: 22px; background: #141416; color: #F7F6F3;
  box-shadow: 0 0 0 5px #F7F6F3, 0 30px 50px -24px rgba(20,20,22,0.55);
  transform: translateX(calc(var(--i) * 150px)) rotate(calc(var(--i) * 7deg)) translateY(calc(var(--a) * 22px));
  transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1); z-index: var(--z); }
[data-rc-card] img { object-fit: cover; object-position: 50% 30%; transform: scale(1.8); }
@media (hover: hover) and (pointer: fine) {
  [data-rc-fan]:hover [data-rc-card] { transform: translateX(calc(var(--i) * 190px)) rotate(calc(var(--i) * 4deg)) translateY(calc(var(--a) * 12px)); }
  [data-rc-fan] [data-rc-card]:hover { transform: translateX(calc(var(--i) * 190px)) rotate(0deg) translateY(-24px) scale(1.04); z-index: 20; }
}
@media (max-width: 768px) { [data-rc-card] { width: 170px; margin-left: -85px; transform: translateX(calc(var(--i) * 70px)) rotate(calc(var(--i) * 7deg)) translateY(calc(var(--a) * 16px)); } [data-rc-fan] { height: 330px; } }

[data-rc-face] img { filter: grayscale(1); transition: filter 0.5s ease-out, transform 0.8s cubic-bezier(0.23, 1, 0.32, 1); }
@media (hover: hover) and (pointer: fine) { a:hover [data-rc-face] img { filter: grayscale(0); transform: scale(1.04); } }

[data-rc-closing] { --rc-field: #E8613C; }

[data-theme="rollcall"] [data-gf] { --gf-word-lit: linear-gradient(90deg, #3E4FD8, #E8613C 50%, #D9B43B); --gf-word: rgba(20,20,22,0.08); --gf-word-weight: 800; }
[data-theme="rollcall"] [data-gf-seal] { background: #F7F6F3; }

[data-k-faq] summary { list-style: none; }
`
