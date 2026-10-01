import type { CSSProperties } from "react"

/**
 * Builds a full set of kit tokens from a handful of choices, so a first-round
 * concept can wear the kit's pages (courses, exams, books, notes, results,
 * contact) in its own palette, fonts and corner radius.
 */
export type ConceptSpec = {
  dark: boolean
  bg: string
  ink: string
  accent: string
  /** a structural colour for books and folders; defaults to the ink */
  second?: string
  /** text on the accent; chosen for contrast when omitted */
  accentInk?: string
  radius: number
  inner: number
  pill?: number
  /** css `var(--x)` strings for the fonts the concept loads */
  display: string
  sans: string
  h1Weight?: string
  h1Tracking?: string
  labelTracking?: string
  labelWeight?: string
}

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const hex2 = (n: number) =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, "0")

/** `hex` at opacity `a`. */
export const alpha = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

/** `t` of the way from `from` to `to`. */
export const mix = (from: string, to: string, t: number) => {
  const a = rgb(from)
  const b = rgb(to)
  return `#${a.map((v, i) => hex2(v + (b[i]! - v) * t)).join("")}`
}

const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** White or near-black, whichever reads better on `hex`. */
export const readable = (hex: string) => {
  const l = luminance(hex)
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05) ? "#0B0D12" : "#FFFFFF"
}

export function conceptTokens(s: ConceptSpec): CSSProperties {
  const white = "#FFFFFF"
  const black = "#000000"
  const second = s.second ?? s.ink
  const accentInk = s.accentInk ?? readable(s.accent)
  const muted = mix(s.ink, s.bg, s.dark ? 0.36 : 0.34)
  const card = s.dark ? mix(s.bg, white, 0.06) : mix(s.bg, white, 0.7)
  const paper = s.dark ? "#F4F1EA" : card
  const paperInk = s.dark ? "#16181D" : s.ink
  const secondInk = readable(second)
  const secondSpine = mix(second, black, 0.22)
  const accentSpine = mix(s.accent, black, 0.2)
  const shadow = s.dark
    ? `0 0 0 1px ${alpha(s.ink, 0.08)}, 0 26px 48px -30px rgba(0,0,0,0.75)`
    : `0 0 0 1px ${alpha(s.ink, 0.08)}, 0 24px 40px -28px ${alpha(s.ink, 0.45)}`
  return {
    "--k-bg": s.bg,
    "--k-ink": s.ink,
    "--k-muted": muted,
    "--k-line": alpha(s.ink, s.dark ? 0.1 : 0.11),
    "--k-line-hi": alpha(s.ink, s.dark ? 0.26 : 0.3),
    "--k-card": card,
    "--k-card-solid": card,
    "--k-shadow": shadow,
    "--k-tile": s.dark ? alpha(s.ink, 0.04) : s.bg,
    "--k-chip": s.dark ? alpha(s.ink, 0.06) : card,
    "--k-hover": alpha(s.ink, s.dark ? 0.1 : 0.06),
    "--k-on": s.dark ? s.accent : s.ink,
    "--k-on-ink": s.dark ? accentInk : s.bg,
    "--k-accent": s.accent,
    "--k-accent-deep": s.dark ? s.accent : mix(s.accent, black, 0.35),
    "--k-accent-ink": accentInk,
    "--k-btn": s.accent,
    "--k-btn-shadow": `0 14px 26px -14px ${alpha(s.accent, 0.6)}, inset 0 1px 0 rgba(255,255,255,0.3)`,
    "--k-radius": `${s.radius}px`,
    "--k-inner": `${s.inner}px`,
    "--k-pill": `${s.pill ?? 999}px`,
    "--k-scrim": s.dark ? "rgba(0,0,0,0.66)" : alpha(s.ink, 0.55),
    "--k-frame": s.dark ? mix(s.bg, white, 0.04) : s.bg,
    "--k-icon-bg": s.dark ? alpha(s.ink, 0.1) : "rgba(255,255,255,0.9)",
    "--k-paper": paper,
    "--k-paper-ink": paperInk,
    "--k-paper-muted": mix(paperInk, paper, 0.34),
    "--k-paper-line": alpha(paperInk, 0.12),
    "--k-danger": s.dark ? "#FF8A7A" : "#A63A24",
    "--k-field": s.dark ? alpha(s.ink, 0.06) : white,
    "--k-book-a": s.accent,
    "--k-book-a-ink": accentInk,
    "--k-book-a-spine": accentSpine,
    "--k-book-b": second,
    "--k-book-b-ink": secondInk,
    "--k-book-b-spine": secondSpine,
    "--k-book-c": card,
    "--k-book-c-ink": s.ink,
    "--k-book-c-spine": mix(card, s.ink, 0.12),
    "--k-folder-back": mix(second, s.dark ? black : white, 0.3),
    "--k-folder-front": second,
    "--k-folder-paper": paper,
    "--k-folder-ink": secondInk,
    "--k-folder-muted": mix(secondInk, second, 0.3),
    "--k-display-font": s.display,
    "--k-sans": s.sans,
    "--k-label-tracking": s.labelTracking ?? "0.12em",
    "--k-label-weight": s.labelWeight ?? "600",
    "--k-h1-weight": s.h1Weight ?? "700",
    "--k-h1-tracking": s.h1Tracking ?? "-0.03em",
    "--k-h2-weight": s.h1Weight ?? "700",
    "--k-h2-tracking": s.h1Tracking ?? "-0.03em",
    "--k-fact": s.dark ? s.accent : mix(s.accent, black, 0.35),
    "--bk-shadow": s.dark ? "rgba(0,0,0,0.6)" : alpha(s.ink, 0.4),
  } as CSSProperties
}

/** The few rules every concept needs on top of the kit's stylesheet. */
export function conceptCss(theme: string) {
  const t = `[data-theme="${theme}"]`
  return `
[data-k-navlink] { padding: 10px 14px; border-radius: var(--k-pill); font-weight: 600; font-size: 0.9rem; color: var(--k-muted); transition: color 0.15s ease-out, background-color 0.15s ease-out; }
@media (hover: hover) and (pointer: fine) { [data-k-navlink]:hover { color: var(--k-ink); background: var(--k-hover); } }
${t} [data-k-logo] { border-radius: var(--k-inner); box-shadow: 0 0 0 1px var(--k-line); }
${t} [data-k-brand] { font-family: var(--k-display-font), sans-serif; font-weight: 700; font-size: 0.95rem; letter-spacing: -0.02em; }
${t} [data-k-progress] { background: var(--k-accent); }
${t} [data-k-tag] { padding: 5px 12px; font-size: 0.68rem; }
${t} [data-k-btn], ${t} [data-eq-btn]:not([data-quiet]), ${t} [data-pm-btn]:not([data-quiet]), ${t} [data-fb-read] { font-weight: 700; }
`
}
