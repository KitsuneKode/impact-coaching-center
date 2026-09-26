/**
 * India Standard Time arithmetic for the admin.
 *
 * Staff work the queue by the day at the centre, so "due today" and
 * "tomorrow morning" mean IST whatever timezone the device or the server
 * reports. IST has no daylight saving, so a fixed offset is exact.
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function istParts(at: number) {
  const ist = new Date(at + IST_OFFSET_MS)
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth(),
    day: ist.getUTCDate(),
  }
}

/** The first instant of tomorrow in IST. Anything before it is due today. */
export function endOfTodayIst(now: number): number {
  const { year, month, day } = istParts(now)
  return Date.UTC(year, month, day + 1) - IST_OFFSET_MS
}

/** Whether a follow-up is due today or overdue. */
export function isDueIst(at: number | undefined, now: number): boolean {
  return at !== undefined && at < endOfTodayIst(now)
}

/** 10 AM IST, `days` from today: when a call back is reasonable. */
export function morningInIst(days: number, now: number): number {
  const { year, month, day } = istParts(now)
  return Date.UTC(year, month, day + days, 10, 0) - IST_OFFSET_MS
}

/** `yyyy-mm-dd` of the IST calendar day, for a date input. */
export function toIstDateInput(at: number | undefined): string {
  if (at === undefined) return ""
  return new Date(at + IST_OFFSET_MS).toISOString().slice(0, 10)
}

/** A date input's `yyyy-mm-dd` back to 10 AM IST that day. */
export function fromIstDateInput(value: string): number | undefined {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return Date.UTC(year, month - 1, day, 10, 0) - IST_OFFSET_MS
}
