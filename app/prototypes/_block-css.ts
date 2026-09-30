/* Styles for the shared client blocks. Kept out of the "use client" files so a server layout can read them. */

export const examGuideCss = `
[data-eg-tabs] { display: flex; flex-wrap: wrap; gap: 8px; }
[data-eg-tab] { min-height: 44px; padding: 0 18px; border-radius: var(--eg-radius, 12px); font-weight: 600; font-size: 0.95rem;
  color: var(--eg-ink); background: var(--eg-chip); box-shadow: inset 0 0 0 1px var(--eg-line);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background-color 0.2s ease-out, color 0.2s ease-out; }
[data-eg-tab]:active { transform: scale(0.96); }
[data-eg-tab][data-on] { background: var(--eg-on); color: var(--eg-on-ink); box-shadow: none; }
@media (hover: hover) and (pointer: fine) { [data-eg-tab]:not([data-on]):hover { background: var(--eg-chip-hover); } }
[data-eg-panel] { margin-top: 20px; padding: clamp(20px, 3.4vw, 40px); border-radius: var(--eg-panel-radius, 20px); background: var(--eg-card); color: var(--eg-ink);
  box-shadow: var(--eg-shadow, inset 0 0 0 1px var(--eg-line)); }
[data-eg-body] { font-size: 0.875rem; color: var(--eg-muted); }
[data-eg-name] { margin-top: 6px; font-family: var(--eg-display); font-size: clamp(1.4rem, 2.6vw, 2.1rem); line-height: 1.12; max-width: 28ch; text-wrap: balance; }
[data-eg-summary] { margin-top: 12px; max-width: 62ch; color: var(--eg-muted); text-wrap: pretty; }
[data-eg-stages] { margin-top: 28px; display: grid; gap: 14px; }
@media (min-width: 900px) { [data-eg-stages] { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); } }
[data-eg-stage] { display: flex; gap: 14px; padding: 18px; border-radius: var(--eg-inner-radius, 14px); background: var(--eg-tile); box-shadow: inset 0 0 0 1px var(--eg-line); }
[data-eg-n] { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px; font-family: var(--eg-display); font-size: 1.05rem;
  background: var(--eg-accent); color: var(--eg-accent-ink); font-variant-numeric: tabular-nums; }
[data-eg-stage] h4 { font-weight: 600; line-height: 1.25; }
[data-eg-facts] { margin-top: 4px; font-size: 0.875rem; font-weight: 600; font-variant-numeric: tabular-nums; }
[data-eg-stage] ul { margin-top: 10px; display: grid; gap: 8px; font-size: 0.875rem; color: var(--eg-muted); }
[data-eg-more] { margin-top: 24px; display: grid; gap: 24px; }
@media (min-width: 760px) { [data-eg-more] { grid-template-columns: 1fr 1fr; } }
[data-eg-more] h4 { font-weight: 600; }
[data-eg-more] ul { margin-top: 10px; display: grid; gap: 6px; font-size: 0.9rem; color: var(--eg-muted); }
[data-eg-link] { display: inline-flex; align-items: center; gap: 4px; min-height: 32px; color: var(--eg-ink); text-decoration: underline; text-decoration-color: var(--eg-line); text-underline-offset: 4px;
  transition: text-decoration-color 0.2s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-eg-link]:hover { text-decoration-color: currentColor; } }
[data-eg-checked] { margin-top: 22px; font-size: 0.8125rem; color: var(--eg-muted); }
`

