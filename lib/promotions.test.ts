import { describe, expect, test } from "bun:test"

import {
  deliveryState,
  dismissalKey,
  parsePromotionContent,
  selectPromotions,
  type Promotion,
  type PromotionContent,
} from "./promotions"

const content: PromotionContent = {
  title: "Workshop",
  message: "Explore our free workshop.",
  placement: "announcement",
  targetRoutes: ["/", "/courses/lakhya-2027"],
  cta: { kind: "whatsapp", label: "View workshop", target: "workshop" },
  startsAt: 1000,
  endsAt: 2000,
  priority: 10,
  dismissDays: 7,
}
const promotion: Promotion = {
  ...content,
  id: "promo-a",
  state: "published",
  revision: 1,
  dismissalVersion: 1,
}

describe("promotion validation", () => {
  test("rejects sparse route arrays rather than producing undefined targets", () => {
    const routes: string[] = []
    routes.length = 1
    expect(parsePromotionContent({ ...content, targetRoutes: routes }).ok).toBe(
      false
    )
  })
  test("normalises text and constructs only approved fields", () => {
    const parsed = parsePromotionContent({
      ...content,
      title: " Workshop ",
      owner: "extra",
    })
    expect(parsed).toEqual({ ok: true, value: content })
  })

  test.each(
    [null, [], "text", {}, { ...content, cta: null }].map((input) => ({
      input,
    }))
  )("rejects malformed content %p", ({ input }) => {
    expect(parsePromotionContent(input).ok).toBe(false)
  })

  test.each([
    "/admin",
    "/sign-in",
    "/api/auth",
    "/courses/missing",
    "/courses?email=x",
    "//example.com",
    "/courses/../admin",
  ])("rejects nonpublic route %s", (route) => {
    expect(
      parsePromotionContent({ ...content, targetRoutes: [route] }).ok
    ).toBe(false)
    expect(
      parsePromotionContent({
        ...content,
        cta: { kind: "internal", target: route, label: "Open" },
      }).ok
    ).toBe(false)
  })

  test("accepts known internal course destinations", () => {
    expect(
      parsePromotionContent({
        ...content,
        cta: {
          kind: "internal",
          target: "/courses/lakhya-2027",
          label: "Read",
        },
      }).ok
    ).toBe(true)
  })

  test.each(["call", "https://wa.me/123", "javascript:alert(1)"])(
    "rejects freeform WhatsApp target %s",
    (target) => {
      expect(
        parsePromotionContent({ ...content, cta: { ...content.cta, target } })
          .ok
      ).toBe(false)
    }
  )

  test.each([
    { title: "x".repeat(81) },
    { message: "x".repeat(321) },
    { title: " " },
    { title: "<b>Workshop</b>" },
    { message: "<script>unsafe</script>" },
    { cta: { ...content.cta, label: "x".repeat(41) } },
    { targetRoutes: [] },
    { targetRoutes: Array(13).fill("/") },
    { priority: 101 },
    { priority: -1 },
    { priority: 0.5 },
    { dismissDays: 0 },
    { dismissDays: 31 },
    { dismissDays: 1.5 },
    { startsAt: -1 },
    { startsAt: Number.NaN },
    { endsAt: Infinity },
    { endsAt: 1000 },
    { endsAt: 999 },
    { endsAt: 1000 + 366 * 86400000 },
    { placement: "popup" },
  ])("rejects invalid field bounds %p", (patch) => {
    expect(parsePromotionContent({ ...content, ...patch }).ok).toBe(false)
  })

  test("accepts inclusive field limits and deduplicates valid routes", () => {
    const parsed = parsePromotionContent({
      ...content,
      title: "x".repeat(80),
      message: "x".repeat(320),
      priority: 100,
      dismissDays: 30,
      endsAt: 1000 + 365 * 86400000,
      targetRoutes: ["/", "/"],
    })
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(parsed.value.targetRoutes).toEqual(["/"])
  })
})

describe("delivery and selection", () => {
  test("uses an inclusive start and exclusive end", () => {
    expect(deliveryState(promotion, 999)).toBe("scheduled")
    expect(deliveryState(promotion, 1000)).toBe("live")
    expect(deliveryState(promotion, 1999)).toBe("live")
    expect(deliveryState(promotion, 2000)).toBe("expired")
  })
  test.each(["draft", "paused", "archived"] as const)(
    "never delivers %s",
    (state) => {
      expect(deliveryState({ ...promotion, state }, 1500)).toBe(state)
      expect(selectPromotions([{ ...promotion, state }], "/", 1500)).toEqual({})
    }
  )
  test("chooses priority then stable ID independently of input order", () => {
    const low = { ...promotion, id: "promo-low", priority: 1 }
    const tie = { ...promotion, id: "promo-z" }
    const inline = {
      ...promotion,
      id: "promo-inline",
      placement: "inline" as const,
    }
    const input = [tie, inline, low, promotion]
    expect(selectPromotions(input, "/", 1500)).toEqual({
      announcement: promotion,
      inline,
    })
    expect(selectPromotions([...input].reverse(), "/", 1500)).toEqual({
      announcement: promotion,
      inline,
    })
    expect(input[0]).toBe(tie)
  })
  test("requires exact route and active schedule", () => {
    expect(selectPromotions([promotion], "/courses", 1500)).toEqual({})
    expect(selectPromotions([promotion], "/", 2000)).toEqual({})
    expect(selectPromotions([promotion], "/", 999)).toEqual({})
  })
  test("dismissal survives ordinary edits and changes only with dismissal version", () => {
    expect(dismissalKey({ ...promotion, revision: 2 })).toBe(
      dismissalKey(promotion)
    )
    expect(dismissalKey({ ...promotion, dismissalVersion: 2 })).not.toBe(
      dismissalKey(promotion)
    )
    expect(dismissalKey({ ...promotion, id: "promo-other" })).not.toBe(
      dismissalKey(promotion)
    )
  })
})
