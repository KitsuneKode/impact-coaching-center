/**
 * Promotion campaigns: what the owner may put on the site and when it shows.
 * Pure functions, shared by the Convex functions and the admin editor, so the
 * form and the server agree on every limit.
 */

export const CAMPAIGN_KINDS = ["bar", "banner", "modal", "reel"] as const
export type CampaignKind = (typeof CAMPAIGN_KINDS)[number]

export const CAMPAIGN_STATUSES = ["draft", "live", "paused"] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const CAMPAIGN_KIND_LABEL: Record<CampaignKind, string> = {
  bar: "Announcement bar",
  banner: "Top banner",
  modal: "Pop-up",
  reel: "Video reel",
}

export const CAMPAIGN_LIMITS = {
  name: 60,
  tag: 24,
  headline: 90,
  body: 280,
  cta: 30,
  href: 300,
  reels: 8,
  routes: 10,
  route: 80,
  delayMax: 600,
  restMax: 90,
  priorityMax: 100,
} as const

/** The words a visitor reads; English always, Assamese when written. */
export type CampaignWords = {
  tag: string
  headline: string
  body: string
  cta: string
}

export type CampaignInput = {
  name: string
  /** Assamese wording for /as pages; English shows where it is absent. */
  as?: CampaignWords
  kind: CampaignKind
  tag: string
  headline: string
  body: string
  cta: string
  href: string
  coupon: string
  reelIds: string[]
  routes: string[]
  startsAt?: number
  endsAt?: number
  delaySeconds: number
  restDays: number
  priority: number
}

export type Checked =
  | { ok: true; value: CampaignInput }
  | { ok: false; field: string }

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const COUPON = /^[A-Z0-9-]{3,24}$/

/** A link that stays on the site or goes to https. Never `javascript:`. */
export function isSafeHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//")
  try {
    return new URL(href).protocol === "https:"
  } catch {
    return false
  }
}

const int = (n: number, min: number, max: number) =>
  Number.isInteger(n) && n >= min && n <= max

/** Trim, bound and validate a campaign. The first field at fault is named. */
export function checkCampaign(input: CampaignInput): Checked {
  const L = CAMPAIGN_LIMITS
  const name = input.name.trim()
  const tag = input.tag.trim()
  const headline = input.headline.trim()
  const body = input.body.trim()
  const cta = input.cta.trim()
  const href = input.href.trim()
  const coupon = input.coupon.trim().toUpperCase()
  const reelIds = input.reelIds.map((id) => id.trim())
  const routes = input.routes.map((r) => r.trim()).filter(Boolean)

  if (!CAMPAIGN_KINDS.includes(input.kind)) return { ok: false, field: "type" }
  if (name.length < 1 || name.length > L.name)
    return { ok: false, field: "name" }
  if (tag.length > L.tag) return { ok: false, field: "label" }
  if (headline.length < 1 || headline.length > L.headline)
    return { ok: false, field: "headline" }
  const needsBody = input.kind === "banner" || input.kind === "modal"
  if (body.length > L.body || (needsBody && body.length < 1))
    return { ok: false, field: "message" }
  if (cta.length > L.cta || cta.length < 1)
    return { ok: false, field: "button" }
  if (cta && (href.length > L.href || !isSafeHref(href)))
    return { ok: false, field: "link" }
  if (coupon && !COUPON.test(coupon)) return { ok: false, field: "code" }

  // Assamese wording is optional, but once begun it needs a headline, and
  // a button label when the English has one, within the same limits.
  let as: CampaignWords | undefined
  if (input.as) {
    const w = {
      tag: input.as.tag.trim(),
      headline: input.as.headline.trim(),
      body: input.as.body.trim(),
      cta: input.as.cta.trim(),
    }
    if (w.tag || w.headline || w.body || w.cta) {
      if (w.tag.length > L.tag) return { ok: false, field: "Assamese label" }
      if (w.headline.length < 1 || w.headline.length > L.headline)
        return { ok: false, field: "Assamese headline" }
      if (w.body.length > L.body)
        return { ok: false, field: "Assamese message" }
      if (w.cta.length > L.cta || (cta && w.cta.length < 1))
        return { ok: false, field: "Assamese button" }
      as = w
    }
  }

  if (input.kind === "reel") {
    if (reelIds.length < 1 || reelIds.length > L.reels)
      return { ok: false, field: "videos" }
    if (
      !reelIds.every((id) => YOUTUBE_ID.test(id)) ||
      new Set(reelIds).size !== reelIds.length
    )
      return { ok: false, field: "videos" }
  } else if (reelIds.length > 0) {
    return { ok: false, field: "videos" }
  }

  if (
    routes.length > L.routes ||
    !routes.every((r) => r.startsWith("/") && r.length <= L.route)
  )
    return { ok: false, field: "pages" }

  const { startsAt, endsAt } = input
  if (startsAt !== undefined && !Number.isFinite(startsAt))
    return { ok: false, field: "start" }
  if (endsAt !== undefined && !Number.isFinite(endsAt))
    return { ok: false, field: "end" }
  if (startsAt !== undefined && endsAt !== undefined && endsAt <= startsAt)
    return { ok: false, field: "end" }

  if (!int(input.delaySeconds, 0, L.delayMax))
    return { ok: false, field: "delay" }
  if (!int(input.restDays, 0, L.restMax))
    return { ok: false, field: "rest days" }
  if (!int(input.priority, 0, L.priorityMax))
    return { ok: false, field: "priority" }

  return {
    ok: true,
    value: {
      name,
      as,
      kind: input.kind,
      tag,
      headline,
      body,
      cta,
      href: cta ? href : "",
      coupon,
      reelIds: input.kind === "reel" ? reelIds : [],
      routes,
      startsAt,
      endsAt,
      delaySeconds: input.delaySeconds,
      restDays: input.restDays,
      priority: input.priority,
    },
  }
}

