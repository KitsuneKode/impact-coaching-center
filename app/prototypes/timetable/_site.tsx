import { Archivo } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const sans = Archivo({ subsets: ["latin"], variable: "--site-sans" })

export const fontClass = `${sans.variable}`
export const base = "/prototypes/timetable"

export const tokens = conceptTokens({
  dark: false,
  bg: "#F4F3EE",
  ink: "#101828",
  accent: "#E9A23B",
  radius: 16,
  inner: 10,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "700",
  h1Tracking: "-0.035em",
  labelTracking: "0.08em",
})
export const themeCss = conceptCss("timetable")
