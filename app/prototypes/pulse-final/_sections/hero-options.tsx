"use client"

import { IconChevronUp } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { heroOptions, type HeroKey } from "../_content"

/**
 * A review control for the client: swaps the hero composition without
 * reloading. On desktop it is a compact segmented pill centred just above the
 * prototype switcher; below lg it is a collapsed pill at bottom-left that
 * opens upward. Either way it hides once the hero leaves the viewport — it is
 * a review tool, not page chrome.
 */
export function HeroOptions({ active }: { active: HeroKey }) {
  const [off, setOff] = useState(false)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const hero = document.querySelector("[data-pf-hero]")
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting), {
      rootMargin: "48px",
    })
    io.observe(hero)
    return () => io.disconnect()
  }, [active])

  useEffect(() => {
    if (off && detailsRef.current) detailsRef.current.open = false
  }, [off])

  const current = heroOptions.find((o) => o.key === active) ?? heroOptions[0]
  const link = (o: (typeof heroOptions)[number]) => (
    <Link
      key={o.key}
      href={`?hero=${o.key}`}
      scroll={false}
      title={o.note}
      aria-current={o.key === active ? "page" : undefined}
      className={`inline-flex h-11 items-center rounded-full px-4 text-sm whitespace-nowrap transition-colors hover:bg-white/10 ${
        o.key === active ? "bg-white font-semibold text-[#0B0F1A]" : ""
      }`}
    >
      {o.label}
    </Link>
  )
  const links = heroOptions.map(link)

  return (
    <nav
      data-pf-pick
      data-hidden={off || undefined}
      inert={off}
      aria-label="Hero options"
      className="fixed bottom-[80px] left-4 z-50 lg:right-auto lg:bottom-[82px] lg:left-1/2 lg:-translate-x-1/2"
    >
      <details ref={detailsRef} className="group relative lg:hidden">
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 bg-[#0B0F1A]/90 px-4 text-sm font-medium text-white shadow-2xl backdrop-blur-md [&::-webkit-details-marker]:hidden">
          Hero: {current.label}
          <IconChevronUp
            aria-hidden
            size={15}
            className="text-white/60 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="absolute bottom-[52px] left-0 w-[220px] rounded-2xl border border-white/15 bg-[#0B0F1A]/95 p-2 text-white shadow-2xl backdrop-blur-md">
          <p className="px-3 pt-1 pb-1.5 text-[0.68rem] font-medium tracking-[0.08em] text-white/50 uppercase">
            Hero option
          </p>
          {heroOptions.map((o) => (
            <Link
              key={o.key}
              href={`?hero=${o.key}`}
              scroll={false}
              title={o.note}
              aria-current={o.key === active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-xl px-3 text-sm transition-colors hover:bg-white/10 ${
                o.key === active ? "bg-white/15 font-semibold" : ""
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </details>
      <div className="hidden items-center gap-0.5 rounded-full border border-white/15 bg-[#0B0F1A]/90 p-1 pr-1 pl-4 text-white shadow-2xl backdrop-blur-md lg:flex">
        <span className="mr-2 text-[0.7rem] font-medium tracking-[0.08em] whitespace-nowrap text-white/50 uppercase">
          Hero option
        </span>
        {links}
      </div>
    </nav>
  )
}
