import { describe, expect, test } from "bun:test"
import { createHmac } from "node:crypto"

import {
  checkoutSignatureValid,
  choosePaymentProvider,
  financialYear,
  hmacHex,
  receiptNumber,
  webhookSignatureValid,
} from "./payments"

describe("choosePaymentProvider", () => {
  test("Razorpay runs wherever it is configured", () => {
    expect(
      choosePaymentProvider("razorpay", "https://prod-1.convex.site")
    ).toBe("razorpay")
  })

  test("the simulated gateway runs only locally or on the dev deployment", () => {
    expect(choosePaymentProvider("simulated", "http://127.0.0.1:3211")).toBe(
      "simulated"
    )
    expect(
      choosePaymentProvider("simulated", "https://peaceful-emu-861.convex.site")
    ).toBe("simulated")
    // Copied onto production by mistake, it switches payments off instead.
    expect(
      choosePaymentProvider("simulated", "https://happy-otter-1.convex.site")
    ).toBe("off")
  })

  test("nothing configured means no payments, not a guess", () => {
    expect(choosePaymentProvider(undefined, "http://127.0.0.1:3211")).toBe(
      "off"
    )
    expect(choosePaymentProvider("stripe", "http://127.0.0.1:3211")).toBe("off")
  })
})

describe("signatures", () => {
  test("hmacHex matches Node's HMAC-SHA256, as Razorpay computes it", async () => {
    const node = createHmac("sha256", "secret").update("a|b").digest("hex")
    expect(await hmacHex("secret", "a|b")).toBe(node)
  })

  test("a checkout signature is valid only for our order and that payment", async () => {
    const secret = "key_secret_test"
    const signature = createHmac("sha256", secret)
      .update("order_ABC|pay_XYZ")
      .digest("hex")
    const ok = { orderId: "order_ABC", paymentId: "pay_XYZ", signature, secret }
    expect(await checkoutSignatureValid(ok)).toBe(true)
    expect(
      await checkoutSignatureValid({ ...ok, orderId: "order_OTHER" })
    ).toBe(false)
    expect(
      await checkoutSignatureValid({ ...ok, paymentId: "pay_OTHER" })
    ).toBe(false)
    expect(
      await checkoutSignatureValid({ ...ok, secret: "another_secret" })
    ).toBe(false)
  })

  test("a webhook signature covers the raw body byte for byte", async () => {
    const body = '{"event":"order.paid","payload":{}}'
    const signature = createHmac("sha256", "whsec").update(body).digest("hex")
    expect(
      await webhookSignatureValid({ body, signature, secret: "whsec" })
    ).toBe(true)
    // Re-serialised JSON is not the same bytes.
    expect(
      await webhookSignatureValid({
        body: JSON.stringify(JSON.parse(body), null, 1),
        signature,
        secret: "whsec",
      })
    ).toBe(false)
  })
})

describe("receipts", () => {
  test("the financial year turns on 1 April, India time", () => {
    // 31 March 2027, 23:59 IST is still 26-27.
    expect(financialYear(Date.UTC(2027, 2, 31, 18, 29))).toBe("26-27")
    // 1 April 2027, 00:30 IST (31 March 19:00 UTC) is 27-28.
    expect(financialYear(Date.UTC(2027, 2, 31, 19, 0))).toBe("27-28")
    expect(financialYear(Date.UTC(2026, 9, 13))).toBe("26-27")
  })

  test("receipt numbers are padded and carry the year", () => {
    expect(receiptNumber("ICT", "26-27", 7)).toBe("ICT/26-27/0007")
    expect(receiptNumber("ICT", "26-27", 12345)).toBe("ICT/26-27/12345")
  })
})
