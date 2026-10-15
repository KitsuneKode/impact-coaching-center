"use client"

import {
  IconArrowRight,
  IconAward,
  IconBooks,
  IconBuildingBank,
  IconBuildingMonument,
  IconCalendarEvent,
  IconChecklist,
  IconCompass,
  IconFileText,
  IconMapPin,
  IconNews,
  IconNotes,
  IconPencil,
  IconShieldCheck,
  IconShieldStar,
  IconTrophy,
  IconTruckDelivery,
  IconUsers,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { NAV_MENUS } from "./nav-links"

const ICONS = {
  landmark: IconBuildingMonument,
  shield: IconShieldCheck,
  bank: IconBuildingBank,
  compass: IconCompass,
  award: IconAward,
  truck: IconTruckDelivery,
  file: IconFileText,
  news: IconNews,
  notes: IconNotes,
  checklist: IconChecklist,
  books: IconBooks,
  badge: IconShieldStar,
  calendar: IconCalendarEvent,
  pencil: IconPencil,
  trophy: IconTrophy,
  users: IconUsers,
  map: IconMapPin,
} as const

/**
 * The header's sections. Hovering one opens its pages in a panel under the
 * header bar (it glides between sections rather than closing and opening);
 * clicking the section name goes to its listing, so "Courses" still means
 * the courses page. Arrow keys move along the row, and every page in a panel
 * is also reachable from its listing.
 */
export function SiteNav({
  anchor,
  label,
}: {
  anchor: RefObject<HTMLElement | null>
  label: string
}) {
  const t = useTranslations("NavMenu")
  const nav = useTranslations("Nav")
  const path = usePathname()

  return (
    <NavigationMenu
      data-site-nav
      data-flip
      aria-label={label}
      // Phones and tablets get the full menu sheet instead (site-menu.tsx).
      className="max-lg:hidden"
      delay={80}
      closeDelay={160}
      positioner={{ anchor, align: "center", sideOffset: 10 }}
    >
      <NavigationMenuList>
        {NAV_MENUS.map((menu) => {
          const section = menu.key === "ict" ? t("ict") : nav(menu.key)
          const current = menu.items.some(
            (item) =>
              item.href.split(/[?#]/)[0] !== "/" &&
              (path === item.href.split(/[?#]/)[0] ||
                path.startsWith(`${item.href.split(/[?#]/)[0]}/`))
          )
          return (
            <NavigationMenuItem key={menu.key} value={menu.key}>
              <NavigationMenuTrigger
                nativeButton={false}
                render={<Link href={menu.href} />}
                data-site-trigger
                // It renders an <a> to the listing; Base UI would announce it as
                // a button, but activating it navigates.
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                role="link"
                aria-current={current ? "page" : undefined}
              >
                {section}
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
                          render={<Link href={item.href} />}
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
                    render={<Link href={menu.href} />}
                    data-menu-all
                  >
                    {t(`all.${menu.key}`)}
                    <IconArrowRight aria-hidden size={16} stroke={2} />
                  </NavigationMenuLink>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
