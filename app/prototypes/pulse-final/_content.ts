import { siteBase } from "./_theme"

/**
 * The page's own copy. Every fact (names, prices, timings, photographs) comes
 * from `../_data` and `@/lib/brand`; this file holds only words that belong to
 * this page — labels, the hero word list, and how each exam panel is painted.
 */

export const navItems = [
  { href: "#free", label: "Free first" },
  { href: "#books", label: "Books" },
  { href: "#courses", label: "Courses" },
  { href: "#teachers", label: "Teachers" },
  { href: `${siteBase}/notes`, label: "Free notes" },
  { href: `${siteBase}/contact`, label: "Contact" },
] as const

export const heroWords = [
  "APSC.",
  "ADRE.",
  "Assam Police.",
  "banking.",
  "SSC.",
  "Railway.",
]

export const heroCopy =
  "Morning, noon and evening batches in North Lakhimpur. ICT's own books, free notes, and every class on the app."

export const marqueeWords = [
  "APSC",
  "ADRE",
  "Assam Police",
  "Banking",
  "SSC",
  "Railway NTPC",
  "Warrior mocks",
  "Brahmastra",
  "Astra Series",
  "Axom Dhwani",
]

/** The three hero compositions the review control steps through. */
export const heroOptions = [
  {
    key: "wall",
    label: "Blue field",
    note: "ICT's blue stays; the classroom drifts beside it.",
  },
  {
    key: "bleed",
    label: "Full photo wall",
    note: "Every photo is ours, edge to edge.",
  },
  {
    key: "ribbons",
    label: "Photo ribbons",
    note: "Calm paper page, the photos run underneath.",
  },
] as const

export type HeroKey = (typeof heroOptions)[number]["key"]

/**
 * One colour field per exam, in Pulse's palette. `dim` keeps the muted half
 * of the big line at or above 3:1 against its field; `mrp` is the struck
 * price at body-text contrast.
 */
export const panelField: Record<
  string,
  {
    field: string
    ink: string
    dim: string
    mrp: string
    btn: string
    btnInk: string
    tilt: string
  }
> = {
  apsc: {
    field: "var(--pu-blue)",
    ink: "#FFFFFF",
    dim: "rgba(255,255,255,0.66)",
    mrp: "#D5E2FA",
    btn: "var(--pu-amber)",
    btnInk: "var(--pu-ink)",
    tilt: "-2.5deg",
  },
  adre: {
    field: "var(--pu-ink)",
    ink: "#FFFFFF",
    dim: "rgba(255,255,255,0.62)",
    mrp: "#D5E2FA",
    btn: "var(--pu-amber)",
    btnInk: "var(--pu-ink)",
    tilt: "2deg",
  },
  banking: {
    field: "var(--pu-amber)",
    ink: "var(--pu-ink)",
    dim: "rgba(11,22,51,0.6)",
    mrp: "var(--pu-muted)",
    btn: "var(--pu-ink)",
    btnInk: "#FFFFFF",
    tilt: "-1.5deg",
  },
}

/** Drift speed per wall column, between 54 and 78 seconds. */
export const wallDurations = [58, 70, 62]
export const bleedDurations = [74, 58, 66, 54, 78]
export const ribbonDurations = [72, 64]
