/**
 * The kit's stylesheet. It reads only `--k-*` tokens, so a theme is a set of
 * tokens, two fonts and a little decoration. Every shared block (`--eg`,
 * `--eq`, `--fb`, `--mm`, `--pm`) is fed from the same tokens.
 *
 * Tokens a theme must define: --k-bg --k-ink --k-muted --k-line --k-line-hi
 * --k-card --k-card-solid --k-shadow --k-tile --k-chip --k-hover --k-on
 * --k-on-ink --k-accent --k-accent-deep --k-accent-ink --k-btn --k-btn-shadow
 * --k-display-font --k-sans --k-radius --k-inner --k-pill --k-scrim --k-frame
 * --k-icon-bg --k-paper --k-paper-ink --k-paper-muted --k-paper-line
 * --k-danger --k-field --k-book-{a,b,c}[-ink|-spine] --k-folder-{back,front,paper,ink,muted}
 */
export const kitCss = `
[data-kit] {
  --k-ease: cubic-bezier(0.23, 1, 0.32, 1);
  --bk-shadow: rgba(0,0,0,0.45);
  --eg-ink: var(--k-ink); --eg-muted: var(--k-muted); --eg-line: var(--k-line); --eg-card: var(--k-card); --eg-shadow: var(--k-shadow);
  --eg-tile: var(--k-tile); --eg-chip: var(--k-chip); --eg-chip-hover: var(--k-hover); --eg-on: var(--k-on); --eg-on-ink: var(--k-on-ink);
  --eg-accent: var(--k-accent); --eg-accent-ink: var(--k-accent-ink); --eg-display: var(--k-display-font);
  --eg-radius: var(--k-chip-radius, var(--k-pill)); --eg-panel-radius: var(--k-radius); --eg-inner-radius: var(--k-inner);
  --eq-ink: var(--k-ink); --eq-muted: var(--k-muted); --eq-line: var(--k-line-hi); --eq-field: var(--k-field); --eq-hover: var(--k-hover);
  --eq-accent: var(--k-accent); --eq-accent-ink: var(--k-accent-ink); --eq-danger: var(--k-danger);
  --eq-radius: var(--k-inner); --eq-btn-radius: var(--k-pill); --eq-btn-shadow: var(--k-btn-shadow);
  --fb-ink: var(--k-ink); --fb-muted: var(--k-muted); --fb-line: var(--k-line); --fb-line-hi: var(--k-line-hi); --fb-card: var(--k-chip);
  --fb-card-on: var(--k-hover); --fb-accent: var(--k-accent); --fb-accent-ink: var(--k-accent-ink); --fb-accent-deep: var(--k-accent-deep);
  --fb-display: var(--k-display-font); --fb-paper: var(--k-paper); --fb-paper-ink: var(--k-paper-ink); --fb-paper-muted: var(--k-paper-muted);
  --fb-paper-line: var(--k-paper-line); --fb-radius: var(--k-inner); --fb-btn-radius: var(--k-pill); --fb-btn-shadow: var(--k-btn-shadow);
  --mm-ink: var(--k-ink); --mm-line: var(--k-line); --mm-bg: var(--k-card-solid); --mm-btn-bg: var(--k-chip); --mm-accent: var(--k-accent);
  --mm-display: var(--k-display-font); --mm-radius: var(--k-pill);
  --pm-ink: var(--k-ink); --pm-muted: var(--k-muted); --pm-line: var(--k-line); --pm-line-hi: var(--k-line-hi); --pm-card: var(--k-card);
  --pm-card-solid: var(--k-card-solid); --pm-shadow: var(--k-shadow); --pm-tile: var(--k-tile); --pm-tab: var(--k-chip); --pm-tab-on: var(--k-hover);
  --pm-hover: var(--k-hover); --pm-accent: var(--k-accent); --pm-accent-ink: var(--k-accent-ink); --pm-btn: var(--k-btn); --pm-btn-shadow: var(--k-btn-shadow);
  --pm-display: var(--k-display-font); --pm-radius: var(--k-radius); --pm-inner: var(--k-inner); --pm-pill: var(--k-pill);
  --pm-bar-radius: var(--k-inner); --pm-scrim: var(--k-scrim); --pm-frame: var(--k-frame); --pm-icon-bg: var(--k-icon-bg);

  background: var(--k-bg); color: var(--k-ink);
  font-family: var(--k-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; scroll-behavior: smooth;
}
[data-kit] ::selection { background: var(--k-accent); color: var(--k-accent-ink); }
[data-kit] :focus-visible { outline: 2px solid var(--k-accent-deep, var(--k-accent)); outline-offset: 3px; }
[data-kit] h1, [data-kit] h2, [data-kit] h3 { text-wrap: balance; }
[data-kit] p { text-wrap: pretty; }

[data-k-display] { font-family: var(--k-display-font), var(--k-sans), sans-serif; font-weight: var(--k-display-weight, 500); }
[data-k-wide] { font-family: var(--k-label-font, var(--k-display-font)), var(--k-sans), sans-serif; text-transform: uppercase; letter-spacing: var(--k-label-tracking, 0.14em); font-weight: var(--k-label-weight, 500); }
[data-k-h1] { font-family: var(--k-display-font), var(--k-sans), sans-serif; font-size: var(--k-h1-size, clamp(2rem, 4.2vw, 3.6rem)); line-height: var(--k-h1-leading, 1.08); font-weight: var(--k-h1-weight, 600);
  letter-spacing: var(--k-h1-tracking, -0.03em); text-transform: var(--k-h1-case, none); }
[data-k-h2] { font-family: var(--k-display-font), var(--k-sans), sans-serif; font-size: var(--k-h2-size, clamp(1.75rem, 3.4vw, 2.75rem)); line-height: var(--k-h2-leading, 1.08); font-weight: var(--k-h2-weight, 600);
  letter-spacing: var(--k-h2-tracking, -0.03em); text-transform: var(--k-h2-case, none); }
[data-k-link] { transition: color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-link]:hover { color: var(--k-ink); } }

[data-k-card] { position: relative; color: var(--k-ink); background: var(--k-card); box-shadow: var(--k-shadow); border-radius: var(--k-radius); }
[data-k-tile] { background: var(--k-tile); box-shadow: inset 0 0 0 1px var(--k-line); border-radius: var(--k-inner); }
[data-k-tag] { display: inline-flex; align-items: center; font-family: var(--k-label-font, var(--k-display-font)), sans-serif; text-transform: uppercase; letter-spacing: var(--k-label-tracking, 0.14em);
  font-weight: var(--k-label-weight, 500); box-shadow: inset 0 0 0 1px var(--k-line-hi); border-radius: var(--k-pill); }
[data-k-avatar] { outline: 1px solid var(--k-line-hi); outline-offset: -1px; box-shadow: 0 0 0 2px var(--k-card-solid); }
[data-k-photo] { outline: 1px solid var(--k-line); outline-offset: -1px; }

[data-k-press] { transition: transform 0.16s var(--k-ease), background-color 0.2s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out; }
[data-k-press]:active { transform: scale(0.96); }
[data-k-btn] { color: var(--k-accent-ink); background: var(--k-btn); box-shadow: var(--k-btn-shadow); border-radius: var(--k-pill); font-weight: 700; }
[data-k-outline] { background: var(--k-chip); box-shadow: inset 0 0 0 1.5px var(--k-line-hi); border-radius: var(--k-pill); color: var(--k-ink); }
[data-k-ghost] { color: var(--k-muted); border-radius: var(--k-pill); }
@media (hover: hover) and (pointer: fine) {
  [data-k-btn]:hover { filter: brightness(1.07); }
  [data-k-outline]:hover, [data-k-ghost]:hover { background: var(--k-hover); }
  [data-k-ghost]:hover { color: var(--k-ink); }
  [data-k-lift] { transition: transform 0.35s var(--k-ease); }
  [data-k-lift]:hover { transform: translateY(-4px); }
}

[data-k-faq] summary { list-style: none; cursor: pointer; }
[data-k-faq] summary::-webkit-details-marker { display: none; }
[data-k-faq] { interpolate-size: allow-keywords; }
[data-k-faq]::details-content { block-size: 0; overflow: hidden; transition: block-size 0.3s var(--k-ease), content-visibility 0.3s allow-discrete; }
[data-k-faq][open]::details-content { block-size: auto; }
[data-k-faq][open] [data-plus] { transform: rotate(45deg); }
[data-plus] { transition: transform 0.25s var(--k-ease); }
[data-k-snap] { scrollbar-width: none; }
[data-k-snap]::-webkit-scrollbar { display: none; }

[data-k-nav] { background: color-mix(in oklab, var(--k-bg) 78%, transparent); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%); box-shadow: 0 1px 0 var(--k-line); }
@media (prefers-reduced-transparency: reduce) { [data-k-nav] { background: var(--k-bg); backdrop-filter: none; -webkit-backdrop-filter: none; } }
[data-k-progress] { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; transform-origin: 0 50%; transform: scaleX(0); background: var(--k-accent); }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) { [data-k-progress] { animation: k-progress linear both; animation-timeline: scroll(root block); } }
}
@keyframes k-progress { to { transform: scaleX(1); } }
@keyframes k-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: no-preference) { [data-rise] { animation: k-rise 0.8s var(--k-ease) both; } }
`
