import { describe, expect, test } from "bun:test"

import {
  createAnalytics,
  parseAnalyticsEvent,
  type AnalyticsEvent,
} from "./analytics"

const promotionEvent = {
  name: "promotion_viewed",
  properties: {
    promotion_id: "promo-a",
    revision: 1,
    placement: "announcement",
    route: "/",
  },
} as const

describe("safe analytics properties", () => {
  test("projects only approved properties, including nested data", () => {
    expect(
      parseAnalyticsEvent({
        ...promotionEvent,
        phone: "private",
        properties: {
          ...promotionEvent.properties,
          email: "private",
          href: "https://wa.me/123?text=private",
          intent: { name: "private" },
        },
      })
    ).toEqual(promotionEvent)
  })
  test.each(["promotion_viewed", "promotion_clicked", "promotion_dismissed"])(
    "accepts %s",
    (name) => {
      expect(parseAnalyticsEvent({ ...promotionEvent, name })?.name).toBe(name)
    }
  )
  test.each([
    { promotion_id: "+919876543210" },
    { promotion_id: "9876543210" },
    { promotion_id: "name@example.com" },
    { promotion_id: "https://example.com" },
    { promotion_id: "x".repeat(65) },
    { promotion_id: "" },
    { revision: 0 },
    { revision: 1.5 },
    { revision: Infinity },
    { placement: "popup" },
    { route: "/admin" },
    { route: "/?phone=private" },
  ])("rejects malformed safe properties %p", (patch) => {
    expect(
      parseAnalyticsEvent({
        ...promotionEvent,
        properties: { ...promotionEvent.properties, ...patch },
      })
    ).toBeNull()
  })
  test("rejects arbitrary event names and malformed envelopes", () => {
    for (const input of [
      null,
      [],
      {},
      { name: "message", properties: { text: "private" } },
      { name: "promotion_clicked", properties: null },
    ])
      expect(parseAnalyticsEvent(input)).toBeNull()
  })
  test("requires promotion attribution when the lead source is promotion", () => {
    expect(
      parseAnalyticsEvent({
        name: "lead_submitted",
        properties: { source: "promotion" },
      })
    ).toBeNull()
    expect(
      parseAnalyticsEvent({
        name: "lead_submitted",
        properties: {
          source: "promotion",
          promotion_id: "promo-a",
          phone: "private",
        },
      })
    ).toEqual({
      name: "lead_submitted",
      properties: { source: "promotion", promotion_id: "promo-a" },
    })
    expect(
      parseAnalyticsEvent({
        name: "lead_submitted",
        properties: { source: "website" },
      })
    ).toEqual({ name: "lead_submitted", properties: { source: "website" } })
  })
  test("allows handoff intent kind without copying the contact intent", () => {
    expect(
      parseAnalyticsEvent({
        name: "whatsapp_handoff",
        properties: {
          intent: "whatsapp-handoff",
          name: "private",
          phone: "private",
          timing: "private",
        },
      })
    ).toEqual({
      name: "whatsapp_handoff",
      properties: { intent: "whatsapp-handoff" },
    })
    expect(
      parseAnalyticsEvent({
        name: "whatsapp_handoff",
        properties: { intent: { kind: "workshop" } },
      })
    ).toBeNull()
  })
})

describe("opt-in transport", () => {
  test("never sends until opted in, and stops immediately after opt-out", async () => {
    const delivered: AnalyticsEvent[] = []
    let optedIn = false
    const analytics = createAnalytics({
      isOptedIn: () => optedIn,
      transport: (event) => {
        delivered.push(event)
      },
    })
    expect(await analytics.capture(promotionEvent)).toBe(false)
    expect(delivered).toEqual([])
    optedIn = true
    expect(
      await analytics.capture({
        ...promotionEvent,
        properties: { ...promotionEvent.properties, name: "private" },
      })
    ).toBe(true)
    expect(delivered).toEqual([promotionEvent])
    optedIn = false
    expect(await analytics.capture(promotionEvent)).toBe(false)
    expect(delivered).toHaveLength(1)
  })
  test("an absent transport is inert", async () => {
    expect(
      await createAnalytics({ isOptedIn: () => true }).capture(promotionEvent)
    ).toBe(false)
  })
  test("invalid input never reaches transport", async () => {
    const delivered: AnalyticsEvent[] = []
    const analytics = createAnalytics({
      isOptedIn: () => true,
      transport: (event) => {
        delivered.push(event)
      },
    })
    expect(await analytics.capture({ name: "unknown" })).toBe(false)
    expect(delivered).toEqual([])
  })
  test("sync and async transport failures cannot break the visitor flow", async () => {
    expect(
      await createAnalytics({
        isOptedIn: () => true,
        transport: () => {
          throw new Error("offline")
        },
      }).capture(promotionEvent)
    ).toBe(false)
    expect(
      await createAnalytics({
        isOptedIn: () => true,
        transport: async () => {
          throw new Error("offline")
        },
      }).capture(promotionEvent)
    ).toBe(false)
    expect(
      await createAnalytics({
        isOptedIn: () => {
          throw new Error("unavailable")
        },
        transport: () => {},
      }).capture(promotionEvent)
    ).toBe(false)
  })
})
