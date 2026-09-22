import { catalogue } from "./catalogue"

export const ROUTE_TARGETS: readonly string[] = [
  "/",
  "/courses",
  "/success-stories",
  "/library",
  "/contact",
  ...catalogue.map((course) => `/courses/${course.slug}`),
]

export type PromotionContent = {
  title: string
  message: string
  placement: "announcement" | "inline" | "dialog"
  targetRoutes: string[]
  cta: { kind: "internal" | "whatsapp"; label: string; target: string }
  startsAt: number
  endsAt: number
  priority: number
  dismissDays: number
}

export type PromotionState = "draft" | "published" | "paused" | "archived"
export type Promotion = PromotionContent & {
  id: string
  state: PromotionState
  revision: number
  dismissalVersion: number
}
export type PromotionDeliveryState =
  | Exclude<PromotionState, "published">
  | "scheduled"
  | "live"
  | "expired"

type ParseResult =
  | { ok: true; value: PromotionContent }
  | { ok: false; errors: Record<string, string> }

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Plain text only. Render with normal React text nodes, never an HTML sink. */
function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= max && !/[<>]/.test(trimmed)
    ? trimmed
    : null
}

function integer(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  )
}

function timestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

function routeList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 12 &&
    Array.from(value).every(
      (route: unknown) =>
        typeof route === "string" && ROUTE_TARGETS.includes(route)
    )
  )
}

export function parsePromotionContent(input: unknown): ParseResult {
  if (!record(input))
    return { ok: false, errors: { form: "Enter promotion content." } }
  const errors: Record<string, string> = {}
  const title = text(input.title, 80)
  const message = text(input.message, 320)
  const placement = input.placement
  if (!title) errors.title = "Use 1–80 characters of plain text."
  if (!message) errors.message = "Use 1–320 characters of plain text."
  const validPlacement =
    placement === "announcement" ||
    placement === "inline" ||
    placement === "dialog"
  if (!validPlacement) errors.placement = "Choose an available placement."

  const routes = input.targetRoutes
  const validRoutes = routeList(routes)
  if (!validRoutes)
    errors.targetRoutes = "Choose between 1 and 12 public routes."

  const cta = record(input.cta) ? input.cta : {}
  const label = text(cta.label, 40)
  const kind = cta.kind
  const target = cta.target
  if (!label) errors["cta.label"] = "Use 1–40 characters of plain text."
  const validTarget =
    typeof target === "string" &&
    ((kind === "internal" && ROUTE_TARGETS.includes(target)) ||
      (kind === "whatsapp" && target === "workshop"))
  if (!validTarget)
    errors["cta.target"] =
      "Choose a public page or the workshop WhatsApp intent."

  const startsAt = input.startsAt
  const endsAt = input.endsAt
  if (!timestamp(startsAt)) errors.startsAt = "Choose a valid start date."
  if (!timestamp(endsAt)) errors.endsAt = "Choose a valid end date."
  if (
    timestamp(startsAt) &&
    timestamp(endsAt) &&
    (endsAt <= startsAt || endsAt - startsAt > 365 * 86400000)
  )
    errors.endsAt = "End after the start and within 365 days."
  const priority = input.priority
  const dismissDays = input.dismissDays
  if (!integer(priority, 0, 100))
    errors.priority = "Use a whole number from 0 to 100."
  if (!integer(dismissDays, 1, 30))
    errors.dismissDays = "Use a whole number from 1 to 30."

  if (
    Object.keys(errors).length ||
    !title ||
    !message ||
    !validPlacement ||
    !validRoutes ||
    !label ||
    !validTarget ||
    (kind !== "internal" && kind !== "whatsapp") ||
    !timestamp(startsAt) ||
    !timestamp(endsAt) ||
    !integer(priority, 0, 100) ||
    !integer(dismissDays, 1, 30)
  )
    return { ok: false, errors }

  return {
    ok: true,
    value: {
      title,
      message,
      placement,
      targetRoutes: [...new Set(routes)],
      cta: { kind, label, target },
      startsAt,
      endsAt,
      priority,
      dismissDays,
    },
  }
}

/** Delivery uses [start, end); publishing alone never bypasses the schedule. */
export function deliveryState(
  promotion: Promotion,
  now: number
): PromotionDeliveryState {
  if (promotion.state !== "published") return promotion.state
  if (!Number.isFinite(now) || now >= promotion.endsAt) return "expired"
  if (now < promotion.startsAt) return "scheduled"
  return "live"
}

/** Client engagement, dismissal and overlay suppression run after this selector. */
export function selectPromotions(
  promotions: readonly Promotion[],
  pathname: string,
  now: number
): Partial<Record<PromotionContent["placement"], Promotion>> {
  const selected: Partial<Record<PromotionContent["placement"], Promotion>> = {}
  if (!ROUTE_TARGETS.includes(pathname)) return selected
  for (const promotion of promotions) {
    if (
      deliveryState(promotion, now) !== "live" ||
      !promotion.targetRoutes.includes(pathname)
    )
      continue
    const current = selected[promotion.placement]
    if (
      !current ||
      promotion.priority > current.priority ||
      (promotion.priority === current.priority && promotion.id < current.id)
    )
      selected[promotion.placement] = promotion
  }
  return selected
}

/** Ordinary copy edits must not reset a visitor's dismissal. */
export function dismissalKey(promotion: Promotion): string {
  return `ict:promotion:${encodeURIComponent(promotion.id)}:${promotion.dismissalVersion}`
}
