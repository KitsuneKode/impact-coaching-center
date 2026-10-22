"use client"

import {
  IconArrowRight,
  IconFileText,
  IconLock,
  IconSearch,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import {
  startTransition,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react"

import { convexConfigured } from "@/app/providers"
import { PageViewer } from "@/components/commerce/lazy-page-viewer"
import { useOpenResource } from "@/components/commerce/use-open-resource"
import { Folder } from "@/components/home/folder"
import { Spinner } from "@/components/ui/spinner"
import { useContent } from "@/i18n/content"
import type { Language, Resource } from "@/lib/catalog"

const normalise = (text: string) => text.toLowerCase().normalize("NFKD")

/** Files listed at once inside a folder; "Show more" adds the next lot. */
const PAGE = 24
/** A file this recent wears a "New" tag. */
const NEW_FOR_MS = 21 * 24 * 60 * 60 * 1000
const NONE = new URLSearchParams()

type Reader = ReturnType<typeof useOpenResource>

/**
 * Free notes as folders, one per kind. Pick a folder, pick a file, and a
 * typeset sheet previews it beside the list with the one action: read it, or
 * log in once to read it. Exam, folder, language and search live in the URL
 * (`?exam=`, `?kind=`, `?lang=`, `?q=`), so the home page's folders and
 * shared links land on the right shelf; `?open=` reopens a file after log-in.
 *
 * The page is static, so the server cannot know the address: it renders the
 * shelf as it looks with none (the Suspense fallback is in the HTML), and the
 * browser swaps in the one that reads the address as it hydrates. Moves on
 * the shelf write the address with the History API, which Next keeps in
 * step with `useSearchParams` without a round trip to the server.
 */
export function NotesBrowser({
  resources,
}: {
  resources: readonly Resource[]
}) {
  return (
    <Suspense
      fallback={<Shelf resources={resources} reader={null} search={NONE} />}
    >
      {convexConfigured ? (
        <Connected resources={resources} />
      ) : (
        <FromAddress resources={resources} reader={null} />
      )}
    </Suspense>
  )
}

function Connected({ resources }: { resources: readonly Resource[] }) {
  return <FromAddress resources={resources} reader={useOpenResource()} />
}

function FromAddress({
  resources,
  reader,
}: {
  resources: readonly Resource[]
  reader: Reader | null
}) {
  return (
    <Shelf resources={resources} reader={reader} search={useSearchParams()} />
  )
}

/** Rewrites the query string in place; Next's router reads it back. */
function writeAddress(
  search: URLSearchParams,
  changes: Record<string, string | null>
) {
  const next = new URLSearchParams(search)
  for (const [key, value] of Object.entries(changes))
    if (value) next.set(key, value)
    else next.delete(key)
  const query = next.toString()
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`
  )
}

function Shelf({
  resources,
  reader,
  search,
}: {
  resources: readonly Resource[]
  reader: Reader | null
  search: URLSearchParams
}) {
  const t = useTranslations("Shop")
  const pulse = useTranslations("Pulse")
  const { phrase } = useContent()

  // One lower-cased haystack per file, built once per list rather than on
  // every keystroke.
  const haystacks = useMemo(
    () =>
      new Map(
        resources.map((r) => [
          r.slug,
          normalise(`${r.title} ${r.description} ${r.exam} ${r.kind}`),
        ])
      ),
    [resources]
  )
  // Rendered once per page load, so "new" cannot flip mid-visit.
  const [now] = useState(() => Date.now())

  const exams = ["All", ...new Set(resources.map((r) => r.exam))]
  const examParam = search.get("exam")
  const exam = examParam && exams.includes(examParam) ? examParam : "All"
  const langParam = search.get("lang")
  const [query, setQuery] = useState(() => search.get("q") ?? "")
  const needle = normalise(useDeferredValue(query).trim())
  const toOpen = search.get("open")
  const linked = resources.find((r) => r.slug === toOpen)

  const inExam = resources.filter((r) => exam === "All" || r.exam === exam)
  const matches = (r: Resource) =>
    !needle || Boolean(haystacks.get(r.slug)?.includes(needle))
  const folders = [...Map.groupBy(inExam, (r) => r.kind)].map(
    ([kind, items]) => ({ kind, items, hits: items.filter(matches).length })
  )
  const wanted = linked?.kind ?? search.get("kind")
  const kind =
    folders.find((f) => f.kind === wanted)?.kind ?? folders[0]?.kind ?? null
  const folder = folders.find((f) => f.kind === kind)

  // A search looks in every folder of the exam; otherwise the open folder.
  const pool = needle ? inExam.filter(matches) : (folder?.items ?? [])
  const languages = new Set(pool.map((r) => r.language ?? "en"))
  const language: Language | null =
    languages.size > 1 && (langParam === "en" || langParam === "as")
      ? langParam
      : null
  const files = language
    ? pool.filter((r) => (r.language ?? "en") === language)
    : pool

  // How many rows show, reset whenever the list underneath changes.
  const view = `${exam}|${kind}|${needle}|${language}`
  const [shown, setShown] = useState({ view, count: PAGE })
  const count = shown.view === view ? shown.count : PAGE
  const visible = files.slice(0, count)

  const [file, setFile] = useState<string | null>(linked?.slug ?? null)
  const current = visible.find((r) => r.slug === file) ?? visible[0]

  const move = (changes: Record<string, string | null>) => {
    setFile(null)
    startTransition(() => writeAddress(search, changes))
  }
  const pickFolder = (next: string) => {
    setQuery("")
    move({ kind: next, q: null, open: null })
  }

  // Back from log-in with ?open=<slug>: open it once, as soon as the session is known.
  const reopened = useRef(false)
  useEffect(() => {
    if (!reader || !linked || reopened.current || !reader.signedIn) return
    reopened.current = true
    void reader.open(linked.slug)
  })

  const meta = (r: Resource) =>
    [
      needle ? phrase(r.kind) : null,
      phrase(r.exam),
      t("pages", { count: r.pages }),
    ]
      .filter(Boolean)
      .join(" · ")
  const isNew = (r: Resource) =>
    r.addedAt !== undefined && now - r.addedAt < NEW_FOR_MS

  const action = (r: Resource) => {
    if (!reader || reader.signedIn === undefined)
      return (
        <span data-notes-read data-wait aria-hidden>
          {pulse("readFree")}
        </span>
      )
    const busy = reader.busy === r.slug
    return (
      <button
        type="button"
        data-notes-read
        disabled={busy}
        onClick={() => void reader.open(r.slug)}
        aria-label={
          reader.signedIn
            ? t("openTitle", { title: r.title })
            : t("loginToOpenTitle", { title: r.title })
        }
      >
        {busy ? (
          <>
            <Spinner />
            {t("opening")}
          </>
        ) : reader.signedIn ? (
          <>
            {pulse("readFree")}
            <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
          </>
        ) : (
          <>
            <IconLock aria-hidden size={17} stroke={1.75} />
            {t("loginToOpen")}
          </>
        )}
      </button>
    )
  }

  return (
    <div data-notes>
      <div className="flex flex-wrap items-center gap-3">
        {exams.length > 2 ? (
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">{t("filterExam")}</legend>
            {exams.map((e) => (
              <button
                key={e}
                type="button"
                data-chip
                aria-pressed={exam === e}
                onClick={() =>
                  move({
                    exam: e === "All" ? null : e,
                    kind: null,
                    open: null,
                  })
                }
                className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
              >
                {e === "All" ? t("all") : phrase(e)}
              </button>
            ))}
          </fieldset>
        ) : null}
        <label data-notes-search className="ms-auto">
          <IconSearch aria-hidden size={18} stroke={1.75} />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              writeAddress(search, { q: event.target.value.trim() || null })
            }}
            placeholder={t("search")}
            aria-label={t("searchLabel")}
          />
        </label>
      </div>

      <ul data-notes-folders className="mbs-10">
        {folders.map((f) => {
          const shownCount = needle ? f.hits : f.items.length
          return (
            <li key={f.kind}>
              <button
                type="button"
                data-folder-open
                data-notes-folder
                data-none={needle && !f.hits ? "" : undefined}
                aria-pressed={!needle && f.kind === kind}
                onClick={() => pickFolder(f.kind)}
                className="block w-full rounded-[14px] text-start"
              >
                <Folder
                  name={phrase(f.kind)}
                  count={shownCount}
                  label={pulse("folderFiles", { count: shownCount })}
                />
              </button>
            </li>
          )
        })}
      </ul>

      {folder || needle ? (
        <div data-notes-body className="mbs-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 className="type-display-sm">
                {needle
                  ? t("resultsFor", { query: query.trim() })
                  : phrase(folder?.kind ?? "")}
              </h2>
              <p
                aria-live="polite"
                className="tnum mbs-1 text-sm text-muted-foreground"
              >
                {t("count", { count: files.length })}
                {needle ? ` · ${t("searchingAll")}` : null}
              </p>
            </div>
            {languages.size > 1 ? (
              <fieldset className="flex flex-wrap gap-2">
                <legend className="sr-only">{t("filterLanguage")}</legend>
                {([null, "en", "as"] as const).map((l) => (
                  <button
                    key={l ?? "all"}
                    type="button"
                    data-chip
                    aria-pressed={language === l}
                    lang={l === "as" ? "as-IN" : undefined}
                    onClick={() => move({ lang: l })}
                    className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold"
                  >
                    {l === null
                      ? t("all")
                      : l === "en"
                        ? t("langEn")
                        : t("langAs")}
                  </button>
                ))}
              </fieldset>
            ) : null}
          </div>
          {current ? (
            <ViewTransition key={view} enter="auto" default="none">
              <div data-notes-split className="mbs-6">
                <div>
                  <ul
                    data-notes-list
                    aria-label={
                      needle
                        ? t("resultsFor", { query: query.trim() })
                        : pulse("filesIn", { name: phrase(folder?.kind ?? "") })
                    }
                  >
                    {visible.map((r) => {
                      const on = r.slug === current.slug
                      return (
                        <li key={r.slug} data-on={on || undefined}>
                          <button
                            type="button"
                            data-notes-file
                            aria-pressed={on}
                            onClick={() => setFile(r.slug)}
                          >
                            <IconFileText aria-hidden size={20} stroke={1.5} />
                            <span className="min-w-0">
                              <span
                                lang={r.language === "as" ? "as-IN" : undefined}
                                className="block font-semibold text-pretty"
                              >
                                {r.title}
                                {isNew(r) ? (
                                  <span data-notes-new>{t("newFile")}</span>
                                ) : null}
                              </span>
                              <span className="tnum mbs-0.5 block text-sm text-muted-foreground">
                                {meta(r)}
                              </span>
                            </span>
                          </button>
                          {/* On a narrow screen the chosen file opens in place. */}
                          {on ? (
                            <div data-notes-inline>
                              {r.description ? (
                                <p className="text-sm text-muted-foreground">
                                  {r.description}
                                </p>
                              ) : null}
                              {action(r)}
                            </div>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                  {files.length > visible.length ? (
                    <div className="mbs-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <button
                        type="button"
                        data-press
                        data-cta="ghost-paper"
                        onClick={() => setShown({ view, count: count + PAGE })}
                        className="inline-flex h-11 items-center rounded-full ps-5 pe-5 text-sm font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
                      >
                        {t("showMore", {
                          count: Math.min(PAGE, files.length - visible.length),
                        })}
                      </button>
                      <span className="tnum text-sm text-muted-foreground">
                        {t("shownOf", {
                          shown: visible.length,
                          total: files.length,
                        })}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div data-notes-preview>
                  <div key={current.slug} data-swap>
                    <div data-notes-sheet>
                      <span data-notes-kind>{phrase(current.kind)}</span>
                      <span
                        lang={current.language === "as" ? "as-IN" : undefined}
                        className="mbs-3 block font-display text-[clamp(1.25rem,1rem+1.2vw,1.75rem)] leading-[1.12] font-semibold text-balance"
                      >
                        {current.title}
                      </span>
                      {current.description ? (
                        <span className="mbs-3 line-clamp-3 block text-sm text-muted-foreground">
                          {current.description}
                        </span>
                      ) : null}
                      <span data-notes-lines aria-hidden />
                      <span className="tnum mbs-4 block text-sm text-muted-foreground">
                        {meta(current)}
                      </span>
                    </div>
                    <div className="mbs-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                      {action(current)}
                      {reader?.signedIn === false ? (
                        <p className="text-sm text-muted-foreground">
                          {pulse("loginOnce")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </ViewTransition>
          ) : (
            <div className="mbs-6 grid max-w-[48ch] justify-items-start gap-3 rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_var(--border)]">
              <p className="font-semibold">{t("nothingMatched")}</p>
              <p className="text-sm text-muted-foreground">
                {t("nothingNote")}
              </p>
              <button
                type="button"
                data-press
                data-cta="ghost-paper"
                onClick={() => {
                  setQuery("")
                  move({ q: null, lang: null })
                }}
                className="inline-flex h-10 items-center rounded-full ps-4 pe-4 text-sm font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
              >
                {t("clear")}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {reader?.opened ? (
        <PageViewer
          open
          marks
          onOpenChange={(next) => {
            if (next) return
            reader.close()
            if (toOpen) writeAddress(search, { open: null })
          }}
          title={reader.opened.title}
          note={
            reader.opened.placeholder
              ? t("placeholderPages")
              : t("pageCount", { count: reader.opened.pageCount })
          }
          pages={reader.opened.pages}
          pdfUrl={reader.opened.pdfUrl}
        />
      ) : null}
    </div>
  )
}