export const enquiryCss = `
[data-eq] { color: var(--eq-ink); }
[data-eq-form] { position: relative; display: grid; gap: 22px; }
[data-eq-pair] { display: grid; gap: 18px; }
@media (min-width: 640px) { [data-eq-pair] { grid-template-columns: 1fr 1fr; } }
[data-eq-label] { display: block; margin-bottom: 8px; font-size: 0.875rem; font-weight: 600; }
[data-eq-input] { width: 100%; height: 48px; padding: 0 14px; border-radius: var(--eq-radius, 12px); font: inherit; color: var(--eq-ink); background: var(--eq-field);
  box-shadow: inset 0 0 0 1px var(--eq-line); transition: box-shadow 0.2s ease-out; }
[data-eq-input]::placeholder { color: var(--eq-muted); opacity: 0.8; }
[data-eq-input]:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--eq-accent); }
[data-eq-input][aria-invalid="true"] { box-shadow: inset 0 0 0 2px var(--eq-danger); }
[data-eq-choices] { display: flex; flex-wrap: wrap; gap: 8px; }
[data-eq-choice] { position: relative; }
[data-eq-choice] input { position: absolute; opacity: 0; inset: 0; }
[data-eq-choice] span { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: var(--eq-radius, 12px); font-size: 0.9rem; cursor: pointer; user-select: none;
  background: var(--eq-field); box-shadow: inset 0 0 0 1px var(--eq-line);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background-color 0.2s ease-out, color 0.2s ease-out; }
[data-eq-choice] span:active { transform: scale(0.96); }
[data-eq-choice] input:checked + span { background: var(--eq-accent); color: var(--eq-accent-ink); box-shadow: none; font-weight: 600; }
[data-eq-choice] input:focus-visible + span { outline: 2px solid var(--eq-accent); outline-offset: 2px; }
@media (hover: hover) and (pointer: fine) { [data-eq-choice] input:not(:checked) + span:hover { background: var(--eq-hover); } }
[data-eq-error] { margin-top: 6px; font-size: 0.875rem; color: var(--eq-danger); }
[data-eq-summary] { padding: 14px 16px; border-radius: var(--eq-radius, 12px); box-shadow: inset 0 0 0 1px var(--eq-danger); color: var(--eq-danger); }
[data-eq-summary] p { font-size: 0.875rem; font-weight: 600; }
[data-eq-summary] ul { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px 16px; }
[data-eq-summary] button { min-height: 44px; font-size: 0.875rem; text-decoration: underline; text-underline-offset: 4px; }
[data-eq-foot] { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; }
[data-eq-foot] p { font-size: 0.875rem; color: var(--eq-muted); }
[data-eq-btn] { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 24px; border-radius: var(--eq-btn-radius, 12px); font-weight: 700; white-space: nowrap;
  background: var(--eq-accent); color: var(--eq-accent-ink); box-shadow: var(--eq-btn-shadow, none);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), filter 0.2s ease-out, opacity 0.2s ease-out; }
[data-eq-btn]:active { transform: scale(0.96); }
[data-eq-btn]:disabled { opacity: 0.7; cursor: progress; }
[data-eq-btn][data-quiet] { background: transparent; color: var(--eq-ink); box-shadow: inset 0 0 0 1.5px var(--eq-line); }
@media (hover: hover) and (pointer: fine) { [data-eq-btn]:not(:disabled):hover { filter: brightness(1.08); } }
[data-eq-btn]:focus-visible, [data-eq-again]:focus-visible { outline: 2px solid var(--eq-accent); outline-offset: 3px; }
[data-eq-thanks] { margin-top: 14px; font-size: 1.25rem; font-weight: 600; line-height: 1.35; text-wrap: pretty; }
[data-eq-thanks] span { font-weight: 400; color: var(--eq-muted); }
[data-eq-thanks] b { color: var(--eq-ink); font-variant-numeric: tabular-nums; }
[data-eq-ok] { color: var(--eq-accent); }
[data-eq-actions] { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 12px; }
[data-eq-again] { margin-top: 14px; min-height: 44px; font-size: 0.9rem; text-decoration: underline; text-underline-offset: 4px; }
@keyframes eq-spin { to { transform: rotate(360deg); } }
[data-eq-spin] { animation: eq-spin 0.8s linear infinite; }
@media (prefers-reduced-motion: reduce) { [data-eq-spin] { animation-duration: 2s; } }
`

