"use client"

import { IconArrowRight, IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useState, useSyncExternalStore } from "react"

import { BookCover } from "@/components/commerce/book-cover"
import { Link } from "@/i18n/navigation"
import type { Picture } from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

/** One set as the card needs it, worked out on the server. */
export type PaperSet = {
  slug: string
  exam: string
  examLabel: string
  title: string
  books: number
  pricePaise: number | null
  /** A book in it is a solved-papers book. */
  papers: boolean
  cover: { title: string; subtitle?: string; picture: Picture | null }
}

/** The folders where a printed set is the natural next step. */
const PAPER_KINDS = new Set(["Question paper", "Practice set"])
const HIDDEN_KEY = "ict-paper-books-hidden"

const noSubscribe = () => () => {}
const readHidden = () => {
  try {
    return sessionStorage.getItem(HIDDEN_KEY) === "1"
  } catch {
    return false
  }
}

/**
 * On the question-paper and practice folders of the free notes, a small
 * card in the corner names ICT's printed set for the exam being browsed. It
 * reads the shelf's own address (notes-browser.tsx writes exam and kind)
 * and waits a beat before it appears. On a phone it sits below the shelf
 * instead of over the files. Once hidden, it stays hidden for the visit.
 */
export function PaperBooks({ sets }: { sets: readonly PaperSet[] }) {
  const t = useTranslations("Shop")
  const pulse = useTranslations("Pulse")
  const search = useSearchParams()
  const storedHidden = useSyncExternalStore(noSubscribe, readHidden, () => true)
  const [hidden, setHidden] = useState(false)

  const kind = search.get("kind")
  const exam = search.get("exam")
  if (hidden || storedHidden || !kind || !PAPER_KINDS.has(kind)) return null

  // The exam being browsed, or across all exams the set of solved papers.
  const pool = sets.filter(
    (set) => !exam || exam === "All" || set.exam === exam
  )
  const set = pool.find((s) => s.papers) ?? pool[0]
  if (!set) return null

  const hide = () => {
    setHidden(true)
    try {
      sessionStorage.setItem(HIDDEN_KEY, "1")
    } catch {
      // Private mode: hidden until the page reloads, which is enough.
    }
  }

  return (
    <aside
      key={set.slug}
      aria-label={t("paperBooks", { exam: set.examLabel })}
      data-paper-books
    >
      <div className="w-12 flex-none">
        <BookCover
          size="sm"
          tone="primary"
          title={set.cover.title}
          subtitle={set.cover.subtitle}
          cover={set.cover.picture}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          {t("paperBooks", { exam: set.examLabel })}
        </p>
        <p className="mbs-0.5 truncate font-semibold">{set.title}</p>
        <p className="tnum text-xs text-muted-foreground">
          {t("booksInSet", { count: set.books })}
          {set.pricePaise === null
            ? null
            : ` · ${t("fromPrice", { price: formatPaise(set.pricePaise) })}`}
        </p>
        <Link
          href={`/books/${set.slug}`}
          className="mbs-2 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary"
        >
          {pulse("seeSet")}
          <IconArrowRight aria-hidden size={15} stroke={2} />
        </Link>
      </div>
      <button
        type="button"
        onClick={hide}
        aria-label={t("paperBooksHide")}
        className="-me-1 -mt-1 grid size-9 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <IconX aria-hidden size={16} stroke={2} />
      </button>
    </aside>
  )
}
