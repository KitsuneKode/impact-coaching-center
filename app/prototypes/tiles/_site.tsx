import { Host_Grotesk } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const sans = Host_Grotesk({ subsets: ["latin"], variable: "--site-sans" })

export const fontClass = `${sans.variable}`
export const base = "/prototypes/tiles"

export const tokens = conceptTokens({
  dark: false,
  bg: "#F2F3F5",
  ink: "#0A1020",
  accent: "#1E63CF",
  radius: 20,
  inner: 14,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "700",
  h1Tracking: "-0.04em",
})
export const themeCss = conceptCss("tiles")
