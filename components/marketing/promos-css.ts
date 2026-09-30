/* Styles for the promotion kit (components/marketing/promos.tsx), themed by --pm-* variables. */

export const promoCss = `
[data-pm-scope] { display: contents; }
[data-pm-tag] { display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: var(--pm-pill, 999px); font-family: var(--pm-display); font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;
  color: var(--pm-ink); box-shadow: inset 0 0 0 1px var(--pm-line-hi); }
[data-pm-btn] { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 22px; border-radius: var(--pm-pill, 999px); font-weight: 700; font-size: 0.95rem; white-space: nowrap;
  background: var(--pm-btn); color: var(--pm-accent-ink); box-shadow: var(--pm-btn-shadow, none);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), filter 0.2s ease-out, background-color 0.2s ease-out; }
[data-pm-btn][data-small] { min-height: 40px; padding: 0 16px; font-size: 0.875rem; }
[data-pm-btn][data-quiet] { background: transparent; color: var(--pm-ink); box-shadow: inset 0 0 0 1.5px var(--pm-line-hi); }
[data-pm-btn]:active { transform: scale(0.96); }
[data-pm-btn]:focus-visible, [data-pm-icon]:focus-visible, [data-pm-studio-tab]:focus-visible, [data-pm-nav-trigger]:focus-visible, [data-pm-dock-thumb]:focus-visible, [data-pm-menu-item]:focus-visible { outline: 2px solid var(--pm-accent); outline-offset: 3px; }
@media (hover: hover) and (pointer: fine) { [data-pm-btn]:hover { filter: brightness(1.08); } [data-pm-btn][data-quiet]:hover { background: var(--pm-hover); filter: none; } }
[data-pm-icon] { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: var(--pm-pill, 999px); color: var(--pm-muted); transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background-color 0.2s ease-out, color 0.2s ease-out; }
[data-pm-icon]:active { transform: scale(0.96); }
[data-pm-icon][data-corner] { position: absolute; top: 8px; right: 8px; z-index: 2; background: var(--pm-icon-bg); }
@media (hover: hover) and (pointer: fine) { [data-pm-icon]:hover { background: var(--pm-hover); color: var(--pm-ink); } }
[data-pm-actions] { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

/* Announcement bar */
[data-pm-bar] { display: flex; align-items: center; gap: 14px; padding: 8px 8px 8px 16px; background: var(--pm-card); color: var(--pm-ink); box-shadow: var(--pm-shadow); border-radius: var(--pm-bar-radius, 20px); }
[data-pm-bar] p { flex: 1; min-width: 0; font-size: 0.925rem; text-wrap: balance; }
[data-pm-bar] p strong { font-weight: 600; }
[data-pm-bar] p span { color: var(--pm-muted); }
@media (max-width: 720px) { [data-pm-bar] { flex-wrap: wrap; } [data-pm-bar] p { flex-basis: 100%; order: 3; } }

/* Top banner */
[data-pm-banner] { position: relative; display: grid; overflow: hidden; border-radius: var(--pm-radius, 24px); background: var(--pm-card); color: var(--pm-ink); box-shadow: var(--pm-shadow); }
@media (min-width: 720px) { [data-pm-banner] { grid-template-columns: 340px 1fr; } }
[data-pm-banner-img] { position: relative; display: block; min-height: 160px; }
[data-pm-banner-copy] { display: grid; gap: 12px; justify-items: start; padding: clamp(20px, 3vw, 32px); }
[data-pm-banner-copy] h3, [data-pm-modal-copy] h3 { font-family: var(--pm-display); font-size: clamp(1.3rem, 2.4vw, 1.8rem); line-height: 1.12; text-wrap: balance; }
[data-pm-banner-copy] p, [data-pm-modal-copy] p { max-width: 52ch; color: var(--pm-muted); text-wrap: pretty; }

/* Modal */
[data-pm-modal] { position: relative; display: grid; overflow: hidden; width: min(440px, calc(100vw - 32px)); border-radius: var(--pm-radius, 24px); background: var(--pm-card); color: var(--pm-ink); box-shadow: var(--pm-shadow), 0 40px 80px -20px rgba(0,0,0,0.5); }
[data-pm-modal-img] { position: relative; display: block; aspect-ratio: 2 / 1; }
[data-pm-modal-copy] { display: grid; gap: 12px; justify-items: start; padding: 24px; }
[data-pm-modal][data-real] { position: fixed; left: 50%; top: 50%; z-index: 60; transform: translate(-50%, -50%); outline: none; max-height: calc(100dvh - 32px); overflow-y: auto;
  transition: opacity 0.22s cubic-bezier(0.23,1,0.32,1), transform 0.22s cubic-bezier(0.23,1,0.32,1); }
[data-pm-modal][data-real][data-starting-style], [data-pm-modal][data-real][data-ending-style] { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
[data-pm-scrim][data-contained] { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; padding: 16px; background: var(--pm-scrim); }
[data-pm-scrim][data-contained] [data-pm-modal] { width: min(400px, 100%); }

/* Nav dropdown */
[data-pm-nav-trigger] { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: var(--pm-pill, 999px); font-weight: 600; font-size: 0.9rem; color: var(--pm-ink); box-shadow: inset 0 0 0 1px var(--pm-line-hi);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background-color 0.2s ease-out; }
[data-pm-nav-trigger]:active { transform: scale(0.96); }
[data-pm-nav-trigger] [data-chevron] { transition: transform 0.2s cubic-bezier(0.23,1,0.32,1); }
[data-pm-nav-trigger][data-popup-open] [data-chevron] { transform: rotate(180deg); }
[data-pm-menu] { width: min(340px, calc(100vw - 32px)); padding: 8px; border-radius: var(--pm-radius, 24px); background: var(--pm-card-solid); color: var(--pm-ink); box-shadow: var(--pm-shadow), 0 30px 60px -20px rgba(0,0,0,0.5); outline: none;
  transform-origin: var(--transform-origin); transition: opacity 0.18s cubic-bezier(0.23,1,0.32,1), transform 0.18s cubic-bezier(0.23,1,0.32,1); }
[data-pm-menu][data-starting-style], [data-pm-menu][data-ending-style] { opacity: 0; transform: scale(0.97); }
[data-pm-menu-hero] { position: relative; display: grid; gap: 8px; justify-items: start; padding: 10px 10px 14px; border-radius: var(--pm-inner, 16px); }
[data-pm-menu-img] { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: var(--pm-inner, 16px); margin-bottom: 4px; }
[data-pm-menu-hero] strong { font-family: var(--pm-display); font-size: 1.15rem; line-height: 1.15; text-wrap: balance; }
[data-pm-menu-note] { display: block; font-size: 0.85rem; color: var(--pm-muted); text-wrap: pretty; }
[data-pm-menu] ul { margin-top: 4px; padding-top: 6px; box-shadow: inset 0 1px 0 var(--pm-line); }
[data-pm-menu-item] { display: grid; gap: 2px; padding: 10px; border-radius: var(--pm-inner, 16px); font-weight: 600; font-size: 0.925rem; outline: none; transition: background-color 0.15s ease-out; }
[data-pm-menu-item][data-highlighted] { background: var(--pm-hover); }

/* Video reel */
[data-pm-reel] { position: fixed; right: 16px; bottom: 84px; z-index: 45; width: 172px; aspect-ratio: 9 / 16; overflow: hidden; border-radius: var(--pm-radius, 24px); background: #000; color: #fff;
  box-shadow: var(--pm-shadow), 0 30px 60px -20px rgba(0,0,0,0.55); transition: width 0.35s cubic-bezier(0.23,1,0.32,1); }
@media (min-width: 768px) { [data-pm-reel] { right: 24px; bottom: 24px; width: 196px; } }
[data-pm-reel][data-open] { width: min(320px, calc(100vw - 32px)); }
[data-pm-reel][data-contained] { position: absolute; right: 12px; bottom: 12px; z-index: 6; width: 168px; }
[data-pm-reel][data-contained][data-open] { width: 250px; }
[data-pm-reel-media] { position: absolute; inset: 0; }
[data-pm-reel-media] iframe { width: 100%; height: 100%; border: 0; pointer-events: none; }
[data-pm-reel][data-open] [data-pm-reel-media] iframe { pointer-events: auto; }
[data-pm-reel-hit] { position: absolute; inset: 0; z-index: 2; cursor: pointer; }
[data-pm-reel-hit]:focus-visible { outline: 3px solid var(--pm-accent); outline-offset: -3px; border-radius: inherit; }
[data-pm-reel-shade] { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0.45), transparent 26%, transparent 52%, rgba(0,0,0,0.82)); }
[data-pm-reel][data-open] [data-pm-reel-shade] { background: linear-gradient(180deg, rgba(0,0,0,0.35), transparent 18%, transparent 66%, rgba(0,0,0,0.85)); }
[data-pm-reel-bars] { position: absolute; top: 8px; left: 10px; right: 10px; z-index: 3; display: flex; gap: 4px; pointer-events: none; }
[data-pm-reel-bars] li { flex: 1; height: 3px; overflow: hidden; border-radius: 2px; background: rgba(255,255,255,0.32); }
[data-pm-reel-bars] span { display: block; height: 100%; width: 100%; transform: scaleX(0); transform-origin: 0 50%; background: #fff; }
[data-pm-reel-bars] span[data-done] { transform: scaleX(1); }
@keyframes pm-reel-fill { to { transform: scaleX(1); } }
[data-pm-reel-bars] span[data-now] { animation: pm-reel-fill 14s linear forwards; }
[data-pm-reel-top] { position: absolute; top: 18px; left: 8px; right: 8px; z-index: 3; display: flex; align-items: center; justify-content: space-between; gap: 4px; pointer-events: none; }
[data-pm-reel-top] > * { pointer-events: auto; }
[data-pm-reel-top] [data-pm-icon] { margin-left: auto; }
[data-pm-reel-top] [data-pm-icon] + [data-pm-icon] { margin-left: 0; }
[data-pm-reel-badge] { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 9px; border-radius: 999px; font-size: 0.7rem; white-space: nowrap; font-weight: 600; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); pointer-events: none; }
[data-pm-icon][data-onmedia] { width: 38px; height: 38px; color: #fff; background: rgba(0,0,0,0.45); backdrop-filter: blur(6px); }
@media (hover: hover) and (pointer: fine) { [data-pm-icon][data-onmedia]:hover { background: rgba(0,0,0,0.65); color: #fff; } }
[data-pm-reel-foot] { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 3; display: grid; gap: 10px; pointer-events: none; }
[data-pm-reel-foot] > * { pointer-events: auto; }
[data-pm-reel-foot] p { display: grid; pointer-events: none; }
[data-pm-reel-foot] strong { font-size: 0.925rem; font-weight: 700; text-shadow: 0 1px 8px rgba(0,0,0,0.6); }
[data-pm-reel-foot] p span { font-size: 0.78rem; opacity: 0.85; }
[data-pm-reel-foot] [data-pm-actions] { gap: 6px; }
[data-pm-reel-foot] [data-pm-btn] { min-height: 40px; padding: 0 14px; font-size: 0.8125rem; }
@media (prefers-reduced-motion: reduce) { [data-pm-reel] { transition: none; } [data-pm-reel-bars] span[data-now] { animation: none; transform: scaleX(1); } }

/* Offer card */
[data-pm-offer] { display: grid; gap: 14px; justify-items: start; padding: clamp(20px, 3vw, 32px); border-radius: var(--pm-radius, 24px); background: var(--pm-card); color: var(--pm-ink); box-shadow: var(--pm-shadow); }
[data-pm-offer] h3 { font-family: var(--pm-display); font-size: clamp(1.4rem, 2.6vw, 2rem); line-height: 1.12; text-wrap: balance; }
[data-pm-offer] > p { max-width: 46ch; color: var(--pm-muted); text-wrap: pretty; }
[data-pm-price] { display: flex; align-items: baseline; gap: 12px; font-variant-numeric: tabular-nums; }
[data-pm-price] span { font-family: var(--pm-display); font-size: clamp(2rem, 4vw, 3rem); line-height: 1; color: var(--pm-ink); }
[data-pm-price] s { color: var(--pm-muted); }
[data-pm-clock] { display: flex; gap: 8px; }
[data-pm-clock] div { display: grid; min-width: 68px; padding: 10px 8px; justify-items: center; border-radius: var(--pm-inner, 16px); background: var(--pm-tile); box-shadow: inset 0 0 0 1px var(--pm-line); }
[data-pm-clock] dd { font-family: var(--pm-display); font-size: 1.6rem; line-height: 1; font-variant-numeric: tabular-nums; }
[data-pm-clock] dt { margin-top: 4px; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--pm-muted); }
[data-pm-coupon] { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: min(100%, 460px); padding: 6px 6px 6px 16px; border-radius: var(--pm-inner, 16px); border: 1.5px dashed var(--pm-line-hi); background: var(--pm-tile); }
[data-pm-coupon] code { font-family: var(--pm-display); font-size: 1rem; letter-spacing: 0.08em; }

/* Studio */
[data-pm-studio] { display: grid; gap: 20px; }
@media (min-width: 960px) { [data-pm-studio] { grid-template-columns: 240px 1fr; align-items: start; } }
[data-pm-studio-list] { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
@media (min-width: 960px) { [data-pm-studio-list] { flex-direction: column; overflow: visible; } }
[data-pm-studio-tab] { flex: none; min-height: 48px; padding: 0 18px; border-radius: var(--pm-inner, 16px); text-align: left; font-weight: 600; font-size: 0.925rem; color: var(--pm-ink); background: var(--pm-tab); box-shadow: inset 0 0 0 1px var(--pm-line);
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background-color 0.2s ease-out, box-shadow 0.2s ease-out; }
[data-pm-studio-tab]:active { transform: scale(0.97); }
[data-pm-studio-tab][data-on] { background: var(--pm-tab-on); box-shadow: inset 0 0 0 2px var(--pm-accent); }
@media (hover: hover) and (pointer: fine) { [data-pm-studio-tab]:not([data-on]):hover { background: var(--pm-hover); } }
[data-pm-frame] { position: relative; overflow: hidden; border-radius: var(--pm-radius, 24px); background: var(--pm-frame); box-shadow: var(--pm-shadow); }
[data-pm-frame-top] { display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; box-shadow: inset 0 -1px 0 var(--pm-line); }
[data-pm-frame-top] span { width: 10px; height: 10px; border-radius: 999px; background: var(--pm-line-hi); }
[data-pm-frame-top] b { margin-left: 12px; font-size: 0.75rem; font-weight: 500; color: var(--pm-muted); }
[data-pm-frame-page] { position: relative; display: grid; align-content: start; gap: 14px; min-height: 480px; padding: 12px; overflow: hidden; }
[data-pm-frame-nav] { display: flex; align-items: center; gap: 12px; padding: 4px; min-height: 52px; }
[data-pm-frame-logo] { width: 36px; height: 36px; border-radius: 10px; background: var(--pm-line-hi); }
[data-pm-frame-links] { flex: 0 1 260px; height: 8px; border-radius: 999px; background: var(--pm-line); }
[data-pm-frame-nav] [data-pm-nav-trigger] { margin-left: auto; }
[data-pm-frame-page][data-tall] { min-height: 640px; }
[data-pm-frame-pad] { padding: 0; }
[data-pm-frame-hero] { display: grid; gap: 12px; padding: 24px 12px; }
[data-pm-frame-hero] span { height: 22px; border-radius: 999px; background: var(--pm-line); }
[data-pm-frame-hero] span:nth-child(1) { width: 62%; height: 34px; }
[data-pm-frame-hero] span:nth-child(2) { width: 48%; height: 34px; }
[data-pm-frame-hero] span:nth-child(3) { width: 36%; }
[data-pm-toast] { position: absolute; right: 16px; bottom: 16px; z-index: 6; display: grid; gap: 4px; width: min(320px, calc(100% - 32px)); padding: 16px; border-radius: var(--pm-inner, 16px); background: var(--pm-card-solid); color: var(--pm-ink); box-shadow: var(--pm-shadow), 0 20px 40px -16px rgba(0,0,0,0.5); }
[data-pm-toast] span { font-size: 0.875rem; color: var(--pm-muted); }
[data-pm-toast] a { margin-top: 6px; width: fit-content; min-height: 32px; font-size: 0.875rem; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
[data-pm-studio-foot] { display: grid; gap: 16px; margin-top: 16px; }
[data-pm-spec] { display: grid; gap: 14px 24px; }
@media (min-width: 720px) { [data-pm-spec] { grid-template-columns: repeat(4, 1fr); } }
[data-pm-spec] dt { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--pm-muted); }
[data-pm-spec] dd { margin-top: 4px; font-size: 0.925rem; text-wrap: pretty; }
@media (prefers-reduced-motion: reduce) { [data-pm-modal][data-real], [data-pm-menu] { transition: none; } }
`