export const mobileMenuCss = `
[data-mm-btn] { display: grid; place-items: center; width: 44px; height: 44px; border-radius: var(--mm-radius, 999px); color: var(--mm-ink); background: var(--mm-btn-bg); box-shadow: inset 0 0 0 1px var(--mm-line);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background-color 0.2s ease-out; }
[data-mm-btn]:active { transform: scale(0.96); }
[data-mm-btn]:focus-visible, [data-mm-link]:focus-visible { outline: 2px solid var(--mm-accent); outline-offset: 2px; }
[data-mm-panel] { position: fixed; left: 0; right: 0; z-index: 45; padding: 8px 20px 24px; background: var(--mm-bg); box-shadow: 0 1px 0 var(--mm-line), 0 30px 40px -20px rgba(0,0,0,0.4); }
[data-mm-panel] ul { display: grid; }
[data-mm-link] { display: flex; align-items: center; min-height: 56px; font-family: var(--mm-display); font-size: 1.25rem; color: var(--mm-ink); }
[data-mm-panel] li + li { box-shadow: inset 0 1px 0 var(--mm-line); }
`

export const folderBrowserCss = `
[data-fb-folders] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 16px; }
@media (min-width: 640px) { [data-fb-folders] { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1024px) { [data-fb-folders] { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
[data-fb-folder] { display: block; width: 100%; text-align: left; border-radius: 14px; transition: opacity 0.2s ease-out; }
[data-fb-folder][aria-pressed="false"] { opacity: 0.72; }
@media (hover: hover) and (pointer: fine) { [data-fb-folder]:hover { opacity: 1; } }
[data-fb-folder]:focus-visible, [data-fb-file]:focus-visible, [data-fb-read]:focus-visible { outline: 2px solid var(--fb-accent); outline-offset: 3px; }
[data-fb-body] { margin-top: 48px; min-height: 18rem; color: var(--fb-ink); }
[data-fb-title] { font-family: var(--fb-display); font-size: clamp(1.4rem, 2.6vw, 2rem); line-height: 1.1; text-wrap: balance; }
[data-fb-split] { margin-top: 24px; display: grid; gap: 20px; }
@media (min-width: 960px) { [data-fb-split] { grid-template-columns: 5fr 7fr; align-items: start; } }
[data-fb-list] { display: grid; gap: 8px; }
[data-fb-file] { display: flex; align-items: flex-start; gap: 14px; width: 100%; padding: 16px; text-align: left; border-radius: var(--fb-radius, 16px); color: var(--fb-ink); background: var(--fb-card);
  box-shadow: inset 0 0 0 1px var(--fb-line); transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s ease-out, background-color 0.2s ease-out; }
[data-fb-file]:active { transform: scale(0.98); }
[data-fb-file][data-on] { box-shadow: inset 0 0 0 2px var(--fb-accent); background: var(--fb-card-on); }
[data-fb-file] svg { flex: none; margin-top: 2px; color: var(--fb-muted); }
[data-fb-name] { display: block; font-weight: 600; line-height: 1.3; }
[data-fb-meta] { display: block; margin-top: 2px; font-size: 0.875rem; color: var(--fb-muted); }
@media (hover: hover) and (pointer: fine) { [data-fb-file]:not([data-on]):hover { box-shadow: inset 0 0 0 1px var(--fb-line-hi); } }
[data-fb-preview] { position: relative; }
@media (min-width: 960px) { [data-fb-preview] { position: sticky; top: 96px; } }
[data-fb-sheet] { position: relative; display: flex; flex-direction: column; aspect-ratio: 16 / 10; max-width: 560px; padding: clamp(20px, 4vw, 36px); border-radius: 10px; background: var(--fb-paper); color: var(--fb-paper-ink);
  box-shadow: 0 30px 50px -28px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.4) inset; }
[data-fb-sheet]::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 6px; border-radius: 10px 10px 0 0; background: var(--fb-accent); }
[data-fb-kind] { font-size: 0.8125rem; font-weight: 600; color: var(--fb-accent-deep); }
[data-fb-sheet-title] { margin-top: 10px; font-family: var(--fb-display); font-size: clamp(1.2rem, 2.4vw, 1.75rem); line-height: 1.12; text-wrap: balance; }
[data-fb-lines] { margin-top: auto; height: 96px; background: repeating-linear-gradient(to bottom, var(--fb-paper-line) 0 2px, transparent 2px 12px); mask-image: linear-gradient(to bottom, #000 30%, transparent); -webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent); }
[data-fb-sheet-foot] { margin-top: 14px; font-size: 0.875rem; color: var(--fb-paper-muted); font-variant-numeric: tabular-nums; }
[data-fb-sheet-foot] b { color: var(--fb-paper-ink); }
[data-fb-actions] { margin-top: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; }
[data-fb-actions] p { font-size: 0.875rem; color: var(--fb-muted); }
[data-fb-read] { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 24px; border-radius: var(--fb-btn-radius, 999px); font-weight: 700; background: var(--fb-accent); color: var(--fb-accent-ink); box-shadow: var(--fb-btn-shadow, none);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), filter 0.2s ease-out; }
[data-fb-read]:active { transform: scale(0.96); }
@media (hover: hover) and (pointer: fine) { [data-fb-read]:hover { filter: brightness(1.08); } }
[data-fb-empty] { margin-top: 24px; max-width: 48ch; padding: 24px; border-radius: var(--fb-radius, 16px); background: var(--fb-card); color: var(--fb-muted); box-shadow: inset 0 0 0 1px var(--fb-line); }
`

