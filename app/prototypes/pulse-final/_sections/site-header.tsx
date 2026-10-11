"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { navItems } from "../_content"
import { container } from "../_theme"
import { SiteMenu } from "./site-menu"

/**
 * One sticky header for the whole page. At the top it floats over the hero in
 * the hero's tone; once the promo strip and the 1px sentinel have scrolled
 * away it turns into a frosted paper bar in ink. The negative bottom margin
 * lets it sit over each hero's spacer, so the heroes never reflow.
 */
export function SiteHeader({
  tone,
  phone,
  tel,
  whatsapp,
  cta,
}: {
  tone: "blue" | "paper" | "overlay"
  phone: string
  tel: string
  whatsapp: string
  cta: string
}) {
  const light = tone !== "paper"
  const [stuck, setStuck] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px" />
      <header
        data-pf-header
        data-pf-hdr={light ? "light" : undefined}
        data-stuck={stuck || undefined}
        className={`sticky top-0 z-50 -mb-[76px] h-[76px] ${
          light ? "text-white" : "text-[var(--pu-ink)]"
        }`}
      >
        <div
          data-pf-hdr-row
          className={`${container} flex h-[76px] items-center gap-8`}
        >
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={30}
                height={30}
                className="size-[30px]"
              />
            </span>
            <span className="hidden font-[family-name:var(--pu-display)] text-sm font-semibold lg:inline">
              Impact Career Tutorials
            </span>
          </a>
          <nav
            aria-label="Sections"
            className={`ml-auto hidden items-center gap-5 text-sm md:flex lg:gap-7 ${
              light ? "text-[var(--pu-on-blue)]" : "text-[var(--pu-muted)]"
            }`}
          >
            {navItems.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`transition-colors duration-150 ${
                  light ? "hover:text-white" : "hover:text-[var(--pu-ink)]"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href={tel}
            className="ml-auto text-sm font-medium whitespace-nowrap tabular-nums md:ml-0"
          >
            {phone}
          </a>
          <SiteMenu phone={phone} tel={tel} whatsapp={whatsapp} cta={cta} />
        </div>
      </header>
    </>
  )
}
