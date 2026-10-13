import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// ClassPlus is the source of truth for courses; the site follows it.
crons.interval("sync ClassPlus courses", { hours: 6 }, internal.courses.sync, {
  trigger: "schedule",
})

// Orders left unpaid for three days are cancelled; a late payment revives one.
crons.daily(
  "expire unpaid orders",
  { hourUTC: 21, minuteUTC: 0 },
  internal.orders.expireUnpaid,
  {}
)

export default crons
