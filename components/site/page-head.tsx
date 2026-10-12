import { IconChevronRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Link } from "@/i18n/navigation"

/**
 * The top of an inner page: a breadcrumb, the display title, a lede and
 * whatever the page adds below (jump links, a search box).
 */
export function PageHead({
  trail,
  title,
  lede,
  children,
}: {
  trail: { label: string; href?: string }[]
  title: ReactNode
  lede?: ReactNode
  children?: ReactNode
}) {
  const t = useTranslations("Pulse")
  return (
    <header className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-12 md:pbs-[calc(var(--header-height)+2.5rem)]">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              {t("home")}
            </Link>
          </li>
          {trail.map((crumb) => (
            <li key={crumb.label} className="flex items-center gap-1">
              <IconChevronRight aria-hidden size={14} stroke={1.75} />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="type-hero mbs-6 max-w-[22ch]">{title}</h1>
      {lede ? (
        <p className="mbs-5 max-w-[56ch] text-lg text-pretty text-muted-foreground">
          {lede}
        </p>
      ) : null}
      {children}
    </header>
  )
}
