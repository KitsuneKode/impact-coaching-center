import { Schibsted_Grotesk } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--site-sans" })

export const fontClass = `${sans.variable}`
export const base = "/prototypes/path"

export const tokens = conceptTokens({
  dark: false,
  bg: "#E9EDE6",
  ink: "#123D2C",
  accent: "#CDEB6B",
  second: "#123D2C",
  radius: 26,
  inner: 16,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "700",
  h1Tracking: "-0.035em",
})
export const themeCss = conceptCss("path")
