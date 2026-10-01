import { Geist, Geist_Mono } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const sans = Geist({ subsets: ["latin"], variable: "--site-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--site-mono" })

export const fontClass = `${sans.variable} ${mono.variable}`
export const base = "/prototypes/answer-sheet"

export const tokens = conceptTokens({
  dark: false,
  bg: "#FBFBF9",
  ink: "#1B1F27",
  accent: "#2FB04A",
  second: "#1B1F27",
  radius: 8,
  inner: 6,
  pill: 6,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "600",
  h1Tracking: "-0.04em",
  labelTracking: "0.06em",
})
export const themeCss = conceptCss("answer-sheet")
