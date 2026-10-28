import { describe, expect, test } from "bun:test"

import { createPhoneAuthFlow } from "./phone-auth-flow"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

const success = { error: null }

describe("phone verification flow", () => {
  test("a late send cannot move an edited number into the code step", async () => {
    const response = deferred<typeof success>()
    const flow = createPhoneAuthFlow({
      send: () => response.promise,
      verify: async () => success,
    })
    flow.setPhone("9876543210")
    const sending = flow.send()
    flow.setPhone("9812345678")
    response.resolve(success)
    await sending
    expect(flow.getSnapshot()).toMatchObject({
      phone: "9812345678",
      step: "phone",
      pending: null,
      sentTo: null,
    })
  })

  test("a stale failure cannot replace the current phone's success", async () => {
    const first = deferred<{ error: { code: string } }>()
    let calls = 0
    const flow = createPhoneAuthFlow({
      send: () => (++calls === 1 ? first.promise : Promise.resolve(success)),
      verify: async () => success,
    })
    flow.setPhone("9876543210")
    const old = flow.send()
    flow.setPhone("9812345678")
    await flow.send()
    first.resolve({ error: { code: "INVALID_PHONE_NUMBER" } })
    await old
    expect(flow.getSnapshot()).toMatchObject({
      step: "code",
      sentTo: "+919812345678",
      error: null,
    })
  })

  test("duplicate submissions send once and verification uses the acknowledged normalized phone", async () => {
    const response = deferred<typeof success>()
    const sends: string[] = []
    const checks: Array<{ phoneNumber: string; code: string }> = []
    let navigations = 0
    const flow = createPhoneAuthFlow({
      send: (phone) => {
        sends.push(phone)
        return response.promise
      },
      verify: async (input) => {
        checks.push(input)
        return success
      },
    })
    flow.setPhone("98765 43210")
    const sending = flow.send()
    await flow.send()
    expect(sends).toEqual(["+919876543210"])
    response.resolve(success)
    await sending
    flow.setCode("123456")
    const verifying = flow.verify(() => {
      navigations++
    })
    await flow.verify(() => {
      navigations++
    })
    await verifying
    expect(checks).toEqual([{ phoneNumber: "+919876543210", code: "123456" }])
    expect(navigations).toBe(1)
  })

  test("network rejection clears pending while preserving input for retry", async () => {
    let fail = true
    const flow = createPhoneAuthFlow({
      send: async () => {
        if (fail) throw new Error("private transport detail")
        return success
      },
      verify: async () => {
        throw new Error("private transport detail")
      },
    })
    flow.setPhone("9876543210")
    await flow.send()
    expect(flow.getSnapshot()).toMatchObject({
      phone: "9876543210",
      pending: null,
      step: "phone",
    })
    expect(flow.getSnapshot().error).not.toContain("private")
    fail = false
    await flow.send()
    flow.setCode("123456")
    await flow.verify(() => {
      throw new Error("must not navigate")
    })
    expect(flow.getSnapshot()).toMatchObject({
      code: "123456",
      pending: null,
      step: "code",
    })
    expect(flow.getSnapshot().error).not.toContain("private")
  })

  test("unmount cancellation prevents a late verification from navigating", async () => {
    const response = deferred<typeof success>()
    let navigations = 0
    const flow = createPhoneAuthFlow({
      send: async () => success,
      verify: () => response.promise,
    })
    flow.setPhone("9876543210")
    await flow.send()
    flow.setCode("123456")
    const verifying = flow.verify(() => {
      navigations++
    })
    flow.cancelPending()
    response.resolve(success)
    await verifying
    expect(navigations).toBe(0)
  })
  test("number correction is blocked during verification and available after a refusal", async () => {
    const response = deferred<{ error: { code: string } }>()
    const flow = createPhoneAuthFlow({
      send: async () => success,
      verify: () => response.promise,
    })
    flow.setPhone("9876543210")
    await flow.send()
    flow.setCode("123456")
    const verifying = flow.verify(() => {
      throw new Error("must not navigate")
    })
    flow.changeNumber()
    flow.setPhone("9812345678")
    expect(flow.getSnapshot()).toMatchObject({
      step: "code",
      phone: "9876543210",
    })
    response.resolve({ error: { code: "INVALID_OTP" } })
    await verifying
    expect(flow.getSnapshot()).toMatchObject({ code: "", pending: null })
    flow.changeNumber()
    expect(flow.getSnapshot()).toMatchObject({
      step: "phone",
      code: "",
      sentTo: null,
      error: null,
    })
  })

  test("a resend cooldown and an invalid code do not call the transport", async () => {
    let sends = 0
    let verifies = 0
    const flow = createPhoneAuthFlow({
      send: async () => {
        sends++
        return success
      },
      verify: async () => {
        verifies++
        return success
      },
    })
    flow.setPhone("9876543210")
    await flow.send()
    await flow.send()
    flow.setCode("123")
    await flow.verify(() => {
      throw new Error("must not navigate")
    })
    expect(sends).toBe(1)
    expect(verifies).toBe(0)
    expect(flow.getSnapshot().error).toBe(
      "Enter the 6-digit code from WhatsApp."
    )
  })
})

describe("errorMessage", () => {
  test("a refused code clears, so the right one is typed fresh", async () => {
    const flow = createPhoneAuthFlow({
      send: async () => success,
      verify: async () => ({ error: { code: "INVALID_OTP" } }),
    })
    flow.setPhone("9876543210")
    await flow.send()
    flow.setCode("000000")
    await flow.verify(() => {
      throw new Error("must not navigate")
    })
    expect(flow.getSnapshot()).toMatchObject({ code: "", step: "code" })
    expect(flow.getSnapshot().error).not.toBeNull()
  })

  test("never shows a library's own wording", async () => {
    const { errorMessage } = await import("./phone-auth-flow")
    const { GENERIC_AUTH_FAILURE, SEND_REFUSALS } =
      await import("./auth-messages")
    expect(errorMessage({ message: "Invalid origin" })).toBe(
      GENERIC_AUTH_FAILURE
    )
    expect(errorMessage({ code: "INVALID_OTP" })).toMatch(/isn.t right/)
    expect(errorMessage({ message: SEND_REFUSALS.phone })).toBe(
      SEND_REFUSALS.phone
    )
  })
})
