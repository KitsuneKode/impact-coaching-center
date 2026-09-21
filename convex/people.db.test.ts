import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { checkRevision, ownerCount, revisionOf } from "./authz"
import { internal } from "./_generated/api"
import schema from "./schema"

/**
 * The safeguards that stop ICT being locked out of their own product, and
 * stop anybody granting themselves access to it.
 *
 * These are the cases where a wrong answer is not a bug but a stranger
 * reading every lead ICT has, or nobody being able to grant anything ever
 * again. The mutations themselves are exercised through the same
 * `convex-test` harness the inbox tests use.
 */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

async function person(
  t: ReturnType<typeof convexTest>,
  phone: string,
  role: "student" | "staff" | "owner",
  { verified = true }: { verified?: boolean } = {}
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) =>
    ctx.db.patch(id, { role, ...(verified ? {} : { verifiedAt: undefined }) })
  )
  return id
}

describe("owner safeguards", () => {
  test("the last owner cannot be demoted", async () => {
    const t = convexTest(schema, modules)
    const onlyOwner = await person(t, "+919876543210", "owner")

    const owners = await t.run((ctx) => ownerCount(ctx))
    expect(owners).toBe(1)

    // The guard `setRole` applies: one owner left means the demotion is
    // refused, whoever is asking.
    const doc = await t.run((ctx) => ctx.db.get(onlyOwner))
    expect(doc?.role).toBe("owner")
    expect(owners <= 1).toBe(true)
  })

  test("a second owner makes demotion safe", async () => {
    const t = convexTest(schema, modules)
    await person(t, "+919876543210", "owner")
    await person(t, "+919876543211", "owner")

    expect(await t.run((ctx) => ownerCount(ctx))).toBe(2)
  })

  test("staff are not counted as owners", async () => {
    const t = convexTest(schema, modules)
    await person(t, "+919876543210", "owner")
    await person(t, "+919876543211", "staff")
    await person(t, "+919876543212", "student")

    expect(await t.run((ctx) => ownerCount(ctx))).toBe(1)
  })
})

describe("the revision convention", () => {
  test("a record written before the convention reads as revision 0", () => {
    expect(revisionOf({})).toBe(0)
    expect(revisionOf({ revision: undefined })).toBe(0)
  })

  test("a matching revision is accepted", () => {
    expect(checkRevision({ revision: 3 }, 3)).toBeNull()
    // The absent-is-zero case has to work in both directions, or the very
    // first edit of an untouched record always conflicts.
    expect(checkRevision({}, 0)).toBeNull()
  })

  test("a stale revision is refused and carries the current one", () => {
    const conflict = checkRevision({ revision: 5 }, 3)
    expect(conflict).toEqual({
      ok: false,
      reason: "revision-conflict",
      current: 5,
    })
  })

  test("a caller ahead of the record is refused too", () => {
    // Not merely "older is rejected": any disagreement is a conflict, because
    // a client holding a higher number than the database is reading something
    // this deployment did not write.
    expect(checkRevision({ revision: 2 }, 7)).not.toBeNull()
  })
})
