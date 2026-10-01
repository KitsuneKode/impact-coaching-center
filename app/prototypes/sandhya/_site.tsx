import { Anek_Bangla, Anek_Latin } from "next/font/google"

import { conceptCss, conceptTokens } from "../_kit/concept"

const bangla = Anek_Bangla({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--site-as",
})
const latin = Anek_Latin({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--site-sans",
})

export const fontClass = `${bangla.variable} ${latin.variable}`
export const base = "/prototypes/sandhya"

export const tokens = conceptTokens({
  dark: true,
  bg: "#07090E",
  ink: "#ECEFF4",
  accent: "#F5B544",
  second: "#1B2433",
  radius: 20,
  inner: 14,
  display: "var(--site-sans)",
  sans: "var(--site-sans)",
  h1Weight: "700",
  h1Tracking: "-0.03em",
})
export const themeCss = conceptCss("sandhya")
