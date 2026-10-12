import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// ClassPlus is the source of truth for courses; the site follows it.
crons.interval("sync ClassPlus courses", { hours: 6 }, internal.courses.sync, {
  trigger: "schedule",
})

export default crons