export { promoCss } from "@/components/marketing/promos-css"

/* The batch finder and the route map: styled only by --k-* tokens, so any kit theme wears them. */
export const finderCss = `
[data-bf-step] { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; font-variant-numeric: tabular-nums;
  background: var(--k-hover); color: var(--k-ink); transition: background-color 0.25s ease-out, color 0.25s ease-out, transform 0.25s var(--k-ease); }
[data-bf-step][data-on] { background: var(--k-on); color: var(--k-on-ink); }
[data-bf-step][data-now] { transform: scale(1.12); box-shadow: 0 0 0 4px color-mix(in oklab, var(--k-accent) 28%, transparent); }
[data-bf-chip] { display: inline-flex; align-items: center; min-height: 48px; padding: 0 20px; border-radius: var(--k-pill); font-weight: 600; text-align: left; color: var(--k-ink); background: var(--k-chip); box-shadow: inset 0 0 0 1.5px var(--k-line-hi);
  transition: transform 0.16s var(--k-ease), background-color 0.2s ease-out, box-shadow 0.2s ease-out, color 0.2s ease-out; }
[data-bf-chip]:active { transform: scale(0.96); }
@media (hover: hover) and (pointer: fine) { [data-bf-chip]:hover { background: var(--k-hover); } }
[data-bf-chip][data-on] { background: var(--k-on); color: var(--k-on-ink); box-shadow: none; }
[data-bf-result] { display: grid; gap: 4px 16px; padding: 16px 18px; border-radius: var(--k-inner); background: var(--k-tile); box-shadow: inset 0 0 0 1px var(--k-line); transition: transform 0.2s var(--k-ease), box-shadow 0.2s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-bf-result]:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1.5px var(--k-accent-deep, var(--k-accent)); } }
[data-bf-fact] { color: var(--k-fact, var(--k-accent-deep)); font-weight: 700; font-variant-numeric: tabular-nums; }
`

export const routeMapCss = `
[data-rm-map] { position: relative; }
[data-rm-trunk] { position: absolute; left: 22px; top: 40px; bottom: 40px; width: 6px; border-radius: 3px; background: var(--k-ink); }
[data-rm-route] { position: relative; display: grid; grid-template-columns: 52px minmax(0, 1fr); align-items: center; min-height: 104px; text-align: left; width: 100%; border-radius: var(--k-inner);
  transition: opacity 0.25s ease-out, background-color 0.2s ease-out; }
[data-rm-route][data-dim] { opacity: 0.34; }
@media (hover: hover) and (pointer: fine) { [data-rm-route]:hover { background: var(--k-hover); } }
[data-rm-line] { position: absolute; left: 25px; right: 12px; top: 63px; height: 8px; border-radius: 4px; background: var(--route); }
[data-rm-station] { position: relative; z-index: 1; display: grid; justify-items: center; }
[data-rm-dot] { display: block; width: 22px; height: 22px; border-radius: 999px; background: var(--k-card-solid); box-shadow: inset 0 0 0 5px var(--route); transition: transform 0.25s var(--k-ease); }
[data-rm-route][data-on] [data-rm-dot] { transform: scale(1.25); }
[data-rm-route]:focus-visible { outline: 2px solid var(--route); outline-offset: 2px; }
[data-rm-hub] { position: relative; z-index: 2; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 999px; background: var(--k-ink); color: var(--k-bg); box-shadow: 0 0 0 4px var(--k-bg); }
@keyframes rm-ping { 0% { box-shadow: inset 0 0 0 5px var(--route), 0 0 0 0 var(--route); } 100% { box-shadow: inset 0 0 0 5px var(--route), 0 0 0 12px transparent; } }
@media (prefers-reduced-motion: no-preference) { [data-rm-route][data-on] [data-rm-dot] { animation: rm-ping 1.6s ease-out infinite; } }
[data-rm-legend] li { transition: background-color 0.2s ease-out, opacity 0.25s ease-out; }
[data-rm-legend] li[data-dim] { opacity: 0.4; }
[data-rm-legend] li[data-on] { background: var(--k-hover); }
[data-rm-swatch] { display: inline-block; width: 12px; height: 12px; border-radius: 999px; background: var(--route); }

`

