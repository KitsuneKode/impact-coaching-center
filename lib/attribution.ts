/** Only known channels leave the browser. Never send a raw referrer or query. */
export type VisitSource =
  | "instagram"
  | "facebook"
  | "youtube"
  | "chatgpt"
  | "google"
  | "whatsapp"
  | "direct"
  | "other"

function known(value: string | null): VisitSource | null {
  const source = value
    ?.trim()
    .toLowerCase()
    .replace(/^www\./, "")
  if (!source) return null
  if (["ig", "instagram", "instagram.com", "l.instagram.com"].includes(source))
    return "instagram"
  if (
    [
      "fb",
      "facebook",
      "facebook.com",
      "m.facebook.com",
      "l.facebook.com",
    ].includes(source)
  )
    return "facebook"
  if (
    ["yt", "youtube", "youtube.com", "youtu.be", "m.youtube.com"].includes(
      source
    )
  )
    return "youtube"
  if (["chatgpt", "chatgpt.com", "chat.openai.com"].includes(source))
    return "chatgpt"
  if (["google", "google.com", "google.co.in"].includes(source)) return "google"
  if (["wa", "whatsapp", "whatsapp.com", "web.whatsapp.com"].includes(source))
    return "whatsapp"
  return null
}

export function visitSource(url: string, referrer: string): VisitSource {
  let page: URL
  try {
    page = new URL(url)
  } catch {
    return "other"
  }
  const tagged =
    page.searchParams.get("utm_source") ??
    page.searchParams.get("ref") ??
    page.searchParams.get("refer")
  if (tagged) return known(tagged) ?? "other"
  if (!referrer) return "direct"
  try {
    const previous = new URL(referrer)
    if (previous.origin === page.origin) return "direct"
    return known(previous.hostname) ?? "other"
  } catch {
    return "other"
  }
}

/** What travels with an enquiry: the first page of the visit and its source. */
export type VisitAttribution = {
  utmSource: VisitSource
  utmMedium?: string
  utmCampaign?: string
}

const VISIT_KEY = "ict-visit"
const clip = (value: string | null) => value?.trim().slice(0, 80) || undefined

/**
 * The visit's source, decided once on the landing page and kept for the
 * session, so an enquiry three pages later still credits the ad that brought
 * the visitor. Storage can be blocked; then the current page decides.
 */
export function visitAttribution(): VisitAttribution {
  try {
    const kept = sessionStorage.getItem(VISIT_KEY)
    if (kept) return JSON.parse(kept) as VisitAttribution
  } catch {
    /* fall through to the current page */
  }
  const page = new URL(window.location.href)
  const visit: VisitAttribution = {
    utmSource: visitSource(page.href, document.referrer),
    utmMedium: clip(page.searchParams.get("utm_medium")),
    utmCampaign: clip(page.searchParams.get("utm_campaign")),
  }
  try {
    sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit))
  } catch {
    /* a blocked store only loses first-touch credit */
  }
  return visit
}
