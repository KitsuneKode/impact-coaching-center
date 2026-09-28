import { NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import type { ReactNode } from "react"

import { SiteChrome } from "@/components/marketing/site-chrome"
import en from "@/messages/en.json"

/** Account, checkout, login and register: English only for now, same chrome. */
export default function PlainLayout({ children }: { children: ReactNode }) {
  setRequestLocale("en")
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <SiteChrome>{children}</SiteChrome>
    </NextIntlClientProvider>
  )
}
