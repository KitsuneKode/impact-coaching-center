"use client"

import { useTranslations } from "next-intl"

import { BookCard } from "@/components/commerce/book-card"
import { useContent } from "@/i18n/content"
import { useExamFilter } from "@/components/commerce/use-exam-filter"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Book } from "@/lib/catalog"

/** Books filtered by exam. */
export function BookGrid({ books }: { books: readonly Book[] }) {
  const t = useTranslations("Shop")
  const { phrase } = useContent()
  const exams = ["All", ...new Set(books.map((b) => b.exam))]
  const [exam, setExam] = useExamFilter(exams)
  const shown = exam === "All" ? books : books.filter((b) => b.exam === exam)

  return (
    <div className="mt-10 grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          value={[exam]}
          onValueChange={(value) => setExam(value[0] ?? "All")}
          aria-label={t("filterExam")}
          className="flex-wrap"
        >
          {exams.map((e) => (
            <ToggleGroupItem key={e} value={e} className="px-3 text-sm">
              {e === "All" ? t("all") : phrase(e)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p aria-live="polite" className="tnum text-sm text-muted-foreground">
          {t("bookCount", { count: shown.length })}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {shown.map((book) => (
          <li key={book.slug}>
            <BookCard book={book} />
          </li>
        ))}
      </ul>
    </div>
  )
}
