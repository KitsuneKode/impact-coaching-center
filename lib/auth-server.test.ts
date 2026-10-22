import { describe, expect, test } from "bun:test"

import { HUMAN_CHECK } from "./auth-messages"
import { humanCheckRefusal } from "./auth-server"
import { HUMAN_CHECK_HEADER } from "./turnstile"

const SEND = "http://localhost:3000/api/auth/phone-number/send-otp"
const request = (url: string, token?: string) =>
  new Request(url, {
    method: "POST",
    headers: {
      "x-real-ip": "198.51.100.9",
      ...(token ? { [HUMAN_CHECK_HEADER]: token } : {}),
    },
  })

describe("the Turnstile check on code requests", () => {
  test("a code request without a passing token is refused with our sentence", async () => {
    const seen: unknown[] = []
    const refusal = await humanCheckRefusal(
      request(SEND, "spent"),
      "secret",
      async (...args) => {
        seen.push(args)
        return false
      }
    )
    expect(refusal?.status).toBe(403)
    expect(await refusal?.json()).toEqual({
      code: "HUMAN_CHECK",
      message: HUMAN_CHECK,
    })
    // Cloudflare is told the visitor's address along with the token.
    expect(seen).toEqual([["secret", "spent", "198.51.100.9"]])
  })

  test("a passing token goes through", async () => {
    expect(
      await humanCheckRefusal(request(SEND, "good"), "secret", async () => true)
    ).toBeNull()
  })

  test("only code requests are checked: verify, session and sign-out are not", async () => {
    for (const path of ["phone-number/verify", "get-session", "sign-out"])
      expect(
        await humanCheckRefusal(
          request(`http://localhost:3000/api/auth/${path}`),
          "secret",
          async () => false
        )
      ).toBeNull()
  })

  test("with no secret configured (development) nothing is checked", async () => {
    expect(
      await humanCheckRefusal(request(SEND), undefined, async () => false)
    ).toBeNull()
  })
})
