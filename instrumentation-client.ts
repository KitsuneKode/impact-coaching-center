import { startAnalytics } from "@/lib/analytics"

// Analytics wait until the page is idle, so they never compete with it.
if (typeof window !== "undefined") {
  const start = () => startAnalytics()
  if ("requestIdleCallback" in window)
    window.requestIdleCallback(start, { timeout: 4000 })
  else setTimeout(start, 2500)
}
