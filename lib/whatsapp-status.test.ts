import { expect, test } from "bun:test"

import { undeliverableFrom } from "./whatsapp-status"

const status = (s: string, id: string, code?: number) => ({
  entry: [
    {
      changes: [
        {
          value: {
            statuses: [
              { status: s, recipient_id: id, errors: code ? [{ code }] : [] },
            ],
          },
        },
      ],
    },
  ],
})

test("a failed send to a number not on WhatsApp is reported", () => {
  expect(undeliverableFrom(status("failed", "919876543210", 131026))).toEqual([
    { code: 131026, phones: ["+919876543210"] },
  ])
})

test("delivered messages, other errors and junk are ignored", () => {
  expect(undeliverableFrom(status("delivered", "919876543210"))).toEqual([])
  expect(undeliverableFrom(status("failed", "919876543210", 131047))).toEqual(
    []
  )
  expect(undeliverableFrom(status("failed", "not-a-number", 131026))).toEqual(
    []
  )
  expect(undeliverableFrom(null)).toEqual([])
})
