"use client"

import { useTranslations } from "next-intl"

import { BundleCard } from "@/components/commerce/bundle-card"
import { useExamFilter } from "@/components/commerce/use-exam-filter"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useContent } from "@/i18n/content"
import type { PublicBundle } from "@/lib/catalog"

/** Sets filtered by exam. */
export function BundleGrid({ bundles }: { bundles: readonly PublicBundle[] }) {
  const t = useTranslations("Shop")
  const { phrase } = useContent()
  const exams = ["All", ...new Set(bundles.map((b) => b.exam))]
  const [exam, setExam] = useExamFilter(exams)
  const shown =
    exam === "All" ? bundles : bundles.filter((b) => b.exam === exam)

  return (
    <div className="mt-10 grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {exams.length > 2 ? (
          <ToggleGroup
            value={[exam]}
            onValueChange={(value) => setExam(value[0] ?? "All")}
            aria-label={t("filterExam")}
            className="flex-wrap"
          >
            {exams.map((e) => (
              <ToggleGroupItem key={e} value={e} className="px-3 text-sm">
                {e === "All" ? t("allSets") : phrase(e)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : (
          <span />
        )}
        <p aria-live="polite" className="tnum text-sm text-muted-foreground">
          {t("setCount", { count: shown.length })}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((bundle) => (
          <li key={bundle.slug}>
            <BundleCard bundle={bundle} />
          </li>
        ))}
      </ul>
    </div>
  )
}
