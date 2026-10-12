"use client"

import { useTranslations } from "next-intl"

import { IconSearch } from "@tabler/icons-react"
import { useSearchParams } from "next/navigation"
import { useDeferredValue, useState } from "react"

import { ResourceCard } from "@/components/commerce/resource-card"
import { useContent } from "@/i18n/content"
import { useExamFilter } from "@/components/commerce/use-exam-filter"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Resource } from "@/lib/catalog"

const normalise = (text: string) => text.toLowerCase().normalize("NFKD")

/** Resources filtered by exam and kind, and searched by title and description. */
export function ResourceList({
  resources,
}: {
  resources: readonly Resource[]
}) {
  const t = useTranslations("Shop")
  const { phrase } = useContent()
  const exams = ["All", ...new Set(resources.map((r) => r.exam))]
  const kinds = ["All", ...new Set(resources.map((r) => r.kind))]
  const [exam, setExam] = useExamFilter(exams)
  const [kind, setKind] = useState("All")
  const [query, setQuery] = useState("")
  const needle = normalise(useDeferredValue(query).trim())
  const toOpen = useSearchParams().get("open")
  const shown = resources.filter(
    (r) =>
      (exam === "All" || r.exam === exam) &&
      (kind === "All" || r.kind === kind) &&
      (!needle ||
        normalise(`${r.title} ${r.description} ${r.exam} ${r.kind}`).includes(
          needle
        ))
  )
  const filtered = exam !== "All" || kind !== "All" || needle !== ""

  return (
    <div className="mt-8 grid gap-6">
      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          aria-label={t("searchLabel")}
        />
      </InputGroup>
      <div className="grid gap-3">
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
        {kinds.length > 2 ? (
          <ToggleGroup
            value={[kind]}
            onValueChange={(value) => setKind(value[0] ?? "All")}
            aria-label={t("filterKind")}
            className="flex-wrap"
          >
            {kinds.map((k) => (
              <ToggleGroupItem key={k} value={k} className="px-3 text-sm">
                {k === "All" ? t("everyKind") : phrase(k)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {t("count", { count: shown.length })}
      </p>
      {shown.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <li key={r.slug} className="grid">
              <ResourceCard resource={r} autoOpen={r.slug === toOpen} />
            </li>
          ))}
        </ul>
      ) : filtered ? (
        <div className="grid justify-items-start gap-3 rounded-card border border-border p-6">
          <p className="font-medium">{t("nothingMatched")}</p>
          <p className="text-sm text-muted-foreground">{t("nothingNote")}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setQuery("")
              setKind("All")
              setExam("All")
            }}
          >
            {t("clear")}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
