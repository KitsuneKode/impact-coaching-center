"use client"

import { BookCard } from "@/components/commerce/book-card"
import { useExamFilter } from "@/components/commerce/use-exam-filter"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { previewBooks } from "@/lib/preview-catalogue"

const exams = ["All", ...new Set(previewBooks.map((b) => b.exam))]

/** Books filtered by exam. */
export function BookGrid() {
  const [exam, setExam] = useExamFilter(exams)
  const shown =
    exam === "All" ? previewBooks : previewBooks.filter((b) => b.exam === exam)

  return (
    <div className="mt-10 grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          value={[exam]}
          onValueChange={(value) => setExam(value[0] ?? "All")}
          aria-label="Filter by exam"
          className="flex-wrap"
        >
          {exams.map((e) => (
            <ToggleGroupItem key={e} value={e} className="px-3 text-sm">
              {e}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p aria-live="polite" className="tnum text-sm text-muted-foreground">
          {shown.length} {shown.length === 1 ? "book" : "books"}
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
