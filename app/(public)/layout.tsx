import type { ReactNode } from "react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { MobileActionBar } from "@/components/marketing/mobile-action-bar"
import { EdgeBlur } from "@/components/motion/edge-blur"
export default function PublicLayout({children}:{children:ReactNode}) {
  return <><SiteHeader /><EdgeBlur />{children}<SiteFooter /><MobileActionBar /></>
}
