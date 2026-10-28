import { IconChevronRight } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import type { CSSProperties } from "react"

import { afterWords, splitWords } from "@/components/motion/words"
import type { ReactNode } from "react"

import { Link } from "@/i18n/navigation"
import { siteUrl } from "@/lib/site"

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
  const locale = useLocale()
  const heading = splitWords(title)
  const base = `${siteUrl}${locale === "en" ? "" : `/${locale}`}`
  // The same trail for search engines; the current page has no link.
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: t("home"), href: "/" }, ...trail].map(
      (crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.label,
        ...(crumb.href
          ? { item: `${base}${crumb.href === "/" ? "" : crumb.href}` }
          : {}),
      })
    ),
  }
  const after = afterWords(heading.count)
  return (
    <header
      data-reveal-head
      style={{ "--after": `${after}s` } as CSSProperties}
      className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-12 md:pbs-[calc(var(--header-height)+2.5rem)]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" data-reveal="0">
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
      <h1 className="type-hero mbs-6 max-w-[22ch]">{heading.node}</h1>
      {lede ? (
        <p
          data-reveal="after"
          className="mbs-5 max-w-[56ch] text-lg text-pretty text-muted-foreground"
        >
          {lede}
        </p>
      ) : null}
      {children ? <div data-reveal="later">{children}</div> : null}
    </header>
  )
}
