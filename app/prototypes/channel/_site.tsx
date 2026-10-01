import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--site-display",
})
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--site-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/channel"

export const tokens = conceptTokens({
  dark: true,
  bg: "#0B1020",
  ink: "#F3F4F8",
  accent: "#E8B04B",
  second: "#2A3A6B",
  radius: 16,
  inner: 12,
  display: "var(--site-display)",
  sans: "var(--site-sans)",
  h1Weight: "700",
  h1Tracking: "-0.03em",
})
export const themeCss = conceptCss("channel")
