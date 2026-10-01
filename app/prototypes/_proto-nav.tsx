"use client"

import {
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconBellRinging,
  IconHeartFilled,
  IconLayoutGrid,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { replayOffers } from "./_kit/promo-session"
import { usePicks } from "./_picks"

type Item = { slug: string; name: string }

const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/** Previous and next design, a like button, and the arrow and Esc keys. */
export function ProtoNav({
  current,
  items,
}: {
  current: string
  items: Item[]
}) {
  const router = useRouter()
  const onHome = usePathname() === `/prototypes/${current}`
  const picks = usePicks()
  const index = items.findIndex((p) => p.slug === current)
  const prev = items.at(index - 1)!
  const next = items[(index + 1) % items.length]!
  const liked = picks.has(current)

  useEffect(() => {
    const go = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (typing(e.target)) return
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) return
      if (e.key === "ArrowLeft") router.push(`/prototypes/${prev.slug}`)
      else if (e.key === "ArrowRight") router.push(`/prototypes/${next.slug}`)
      else if (e.key === "Escape") router.push("/prototypes")
    }
    window.addEventListener("keydown", go)
    return () => window.removeEventListener("keydown", go)
  }, [router, prev.slug, next.slug])

  const step =
    "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-3 transition-colors hover:bg-white/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"

  return (
    <nav
      aria-label="Landing prototypes"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/15 bg-[#0B0F1A]/90 p-1 text-sm text-white shadow-2xl backdrop-blur-md"
    >
      <Link
        href={`/prototypes/${prev.slug}`}
        aria-label={`Previous design: ${prev.name}`}
        className={step}
      >
        <IconChevronLeft aria-hidden size={18} />
        <span className="hidden sm:inline">Previous</span>
      </Link>
      <Link
        href="/prototypes"
        aria-label="All designs"
        className="inline-flex h-11 items-center gap-2 rounded-full px-3 font-medium whitespace-nowrap transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
      >
        <IconLayoutGrid aria-hidden size={16} className="opacity-70" />
        <span className="tabular-nums opacity-70">
          {index + 1}/{items.length}
        </span>
        <span className="max-w-[9ch] truncate sm:max-w-none">
          {items[index]!.name}
        </span>
      </Link>
      {onHome && (
        <button
          type="button"
          onClick={() => replayOffers(`/prototypes/${current}`)}
          aria-label="Show the offers bar, pop-up and video again"
          title="Show the offers again"
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white active:scale-95"
        >
          <IconBellRinging aria-hidden size={18} />
          <span className="hidden md:inline">Offers</span>
        </button>
      )}
      <button
        type="button"
        aria-pressed={liked}
        disabled={!liked && picks.full}
        title={!liked && picks.full ? "Remove a pick first" : undefined}
        onClick={() => picks.toggle(current)}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white active:scale-95 disabled:opacity-40"
      >
        {liked ? (
          <IconHeartFilled aria-hidden size={18} className="text-[#FF6B7A]" />
        ) : (
          <IconHeart aria-hidden size={18} />
        )}
        <span className="hidden sm:inline">{liked ? "Picked" : "Pick"}</span>
      </button>
      <Link
        href={`/prototypes/${next.slug}`}
        aria-label={`Next design: ${next.name}`}
        className={step}
      >
        <span className="hidden sm:inline">Next</span>
        <IconChevronRight aria-hidden size={18} />
      </Link>
    </nav>
  )
}
