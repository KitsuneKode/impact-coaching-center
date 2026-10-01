import { Epilogue } from "next/font/google"

import { islandTokens } from "./_island"
import { conceptCss } from "../_kit/concept"

const sans = Epilogue({ subsets: ["latin"], variable: "--gm-sans" })

export const fontClass = `${sans.variable}`
export const base = "/prototypes/gamusa"

export const tokens = islandTokens
export const themeCss = conceptCss("gamusa")
