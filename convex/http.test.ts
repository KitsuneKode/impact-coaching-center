import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { convexTest } from "convex-test"
import schema from "./schema"
import { enquiryTracks, enquiryTimings } from "../lib/leads"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (!file.endsWith(".test.ts"))
    modules[`./${file}`] = () => import(`./${file}`)
}
const original = {
  secret: process.env.LEAD_INGEST_SECRET,
  site: process.env.SITE_URL,
}
beforeEach(() => {
  process.env.LEAD_INGEST_SECRET = "test-only-ingestion-secret"
  process.env.SITE_URL = "http://localhost:3000"
})
afterEach(() => {
  if (original.secret === undefined) delete process.env.LEAD_INGEST_SECRET
  else process.env.LEAD_INGEST_SECRET = original.secret
  if (original.site === undefined) delete process.env.SITE_URL
  else process.env.SITE_URL = original.site
})

describe("server-to-server enquiry route", () => {
  const lead = {
    name: "Rituparna",
    phone: "98123 45670",
    track: enquiryTracks[0]!,
    timing: enquiryTimings[0]!,
  }
  const headers = {
    "content-type": "application/json",
    authorization: "Bearer test-only-ingestion-secret",
  }
  test("unauthorized requests cannot persist; configured receipt follows persistence", async () => {
    const t = convexTest(schema, modules)
    expect(
      (
        await t.fetch("/enquiries", {
          method: "POST",
          body: JSON.stringify(lead),
        })
      ).status
    ).toBe(401)
    expect(
      await t.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(0)
    expect(
      (
        await t.fetch("/enquiries", {
          method: "POST",
          headers,
          body: JSON.stringify(lead),
        })
      ).status
    ).toBe(204)
    expect(
      await t.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(1)
    expect(
      await t.run((ctx) => ctx.db.query("activities").collect())
    ).toHaveLength(1)
  })
  test("malformed, oversized and invalid requests do not write records", async () => {
    const t = convexTest(schema, modules)
    for (const body of [
      "broken",
      "null",
      "[]",
      "{}",
      JSON.stringify({ ...lead, phone: 123 }),
      JSON.stringify({ ...lead, name: "" }),
    ]) {
      expect(
        (await t.fetch("/enquiries", { method: "POST", headers, body })).status
      ).toBe(400)
    }
    expect(
      (
        await t.fetch("/enquiries", {
          method: "POST",
          headers,
          body: "x".repeat(8193),
        })
      ).status
    ).toBe(413)
    expect(
      await t.run((ctx) => ctx.db.query("persons").collect())
    ).toHaveLength(0)
  })
  test("missing secret never opens ingestion", async () => {
    const t = convexTest(schema, modules)
    delete process.env.LEAD_INGEST_SECRET
    expect(
      (
        await t.fetch("/enquiries", {
          method: "POST",
          headers,
          body: JSON.stringify(lead),
        })
      ).status
    ).toBe(401)
  })
})
