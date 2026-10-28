import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// ClassPlus is the source of truth for courses; the site follows it nightly,
// and the owner has "Sync now" for a change that cannot wait. 02:00 in India.
crons.cron("sync ClassPlus courses", "30 20 * * *", internal.courses.sync, {
  trigger: "schedule",
})

// Short-lived rows: undeliverable numbers, spent rate limits, old event ids,
// abandoned checkouts, sent messages. Sundays, 03:00 in India.
crons.cron(
  "clean up short-lived rows",
  "30 21 * * 0",
  internal.cleanup.weekly,
  {}
)

// Files nothing uses any more, past their restore window. 03:30 in India.
crons.cron("sweep released files", "0 22 * * 0", internal.files.sweep, {})

export default crons
