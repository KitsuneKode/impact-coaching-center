import { Onest } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const sans = Onest({ subsets: ["latin"], variable: "--site-sans" })

export const fontClass = `${sans.variable}`
export const base = "/prototypes/mist"

export const tokens = conceptTokens({
  dark: false,
  bg: "#F2F5F4",
  ink: "#0D1B1E",
  accent: "#A9CDF2",
  second: "#0D1B1E",
  radius: 28,
  inner: 18,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "600",
  h1Tracking: "-0.035em",
})
export const themeCss = conceptCss("mist")
