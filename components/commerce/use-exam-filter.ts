"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * The exam filter, kept in the URL (`?exam=APSC`) so a filtered list can be
 * shared, bookmarked and restored with the back button. An unknown value
 * falls back to "All" instead of showing an empty list.
 */
export function useExamFilter(options: readonly string[]) {
  const router = useRouter()
  const pathname = usePathname()
  const param = useSearchParams().get("exam")
  const exam = param && options.includes(param) ? param : "All"

  const setExam = (next: string) => {
    const query = next === "All" ? "" : `?exam=${encodeURIComponent(next)}`
    router.replace(`${pathname}${query}`, { scroll: false })
  }
  return [exam, setExam] as const
}
