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
import { useEffect, useState } from "react"

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
        setOpen((previous) => !previous)
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

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        data-site-search={variant}
        data-press
        onClick={() => setOpen(true)}
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
        onOpenChange={setOpen}
        title={t("searchOpen")}
        description={t("searchPlaceholder")}
        className="sm:max-w-xl data-open:animate-none data-closed:animate-none"
      >
        <Command
          // Our own scoring: word and prefix matches, never scattered letters.
          filter={(value, search, keywords) =>
            searchScore(value.split("\u0000")[0] ?? value, search, keywords)
          }
        >
          <CommandInput placeholder={t("searchPlaceholder")} />
          <CommandList className="max-h-[min(28rem,60dvh)]">
            {items === null ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {failed ? t("searchFailed") : t("searchLoading")}
              </p>
            ) : (
              <>
                <CommandEmpty>{t("searchEmpty")}</CommandEmpty>
                {GROUPS.map(({ kind, key, icon: Icon }) => {
                  const group = items.filter((item) => item.kind === kind)
                  if (!group.length) return null
                  return (
                    <CommandGroup key={kind} heading={t(key)}>
                      {group.map((item) => (
                        <CommandItem
                          key={`${kind}:${item.href}`}
                          value={`${item.title}\u0000${item.href}`}
                          keywords={item.keywords}
                          onSelect={() => go(item.href)}
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
                  )
                })}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
