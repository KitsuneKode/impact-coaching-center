import { Geist, Geist_Mono } from "next/font/google"

/**
 * Prototype 24: Alloy. The Ink and Champagne palette's steel ramp and its
 * champagne, laid out the way a product page is: one object in the hero, a
 * row of highlights, big numbers, and a chart to compare the batches side by
 * side. Brushed aluminium is a cool banded gradient with anisotropic noise;
 * champagne is the same gold as Laureate's with its chroma drawn down.
 */

const sans = Geist({ subsets: ["latin"], variable: "--al-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--al-mono" })

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/alloy"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

const BRUSH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.002 0.9' numOctaves='2' seed='11'/%3E%3CfeColorMatrix values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

/** Anodised aluminium: cool bands, a highlight near the top edge. */
const ALU =
  "linear-gradient(180deg, #F7F9FB 0%, #E3E8EE 18%, #EEF2F6 42%, #D5DCE4 70%, #E8ECF1 100%)"
/** Dark steel for the chrome around the screen. */
const STEEL =
  "linear-gradient(180deg, #52657A 0%, #283A4C 10%, #142537 50%, #0B1827 100%)"
const CHAMPAGNE =
  "linear-gradient(100deg, #AE9D73 0%, #F9E6BB 30%, #E1CFA5 50%, #C7B68C 70%, #F9E6BB 100%)"

export const tokens = {}

