import { Funnel_Display, Funnel_Sans } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const display = Funnel_Display({
  subsets: ["latin"],
  variable: "--site-display",
})
const sans = Funnel_Sans({ subsets: ["latin"], variable: "--site-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/stage"

export const tokens = conceptTokens({
  dark: true,
  bg: "#0D0D0F",
  ink: "#F2F0EC",
  accent: "#F0592F",
  second: "#3A1E16",
  radius: 22,
  inner: 12,
  display: "var(--site-display)",
  sans: "var(--site-sans)",
  h1Weight: "600",
  h1Tracking: "-0.03em",
})
export const themeCss = conceptCss("stage")
