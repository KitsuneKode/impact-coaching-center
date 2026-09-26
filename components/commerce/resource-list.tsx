"use client"

import { useState } from "react"

import { ResourceCard } from "@/components/commerce/resource-card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { previewResources } from "@/lib/preview-catalogue"

const exams = ["All", ...new Set(previewResources.map((r) => r.exam))]

/** Resources filtered by exam, one choice at a time. */
export function ResourceList() {
  const [exam, setExam] = useState("All")
  const shown =
    exam === "All"
      ? previewResources
      : previewResources.filter((r) => r.exam === exam)

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
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <li key={r.slug} className="grid">
            <ResourceCard resource={r} />
          </li>
        ))}
      </ul>
    </div>
  )
}
