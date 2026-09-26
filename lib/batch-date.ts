/** Whole days from `now` until an ISO date starts in IST; negative once past. */
export function daysUntil(isoDate: string, now = Date.now()) {
  const start = new Date(`${isoDate}T00:00:00+05:30`).getTime()
  return Math.ceil((start - now) / (24 * 60 * 60 * 1000))
}

/** Whether a dated batch has already started. */
export function hasStarted(isoDate: string, now = Date.now()) {
  return daysUntil(isoDate, now) < 0
}
