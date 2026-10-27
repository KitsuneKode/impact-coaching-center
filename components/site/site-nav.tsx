"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { memo, type RefObject, useEffect, useRef, useState } from "react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { NAV_ICONS } from "./nav-icons"
import { NAV_MENUS } from "./nav-links"

const ICONS = NAV_ICONS

/**
 * The header's sections. Each name is a button that opens its pages in a
 * panel under the header bar (hover or click; it glides between sections
 * rather than closing and opening). One control, one job: the panel's last
 * row goes to the section's listing. Arrow keys move along the row.
 * Moving between sections re-renders the root only: each section is
 * memoised on props that never change while the pointer moves.
 */
export function SiteNav({
  anchor,
  label,
}: {
  anchor: RefObject<HTMLElement | null>
  label: string
}) {
  const path = usePathname()
  // Open section, ours to close: a click on a page, a new page, or reading
  // on down the page closes it, so it never hangs over what comes next.
  const [open, setOpen] = useState<string | null>(null)
  const [close] = useState(() => () => setOpen(null))
  const [shownOn, setShownOn] = useState(path)
  if (shownOn !== path) {
    setShownOn(path)
    setOpen(null)
  }
  // One highlight that slides between the sections, the way a finger would
  // move along them, instead of each lighting up on its own. It is moved by
  // writing its style directly (a CSS transition does the motion), so moving
  // the pointer along the row never re-renders anything.
  const list = useRef<HTMLUListElement>(null)
  const [pillTo] = useState(() => (target: Element | null) => {
    const row = list.current
    const pill = row?.querySelector<HTMLElement>("[data-nav-pill]")
    if (!row || !pill) return
    if (!target) {
      pill.removeAttribute("data-shown")
      return
    }
    const box = target.getBoundingClientRect()
    const frame = row.getBoundingClientRect()
    const appearing = !pill.hasAttribute("data-shown")
    // Appearing: arrive in place rather than slide in from the last spot.
    if (appearing) pill.style.transitionProperty = "opacity"
    const start = box.left - frame.left
    const end = frame.right - box.right
    pill.style.clipPath = `inset(0 ${end}px 0 ${start}px round 999px)`
    pill.setAttribute("data-shown", "")
    if (appearing) {
      void pill.offsetWidth
      pill.style.transitionProperty = ""
    }
  })
  const openTrigger = () =>
    list.current?.querySelector("[data-site-trigger][data-popup-open]") ?? null
  useEffect(() => {
    const trigger = list.current?.querySelector(
      "[data-site-trigger][data-popup-open]"
    )
    if (open !== null) pillTo(trigger ?? null)
    else if (!list.current?.matches(":hover")) pillTo(null)
  }, [open, pillTo])

  useEffect(() => {
    if (open === null) return
    const from = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - from) > 32) setOpen(null)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [open])

  return (
    <NavigationMenu
      value={open}
      onValueChange={(value) => setOpen((value as string | null) ?? null)}
      data-site-nav
      data-flip
      aria-label={label}
      // Phones and tablets get the full menu sheet instead (site-menu.tsx).
      className="max-lg:hidden"
      delay={50}
      closeDelay={160}
      positioner={{ anchor, align: "center", sideOffset: 10 }}
    >
      <NavigationMenuList
        ref={list}
        onPointerLeave={() => pillTo(openTrigger())}
      >
        <li aria-hidden data-nav-pill />
        {NAV_MENUS.map((menu) => (
          <Section
            key={menu.key}
            menu={menu}
            current={menu.items.some((item) => {
              const base = item.href.split(/[?#]/)[0]
              return (
                base !== "/" && (path === base || path.startsWith(`${base}/`))
              )
            })}
            pillTo={pillTo}
            close={close}
          />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

/** One section: its name in the row and its panel of pages. */
const Section = memo(function Section({
  menu,
  current,
  pillTo,
  close,
}: {
  menu: (typeof NAV_MENUS)[number]
  current: boolean
  pillTo: (target: Element | null) => void
  close: () => void
}) {
  const t = useTranslations("NavMenu")
  const nav = useTranslations("Nav")
  return (
    <NavigationMenuItem value={menu.key}>
      <NavigationMenuTrigger
        data-site-trigger
        data-current={current ? "" : undefined}
        onPointerEnter={(e) => pillTo(e.currentTarget)}
        onFocus={(e) => pillTo(e.currentTarget)}
      >
        {menu.key === "ict" ? t("ict") : nav(menu.key)}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul
          data-menu-grid
          className="grid w-[min(36rem,calc(100vw-2rem))] gap-1 sm:grid-cols-2"
        >
          {menu.items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <li key={item.key}>
                <NavigationMenuLink
                  render={<Link href={item.href} onClick={close} />}
                  data-menu-tile
                >
                  <span
                    data-menu-icon
                    className="grid size-10 flex-none place-items-center rounded-xl"
                  >
                    <Icon aria-hidden size={19} stroke={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">
                      {t(`${item.key}.title`)}
                    </span>
                    <span className="block truncate text-[0.8125rem] text-muted-foreground">
                      {t(`${item.key}.note`)}
                    </span>
                  </span>
                </NavigationMenuLink>
              </li>
            )
          })}
        </ul>
        {menu.key === "ict" ? null : (
          <NavigationMenuLink
            render={<Link href={menu.href} onClick={close} />}
            data-menu-all
          >
            {t(`all.${menu.key}`)}
            <IconArrowRight aria-hidden size={16} stroke={2} />
          </NavigationMenuLink>
        )}
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
})
