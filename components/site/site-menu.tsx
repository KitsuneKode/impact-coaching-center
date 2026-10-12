"use client"

import {
  IconArrowRight,
  IconMenu2,
  IconPhone,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { AccountMenu } from "@/components/account/account-menu"
import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { Link, usePathname } from "@/i18n/navigation"
import { contactHref } from "@/lib/contact"
import { MENU_LINKS } from "./nav-links"

const ease = [0.23, 1, 0.32, 1] as const

/**
 * The phone and tablet menu. The panel hangs from the sticky header, so it
 * sits directly beneath it wherever the page is scrolled. Page scroll locks
 * while it is open, Escape closes it, and focus cycles inside.
 */
export function SiteMenu({ phone }: { phone: string }) {
  const t = useTranslations("Nav")
  const offer = useTranslations("Offer")
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const reduce = useReducedMotion()
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)

  // A new page closes the menu.
  const [seen, setSeen] = useState(path)
  if (seen !== path) {
    setSeen(path)
    setOpen(false)
  }

  const close = () => {
    setOpen(false)
    requestAnimationFrame(() => button.current?.focus())
  }

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    panel.current?.querySelector<HTMLElement>("a")?.focus()

    const desktop = window.matchMedia("(min-width: 64rem)")
    const onWide = () => desktop.matches && setOpen(false)
    desktop.addEventListener("change", onWide)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        close()
        return
      }
      if (event.key !== "Tab") return
      const items = [
        button.current,
        ...(panel.current?.querySelectorAll<HTMLElement>("a, button") ?? []),
      ].filter((item): item is HTMLElement => item !== null)
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey && (!active || active === first)) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => {
      root.style.overflow = previous
      desktop.removeEventListener("change", onWide)
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
    <div className="lg:hidden">
      <button
        ref={button}
        type="button"
        data-menu-button
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="relative grid size-5 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {open ? (
              <m.span key="x" {...swap} className="absolute">
                <IconX aria-hidden size={20} stroke={1.75} />
              </m.span>
            ) : (
              <m.span key="menu" {...swap} className="absolute">
                <IconMenu2 aria-hidden size={20} stroke={1.75} />
              </m.span>
            )}
          </AnimatePresence>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <>
            <m.div
              aria-hidden
              onClick={close}
              className="absolute inset-x-0 top-full z-40 h-dvh bg-foreground/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease } }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
            />
            <m.nav
              ref={panel}
              id="site-menu"
              aria-label={t("menu")}
              className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-76px-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain bg-background text-foreground"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.2, ease },
              }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
            >
              <ul>
                {MENU_LINKS.map((link) => (
                  <li key={link.href} className="border-b border-border px-5">
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex h-14 items-center font-display text-xl font-semibold"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 px-5 pt-5">
                <LocaleSwitch />
                <AccountMenu />
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <a
                  href={contactHref({ kind: "workshop" })}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setOpen(false)}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-foreground transition-transform duration-150 ease-out-strong active:scale-[0.97]"
                >
                  {offer("cta")}
                  <IconArrowRight
                    aria-hidden
                    size={18}
                    stroke={2}
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href={contactHref({ kind: "call" })}
                  onClick={() => setOpen(false)}
                  className="tnum inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold shadow-[inset_0_0_0_1.5px_var(--border)]"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                  {t("callNumber", { phone })}
                </a>
              </div>
            </m.nav>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
