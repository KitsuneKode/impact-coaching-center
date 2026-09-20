import { describe, expect, test } from "bun:test"

import { chooseTransport, sendOtp } from "./otp-transport"

describe("chooseTransport", () => {
  test("selects the logger when it is asked for explicitly", () => {
    expect(chooseTransport("logger", "http://127.0.0.1:3211")).toBe("logger")
  })

  test("rejects unavailable WhatsApp before any code is stored", () => {
    expect(() => chooseTransport("whatsapp")).toThrow(/not implemented/)
  })

  test("logger fails closed outside local Convex", () => {
    for (const origin of [
      undefined,
      "",
      "garbage",
      "https://example.convex.site",
      "http://localhost.evil.test",
      "http://localhost@evil.test",
      "https://localhost",
    ]) {
      expect(() => chooseTransport("logger", origin)).toThrow(/local HTTP/)
    }
    expect(chooseTransport("logger", "http://[::1]:3211")).toBe("logger")
  })

  test("fails closed when no transport is configured", () => {
    expect(() => chooseTransport(undefined)).toThrow(/OTP_TRANSPORT/)
  })

  test("fails closed on an unrecognised transport rather than guessing", () => {
    expect(() => chooseTransport("sms")).toThrow(/OTP_TRANSPORT/)
  })

  test("does not treat an empty value as a choice", () => {
    expect(() => chooseTransport("")).toThrow(/OTP_TRANSPORT/)
  })
})

describe("sendOtp", () => {
  test("refuses the unimplemented WhatsApp transport rather than pretending", async () => {
    await expect(
      sendOtp("whatsapp", { phoneNumber: "+919876543210", code: "123456" })
    ).rejects.toThrow(/not implemented/i)
  })

  test("resolves for the logger transport", async () => {
    await expect(
      sendOtp("logger", { phoneNumber: "+919876543210", code: "123456" })
    ).resolves.toBeUndefined()
  })
})
