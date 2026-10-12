import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"

import en from "@/messages/en.json"

import { AdminShell } from "@/components/admin/admin-shell"
import type { ReactNode } from "react"

/** Keeps the whole admin area out of search results. */
export const metadata: Metadata = {
  // The pages under here are client components, so they cannot name
  // themselves. Without this the staff inbox inherits the marketing title and
  // a staff member with several tabs open cannot tell which one it is.
  title: { default: "Admin", template: "%s · Admin · ICT" },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  // The admin is English. Shared shop components read the "Shop" strings.
  return (
    <NextIntlClientProvider
      locale="en"
      messages={{ Shop: en.Shop, Promos: en.Promos }}
    >
      <AdminShell>{children}</AdminShell>
    </NextIntlClientProvider>
  )
}
