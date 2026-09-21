import { describe, expect, test } from "bun:test"
import { betterAuth } from "better-auth/minimal"
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory"
import { convexTest } from "convex-test"

import { internal } from "../convex/_generated/api"
import schema from "../convex/schema"
import { phoneAuthOptions } from "./phone-auth"

const TEST_SECRET = "test-only-secret-not-used-outside-this-memory-adapter"

function harness() {
  const db: MemoryDB = { user: [], session: [], account: [], verification: [] }
  const persons = convexTest(schema, {
    "../convex/_generated/server.ts": () =>
      import("../convex/_generated/server"),
    "../convex/persons.ts": () => import("../convex/persons"),
    "../convex/otp.ts": () => import("../convex/otp"),
  })
  let code = ""
  const codes: string[] = []
  let deliveredTo = ""
  let failRecord = false
  let failSend = false
  let holdSend = false
  let releaseHold = () => {}
  const hold = new Promise<void>((resolve) => {
    releaseHold = resolve
  })
  let markSendEntered = () => {}
  const sendEntered = new Promise<void>((resolve) => {
    markSendEntered = resolve
  })
  let sendRefusal: "phone" | "address" | "deployment" | "inflight" | null = null
  let throttled: { phone: string; ip: string | null } | null = null
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: TEST_SECRET,
    database: memoryAdapter(db),
    rateLimit: { enabled: false },
    logger: { disabled: true },
    ...phoneAuthOptions({
      secret: TEST_SECRET,
      claim: async (target) => {
        throttled = target
        if (sendRefusal) return { ok: false, reason: sendRefusal }
        return await persons.mutation(internal.otp.claimOtpSend, {
          phone: target.phone,
          ip: target.ip ?? undefined,
        })
      },
      commit: (attempt) =>
        persons.mutation(internal.otp.commitOtpCode, attempt),
      release: async (attempt) => {
        await persons.mutation(internal.otp.releaseOtpSend, attempt)
      },
      abort: async (attempt) => {
        await persons.mutation(internal.otp.abortOtpCode, attempt)
      },
      verify: (attempt) =>
        persons.mutation(internal.otp.verifyOtpCode, attempt),
      send: async (target) => {
        if (failSend) throw new Error("delivery failed")
        code = target.code
        codes.push(target.code)
        deliveredTo = target.phoneNumber
        markSendEntered()
        if (holdSend) await hold
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
    codes: () => codes,
    failSend: (value = true) => {
      failSend = value
    },
    holdNextSend: () => {
      holdSend = true
    },
    sendEntered: () => sendEntered,
    releaseSend: () => releaseHold(),
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
    await expired.persons.run(async (ctx) => {
      const row = await ctx.db.query("otpSendLeases").unique()
      if (!row) throw new Error("expected a send lease")
      await ctx.db.patch(row._id, { codeExpiresAt: 0 })
    })
    const expiredResponse = await expired.verify()
    expect(expiredResponse.status).toBe(400)
    expect(expired.db.user).toHaveLength(0)
    const exhausted = harness()
    await exhausted.send()
    for (let n = 0; n < 5; n++)
      await exhausted.verify(undefined, { code: "invalid" })
    expect((await exhausted.verify()).status).not.toBe(200)
    expect(exhausted.db.user).toHaveLength(0)
  })
  test("a send already in flight refuses a second and keeps its code", async () => {
    const h = harness()
    h.holdNextSend()
    const first = h.send()
    await h.sendEntered()
    expect((await h.send()).status).toBe(429)
    expect(h.db.verification).toHaveLength(1)
    h.releaseSend()
    expect((await first).status).toBe(200)
    expect(h.codes()).toHaveLength(1)
    expect((await h.verify()).status).toBe(200)
    expect(h.db.session).toHaveLength(1)
  })
  test("a delivery failure does not leave an acceptable code", async () => {
    const h = harness()
    h.failSend()
    expect((await h.send()).status).not.toBe(200)
    expect(h.codes()).toHaveLength(0)
    expect((await h.verify(undefined, { code: "000000" })).status).not.toBe(200)
    h.failSend(false)
    expect((await h.send()).status).toBe(200)
    expect((await h.verify()).status).toBe(200)
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
