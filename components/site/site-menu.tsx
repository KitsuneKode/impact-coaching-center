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
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import { AccountMenu } from "@/components/account/account-menu"
import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { Link, usePathname } from "@/i18n/navigation"
import { contactHref } from "@/lib/contact"
import { NAV_MENUS } from "./nav-links"

const ease = [0.23, 1, 0.32, 1] as const

/**
 * The phone and tablet menu: one paper sheet over the whole screen, under
 * the header bar, so no page shows above, beside or below it however the
 * header has shrunk (the sheet lives on <body>; inside the header it would
 * take the floating bar's box). Page scroll locks while it is open, Escape
 * closes it, and focus cycles inside.
 */
export function SiteMenu({ phone }: { phone: string }) {
  const t = useTranslations("Nav")
  const offer = useTranslations("Offer")
  const menus = useTranslations("NavMenu")
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const reduce = useReducedMotion()
  const button = useRef<HTMLButtonElement>(null)
  // The sheet goes on <body>, which exists only once the page is hydrated.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
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
    // The header drops its over-the-hero white, and the strip comes back,
    // while the sheet is behind them (app/globals.css).
    root.dataset.menuOpen = ""
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
      delete root.dataset.menuOpen
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
      {hydrated &&
        createPortal(
          <AnimatePresence initial={false}>
            {open ? (
              <m.nav
                ref={panel}
                id="site-menu"
                aria-label={t("menu")}
                className="fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-background pbs-[calc(var(--strip-height)+var(--header-height))] pbe-[env(safe-area-inset-bottom)] text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18, ease } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <m.div
                  initial={reduce ? false : { transform: "translateY(-8px)" }}
                  animate={{
                    transform: "translateY(0px)",
                    transition: { duration: 0.22, ease },
                  }}
                >
                  {/* Each section, then its own pages as chips: "APSC books"
                  is one tap, the same groups as the desktop panels. */}
                  <ul>
                    {NAV_MENUS.map((menu) => (
                      <li
                        key={menu.key}
                        className="border-b border-border px-5 pbs-4 pbe-4"
                      >
                        <Link
                          href={menu.href}
                          onClick={() => setOpen(false)}
                          className="flex min-h-11 items-center justify-between font-display text-xl font-semibold"
                        >
                          {menu.key === "ict" ? menus("ict") : t(menu.key)}
                          <IconArrowRight
                            aria-hidden
                            size={18}
                            stroke={2}
                            className="text-muted-foreground"
                          />
                        </Link>
                        <ul className="mbs-2 flex flex-wrap gap-2">
                          {menu.items.map((item) => (
                            <li key={item.key}>
                              <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                data-press
                                className="inline-flex min-h-10 items-center rounded-full bg-secondary px-3.5 text-sm font-medium"
                              >
                                {menus(`${item.key}.title`)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 px-5 pbs-5">
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
                </m.div>
              </m.nav>
            ) : null}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

const noop = () => () => {}
