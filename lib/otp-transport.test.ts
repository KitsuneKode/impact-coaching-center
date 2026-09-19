import { describe, expect, test } from "bun:test"

import { chooseTransport } from "./otp-transport"

describe("chooseTransport", () => {
  test("selects the logger when it is asked for explicitly", () => {
    expect(chooseTransport("logger")).toBe("logger")
  })

  test("selects WhatsApp when it is asked for explicitly", () => {
    expect(chooseTransport("whatsapp")).toBe("whatsapp")
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
