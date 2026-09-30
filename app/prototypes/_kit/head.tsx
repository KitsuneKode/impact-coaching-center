import { IconChevronRight } from "@tabler/icons-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { container } from "./shared"

/** Top of every inner page: breadcrumb, title, one line of context. */
export function PageHead({
  base,
  trail,
  title,
  lede,
  children,
}: {
  base: string
  trail: { label: string; href?: string }[]
  title: string
  lede?: string
  children?: ReactNode
}) {
  return (
    <section className={`${container} relative pt-8 pb-12 md:pt-12 md:pb-16`}>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--k-muted)]"
      >
        <Link href={base} data-k-link>
          Home
        </Link>
        {trail.map((t) => (
          <span key={t.label} className="flex items-center gap-1.5">
            <IconChevronRight aria-hidden size={14} stroke={1.75} />
            {t.href ? (
              <Link href={t.href} data-k-link>
                {t.label}
              </Link>
            ) : (
              <span className="text-[var(--k-ink)]">{t.label}</span>
            )}
          </span>
        ))}
      </nav>
      <h1 data-k-h1 className="mt-8 max-w-[22ch]">
        {title}
      </h1>
      {lede && (
        <p className="mt-5 max-w-[56ch] text-lg text-[var(--k-muted)]">
          {lede}
        </p>
      )}
      {children}
    </section>
  )
}
