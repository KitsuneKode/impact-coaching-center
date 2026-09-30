import {
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Newsreader,
  Noto_Serif_Bengali,
} from "next/font/google"

/**
 * Prototype 27: Akhor (letter, in Assamese). After Sarvam: a near-white page,
 * a light serif at display size, a grotesk for reading and a mono for labels,
 * and one living colour field in the hero. The field is muga silk, Assam's
 * own golden thread, folded over a periwinkle ground and drawn by a WebGL
 * shader. Every heading carries its Assamese line from the reviewed copy.
 */

const display = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--ak-display",
})
const bengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  variable: "--ak-as",
})
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--ak-sans" })
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ak-mono",
})

export const fontClass = `${display.variable} ${bengali.variable} ${sans.variable} ${mono.variable}`
export const base = "/prototypes/akhor"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export const tokens = {}

export const themeCss = `
[data-theme="akhor"] {
  ${vars({
    "--k-bg": "#F8F8F6",
    "--k-ink": "#1E2347",
    "--k-muted": "#555B78",
    "--k-line": "rgba(30,35,71,0.1)",
    "--k-line-hi": "rgba(30,35,71,0.2)",
    "--k-card": "#FFFFFF",
    "--k-card-solid": "#FFFFFF",
    "--k-shadow":
      "0 0 0 1px rgba(30,35,71,0.07), 0 1px 2px rgba(30,35,71,0.05), 0 18px 40px -26px rgba(30,35,71,0.3)",
    "--k-tile": "#F1F1EE",
    "--k-chip": "#FFFFFF",
    "--k-hover": "#EDEDF3",
    "--k-on": "#1E2347",
    "--k-on-ink": "#FFFFFF",
    "--k-accent": "#C99A45",
    "--k-accent-deep": "#855A10",
    "--k-accent-ink": "#1E2347",
    "--k-btn": "#1E2347",
    "--k-btn-shadow":
      "inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 20px -12px rgba(30,35,71,0.7)",
    "--k-scrim": "rgba(30,35,71,0.55)",
    "--k-frame": "#F1F1EE",
    "--k-icon-bg": "rgba(255,255,255,0.9)",
    "--k-paper": "#FFFFFF",
    "--k-paper-ink": "#1E2347",
    "--k-paper-muted": "#555B78",
    "--k-paper-line": "rgba(30,35,71,0.12)",
    "--k-danger": "#B3261E",
    "--k-field": "#FFFFFF",
    "--k-fact": "#3F53B5",
    "--k-book-a": "#1E2347",
    "--k-book-a-ink": "#F8F8F6",
    "--k-book-a-spine": "#12153A",
    "--k-book-b": "#E0B869",
    "--k-book-b-ink": "#1E2347",
    "--k-book-b-spine": "#C99A45",
    "--k-book-c": "#FFFFFF",
    "--k-book-c-ink": "#1E2347",
    "--k-book-c-spine": "#E3E3EC",
    "--k-folder-back": "#D5D8EC",
    "--k-folder-front": "#8C9BE3",
    "--k-folder-paper": "#FFFFFF",
    "--k-folder-ink": "#1E2347",
    "--k-folder-muted": "#2E3666",
    "--bk-shadow": "rgba(30,35,71,0.35)",
    "--k-radius": "20px",
    "--k-inner": "12px",
    "--k-pill": "999px",
    "--k-chip-radius": "999px",
    "--k-display-font": "var(--ak-display)",
    "--k-sans": "var(--ak-sans)",
    "--k-mono": "var(--ak-mono)",
    "--k-label-font": "var(--ak-mono)",
    "--k-label-tracking": "0.1em",
    "--k-label-weight": "400",
    "--k-h1-size": "clamp(2.8rem, 6.2vw, 5.4rem)",
    "--k-h1-weight": "360",
    "--k-h1-leading": "1.02",
    "--k-h1-tracking": "-0.03em",
    "--k-h2-size": "clamp(2.1rem, 4vw, 3.4rem)",
    "--k-h2-weight": "360",
    "--k-h2-leading": "1.06",
    "--k-h2-tracking": "-0.025em",
    "--k-display-weight": "400",
    "--ak-grain": GRAIN,
  })}
  background: var(--k-bg);
}

[data-theme="akhor"] [data-k-nav] { background: color-mix(in oklab, #F8F8F6 80%, transparent); box-shadow: 0 1px 0 rgba(30,35,71,0.06); }
[data-theme="akhor"] [data-k-navlink] { padding: 10px 13px; border-radius: 999px; font-size: 0.9rem; font-weight: 500; color: #2B3056; white-space: nowrap; transition: background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-theme="akhor"] [data-k-navlink]:hover { background: rgba(30,35,71,0.06); } }
[data-theme="akhor"] [data-k-brand] { font-weight: 600; letter-spacing: -0.015em; white-space: nowrap; }
[data-theme="akhor"] [data-k-logo] { border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(30,35,71,0.1); }
[data-theme="akhor"] [data-k-header] [data-k-outline] { background: #FFFFFF; box-shadow: inset 0 0 0 1px rgba(30,35,71,0.12), 0 1px 2px rgba(30,35,71,0.06); }
[data-theme="akhor"] [data-k-progress] { background: linear-gradient(90deg, #8C9BE3, #C99A45); }
[data-theme="akhor"] [data-k-btn] { font-weight: 600; color: #FFFFFF; }
[data-theme="akhor"] [data-k-outline] { background: #FFFFFF; box-shadow: inset 0 0 0 1px rgba(30,35,71,0.12), 0 1px 2px rgba(30,35,71,0.06); font-weight: 600; }

/* The Assamese line under each heading, in a Bengali-script serif */
[data-ak-as] { font-family: var(--ak-as), serif; font-weight: 500; color: var(--k-muted); letter-spacing: 0; line-height: 1.5; }
[data-ak-mono] { font-family: var(--ak-mono), monospace; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--k-muted); }
[data-ak-it] { font-style: italic; }

/* ---------- Hero: the silk field ---------- */
[data-ak-hero] { position: relative; isolation: isolate; }
[data-ak-field] { position: absolute; inset: -68px 0 auto 0; height: calc(100% + 68px); z-index: -1; overflow: hidden;
  background:
    radial-gradient(60% 55% at 50% 0%, #E7B86A 0%, rgba(231,184,106,0) 70%),
    radial-gradient(50% 60% at 0% 35%, #AAB4EE 0%, rgba(170,180,238,0) 70%),
    radial-gradient(50% 60% at 100% 35%, #AAB4EE 0%, rgba(170,180,238,0) 70%), #F8F8F6;
  -webkit-mask-image: linear-gradient(180deg, #000 40%, transparent 96%); mask-image: linear-gradient(180deg, #000 40%, transparent 96%); }
[data-ak-field] canvas { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 1.2s ease-out; }
[data-ak-field] canvas[data-on] { opacity: 1; }
[data-ak-field]::after { content: ""; position: absolute; inset: 0; background: var(--ak-grain); opacity: 0.16; mix-blend-mode: soft-light; pointer-events: none; }
[data-theme="akhor"]:has([data-ak-hero]) [data-k-nav] { background: transparent; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
@supports (animation-timeline: scroll()) {
  [data-theme="akhor"]:has([data-ak-hero]) [data-k-nav] { animation: ak-nav linear both; animation-timeline: scroll(root block); animation-range: 30vh 60vh; }
}
@keyframes ak-nav { to { background: color-mix(in oklab, #F8F8F6 84%, transparent); box-shadow: 0 1px 0 rgba(30,35,71,0.06); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%); } }

/* The gamosa phul: woven diamonds either side of a line */
[data-ak-phul] { display: flex; align-items: center; justify-content: center; gap: 10px; color: #855A10; }
[data-ak-phul] i { display: block; width: 7px; height: 7px; transform: rotate(45deg); background: currentColor; }
[data-ak-phul] i:nth-child(2), [data-ak-phul] i:nth-child(6) { width: 11px; height: 11px; background: transparent; box-shadow: inset 0 0 0 1.5px currentColor; }
[data-ak-phul] b { display: block; width: 56px; height: 1px; background: linear-gradient(90deg, transparent, currentColor); }
[data-ak-phul] b:last-child { background: linear-gradient(270deg, transparent, currentColor); }
[data-ak-pill] { display: inline-flex; align-items: center; gap: 10px; min-height: 34px; padding: 0 16px; border-radius: 999px; background: rgba(255,255,255,0.6); box-shadow: inset 0 0 0 1px rgba(30,35,71,0.12);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); font-size: 0.85rem; color: #2B3056; }

/* Language switch: the old words blur out as the new ones arrive */
[data-ak-switch] { position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: #EDEDF3; box-shadow: inset 0 1px 2px rgba(30,35,71,0.08); }
[data-ak-switch] button { position: relative; z-index: 1; min-height: 40px; padding: 0 18px; border-radius: 999px; font-weight: 600; font-size: 0.92rem; color: #555B78; transition: color 0.2s ease-out; }
[data-ak-switch] button[aria-pressed="true"] { color: #1E2347; }
[data-ak-thumb] { position: absolute; z-index: 0; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 3px rgba(30,35,71,0.14), 0 0 0 1px rgba(30,35,71,0.05);
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1); }
[data-ak-switch][data-as] [data-ak-thumb] { transform: translateX(100%); }

[data-ak-track] { position: relative; overflow: hidden; }
[data-ak-track]::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 4px; background: var(--ak-tint, #C99A45); }

/* ---------- Faculty ---------- */
[data-ak-person] { position: relative; overflow: hidden; border-radius: 20px; background: linear-gradient(160deg, #F4E6CB, #DDE2F7); }
[data-ak-person] img { mix-blend-mode: multiply; filter: grayscale(1) contrast(1.05); transition: filter 0.6s ease-out, transform 0.8s cubic-bezier(0.23, 1, 0.32, 1); }
@media (hover: hover) and (pointer: fine) { [data-ak-person-link]:hover [data-ak-person] img { filter: grayscale(0) contrast(1); mix-blend-mode: normal; transform: scale(1.03); } }

/* ---------- Closing panel, after Sarvam's: dusk, grain, arcs, a mark ---------- */
[data-ak-closing] { position: relative; overflow: hidden; isolation: isolate; border-radius: 28px; color: #F8F8F6;
  background: linear-gradient(180deg, #151836 0%, #2A3170 48%, #8C9BE3 100%); box-shadow: 0 0 0 1px rgba(30,35,71,0.08), 0 0 0 6px #FFFFFF, 0 0 0 7px rgba(30,35,71,0.08); }
[data-ak-closing]::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--ak-grain); opacity: 0.22; mix-blend-mode: overlay; }
[data-ak-closing]::after { content: ""; position: absolute; left: 50%; bottom: -78%; z-index: -1; width: 140%; aspect-ratio: 1; transform: translateX(-50%); border-radius: 999px;
  background: repeating-radial-gradient(circle, transparent 0 58px, rgba(248,248,246,0.16) 58px 59px); -webkit-mask-image: linear-gradient(transparent 10%, #000 55%); mask-image: linear-gradient(transparent 10%, #000 55%); }
[data-ak-seal] { display: grid; place-items: center; width: 64px; height: 64px; margin-inline: auto; border-radius: 999px; background: #F8F8F6; box-shadow: 0 0 0 8px rgba(248,248,246,0.12), 0 0 40px 6px rgba(231,184,106,0.45); }
[data-ak-light] { background: #F8F8F6; color: #1E2347; }
[data-ak-closing] [data-ak-as] { color: #D7DBF3; }

[data-theme="akhor"] [data-gf] { --gf-word-lit: linear-gradient(180deg, #8C9BE3, #C99A45 60%, #855A10); --gf-word: rgba(30,35,71,0.06); --gf-word-font: var(--ak-display); --gf-word-weight: 300; }
[data-theme="akhor"] [data-gf-brand] { font-family: var(--ak-sans), sans-serif; }
[data-theme="akhor"] [data-gf-seal] { background: #EFEFF2; box-shadow: none; }

[data-k-faq] summary { list-style: none; }
`
