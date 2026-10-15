"use client"

import { IconChevronDown, IconListDetails } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import type { Heading } from "@/lib/article"

/**
 * "On this page": the post's headings, the one being read marked, the way
 * Fumadocs does it. A rail beside the list fills to the current heading.
 * Wide screens keep it beside the article; narrower ones fold it into a
 * disclosure above the text (the same links, no JavaScript needed to open).
 */
export function PostContents({
  headings,
  variant,
}: {
  headings: readonly Heading[]
  variant: "rail" | "fold"
}) {
  const t = useTranslations("BlogPage")
  const active = useActiveHeading(headings)
  const index = Math.max(
    0,
    headings.findIndex((h) => h.id === active)
  )

  const list = (
    <ol data-contents-list>
      {headings.map((heading, i) => (
        <li key={heading.id} data-depth={heading.depth}>
          <a
            href={`#${heading.id}`}
            aria-current={heading.id === active ? "location" : undefined}
            data-read={i < index || undefined}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === "fold")
    return (
      <details data-contents-fold>
        <summary>
          <IconListDetails aria-hidden size={18} stroke={1.75} />
          {t("onThisPage")}
          <IconChevronDown
            aria-hidden
            size={16}
            stroke={2}
            data-contents-chevron
          />
        </summary>
        {list}
      </details>
    )

  return (
    <nav aria-label={t("onThisPage")} data-contents-rail>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <IconListDetails aria-hidden size={16} stroke={1.75} />
        {t("onThisPage")}
      </p>
      {list}
    </nav>
  )
}

/**
 * The heading whose section is on screen: the last one that has passed a
 * line a quarter of the way down the window. One observer, no scroll
 * handler.
 */
function useActiveHeading(headings: readonly Heading[]) {
  const [active, setActive] = useState<string | undefined>(headings[0]?.id)
  useEffect(() => {
    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((node): node is HTMLElement => node !== null)
    if (!nodes.length) return
    const above = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Above the line: passed. Below it again: not yet reached.
          if (entry.boundingClientRect.top < (entry.rootBounds?.bottom ?? 0))
            above.add(entry.target.id)
          else above.delete(entry.target.id)
        }
        const last = [...nodes].reverse().find((node) => above.has(node.id))
        setActive(last?.id ?? nodes[0]!.id)
      },
      { rootMargin: "0px 0px -75% 0px", threshold: [0, 1] }
    )
    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [headings])
  return active
}
