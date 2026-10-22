import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { api } from "./_generated/api"
import schema from "./schema"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

describe("counting WhatsApp and call taps", () => {
  test("a script cannot inflate the count past the ceiling", async () => {
    const t = convexTest(schema, modules)
    for (let i = 0; i < 125; i++)
      await t.mutation(api.contactTaps.record, {
        kind: "whatsapp",
        page: "/",
        source: "hero",
      })
    const rows = await t.run((ctx) => ctx.db.query("contactTaps").collect())
    expect(rows.reduce((sum, row) => sum + row.count, 0)).toBe(120)
  })
})