export const themeCss = `
[data-theme="alloy"] {
  ${vars({
    "--k-bg": "#F2F4F7",
    "--k-ink": "#142537",
    "--k-muted": "#52657A",
    "--k-line": "rgba(20,37,55,0.1)",
    "--k-line-hi": "rgba(20,37,55,0.2)",
    "--k-card": "#FFFFFF",
    "--k-card-solid": "#FFFFFF",
    "--k-shadow":
      "0 0 0 1px rgba(20,37,55,0.06), 0 2px 4px rgba(20,37,55,0.04), 0 22px 44px -28px rgba(20,37,55,0.3)",
    "--k-tile": "#E9EDF2",
    "--k-chip": "#FFFFFF",
    "--k-hover": "#E3E8EE",
    "--k-on": "#142537",
    "--k-on-ink": "#FFFFFF",
    "--k-accent": "#E1CFA5",
    "--k-accent-deep": "#72613A",
    "--k-accent-ink": "#142537",
    "--k-btn": "#142537",
    "--k-btn-shadow": "inset 0 1px 0 rgba(255,255,255,0.12)",
    "--k-scrim": "rgba(11,24,39,0.6)",
    "--k-frame": "#E9EDF2",
    "--k-icon-bg": "rgba(255,255,255,0.92)",
    "--k-paper": "#FFFFFF",
    "--k-paper-ink": "#142537",
    "--k-paper-muted": "#52657A",
    "--k-paper-line": "rgba(20,37,55,0.12)",
    "--k-danger": "#B3261E",
    "--k-field": "#FFFFFF",
    "--k-fact": "#3C4F62",
    "--k-book-a": "#142537",
    "--k-book-a-ink": "#F2F4F7",
    "--k-book-a-spine": "#051525",
    "--k-book-b": "#E1CFA5",
    "--k-book-b-ink": "#142537",
    "--k-book-b-spine": "#C7B68C",
    "--k-book-c": "#FFFFFF",
    "--k-book-c-ink": "#142537",
    "--k-book-c-spine": "#D7DEE6",
    "--k-folder-back": "#BED4EB",
    "--k-folder-front": "#283A4C",
    "--k-folder-paper": "#FFFFFF",
    "--k-folder-ink": "#F2F4F7",
    "--k-folder-muted": "#A5BAD1",
    "--bk-shadow": "rgba(20,37,55,0.4)",
    "--k-radius": "24px",
    "--k-inner": "14px",
    "--k-pill": "999px",
    "--k-chip-radius": "999px",
    "--k-display-font": "var(--al-sans)",
    "--k-sans": "var(--al-sans)",
    "--k-mono": "var(--al-mono)",
    "--k-label-font": "var(--al-sans)",
    "--k-label-tracking": "0.01em",
    "--k-label-weight": "600",
    "--k-h1-size": "clamp(2.8rem, 6vw, 5.6rem)",
    "--k-h1-weight": "650",
    "--k-h1-leading": "1",
    "--k-h1-tracking": "-0.045em",
    "--k-h2-size": "clamp(2.2rem, 4.4vw, 4rem)",
    "--k-h2-weight": "650",
    "--k-h2-leading": "1.02",
    "--k-h2-tracking": "-0.04em",
    "--k-display-weight": "650",
    "--al-brush": BRUSH,
    "--al-alu": ALU,
    "--al-steel": STEEL,
    "--al-champagne": CHAMPAGNE,
  })}
  background: var(--k-bg);
}

/* Chrome: translucent, a bright top edge, content scrolling underneath */
[data-theme="alloy"] [data-k-nav] { background: rgba(242,244,247,0.72); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 1px 0 rgba(20,37,55,0.08); }
@media (prefers-reduced-transparency: reduce) { [data-theme="alloy"] [data-k-nav] { background: #F2F4F7; backdrop-filter: none; -webkit-backdrop-filter: none; } }
[data-theme="alloy"] [data-k-navlink] { padding: 8px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 450; color: #283A4C; white-space: nowrap; transition: color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-theme="alloy"] [data-k-navlink]:hover { color: #000919; } }
[data-theme="alloy"] [data-k-brand] { font-weight: 600; letter-spacing: -0.02em; font-size: 0.95rem; white-space: nowrap; }
[data-theme="alloy"] [data-k-logo] { border-radius: 12px; box-shadow: inset 0 0 0 1px rgba(20,37,55,0.1); }
[data-theme="alloy"] [data-k-progress] { background: var(--al-champagne); }
[data-theme="alloy"] [data-k-header] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px rgba(20,37,55,0.16); }
[data-theme="alloy"] [data-k-btn] { color: #FFFFFF; font-weight: 550; }
@media (hover: hover) and (pointer: fine) { [data-theme="alloy"] [data-k-btn]:hover { filter: none; background: #283A4C; } }
[data-theme="alloy"] [data-k-outline] { background: transparent; box-shadow: inset 0 0 0 1px rgba(20,37,55,0.2); font-weight: 550; }
[data-al-link] { display: inline-flex; align-items: center; gap: 2px; color: #3C6FB6; font-weight: 500; }
@media (hover: hover) and (pointer: fine) { [data-al-link]:hover { text-decoration: underline; text-underline-offset: 3px; } }

/* Numbers in steel */
[data-al-steel-text] { background: linear-gradient(180deg, #52657A 0%, #142537 55%, #3C4F62 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
[data-al-champ-text] { background: linear-gradient(180deg, #8F7F56, #5B4B24); -webkit-background-clip: text; background-clip: text; color: transparent; }

/* ---------- The device ---------- */
[data-al-device] { position: relative; padding: 1.6%; border-radius: 28px; background: var(--al-steel);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 0 1px rgba(0,9,25,0.7), 0 1px 0 #A5BAD1, 0 60px 90px -50px rgba(0,9,25,0.7), 0 30px 40px -30px rgba(0,9,25,0.35); }
[data-al-device]::before { content: ""; position: absolute; top: 0.7%; left: 50%; width: 7px; height: 7px; margin-left: -3.5px; border-radius: 999px; background: radial-gradient(circle at 40% 35%, #3C4F62, #000919 70%); }
[data-al-screen] { position: relative; overflow: hidden; border-radius: 16px; background: #000919; aspect-ratio: 16 / 10; }
[data-al-base] { height: 16px; margin-inline: -4%; border-radius: 2px 2px 22px 22px; background: var(--al-brush), var(--al-alu); background-blend-mode: overlay, normal;
  box-shadow: inset 0 1px 0 #FFFFFF, inset 0 -2px 3px rgba(20,37,55,0.25), 0 30px 40px -24px rgba(0,9,25,0.6); }
[data-al-base]::after { content: ""; display: block; width: 16%; height: 6px; margin-inline: auto; border-radius: 0 0 10px 10px; background: linear-gradient(180deg, #C4CDD7, #E3E8EE); }

/* ---------- Highlights carousel ---------- */
[data-al-rail] { scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
[data-al-rail]::-webkit-scrollbar { display: none; }
[data-al-rail] > li { scroll-snap-align: start; }
[data-al-slide] { position: relative; overflow: hidden; isolation: isolate; border-radius: 28px; color: #F2F4F7;
  background: radial-gradient(90% 70% at 80% 0%, #283A4C, transparent 70%), linear-gradient(180deg, #142537, #051525); }
[data-al-slide]::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--al-brush); opacity: 0.35; mix-blend-mode: overlay; }
[data-al-slide][data-light] { color: #142537; background: var(--al-alu); box-shadow: inset 0 1px 0 #FFFFFF, inset 0 0 0 1px rgba(20,37,55,0.06); }
[data-al-medal] { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 999px; color: #142537; background: var(--al-champagne);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -2px 4px rgba(91,75,36,0.35), 0 10px 20px -10px rgba(0,9,25,0.6); }
[data-al-arrow] { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: #E3E8EE; color: #142537; transition: background-color 0.15s ease-out, opacity 0.2s ease-out, transform 0.16s ease-out; }
[data-al-arrow]:active { transform: scale(0.94); }
[data-al-arrow]:disabled { opacity: 0.35; }
@media (hover: hover) and (pointer: fine) { [data-al-arrow]:not(:disabled):hover { background: #D5DCE4; } }

/* ---------- Compare ---------- */
[data-al-compare] { scroll-snap-type: x mandatory; scrollbar-width: none; }
[data-al-compare]::-webkit-scrollbar { display: none; }
[data-al-col] { scroll-snap-align: start; }
[data-al-row] { border-top: 1px solid rgba(20,37,55,0.1); padding-block: 18px; }
[data-al-row] dt { font-size: 0.75rem; color: #52657A; }
[data-al-poster] { position: relative; display: block; overflow: hidden; border-radius: 16px; aspect-ratio: 4 / 3; box-shadow: 0 0 0 1px rgba(20,37,55,0.08), 0 16px 30px -20px rgba(20,37,55,0.5);
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
@media (hover: hover) and (pointer: fine) { a:hover > [data-al-poster] { transform: translateY(-4px); } }

/* ---------- Plaques ---------- */
[data-al-plaque] { position: relative; overflow: hidden; border-radius: 24px; background: var(--al-brush), var(--al-alu); background-size: 600px 300px, 100% 100%; background-blend-mode: overlay, normal;
  box-shadow: inset 0 1px 0 #FFFFFF, inset 0 -1px 0 rgba(20,37,55,0.12), 0 0 0 1px rgba(20,37,55,0.08), 0 30px 50px -34px rgba(20,37,55,0.5); }
[data-al-etch] { color: #3C4F62; text-shadow: 0 1px 0 rgba(255,255,255,0.9); }

/* Closing */
[data-al-closing] { position: relative; overflow: hidden; isolation: isolate; border-radius: 32px; color: #F2F4F7; background: radial-gradient(70% 90% at 50% 110%, #3C4F62, transparent 70%), linear-gradient(180deg, #051525, #142537); }
[data-al-closing]::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--al-brush); opacity: 0.3; mix-blend-mode: overlay; }
[data-al-champ-btn] { color: #142537; background: var(--al-champagne); background-size: 200% 100%; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 24px -12px rgba(225,207,165,0.7); transition: background-position 0.8s cubic-bezier(0.23, 1, 0.32, 1), transform 0.16s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-al-champ-btn]:hover { background-position: 100% 0; } }

[data-theme="alloy"] [data-gf] { --gf-word-lit: linear-gradient(180deg, #8CA1B7, #142537); --gf-word: rgba(20,37,55,0.06); --gf-word-weight: 700; }
[data-theme="alloy"] [data-gf-seal] { background: var(--al-alu); box-shadow: inset 0 1px 0 #FFFFFF, 0 0 0 1px rgba(20,37,55,0.08); }
[data-theme="alloy"] [data-gf-seal] svg { color: #72613A; }

[data-k-faq] summary { list-style: none; }
`
