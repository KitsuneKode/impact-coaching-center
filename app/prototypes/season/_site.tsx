import { Red_Hat_Display, Red_Hat_Mono } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const sans = Red_Hat_Display({ subsets: ["latin"], variable: "--site-sans" })
const mono = Red_Hat_Mono({ subsets: ["latin"], variable: "--site-mono" })

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/season"

export const tokens = conceptTokens({
  dark: false,
  bg: "#EDF1F0",
  ink: "#0C1719",
  accent: "#0A6B63",
  radius: 16,
  inner: 10,
  pill: 99,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "800",
  h1Tracking: "-0.03em",
})
export const themeCss = conceptCss("season")
