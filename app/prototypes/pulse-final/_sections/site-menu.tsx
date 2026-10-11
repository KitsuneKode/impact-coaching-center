"use client"

import {
  IconArrowRight,
  IconMenu2,
  IconPhone,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Magnetic } from "../../_fx"
import { external } from "../_theme"

const ease = [0.23, 1, 0.32, 1] as const

/**
 * The same list `sitePages("pulse")` produces in the kit's home-extras — the
 * data modules it lives beside are server-only, so the links are written out
 * here rather than imported.
 */
const links = [
  { href: "/prototypes/pulse/courses", label: "Courses" },
  { href: "/prototypes/pulse/exams", label: "Exams" },
  { href: "/prototypes/pulse/books", label: "Books" },
  { href: "/prototypes/pulse/notes", label: "Free notes" },
  { href: "/prototypes/pulse/results", label: "Results" },
  { href: "/prototypes/pulse/assist", label: "ASSIST" },
  { href: "/prototypes/pulse/contact", label: "Contact" },
]

/**
 * Pulse's own phone menu. The panel is absolutely anchored to the sticky
 * header itself, so it always hangs directly beneath it no matter where the
 * page is scrolled. The scrim covers everything below the header; page scroll
 * locks while it is open and focus cycles between the button and the panel.
 */
export function SiteMenu({
  phone,
  tel,
  whatsapp,
  cta,
}: {
  phone: string
  tel: string
  whatsapp: string
  cta: string
}) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const reduce = useReducedMotion()
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  // A new page closes the menu.
  const [seen, setSeen] = useState(path)
  if (seen !== path) {
    setSeen(path)
    setOpen(false)
  }

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) requestAnimationFrame(() => btnRef.current?.focus())
  }

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = "hidden"
    panelRef.current?.querySelector<HTMLElement>("a")?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        close()
        return
      }
      if (e.key !== "Tab") return
      const items = [
        btnRef.current,
        ...(panelRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []),
      ].filter((x): x is HTMLElement => x != null)
      const first = items[0]
      const last = items[items.length - 1]
      const ae = document.activeElement as HTMLElement | null
      if (e.shiftKey && (!ae || ae === first || !items.includes(ae))) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && ae === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => {
      root.style.overflow = prev
      window.removeEventListener("keydown", onKey, true)
    }
  }, [open])

  const swap = {
    initial: reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    transition: { type: "spring", duration: 0.3, bounce: 0 } as const,
  }

  return (
    <div data-pf-menu className="md:hidden">
      <button
        ref={btnRef}
        type="button"
        data-pf-menu-btn
        aria-expanded={open}
        aria-controls="pf-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="relative grid size-5 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {open ? (
              <m.span key="x" {...swap} className="absolute">
                <IconX aria-hidden size={20} stroke={1.75} />
              </m.span>
            ) : (
              <m.span key="m" {...swap} className="absolute">
                <IconMenu2 aria-hidden size={20} stroke={1.75} />
              </m.span>
            )}
          </AnimatePresence>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <>
            <m.div
              data-pf-scrim
              aria-hidden
              onClick={() => close()}
              className="absolute inset-x-0 top-full z-40 h-[100dvh]"
              style={{ background: "rgb(11 22 51 / 0.4)" }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.2, ease },
              }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
            />
            <m.nav
              ref={panelRef}
              id="pf-menu-panel"
              data-pf-menu-panel
              aria-label="Menu"
              className="absolute inset-x-0 top-full z-50 overflow-y-auto bg-[var(--pu-paper)] text-[var(--pu-ink)]"
              style={{
                maxHeight: "calc(100dvh - 76px - env(safe-area-inset-bottom))",
                overscrollBehavior: "contain",
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.2, ease },
              }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
            >
              <ul>
                {links.map((l) => (
                  <li
                    key={l.href}
                    className="border-b border-[var(--pu-line)] px-5"
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex h-14 items-center font-[family-name:var(--pu-display)] text-xl font-semibold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <Magnetic className="w-full">
                  <a
                    data-press
                    data-amber
                    href={whatsapp}
                    {...external}
                    onClick={() => setOpen(false)}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--pu-amber)] px-6 font-semibold text-[var(--pu-ink)]"
                  >
                    {cta}
                    <IconArrowRight
                      aria-hidden
                      size={18}
                      stroke={2}
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                  </a>
                </Magnetic>
                <a
                  href={tel}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold tabular-nums shadow-[inset_0_0_0_1.5px_var(--pu-line)]"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                  Call {phone}
                </a>
              </div>
            </m.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
