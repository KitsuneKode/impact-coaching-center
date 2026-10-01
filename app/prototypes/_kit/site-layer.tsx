"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { OffersMenu, PromoModal, PromoScope, type Campaign } from "../_promos"
import { SiteReel, TopBar } from "./site-promos"

const SEEN = "ict-proto-promo-seen"

export type PromoParts = { bar: boolean; modal: boolean; reel: boolean }

/**
 * The promotions every kit theme carries on its own home page: the
 * announcement bar, one pop-up per visit, and the video reel. Other pages stay
 * clear so a visitor is never interrupted mid-task.
 */
export function SitePromoLayer({
  base,
  bar,
  campaign,
  parts,
}: {
  base: string
  bar: Campaign
  campaign: Campaign
  parts: PromoParts
}) {
  const home = usePathname() === base
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!home || !parts.modal) return
    try {
      if (sessionStorage.getItem(SEEN)) return
    } catch {}
    const id = window.setTimeout(() => setOpen(true), 12_000)
    return () => window.clearTimeout(id)
  }, [home, parts.modal])

  const change = (next: boolean) => {
    setOpen(next)
    if (next) return
    try {
      sessionStorage.setItem(SEEN, "1")
    } catch {}
  }

  return (
    <PromoScope>
      {parts.bar && home ? <TopBar c={bar} /> : null}
      {parts.modal ? (
        <PromoModal c={campaign} open={open} onOpenChange={change} />
      ) : null}
      {parts.reel && home ? <SiteReel c={campaign} /> : null}
    </PromoScope>
  )
}

/** The header's Offers dropdown. */
export function SiteOffers({
  campaign,
  items,
}: {
  campaign: Campaign
  items: { label: string; note: string; href: string }[]
}) {
  return (
    <PromoScope>
      <OffersMenu c={campaign} items={items} />
    </PromoScope>
  )
}
