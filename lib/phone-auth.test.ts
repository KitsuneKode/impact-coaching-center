import { describe, expect, test } from "bun:test"
import { betterAuth } from "better-auth/minimal"
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory"
import { convexTest } from "convex-test"

import { internal } from "../convex/_generated/api"
import schema from "../convex/schema"
import { phoneAuthOptions } from "./phone-auth"

function harness() {
  const db: MemoryDB = { user: [], session: [], account: [], verification: [] }
  const persons = convexTest(schema, {
    "../convex/_generated/server.ts": () =>
      import("../convex/_generated/server"),
    "../convex/persons.ts": () => import("../convex/persons"),
  })
  let code = ""
  let deliveredTo = ""
  let failRecord = false
  let sendRefusal: "phone" | "address" | "deployment" | null = null
  let throttled: { phone: string; ip: string | null } | null = null
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "test-only-secret-not-used-outside-this-memory-adapter",
    database: memoryAdapter(db),
    rateLimit: { enabled: false },
    logger: { disabled: true },
    ...phoneAuthOptions({
      throttle: async (target) => {
        throttled = target
        return sendRefusal
      },
      send: async (target) => {
        code = target.code
        deliveredTo = target.phoneNumber
      },
      record: async (person) => {
        if (failRecord) throw new Error("test callback failure")
        await persons.mutation(internal.persons.recordVerifiedPerson, person)
      },
    }),
  })
  async function request(path: string, body: Record<string, unknown>) {
    return auth.handler(
      new Request(`http://localhost:3000/api/auth/phone-number/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
    )
  }
  return {
    db,
    persons,
    request,
    sentTo: () => deliveredTo,
    lastCode: () => code,
    refuseSend: (scope: "phone" | "address" | "deployment" | null) => {
      sendRefusal = scope
    },
    lastThrottle: () => throttled,
    failRecord: (value = true) => {
      failRecord = value
    },
    send: (phoneNumber = "+919876543210") =>
      request("send-otp", { phoneNumber }),
    verify: (
      phoneNumber = "+919876543210",
      extra: Record<string, unknown> = {}
    ) => request("verify", { phoneNumber, code, ...extra }),
  }
}

describe("phone authentication through the installed plugin", () => {
  test("all accepted formats share one auth identity and one Person", async () => {
    const h = harness()
    for (const phone of ["98765 43210", "+919876543210", "09876543210"]) {
      expect((await h.send(phone)).status).toBe(200)
      expect(h.sentTo()).toBe("+919876543210")
      expect((await h.verify(phone)).status).toBe(200)
    }
    expect(h.db.user).toHaveLength(1)
    expect(
      await h.persons.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(1)
  })
  test("OTP signup does not manufacture a Person name", async () => {
    const h = harness()
    await h.send()
    expect((await h.verify()).status).toBe(200)
    expect(
      (await h.persons.run((ctx) => ctx.db.query("persons").collect()))[0]!.name
    ).toBe("")
    await h.persons.mutation(internal.persons.recordVerifiedPerson, {
      phone: "+919876543210",
      name: "Rituparna",
    })
    expect(
      (await h.persons.run((ctx) => ctx.db.query("persons").collect()))[0]!.name
    ).toBe("Rituparna")
  })
  test("rejects invalid input before sending or storing any code", async () => {
    const h = harness()
    for (const phone of ["", "+16507001234", "9876543210 ext 123"])
      expect((await h.send(phone)).status).toBe(400)
    expect(h.db.verification).toHaveLength(0)
    expect(h.sentTo()).toBe("")
  })
  test("rejects phone replacement before consuming a valid code", async () => {
    const h = harness()
    await h.send()
    expect(
      (await h.verify(undefined, { updatePhoneNumber: true })).status
    ).toBe(403)
    expect(h.db.user).toHaveLength(0)
    expect((await h.verify()).status).toBe(200)
  })
  test("a used code cannot create a second session", async () => {
    const h = harness()
    await h.send()
    expect((await h.verify()).status).toBe(200)
    expect((await h.verify()).status).not.toBe(200)
    expect(h.db.session).toHaveLength(1)
  })
  test("resend replaces the live code instead of racing it", async () => {
    const h = harness()
    await h.send()
    await h.send()
    // One row, so which code is accepted cannot depend on createdAt ties.
    expect(h.db.verification).toHaveLength(1)
    expect((await h.verify()).status).toBe(200)
  })
  test("a resent code retires the code it replaced", async () => {
    const h = harness()
    await h.send()
    const superseded = h.lastCode()
    await h.send()
    expect((await h.verify(undefined, { code: superseded })).status).not.toBe(
      200
    )
    expect(h.db.session).toHaveLength(0)
  })
  test("expired and exhausted codes cannot create accounts", async () => {
    const expired = harness()
    await expired.send()
    expired.db.verification[0].expiresAt = new Date(0)
    expect((await expired.verify()).status).not.toBe(200)
    expect(expired.db.user).toHaveLength(0)
    const exhausted = harness()
    await exhausted.send()
    for (let n = 0; n < 5; n++)
      await exhausted.verify(undefined, { code: "invalid" })
    expect((await exhausted.verify()).status).not.toBe(200)
    expect(exhausted.db.user).toHaveLength(0)
  })
  test("a refused send returns 429 and leaves the live code intact", async () => {
    const h = harness()
    await h.send()
    const live = h.lastCode()
    h.refuseSend("phone")
    expect((await h.send()).status).toBe(429)
    // The throttle runs before the resend clears the previous row, so a
    // flood of refused sends cannot retire a code a real Person already has.
    expect(h.db.verification).toHaveLength(1)
    h.refuseSend(null)
    expect((await h.verify(undefined, { code: live })).status).toBe(200)
  })
  test("the throttle sees the normalised number, never the raw input", async () => {
    const h = harness()
    await h.send("98765 43210")
    expect(h.lastThrottle()?.phone).toBe("+919876543210")
  })
  test("verify is not throttled by the send ceiling", async () => {
    const h = harness()
    await h.send()
    h.refuseSend("phone")
    expect((await h.verify()).status).toBe(200)
  })
  test("a refused send delivers nothing", async () => {
    const h = harness()
    h.refuseSend("phone")
    expect((await h.send()).status).toBe(429)
    expect(h.sentTo()).toBe("")
    expect(h.db.verification).toHaveLength(0)
  })
  test("Person callback failure never issues a session", async () => {
    const h = harness()
    await h.send()
    h.failRecord()
    expect((await h.verify()).status).toBe(500)
    expect(h.db.session).toHaveLength(0)
    expect(
      await h.persons.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(0)
    h.failRecord(false)
    await h.send()
    expect((await h.verify()).status).toBe(200)
    expect(h.db.user).toHaveLength(1)
    expect(h.db.session).toHaveLength(1)
  })
})
