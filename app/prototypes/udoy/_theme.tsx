import { Geist_Mono, Schibsted_Grotesk } from "next/font/google"

/**
 * Prototype 24: Udoy (sunrise, in Assamese). Image first: dusk on the
 * Brahmaputra fills the hero and a batch search sits on it the way a travel
 * site's does. The palette is lifted from the photograph: night-sky navy,
 * the apricot of the sun on the water, and a cool river mist for the page.
 * Photographs: Unsplash (5WDMT98VnSI, 9eFACRt8tt4), free licence.
 */

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--ud-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--ud-mono" })

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/udoy"

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ")

export const tokens = {}

export const themeCss = `
[data-theme="udoy"] {
  ${vars({
    "--k-bg": "#EEF1F5",
    "--k-ink": "#0E1733",
    "--k-muted": "#4A5570",
    "--k-line": "rgba(14,23,51,0.1)",
    "--k-line-hi": "rgba(14,23,51,0.22)",
    "--k-card": "#FFFFFF",
    "--k-card-solid": "#FFFFFF",
    "--k-shadow":
      "0 0 0 1px rgba(14,23,51,0.06), 0 1px 2px rgba(14,23,51,0.06), 0 24px 48px -28px rgba(14,23,51,0.35)",
    "--k-tile": "#F6F7FA",
    "--k-chip": "#FFFFFF",
    "--k-hover": "#E4E8EF",
    "--k-on": "#0E1733",
    "--k-on-ink": "#FFFFFF",
    "--k-accent": "#F2A65A",
    "--k-accent-deep": "#9A4A08",
    "--k-accent-ink": "#0E1733",
    "--k-btn": "#F2A65A",
    "--k-btn-shadow":
      "inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 24px -12px rgba(242,166,90,0.9)",
    "--k-scrim": "rgba(14,23,51,0.6)",
    "--k-frame": "#F6F7FA",
    "--k-icon-bg": "rgba(255,255,255,0.9)",
    "--k-paper": "#FFFFFF",
    "--k-paper-ink": "#0E1733",
    "--k-paper-muted": "#4A5570",
    "--k-paper-line": "rgba(14,23,51,0.12)",
    "--k-danger": "#B3261E",
    "--k-field": "#FFFFFF",
    "--k-fact": "#1F5C8B",
    "--k-book-a": "#1B2A5A",
    "--k-book-a-ink": "#F5F2EC",
    "--k-book-a-spine": "#0E1733",
    "--k-book-b": "#F2A65A",
    "--k-book-b-ink": "#0E1733",
    "--k-book-b-spine": "#D98A3F",
    "--k-book-c": "#FFFFFF",
    "--k-book-c-ink": "#0E1733",
    "--k-book-c-spine": "#DCE1EA",
    "--k-folder-back": "#C9D2E0",
    "--k-folder-front": "#1B2A5A",
    "--k-folder-paper": "#FFFFFF",
    "--k-folder-ink": "#F5F2EC",
    "--k-folder-muted": "#B5C0D6",
    "--bk-shadow": "rgba(14,23,51,0.4)",
    "--k-radius": "22px",
    "--k-inner": "14px",
    "--k-pill": "999px",
    "--k-chip-radius": "999px",
    "--k-display-font": "var(--ud-sans)",
    "--k-sans": "var(--ud-sans)",
    "--k-mono": "var(--ud-mono)",
    "--k-label-font": "var(--ud-mono)",
    "--k-label-tracking": "0.08em",
    "--k-label-weight": "500",
    "--k-h1-size": "clamp(2.7rem, 6vw, 5.6rem)",
    "--k-h1-weight": "700",
    "--k-h1-leading": "0.98",
    "--k-h1-tracking": "-0.035em",
    "--k-h2-size": "clamp(2rem, 4vw, 3.4rem)",
    "--k-h2-weight": "700",
    "--k-h2-leading": "1.02",
    "--k-h2-tracking": "-0.03em",
    "--k-display-weight": "650",
  })}
  background: var(--k-bg);
  /* Schibsted's tabular figures set commas and points a full figure wide; keep proportional */
  font-feature-settings: "tnum" 0;
}

/* The header is navy glass everywhere, and clear over the home page's photograph until you scroll. */
[data-theme="udoy"] [data-k-nav] { background: rgba(14,23,51,0.92); box-shadow: 0 1px 0 rgba(255,255,255,0.08); color: #F5F2EC; }
[data-theme="udoy"] [data-k-navlink] { padding: 10px 13px; border-radius: 999px; font-size: 0.875rem; font-weight: 500; color: rgba(245,242,236,0.78); white-space: nowrap; transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-theme="udoy"] [data-k-navlink]:hover { color: #FFFFFF; background: rgba(255,255,255,0.1); } }
[data-theme="udoy"] [data-k-header] [data-k-outline] { color: #F5F2EC; background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.28); }
[data-theme="udoy"] [data-k-brand] { font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
[data-theme="udoy"] [data-k-logo] { border-radius: 999px; }
[data-theme="udoy"] [data-k-progress] { background: #F2A65A; }
[data-theme="udoy"]:has([data-ud-hero]) [data-k-header] { margin-bottom: -68px; }
[data-theme="udoy"]:has([data-ud-hero]) [data-k-nav] { background: transparent; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
@supports (animation-timeline: scroll()) {
  [data-theme="udoy"]:has([data-ud-hero]) [data-k-nav] { animation: ud-nav linear both; animation-timeline: scroll(root block); animation-range: 40vh 80vh; }
}
@keyframes ud-nav { to { background: rgba(14,23,51,0.94); box-shadow: 0 1px 0 rgba(255,255,255,0.08); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%); } }

[data-theme="udoy"] [data-k-btn] { font-weight: 650; }
@media (hover: hover) and (pointer: fine) { [data-theme="udoy"] [data-k-btn]:hover { filter: brightness(1.05) saturate(1.05); } }
[data-ud-label] { font-family: var(--ud-mono), monospace; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; }

/* ---------- Hero ---------- */
[data-ud-hero] { position: relative; min-height: 100svh; isolation: isolate; overflow: clip; color: #F7F4EE; background: #0E1733; }
[data-ud-photo] { position: absolute; inset: 0; z-index: -2; }
[data-ud-photo] img { object-fit: cover; object-position: 50% 62%; }
@keyframes ud-settle { from { transform: scale(1.08); } to { transform: scale(1); } }
@media (prefers-reduced-motion: no-preference) { [data-ud-photo] img { animation: ud-settle 14s cubic-bezier(0.23, 1, 0.32, 1) both; } }
/* Scrims tinted to the sky, never grey: dark where the headline and the search sit, clear over the sun. */
[data-ud-hero]::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(10,18,48,0.72) 0%, rgba(10,18,48,0.2) 34%, rgba(10,18,48,0) 52%, rgba(8,12,30,0.35) 72%, rgba(8,12,30,0.82) 100%),
    radial-gradient(60% 50% at 0% 30%, rgba(10,18,48,0.55), transparent 70%); }

/* The search: a frosted pill with two questions and one button. */
[data-ud-search] { position: relative; display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: center; gap: 4px; padding: 8px; border-radius: 999px; color: #0E1733;
  background: rgba(255,255,255,0.93); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.4), 0 30px 60px -24px rgba(4,8,24,0.7); }
@media (prefers-reduced-transparency: reduce) { [data-ud-search] { background: #FFFFFF; backdrop-filter: none; -webkit-backdrop-filter: none; } }
@media (max-width: 640px) { [data-ud-search] { grid-template-columns: 1fr; border-radius: 26px; padding: 10px; } [data-ud-sep] { display: none; } }
[data-ud-seg] { display: grid; gap: 1px; width: 100%; min-height: 56px; padding: 8px 22px; border-radius: 999px; text-align: left; transition: background-color 0.18s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-ud-seg]:hover { background: rgba(14,23,51,0.06); } }
[data-ud-seg][aria-expanded="true"] { background: #FFFFFF; box-shadow: 0 6px 20px -8px rgba(14,23,51,0.35); }
[data-ud-seg] small { font-family: var(--ud-mono), monospace; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: #4A5570; }
[data-ud-seg] span { font-weight: 650; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-ud-sep] { width: 1px; height: 32px; background: rgba(14,23,51,0.14); }
[data-ud-go] { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 56px; padding: 0 26px; border-radius: 999px; font-weight: 650; white-space: nowrap;
  color: #0E1733; background: #F2A65A; box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 22px -10px rgba(242,166,90,0.95); transition: transform 0.16s var(--k-ease), filter 0.2s ease-out; }
[data-ud-go]:active { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { [data-ud-go]:hover { filter: brightness(1.05); } }
[data-ud-pop] { position: absolute; bottom: calc(100% + 10px); z-index: 30; min-width: 280px; padding: 8px; border-radius: 22px; background: #FFFFFF; color: #0E1733;
  box-shadow: 0 0 0 1px rgba(14,23,51,0.08), 0 30px 60px -20px rgba(4,8,24,0.55); transform-origin: 20% 100%;
  transition: opacity 0.18s ease-out, transform 0.22s var(--k-ease), visibility 0.22s; }
[data-ud-pop][data-closed] { opacity: 0; transform: translateY(6px) scale(0.97); visibility: hidden; pointer-events: none; }
[data-ud-opt] { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; min-height: 46px; padding: 0 16px; border-radius: 14px; text-align: left; font-weight: 550; transition: background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-ud-opt]:hover { background: #EEF1F5; } }
[data-ud-opt][aria-pressed="true"] { background: #0E1733; color: #FFFFFF; }

/* Proof, pinned to the bottom edge of the photograph */
[data-ud-proof] { background: #FFFFFF; border-radius: 22px; box-shadow: 0 0 0 1px rgba(14,23,51,0.06), 0 40px 80px -40px rgba(14,23,51,0.45); }
[data-ud-proof] a { transition: background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-ud-proof] a:hover { background: #F6F7FA; } }

/* ---------- Day bar on each batch ---------- */
[data-ud-day] { position: relative; height: 10px; border-radius: 99px; background: repeating-linear-gradient(90deg, rgba(14,23,51,0.1) 0 1px, transparent 1px 6.25%); }
[data-ud-span] { position: absolute; top: 0; bottom: 0; border-radius: 99px; background: linear-gradient(90deg, #F2A65A, #E8893A); box-shadow: 0 0 0 3px #FFFFFF; }
[data-ud-batch] { transition: transform 0.25s var(--k-ease), box-shadow 0.25s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-ud-batch]:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px rgba(14,23,51,0.08), 0 30px 50px -28px rgba(14,23,51,0.45); } }
[data-ud-batch][data-dim] { opacity: 0.4; }

/* ---------- Photo band: the bridge, drifting slower than the page ---------- */
[data-ud-band] { position: relative; overflow: clip; border-radius: 28px; isolation: isolate; min-height: 560px; color: #0E1733; }
[data-ud-band] img { object-fit: cover; object-position: 50% 50%; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-ud-band-img] { animation: ud-drift linear both; animation-timeline: view(); animation-range: cover; }
  }
}
@keyframes ud-drift { from { transform: translateY(-7%) scale(1.14); } to { transform: translateY(7%) scale(1.14); } }
[data-ud-band]::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(238,241,245,0.92) 0%, rgba(238,241,245,0.55) 38%, rgba(238,241,245,0) 62%); }
[data-ud-chip] { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: 999px; font-size: 0.9rem; font-weight: 550;
  background: rgba(255,255,255,0.72); backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0 1px rgba(14,23,51,0.06); }

/* Faculty rail */
[data-ud-rail] { scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
[data-ud-rail]::-webkit-scrollbar { display: none; }
[data-ud-rail] > li { scroll-snap-align: start; }
[data-ud-person] img { transition: transform 0.7s var(--k-ease); }
@media (hover: hover) and (pointer: fine) { [data-ud-person]:hover img { transform: scale(1.04); } }

[data-ud-map] { filter: saturate(0.85) contrast(1.02); }

/* Closing panel: the river again, at dusk */
[data-ud-closing] { position: relative; overflow: clip; border-radius: 28px; isolation: isolate; color: #F7F4EE; }
[data-ud-closing] img { object-fit: cover; object-position: 50% 58%; }
[data-ud-closing]::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(10,18,48,0.85) 0%, rgba(10,18,48,0.5) 55%, rgba(10,18,48,0.15) 100%); }

[data-theme="udoy"] [data-gf] { --gf-word-lit: linear-gradient(180deg, #F7C58C, #F2A65A 50%, #D9722B); --gf-word: rgba(14,23,51,0.07); }
[data-theme="udoy"] [data-gf-mark] { background: #FFFFFF; }

[data-k-faq] summary { list-style: none; }
`
