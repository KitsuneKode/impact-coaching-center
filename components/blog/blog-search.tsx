"use client"

import { IconSearch, IconX } from "@tabler/icons-react"
import { type ReactNode, useDeferredValue, useId, useState } from "react"

type Item = { slug: string; text: string; node: ReactNode }

/**
 * Search over the posts already on the page: titles and summaries, as you
 * type, no server round trip. With nothing typed the page reads as before,
 * the newest post leading; while searching, every match is a card.
 */
export function BlogSearch({
  lead,
  items,
  labels,
}: {
  lead: { slug: string; node: ReactNode } | null
  items: Item[]
  labels: {
    search: string
    placeholder: string
    noMatch: string
    clear: string
  }
}) {
  const id = useId()
  const [query, setQuery] = useState("")
  const typed = useDeferredValue(query.trim().toLocaleLowerCase())
  const words = typed.split(/\s+/).filter(Boolean)
  const matches = words.length
    ? items.filter((item) => words.every((word) => item.text.includes(word)))
    : items.filter((item) => item.slug !== lead?.slug)

  return (
    <div className="grid gap-4">
      {items.length > 3 ? (
        <search className="flex">
          <label htmlFor={id} className="sr-only">
            {labels.search}
          </label>
          <span
            data-blog-search
            className="relative flex w-full max-w-md items-center"
          >
            <IconSearch
              aria-hidden
              size={18}
              stroke={1.75}
              className="pointer-events-none absolute inset-s-4 text-muted-foreground"
            />
            <input
              id={id}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.placeholder}
              autoComplete="off"
              className="h-12 w-full rounded-full bg-card ps-11 pe-12 text-base outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={labels.clear}
                className="absolute inset-e-1.5 grid size-9 place-items-center rounded-full text-muted-foreground"
              >
                <IconX aria-hidden size={16} stroke={2} />
              </button>
            ) : null}
          </span>
        </search>
      ) : null}

      {words.length ? null : lead?.node}

      <p aria-live="polite" className="sr-only">
        {words.length ? `${matches.length}` : ""}
      </p>
      {matches.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
          {matches.map((item) => (
            <li key={item.slug}>{item.node}</li>
          ))}
        </ul>
      ) : words.length ? (
        <p className="rounded-card bg-card p-8 text-center text-muted-foreground">
          {labels.noMatch.replace("{query}", query.trim())}
        </p>
      ) : null}
    </div>
  )
}
