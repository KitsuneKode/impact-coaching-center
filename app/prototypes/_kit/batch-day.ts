import { todayIst } from "@/lib/calendar"

/** Which day of the batch it is today in India, counting the start date as day 1. */
export function batchDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  const [ty, tm, td] = todayIst(Date.now()).split("-").map(Number)
  const gap =
    (Date.UTC(ty!, tm! - 1, td!) - Date.UTC(y!, m! - 1, d!)) / 86_400_000
  return Math.max(1, Math.round(gap) + 1)
}
