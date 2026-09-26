"use client"

import { useSearchParams } from "next/navigation"

import { ResourceCard } from "@/components/commerce/resource-card"
import { useExamFilter } from "@/components/commerce/use-exam-filter"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Resource } from "@/lib/catalog"

/** Resources filtered by exam, one choice at a time. */
export function ResourceList({
  resources,
}: {
  resources: readonly Resource[]
}) {
  const exams = ["All", ...new Set(resources.map((r) => r.exam))]
  const [exam, setExam] = useExamFilter(exams)
  const toOpen = useSearchParams().get("open")
  const shown =
    exam === "All" ? resources : resources.filter((r) => r.exam === exam)

  return (
    <div className="mt-8 grid gap-6">
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
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {shown.length} {shown.length === 1 ? "resource" : "resources"}
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <li key={r.slug} className="grid">
            <ResourceCard resource={r} autoOpen={r.slug === toOpen} />
          </li>
        ))}
      </ul>
    </div>
  )
}
