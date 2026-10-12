"use client"

import {
  IconArrowRight,
  IconFileText,
  IconLock,
  IconSearch,
} from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDeferredValue, useEffect, useRef, useState } from "react"

import { convexConfigured } from "@/app/providers"
import { PageViewer } from "@/components/commerce/page-viewer"
import { useExamFilter } from "@/components/commerce/use-exam-filter"
import { useOpenResource } from "@/components/commerce/use-open-resource"
import { Folder } from "@/components/home/folder"
import { Spinner } from "@/components/ui/spinner"
import { useContent } from "@/i18n/content"
import type { Resource } from "@/lib/catalog"

const normalise = (text: string) => text.toLowerCase().normalize("NFKD")

type Reader = ReturnType<typeof useOpenResource>

/**
 * Free notes as folders, one per kind. Pick a folder, pick a file, and a
 * typeset sheet previews it beside the list with the one action: read it, or
 * log in once to read it. Exam and folder live in the URL (`?exam=`,
 * `?kind=`), so the home page's folders and shared links land on the right
 * shelf; `?open=` reopens a file after log-in.
 */
export function NotesBrowser({
  resources,
}: {
  resources: readonly Resource[]
}) {
  return convexConfigured ? (
    <Connected resources={resources} />
  ) : (
    <Shelf resources={resources} reader={null} />
  )
}

function Connected({ resources }: { resources: readonly Resource[] }) {
  return <Shelf resources={resources} reader={useOpenResource()} />
}

function Shelf({
  resources,
  reader,
}: {
  resources: readonly Resource[]
  reader: Reader | null
}) {
  const t = useTranslations("Shop")
  const pulse = useTranslations("Pulse")
  const { phrase } = useContent()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const exams = ["All", ...new Set(resources.map((r) => r.exam))]
  const [exam, setExam] = useExamFilter(exams)
  const [query, setQuery] = useState("")
  const needle = normalise(useDeferredValue(query).trim())
  const toOpen = params.get("open")
  const linked = resources.find((r) => r.slug === toOpen)

  const inExam = resources.filter((r) => exam === "All" || r.exam === exam)
  const folders = [...Map.groupBy(inExam, (r) => r.kind)].map(
    ([kind, items]) => ({ kind, items })
  )
  const wanted = linked?.kind ?? params.get("kind")
  const [picked, setPicked] = useState<string | null>(null)
  const kind =
    picked && folders.some((f) => f.kind === picked)
      ? picked
      : (folders.find((f) => f.kind === wanted)?.kind ?? folders[0]?.kind)
  const folder = folders.find((f) => f.kind === kind)
  const files = (folder?.items ?? []).filter(
    (r) =>
      !needle ||
      normalise(`${r.title} ${r.description} ${r.exam}`).includes(needle)
  )
  const [file, setFile] = useState<string | null>(linked?.slug ?? null)
  const current = files.find((r) => r.slug === file) ?? files[0]

  const pickFolder = (next: string) => {
    setPicked(next)
    setFile(null)
    const query = new URLSearchParams(params)
    query.set("kind", next)
    query.delete("open")
    router.replace(`${pathname}?${query}`, { scroll: false })
  }

  // Back from log-in with ?open=<slug>: open it once, as soon as the session is known.
  const reopened = useRef(false)
  useEffect(() => {
    if (!reader || !linked || reopened.current || !reader.signedIn) return
    reopened.current = true
    void reader.open(linked.slug)
  })

  const meta = (r: Resource) =>
    [phrase(r.exam), t("pages", { count: r.pages })].join(" · ")

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
                onClick={() => {
                  setExam(e)
                  setPicked(null)
                  setFile(null)
                }}
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            aria-label={t("searchLabel")}
          />
        </label>
      </div>

      <ul data-notes-folders className="mbs-10">
        {folders.map((f) => (
          <li key={f.kind}>
            <button
              type="button"
              data-folder-open
              data-notes-folder
              aria-pressed={f.kind === kind}
              onClick={() => pickFolder(f.kind)}
              className="block w-full rounded-[14px] text-start"
            >
              <Folder
                name={phrase(f.kind)}
                count={f.items.length}
                label={pulse("folderFiles", { count: f.items.length })}
              />
            </button>
          </li>
        ))}
      </ul>

      {folder ? (
        <div data-notes-body className="mbs-12">
          <h2 className="type-display-sm">{phrase(folder.kind)}</h2>
          <p aria-live="polite" className="mbs-1 text-sm text-muted-foreground">
            {t("count", { count: files.length })}
          </p>
          {current ? (
            <div data-notes-split className="mbs-6">
              <ul
                data-notes-list
                aria-label={pulse("filesIn", { name: phrase(folder.kind) })}
              >
                {files.map((r) => {
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
                          <span className="block font-semibold text-pretty">
                            {r.title}
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

              <div data-notes-preview>
                <div key={current.slug} data-swap>
                  <div data-notes-sheet>
                    <span data-notes-kind>{phrase(current.kind)}</span>
                    <span className="mbs-3 block font-display text-[clamp(1.25rem,1rem+1.2vw,1.75rem)] leading-[1.12] font-semibold text-balance">
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
                onClick={() => setQuery("")}
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
          onOpenChange={(next) => {
            if (next) return
            reader.close()
            if (toOpen)
              router.replace(
                locale === "en" ? "/resources" : `/${locale}/resources`,
                { scroll: false }
              )
          }}
          title={reader.opened.title}
          note={
            reader.opened.placeholder
              ? t("placeholderPages")
              : t("pageCount", { count: reader.opened.pages.length })
          }
          pages={reader.opened.pages}
        />
      ) : null}
    </div>
  )
}