/** Live means switched on and inside its dates. */
export function isLiveNow(
  c: { status: CampaignStatus; startsAt?: number; endsAt?: number },
  now: number
): boolean {
  if (c.status !== "live") return false
  if (c.startsAt !== undefined && now < c.startsAt) return false
  if (c.endsAt !== undefined && now >= c.endsAt) return false
  return true
}

/** What the admin badge says: the switch and the dates, read together. */
export function campaignPhase(
  c: { status: CampaignStatus; startsAt?: number; endsAt?: number },
  now: number
): "draft" | "paused" | "scheduled" | "live" | "ended" {
  if (c.status === "draft") return "draft"
  if (c.status === "paused") return "paused"
  if (c.startsAt !== undefined && now < c.startsAt) return "scheduled"
  if (c.endsAt !== undefined && now >= c.endsAt) return "ended"
  return "live"
}

/** No pages listed means everywhere; "/" means the home page alone. */
export function matchesPath(routes: readonly string[], path: string): boolean {
  if (routes.length === 0) return true
  return routes.some((r) =>
    r === "/"
      ? path === "/"
      : path === r || path.startsWith(r.endsWith("/") ? r : `${r}/`)
  )
}

/** A YouTube id from a bare id, a watch link, a youtu.be link or a Shorts link. */
export function youtubeId(text: string): string | null {
  const t = text.trim()
  if (YOUTUBE_ID.test(t)) return t
  try {
    const url = new URL(t)
    const host = url.hostname.replace(/^www\.|^m\./, "")
    const candidate =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : host === "youtube.com" || host === "youtube-nocookie.com"
          ? (url.searchParams.get("v") ??
            url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] ??
            "")
          : ""
    return YOUTUBE_ID.test(candidate) ? candidate : null
  } catch {
    return null
  }
}

/** One video per line; lines that are not YouTube links are returned so the form can name them. */
export function parseVideos(text: string): { ids: string[]; bad: string[] } {
  const ids: string[] = []
  const bad: string[] = []
  for (const line of text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)) {
    const id = youtubeId(line)
    if (!id) bad.push(line)
    else if (!ids.includes(id)) ids.push(id)
  }
  return { ids, bad }
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** A `datetime-local` value read as India time. Blank is "no date"; junk is NaN so the check names it. */
export function istInputToMs(value: string): number | undefined {
  const v = value.trim()
  if (!v) return undefined
  return new Date(`${v}:00+05:30`).getTime()
}

/** Milliseconds as a `datetime-local` value in India time, for editing. */
export function msToIstInput(ms: number | undefined): string {
  if (ms === undefined) return ""
  return new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 16)
}

/** Whether a promotion that was closed at `closedAt` may show again. Never closed means yes. */
export function isRested(
  closedAt: number | null,
  restDays: number,
  now: number
): boolean {
  if (closedAt === null) return true
  return now - closedAt >= restDays * 86_400_000
}

/** A promotion's words in the reader's language, English where none. */
export function wordsIn<T extends CampaignWords & { as?: CampaignWords }>(
  promo: T,
  locale: string
): T {
  if (locale !== "as" || !promo.as) return promo
  const { as } = promo
  return {
    ...promo,
    tag: as.tag || promo.tag,
    headline: as.headline,
    body: as.body || promo.body,
    cta: as.cta || promo.cta,
  }
}
