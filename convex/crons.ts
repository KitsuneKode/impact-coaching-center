import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// ClassPlus is the source of truth for courses; the site follows it.
crons.interval("sync ClassPlus courses", { hours: 6 }, internal.courses.sync, {
  trigger: "schedule",
})

// Orders left unpaid for three days are cancelled; a late payment revives one.
// 21:00 UTC is 02:30 in India, when nobody is paying.
crons.cron(
  "expire unpaid orders",
  "0 21 * * *",
  internal.orders.expireUnpaid,
  {}
)

// Short-lived rows: undeliverable numbers, spent rate limits, old event ids.
crons.cron(
  "clean up short-lived rows",
  "30 21 * * *",
  internal.cleanup.daily,
  {}
)

export default crons
