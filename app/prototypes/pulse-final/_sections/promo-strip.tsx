"use client"

import { IconArrowRight, IconX } from "@tabler/icons-react"
import { useState, useSyncExternalStore } from "react"

import type { Campaign } from "@/components/marketing/promos"
import { container } from "../_theme"

const KEY = "ict-proto-strip-dismissed:/prototypes/pulse-final"

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}
const getSnapshot = () => {
  try {
    return sessionStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

/**
 * The announcement strip, in Pulse's voice: an ink band that reads as the top
 * edge of the hero rather than a floating card. One line on phones; body copy
 * joins on md+. Dismissal collapses the row and sticks for the session.
 */
export function PromoStrip({ c, href }: { c: Campaign; href: string }) {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, () => false)
  const [closed, setClosed] = useState(false)

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, "1")
    } catch {}
    setClosed(true)
  }

  return (
    <div data-pf-strip data-hidden={dismissed || closed || undefined}>
      <div className="min-h-0 overflow-clip">
        <div className={`${container} flex h-11 items-center gap-3 md:h-12`}>
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="font-semibold text-[var(--pu-amber)]">
              {c.tag}
            </span>
            <span className="ml-2 font-semibold">{c.headline}</span>
            <span className="ml-2 hidden text-[#AEB9D3] md:inline">
              {c.body}
            </span>
          </p>
          <a
            href={href}
            aria-label={c.cta}
            className="flex h-11 shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-[var(--pu-amber)]"
          >
            <span className="hidden sm:inline">{c.cta}</span>
            <IconArrowRight aria-hidden size={16} stroke={2} />
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:text-white"
          >
            <IconX aria-hidden size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
