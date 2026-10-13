import { describe, expect, test } from "bun:test"

import { chooseTransport, sendOtp } from "./otp-transport"

describe("chooseTransport", () => {
  test("selects the logger when it is asked for explicitly", () => {
    expect(chooseTransport("logger", "http://127.0.0.1:3211")).toBe("logger")
  })

  test("refuses WhatsApp before any code is stored when it is not configured", () => {
    const saved = { ...process.env }
    delete process.env.WHATSAPP_ACCESS_TOKEN
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
    try {
      expect(() => chooseTransport("whatsapp")).toThrow(/WHATSAPP_ACCESS_TOKEN/)
    } finally {
      Object.assign(process.env, saved)
    }
  })

  test("selects WhatsApp when its token and number are set", () => {
    process.env.WHATSAPP_ACCESS_TOKEN = "token"
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123"
    try {
      expect(chooseTransport("whatsapp", "https://prod.convex.site")).toBe(
        "whatsapp"
      )
    } finally {
      delete process.env.WHATSAPP_ACCESS_TOKEN
      delete process.env.WHATSAPP_PHONE_NUMBER_ID
    }
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

  test("logger runs on the hosted deployment named as development", () => {
    expect(
      chooseTransport("logger", "https://peaceful-emu-861.convex.site")
    ).toBe("logger")
    expect(() =>
      chooseTransport("logger", "https://brave-otter-123.convex.site")
    ).toThrow(/local HTTP/)
  })

  test("the dev name lives in code, so no env var can open prod", () => {
    // The failure mode this guards: on a production deployment the platform
    // reports production's own origin, and there is no operator-settable
    // second factor left to paste.
    expect(() => chooseTransport("logger", "https://ict.in")).toThrow(
      /local HTTP/
    )
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
  test("sends the copy-code template with the code in body and button", async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = "token"
    process.env.WHATSAPP_PHONE_NUMBER_ID = "555"
    process.env.WHATSAPP_OTP_TEMPLATE = "ict_login_code"
    const calls: [string, RequestInit][] = []
    const fake = (async (url: string, init: RequestInit) => {
      calls.push([url, init])
      return Response.json({ messages: [{ id: "wamid.1" }] })
    }) as unknown as typeof fetch
    try {
      await sendOtp(
        "whatsapp",
        { phoneNumber: "+919876543210", code: "482915" },
        fake
      )
    } finally {
      delete process.env.WHATSAPP_ACCESS_TOKEN
      delete process.env.WHATSAPP_PHONE_NUMBER_ID
      delete process.env.WHATSAPP_OTP_TEMPLATE
    }
    const [url, init] = calls[0]!
    expect(url).toBe("https://graph.facebook.com/v25.0/555/messages")
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer token")
    const body = JSON.parse(String(init.body))
    expect(body.to).toBe("919876543210")
    expect(body.template.name).toBe("ict_login_code")
    expect(body.template.components[0].parameters[0].text).toBe("482915")
    expect(body.template.components[1]).toMatchObject({
      type: "button",
      sub_type: "url",
      index: "0",
    })
    expect(body.template.components[1].parameters[0].text).toBe("482915")
  })

  test("a refused send throws with Meta's error code, never the token or code", async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = "secret-token"
    process.env.WHATSAPP_PHONE_NUMBER_ID = "555"
    const fake = (async () =>
      Response.json(
        {
          error: {
            type: "OAuthException",
            code: 190,
            message: "secret-token is bad",
          },
        },
        { status: 401 }
      )) as unknown as typeof fetch
    try {
      const error = await sendOtp(
        "whatsapp",
        { phoneNumber: "+919876543210", code: "482915" },
        fake
      ).catch((e: Error) => e)
      expect(String(error)).toMatch(/OAuthException 190/)
      expect(String(error)).not.toMatch(/secret-token|482915/)
    } finally {
      delete process.env.WHATSAPP_ACCESS_TOKEN
      delete process.env.WHATSAPP_PHONE_NUMBER_ID
    }
  })

  test("resolves for the logger transport", async () => {
    await expect(
      sendOtp("logger", { phoneNumber: "+919876543210", code: "123456" })
    ).resolves.toBeUndefined()
  })
})
