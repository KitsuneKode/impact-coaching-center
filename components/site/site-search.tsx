"use client"

import {
  IconBook2,
  IconCalendarEvent,
  IconCheck,
  IconLanguage,
  IconFileText,
  IconFolder,
  IconNews,
  IconBrandWhatsapp,
  IconClock,
  IconSchool,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import {
  Fragment,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useChooseLocale } from "@/components/i18n/use-choose-locale"
import { THEME_CHOICES, useThemeChoice } from "@/components/theme/theme-switch"
import { useRouter } from "@/i18n/navigation"
import type { SearchItem } from "@/lib/search-index"
import { track } from "@/lib/analytics"
import { searchScore } from "@/lib/search-match"
import { contactHref } from "@/lib/contact"

const normalise = (text: string) => text.trim().toLowerCase().normalize("NFKD")

/** The last few things searched for, on this device only. */
const RECENT_KEY = "ict-search-recent"
const RECENT_MAX = 5
function readRecent(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
    return Array.isArray(value)
      ? value
          .filter((q): q is string => typeof q === "string")
          .slice(0, RECENT_MAX)
      : []
  } catch {
    return []
  }
}
function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)))
  } catch {
    // Private windows and blocked storage: recent searches are a nicety.
  }
}

/** The title with each typed word marked where it matches. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)
  if (!words.length) return <>{text}</>
  const pattern = new RegExp(
    `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  )
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 ? (
          <mark key={i} data-hit>
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}

/** What to try when nothing matches. */
const SUGGESTIONS = ["APSC", "ADRE", "Question paper", "Current affairs"]

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
  const theme = useTranslations("Theme")
  const locale = useLocale()
  const router = useRouter()
  const { choice, choose } = useThemeChoice()
  const language = useChooseLocale()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<SearchItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")
  // Before anything is typed, a short start list, not the whole index.
  const browsing = query.trim() === ""
  const [kind, setKind] = useState<SearchItem["kind"] | "all">("all")
  const [recent, setRecent] = useState<string[]>([])
  const list = useRef<HTMLDivElement>(null)
  // A new query starts at the top, so the best match is never hidden.
  useEffect(() => {
    list.current?.scrollTo({ top: 0 })
  }, [query, kind])

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
      .filter((group) => kind === "all" || group.kind === kind)
      .sort((a, b) => (browsing ? 0 : b.best - a.best))
  }, [items, browsing, query, kind])
  const kinds = useMemo(
    () =>
      GROUPS.filter((group) => items?.some((item) => item.kind === group.kind)),
    [items]
  )

  // Settings sit in the start list, and come up for words that ask for
  // them ("dark", "theme", "assamese", ...).
  const asked = normalise(query)
  const settings = [
    ...THEME_CHOICES.map(({ id, icon }) => ({
      key: `theme:${id}`,
      group: "theme" as const,
      label: theme(
        id === "light" ? "useLight" : id === "dark" ? "useDark" : "useSystem"
      ),
      words: `theme mode colour color appearance ${id} ${theme(id)}`,
      icon,
      on: choice === id,
      run: () => choose(id),
    })),
    ...(["en", "as"] as const).map((l) => ({
      key: `lang:${l}`,
      group: "language" as const,
      label: theme(l === "en" ? "readEn" : "readAs"),
      words: `language bhasha ${l === "en" ? "english" : "assamese asomiya অসমীয়া"}`,
      icon: IconLanguage,
      on: language.current === l,
      run: () => {
        setOpen(false)
        setQuery("")
        language.choose(l)
      },
    })),
  ].filter(
    (item) =>
      kind === "all" &&
      (browsing ||
        (asked.length > 1 &&
          normalise(`${item.label} ${item.words}`).includes(asked)))
  )

  // First in the start list; after the results once something is typed.
  const settingsGroups = (["theme", "language"] as const).map((group) => {
    const rows = settings.filter((item) => item.group === group)
    return rows.length ? (
      <CommandGroup
        key={group}
        heading={theme(group === "theme" ? "group" : "languageGroup")}
      >
        {rows.map(({ key, label, icon: Icon, on, run }) => (
          <CommandItem
            key={key}
            value={key}
            onSelect={run}
            className="min-h-11 gap-3"
          >
            <span data-search-icon aria-hidden>
              <Icon size={16} stroke={1.75} />
            </span>
            <span
              lang={key === "lang:as" ? "as-IN" : undefined}
              className="min-w-0 flex-1 truncate font-medium"
            >
              {label}
            </span>
            {on ? (
              <IconCheck
                aria-label={theme("current")}
                size={16}
                stroke={2}
                className="text-primary"
              />
            ) : null}
          </CommandItem>
        ))}
      </CommandGroup>
    ) : null
  })

  const go = (href: string, kind: string) => {
    track({ name: "search_result_opened", kind, query_length: query.length })
    const typed = query.trim()
    if (typed) {
      const next = [typed, ...recent.filter((q) => q !== typed)]
      setRecent(next)
      writeRecent(next)
    }
    setOpen(false)
    setQuery("")
    setKind("all")
    router.push(href)
  }
  const toggle = (next: boolean) => {
    setOpen(next)
    if (next) setRecent(readRecent())
    else {
      setQuery("")
      setKind("all")
    }
  }

  // The shortcut opens and closes the box the same way a click does.
  const onShortcut = useEffectEvent(() => toggle(!open))
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
        onShortcut()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [variant])

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
        className="sm:max-w-xl data-open:animate-none data-closed:animate-none"
      >
        {/* Our own scoring: word and prefix matches, never scattered letters. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchPlaceholder")}
            value={query}
            onValueChange={setQuery}
          />
          {kinds.length > 1 ? (
            <fieldset
              data-search-kinds
              className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-3 pbs-2 pbe-1"
            >
              {[{ kind: "all" as const, key: "searchAll" }, ...kinds].map(
                (option) => (
                  <button
                    key={option.kind}
                    type="button"
                    aria-pressed={kind === option.kind}
                    onClick={() => setKind(option.kind)}
                    data-search-kind
                  >
                    {t(option.key)}
                  </button>
                )
              )}
            </fieldset>
          ) : null}
          <CommandList
            ref={list}
            data-edge-fade
            className="max-h-[min(28rem,calc(100dvh-clamp(1rem,12dvh,7rem)-9rem))]"
          >
            {items === null ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {failed ? t("searchFailed") : t("searchLoading")}
              </p>
            ) : (
              <>
                <CommandEmpty className="px-4 py-6 text-sm">
                  <p className="text-center text-muted-foreground">
                    {t("searchEmpty", { query: query.trim() })}
                  </p>
                  <p className="mbs-4 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((word) => (
                      <button
                        key={word}
                        type="button"
                        data-search-kind
                        onClick={() => {
                          setKind("all")
                          setQuery(word)
                        }}
                      >
                        {word}
                      </button>
                    ))}
                  </p>
                  <p className="mbs-4 text-center">
                    <a
                      href={contactHref({
                        kind: "search",
                        query: query.trim(),
                      })}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary"
                    >
                      <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
                      {t("searchAsk")}
                    </a>
                  </p>
                </CommandEmpty>
                {browsing && kind === "all" && recent.length ? (
                  <CommandGroup heading={t("searchRecent")}>
                    {recent.map((q) => (
                      <CommandItem
                        key={`recent:${q}`}
                        value={`recent:${q}`}
                        onSelect={() => setQuery(q)}
                        className="min-h-11 gap-3"
                      >
                        <span data-search-icon aria-hidden>
                          <IconClock size={16} stroke={1.75} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{q}</span>
                        <button
                          type="button"
                          aria-label={t("searchForget", { query: q })}
                          onClick={(event) => {
                            event.stopPropagation()
                            const next = recent.filter((item) => item !== q)
                            setRecent(next)
                            writeRecent(next)
                          }}
                          className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                        >
                          <IconX aria-hidden size={14} stroke={2} />
                        </button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {browsing ? settingsGroups : null}
                {groups.map(({ kind, key, icon: Icon, rows }) => (
                  <CommandGroup key={kind} heading={t(key)}>
                    {rows.map(({ item }) => (
                      <CommandItem
                        key={`${kind}:${item.href}`}
                        value={`${kind}:${item.href}`}
                        onSelect={() => go(item.href, kind)}
                        className="min-h-11 gap-3"
                      >
                        <span data-search-icon aria-hidden>
                          <Icon size={16} stroke={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            <Highlight text={item.title} query={query} />
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
                {browsing ? null : settingsGroups}
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
