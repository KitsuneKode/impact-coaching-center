"use client"

import {
  IconArrowRight,
  IconChevronDown,
  IconMenu2,
  IconPhone,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import { AccountMenu } from "@/components/account/account-menu"
import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { Link, usePathname } from "@/i18n/navigation"
import { contactHref } from "@/lib/contact"
import { NAV_ICONS } from "./nav-icons"
import { NAV_MENUS } from "./nav-links"

const ease = [0.23, 1, 0.32, 1] as const

/**
 * The phone and tablet menu: one paper sheet over the whole screen, under
 * the header bar, so no page shows above, beside or below it however the
 * header has shrunk (the sheet lives on <body>; inside the header it would
 * take the floating bar's box). Page scroll locks while it is open, Escape
 * closes it, and focus cycles inside.
 *
 * The sections are an accordion, one open at a time (the current page's
 * section opens first), each page a row with its icon and one line on what
 * is there. Language, theme, account and the one call to action stay
 * pinned at the bottom, in thumb reach.
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
  const ids = useId()
  const here = NAV_MENUS.find((menu) =>
    menu.items.some((item) => {
      const base = item.href.split(/[?#]/)[0]
      return base !== "/" && (path === base || path.startsWith(`${base}/`))
    })
  )?.key
  const [section, setSection] = useState<string | undefined>(here)

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
      ].filter(
        (item): item is HTMLElement =>
          item !== null && item.closest("[inert]") === null
      )
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
        onClick={() => {
          if (open) return close()
          setSection(here)
          setOpen(true)
        }}
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
                  className="flex min-h-full flex-col"
                  initial={reduce ? false : { transform: "translateY(-8px)" }}
                  animate={{
                    transform: "translateY(0px)",
                    transition: { duration: 0.22, ease },
                  }}
                >
                  <ul className="px-5">
                    {NAV_MENUS.map((menu) => {
                      const expanded = section === menu.key
                      const name =
                        menu.key === "ict" ? menus("ict") : t(menu.key)
                      return (
                        <li key={menu.key} className="border-b border-border">
                          <button
                            type="button"
                            id={`${ids}-${menu.key}`}
                            aria-expanded={expanded}
                            aria-controls={`${ids}-${menu.key}-pages`}
                            onClick={() =>
                              setSection(expanded ? undefined : menu.key)
                            }
                            className="flex min-h-16 w-full items-center justify-between gap-4 text-start font-display text-xl font-semibold"
                          >
                            {name}
                            <IconChevronDown
                              aria-hidden
                              size={20}
                              stroke={1.75}
                              data-accordion-chevron
                              className="text-muted-foreground"
                            />
                          </button>
                          <section
                            id={`${ids}-${menu.key}-pages`}
                            aria-labelledby={`${ids}-${menu.key}`}
                            data-accordion-panel
                            data-open={expanded || undefined}
                            inert={!expanded}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <ul className="grid gap-0.5 pbe-4">
                                {menu.items.map((item) => {
                                  const Icon = NAV_ICONS[item.icon]
                                  return (
                                    <li key={item.key}>
                                      <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        data-menu-row
                                        className="flex min-h-14 items-center gap-3.5 rounded-2xl px-2"
                                      >
                                        <span
                                          data-menu-icon
                                          className="grid size-10 flex-none place-items-center rounded-xl"
                                        >
                                          <Icon
                                            aria-hidden
                                            size={19}
                                            stroke={1.75}
                                          />
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block font-semibold">
                                            {menus(`${item.key}.title`)}
                                          </span>
                                          <span className="block truncate text-sm text-muted-foreground">
                                            {menus(`${item.key}.note`)}
                                          </span>
                                        </span>
                                      </Link>
                                    </li>
                                  )
                                })}
                                {menu.key === "ict" ? null : (
                                  <li>
                                    <Link
                                      href={menu.href}
                                      onClick={() => setOpen(false)}
                                      className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-primary"
                                    >
                                      {menus(`all.${menu.key}`)}
                                      <IconArrowRight
                                        aria-hidden
                                        size={16}
                                        stroke={2}
                                      />
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </section>
                        </li>
                      )
                    })}
                  </ul>
                  {/* Pinned to the bottom of the sheet, in thumb reach. */}
                  <div data-menu-dock className="grid gap-3 px-5 pbs-4 pbe-5">
                    <div className="flex items-center gap-2">
                      <LocaleSwitch />
                      <ThemeSwitch />
                      <span className="ms-auto">
                        <AccountMenu />
                      </span>
                    </div>
                    <a
                      href={contactHref({ kind: "workshop" })}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() => setOpen(false)}
                      data-cta="amber"
                      data-press
                      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
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
                      className="tnum inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-muted-foreground"
                    >
                      <IconPhone aria-hidden size={17} stroke={1.75} />
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
