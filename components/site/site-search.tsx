"use client"

import {
  IconBook2,
  IconCalendarEvent,
  IconFileText,
  IconFolder,
  IconNews,
  IconSchool,
  IconSearch,
} from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRouter } from "@/i18n/navigation"
import type { SearchItem } from "@/lib/search-index"
import { track } from "@/lib/analytics"
import { searchScore } from "@/lib/search-match"

const GROUPS: {
  kind: SearchItem["kind"]
  key: string
  icon: typeof IconSearch
}[] = [
  { kind: "course", key: "searchCourses", icon: IconSchool },
  { kind: "set", key: "searchSets", icon: IconBook2 },
  { kind: "notes", key: "searchNotes", icon: IconFolder },
  { kind: "exam", key: "searchExams", icon: IconCalendarEvent },
  { kind: "post", key: "searchPosts", icon: IconNews },
  { kind: "page", key: "searchPages", icon: IconFileText },
]

/** How many of each kind the start list shows before anything is typed. */
const START: Record<SearchItem["kind"], number> = {
  course: 4,
  set: 2,
  notes: 2,
  exam: 3,
  post: 0,
  page: 4,
}

/** One fetch per language per visit; the index is a few kilobytes. */
const cache = new Map<string, Promise<SearchItem[]>>()
function loadIndex(locale: string) {
  let pending = cache.get(locale)
  if (!pending) {
    pending = fetch(`/api/search/${locale}`).then((response) => {
      if (!response.ok) throw new Error(String(response.status))
      return response.json() as Promise<SearchItem[]>
    })
    pending.catch(() => cache.delete(locale))
    cache.set(locale, pending)
  }
  return pending
}

/**
 * Site search: courses, book sets, free notes, exam guides, the blog and the
 * main pages, matched as the visitor types. Opened from the header button,
 * Ctrl+K / ⌘K, or "/" when not typing. Opens instantly, with no animation:
 * it is a tool reached for again and again.
 */
export function SiteSearch({
  variant = "header",
}: {
  variant?: "header" | "menu"
}) {
  const t = useTranslations("Pulse")
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<SearchItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")
  // Before anything is typed, a short start list, not the whole index.
  const browsing = query.trim() === ""

  useEffect(() => {
    if (variant !== "header") return
    function onKeyDown(event: KeyboardEvent) {
      const typing = (event.target as Element | null)?.closest(
        "input, textarea, select, [contenteditable='true']"
      )
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        // Browsers bind Ctrl+K to the address bar, so this has to claim it.
        event.preventDefault()
        setOpen((previous) => {
          if (previous) setQuery("")
          return !previous
        })
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [variant])

  useEffect(() => {
    if (!open || items) return
    let live = true
    loadIndex(locale).then(
      (next) => live && setItems(next),
      () => live && setFailed(true)
    )
    return () => {
      live = false
    }
  }, [open, items, locale])

  // Ranked here rather than by the command list, so the best match leads
  // whichever group it is in: groups follow their best item.
  const groups = useMemo(() => {
    if (!items) return []
    return GROUPS.map((group) => {
      const all = items.filter((item) => item.kind === group.kind)
      const rows = browsing
        ? all.slice(0, START[group.kind]).map((item) => ({ item, score: 1 }))
        : all
            .map((item) => ({
              item,
              score: searchScore(item.title, query, item.keywords),
            }))
            .filter((row) => row.score > 0)
            .sort((a, b) => b.score - a.score)
      return { ...group, rows, best: rows[0]?.score ?? 0 }
    })
      .filter((group) => group.rows.length)
      .sort((a, b) => (browsing ? 0 : b.best - a.best))
  }, [items, browsing, query])

  const go = (href: string, kind: string) => {
    track({ name: "search_result_opened", kind, query_length: query.length })
    setOpen(false)
    router.push(href)
  }
  const toggle = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery("")
  }

  return (
    <>
      <button
        type="button"
        data-site-search={variant}
        data-press
        onClick={() => toggle(true)}
        // Start loading on intent, so results are there when the box opens.
        onPointerEnter={() => void loadIndex(locale).catch(() => {})}
        onFocus={() => void loadIndex(locale).catch(() => {})}
        aria-label={t("searchOpen")}
        aria-keyshortcuts="Control+K Meta+K /"
      >
        <IconSearch aria-hidden size={18} stroke={1.75} />
        {variant === "menu" ? <span>{t("searchLabel")}</span> : null}
      </button>
      <CommandDialog
        open={open}
        onOpenChange={toggle}
        title={t("searchOpen")}
        description={t("searchPlaceholder")}
        // High on the screen and never taller than it, so results grow down
        // into view instead of off the bottom.
        className="top-[clamp(1rem,12dvh,7rem)] sm:max-w-xl data-open:animate-none data-closed:animate-none"
      >
        {/* Our own scoring: word and prefix matches, never scattered letters. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchPlaceholder")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList
            data-edge-fade
            className="max-h-[min(28rem,calc(100dvh-clamp(1rem,12dvh,7rem)-7rem))]"
          >
            {items === null ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {failed ? t("searchFailed") : t("searchLoading")}
              </p>
            ) : (
              <>
                <CommandEmpty>{t("searchEmpty")}</CommandEmpty>
                {groups.map(({ kind, key, icon: Icon, rows }) => (
                  <CommandGroup key={kind} heading={t(key)}>
                    {rows.map(({ item }) => (
                      <CommandItem
                        key={`${kind}:${item.href}`}
                        value={`${kind}:${item.href}`}
                        onSelect={() => go(item.href, kind)}
                        className="min-h-11 gap-3"
                      >
                        <Icon
                          aria-hidden
                          size={18}
                          stroke={1.5}
                          className="flex-none text-muted-foreground"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {item.title}
                          </span>
                          {item.detail ? (
                            <span className="tnum block truncate text-xs text-muted-foreground">
                              {item.detail}
                            </span>
                          ) : null}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
          <div
            aria-hidden
            className="hidden items-center gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground sm:flex"
          >
            <span>
              <kbd data-kbd>↑</kbd> <kbd data-kbd>↓</kbd> {t("searchMove")}
            </span>
            <span>
              <kbd data-kbd>Enter</kbd> {t("searchGo")}
            </span>
            <span className="ms-auto">
              <kbd data-kbd>Esc</kbd> {t("searchClose")}
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  )
}