/* The large footer: --gf-* fall back to the kit tokens, a theme overrides what it wants. */
export const grandFooterCss = `
[data-gf] { --gf-ink: var(--k-ink); --gf-muted: var(--k-muted); --gf-line: var(--k-line); --gf-tile: var(--k-tile); --gf-hover: var(--k-hover);
  --gf-mono: var(--k-mono, ui-monospace), ui-monospace, monospace; --gf-display: var(--k-display-font); --gf-radius: var(--k-inner);
  --gf-word: color-mix(in oklab, var(--k-ink) 7%, transparent); --gf-word-lit: var(--k-accent); --gf-word-font: var(--gf-display);
  color: var(--gf-ink); padding-top: clamp(4rem, 9vw, 7rem); border-top: 1px solid var(--gf-line); }
[data-gf-brand] { font-family: var(--gf-display), sans-serif; font-weight: 600; font-size: 1.3rem; letter-spacing: -0.01em; }
[data-gf-mark] { border-radius: 999px; background: #F8F6F1; box-shadow: inset 0 0 0 1px var(--gf-line); }
[data-gf-head] { font-family: var(--gf-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gf-muted); }
[data-gf-link] { color: var(--gf-muted); font-size: 0.95rem; transition: color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-gf-link]:hover { color: var(--gf-ink); } }
[data-gf-seal] { border-radius: var(--gf-radius); background: var(--gf-tile); color: var(--gf-ink); box-shadow: inset 0 0 0 1px var(--gf-line); transition: transform 0.16s var(--k-ease), box-shadow 0.2s ease-out; }
[data-gf-seal] svg { color: var(--k-accent-deep, var(--k-accent)); }
[data-gf-seal]:active { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { [data-gf-seal]:hover { box-shadow: inset 0 0 0 1px var(--k-line-hi); } }
[data-gf-icon] { color: var(--gf-muted); border-radius: var(--gf-radius); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-gf-icon]:hover { color: var(--gf-ink); background: var(--gf-hover); } }
[data-gf-box] { border-radius: var(--gf-radius); box-shadow: inset 0 0 0 1px var(--gf-line); color: var(--gf-muted); }
[data-gf-word] { position: relative; display: grid; justify-items: center; overflow: hidden; height: clamp(5.5rem, 17vw, 17rem); user-select: none;
  font-family: var(--gf-word-font), sans-serif; font-weight: var(--gf-word-weight, 700); font-size: clamp(7rem, 24vw, 24rem); line-height: 0.8; letter-spacing: -0.045em;
  -webkit-mask-image: linear-gradient(180deg, #000 55%, transparent); mask-image: linear-gradient(180deg, #000 55%, transparent); }
[data-gf-word] > span { grid-area: 1 / 1; white-space: nowrap; }
[data-gf-word-base] { color: var(--gf-word); }
[data-gf-word-lit] { background: var(--gf-word-lit); -webkit-background-clip: text; background-clip: text; color: transparent; opacity: 0;
  -webkit-mask-image: radial-gradient(260px circle at var(--wx, 50%) var(--wy, 50%), #000, transparent 70%); mask-image: radial-gradient(260px circle at var(--wx, 50%) var(--wy, 50%), #000, transparent 70%);
  transition: opacity 0.4s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-gf-word]:hover [data-gf-word-lit] { opacity: 1; } }
`
