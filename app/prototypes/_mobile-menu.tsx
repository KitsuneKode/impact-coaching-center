"use client"

import { IconMenu2, IconX } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * The phone menu: a button in the header that drops a full-width panel of
 * links. Closes on navigation and on Escape. Styled through `--mm-*`
 * variables and `mobileMenuCss`.
 */
export function MobileMenu({
  links,
  top = 68,
}: {
  links: { href: string; label: string }[]
  top?: number
}) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const reduce = useReducedMotion()

  // A new page closes the menu.
  const [seen, setSeen] = useState(path)
  if (seen !== path) {
    setSeen(path)
    setOpen(false)
  }
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const swap = {
    initial: reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    transition: { type: "spring", duration: 0.3, bounce: 0 } as const,
  }

  return (
    <div data-mm className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mm-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        data-mm-btn
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
          <m.nav
            id="mm-panel"
            aria-label="Menu"
            data-mm-panel
            style={{ top }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} data-mm-link>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
