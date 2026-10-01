import { Figtree, Unbounded } from "next/font/google"

import { islandTokens } from "./_island"
import { conceptCss } from "../_kit/concept"

const display = Unbounded({ subsets: ["latin"], variable: "--pu-display" })
const sans = Figtree({ subsets: ["latin"], variable: "--pu-sans" })

export const fontClass = `${display.variable} ${sans.variable}`
export const base = "/prototypes/pulse"

export const tokens = islandTokens
export const themeCss = conceptCss("pulse")
