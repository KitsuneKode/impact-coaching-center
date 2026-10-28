import { afterEach, describe, expect, mock, test } from "bun:test"

// submitLead reads the forwarded address, which only exists inside a request
// scope. Supplying one here keeps that read real in production rather than
// wrapping it in a swallow-everything guard for the tests' benefit.
let forwardedFor: string | null = "203.0.113.4"
mock.module("next/headers", () => ({
  headers: async () =>
    new Headers(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
}))

import { enquiryTracks, enquiryTimings, HONEYPOT_FIELD } from "../../lib/leads"
import { submitLead } from "./lead"

const original = { ...process.env }
const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch")!
afterEach(() => {
  Object.defineProperty(globalThis, "fetch", fetchDescriptor)
  for (const key of ["LEAD_INGEST_SECRET", "NEXT_PUBLIC_CONVEX_SITE_URL"]) {
    if (original[key] === undefined) delete process.env[key]
    else process.env[key] = original[key]
  }
})

function form() {
  const data = new FormData()
  for (const [key, value] of Object.entries({
    name: "Rituparna",
    phone: "98123 45670",
    track: enquiryTracks[0]!,
    timing: enquiryTimings[0]!,
  }))
    data.set(key, value)
  return data
}

describe("enquiry action delivery", () => {
  test("missing configuration offers handoff without claiming receipt", async () => {
    const mocked = mock((..._args: Parameters<typeof fetch>) =>
      Promise.resolve(new Response(null, { status: 204 }))
    )
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: mocked,
    })
    try {
      const cases: Array<Record<string, string | undefined>> = [
        {},
        { LEAD_INGEST_SECRET: "test-only-ingestion-secret" },
        { NEXT_PUBLIC_CONVEX_SITE_URL: "https://example.convex.site" },
      ]
      for (const env of cases) {
        delete process.env.LEAD_INGEST_SECRET
        delete process.env.NEXT_PUBLIC_CONVEX_SITE_URL
        for (const [key, value] of Object.entries(env)) {
          if (value) process.env[key] = value
        }
        const state = await submitLead({ status: "idle" }, form())
        expect(state.status).toBe("handoff")
        if (state.status === "handoff")
          expect(state.phone).toBe("+919812345670")
      }
      expect(mocked).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor)
    }
  })
  test("only acknowledged delivery succeeds; failures preserve the handoff", async () => {
    process.env.LEAD_INGEST_SECRET = "test-only-ingestion-secret"
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site"
    const mocked = mock((..._args: Parameters<typeof fetch>) =>
      Promise.resolve(new Response(null, { status: 204 }))
    )
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: mocked,
    })
    try {
      mocked.mockResolvedValueOnce(new Response(null, { status: 204 }))
      expect((await submitLead({ status: "idle" }, form())).status).toBe("ok")
      expect(mocked.mock.calls[0]![0]).toBe(
        "https://example.convex.site/enquiries"
      )
      for (const status of [401, 500]) {
        mocked.mockResolvedValueOnce(new Response(null, { status }))
        expect((await submitLead({ status: "idle" }, form())).status).toBe(
          "handoff"
        )
      }
      // A ceiling needs distinct retry guidance. It does not prove receipt:
      // shared-IP limits can reject a first-time visitor before persistence.
      mocked.mockResolvedValueOnce(new Response(null, { status: 429 }))
      expect((await submitLead({ status: "idle" }, form())).status).toBe(
        "throttled"
      )
      mocked.mockRejectedValueOnce(new DOMException("timeout", "TimeoutError"))
      expect((await submitLead({ status: "idle" }, form())).status).toBe(
        "handoff"
      )
      expect(mocked).toHaveBeenCalledTimes(5)
    } finally {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor)
    }
  })
  test("invalid fields and honeypots never send", async () => {
    // Configured delivery, so the honeypot is compared against the reply a
    // real visitor gets on the healthy path. The control is indistinguishable
    // there; if delivery is itself broken every submission returns "handoff"
    // anyway, which is a louder problem than a detectable honeypot.
    process.env.LEAD_INGEST_SECRET = "test-only-ingestion-secret"
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site"
    const mocked = mock((..._args: Parameters<typeof fetch>) =>
      Promise.resolve(new Response(null, { status: 204 }))
    )
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: mocked,
    })
    try {
      // A File stringifies to "[object File]", thirteen characters, which
      // would otherwise pass the name length check and be stored as a name.
      const uploaded = form()
      uploaded.set("name", new File(["x"], "x.txt"))
      const fileResult = await submitLead({ status: "idle" }, uploaded)
      expect(fileResult.status).toBe("error")
      if (fileResult.status === "error")
        expect(fileResult.errors.name).toBeDefined()

      const invalid = form()
      invalid.set("phone", "invalid")
      expect((await submitLead({ status: "idle" }, invalid)).status).toBe(
        "error"
      )
      // A tripped honeypot must be indistinguishable from a real success,
      // or a bot can find the control by submitting twice and diffing.
      const trapped = form()
      trapped.set(HONEYPOT_FIELD, "autofill")
      const real = form()
      expect(await submitLead({ status: "idle" }, trapped)).toEqual(
        await submitLead({ status: "idle" }, real)
      )
      expect(mocked).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor)
    }
  })
})
