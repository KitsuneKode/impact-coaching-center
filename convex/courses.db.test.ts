import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import type { ClassplusCourse } from "../lib/classplus"
import { internal } from "./_generated/api"
import schema from "./schema"

/** The ClassPlus mirror: ClassPlus owns the course, ICT owns its extras. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const row = (over: Partial<ClassplusCourse> = {}): ClassplusCourse => ({
  classplusId: 886514,
  slug: "lakhya-2027",
  name: "Lakhya 2027 - The Complete APSC Course",
  description: "Features:\n✅ Complete APSC Coaching",
  pricePaise: 3_001_000,
  finalPricePaise: 2_500_900,
  free: false,
  enrolled: 10,
  tags: ["LIVE CLASS"],
  ...over,
})

const apply = (t: ReturnType<typeof convexTest>, rows: ClassplusCourse[]) =>
  t.mutation(internal.courses.applySync, {
    trigger: "schedule",
    rows,
    covers: [],
  })

const coursesIn = (t: ReturnType<typeof convexTest>) =>
  t.run((ctx) => ctx.db.query("courses").collect())

describe("applySync", () => {
  test("adds new courses, follows price changes, keeps ICT's own fields", async () => {
    const t = convexTest(schema, modules)
    await apply(t, [row()])
    const [first] = await coursesIn(t)
    await t.run((ctx) =>
      ctx.db.patch(first!._id, {
        local: {
          hidden: false,
          batchStarts: "2026-11-02",
          offlineFeePaise: 2_000_000,
        },
      })
    )

    await apply(t, [row({ finalPricePaise: 2_200_000, enrolled: 12 })])
    const [course] = await coursesIn(t)
    expect(course!.source.finalPricePaise).toBe(2_200_000)
    expect(course!.local.batchStarts).toBe("2026-11-02")
    expect(course!.revision).toBe(1)
  })

  test("a course gone from ClassPlus is marked missing, and returns cleanly", async () => {
    const t = convexTest(schema, modules)
    await apply(t, [
      row(),
      row({ classplusId: 2, slug: "victor-9", name: "Victor 9.0" }),
    ])
    await apply(t, [row()])
    const gone = (await coursesIn(t)).find((c) => c.classplusId === 2)
    expect(gone!.missingSince).toBeNumber()
    expect(await t.query(internal.courses.coverSources, {})).toEqual({})

    await apply(t, [
      row(),
      row({ classplusId: 2, slug: "victor-9", name: "Victor 9.0" }),
    ])
    const back = (await coursesIn(t)).find((c) => c.classplusId === 2)
    expect(back!.missingSince).toBeUndefined()
  })

  test("the slug never changes, and a clash gets the id appended", async () => {
    const t = convexTest(schema, modules)
    await apply(t, [row()])
    await apply(t, [
      row({ slug: "lakhya-2027-renamed", name: "Lakhya 2027 Renamed" }),
    ])
    expect((await coursesIn(t))[0]!.slug).toBe("lakhya-2027")

    await apply(t, [row(), row({ classplusId: 3 })])
    const clash = (await coursesIn(t)).find((c) => c.classplusId === 3)
    expect(clash!.slug).toBe("lakhya-2027-3")
  })

  test("every run is logged; a failure keeps the last good data", async () => {
    const t = convexTest(schema, modules)
    await apply(t, [row()])
    await t.mutation(internal.courses.recordFailure, {
      trigger: "schedule",
      error: "ClassPlus returned 503.",
    })
    const runs = await t.run((ctx) => ctx.db.query("courseSyncs").collect())
    expect(runs.map((r) => r.status)).toEqual(["ok", "failed"])
    expect(await coursesIn(t)).toHaveLength(1)
  })
})
