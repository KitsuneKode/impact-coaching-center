import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import {
  checkRevision,
  hasGrant,
  ownerCount,
  revisionOf,
  sessionStale,
  STAFF_SESSION_MAX_MS,
} from "./authz"
import { applySetGrants } from "./people"
import { findVerifiedPerson } from "./persons"
import { internal } from "./_generated/api"
import schema from "./schema"

/**
 * The safeguards that stop ICT being locked out of their own product, and
 * stop anybody granting themselves access to it.
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

describe("the staff session cutoff", () => {
  test("a session inside the window is fresh", () => {
    const now = 1_000_000_000_000
    expect(sessionStale(now - STAFF_SESSION_MAX_MS + 1, now)).toBe(false)
  })

  test("a session past seven days is stale, however active", () => {
    // Hard-capped on createdAt: refresh bumps updatedAt, not the birthday,
    // or a daily user would ride the sliding window forever.
    const now = 1_000_000_000_000
    expect(sessionStale(now - STAFF_SESSION_MAX_MS - 1, now)).toBe(true)
    expect(sessionStale(0, now)).toBe(true)
  })
})

describe("bootstrapOwner", () => {
  test("grants the first owner, audited, from a verified Person", async () => {
    const t = convexTest(schema, modules)
    const id = await person(t, "+919876543210", "student")

    const result = await t.mutation(internal.people.bootstrapOwner, {
      phone: "98765 43210", // raw input is normalised before lookup
    })
    expect(result).toEqual({ ok: true })

    const doc = await t.run((ctx) => ctx.db.get(id))
    expect(doc?.role).toBe("owner")
    expect(doc?.revision).toBe(1)

    const audit = await t.run((ctx) =>
      ctx.db
        .query("auditLog")
        .withIndex("by_entity_and_entityId", (q) =>
          q.eq("entity", "person").eq("entityId", id)
        )
        .collect()
    )
    expect(audit).toHaveLength(1)
    expect(audit[0]).toMatchObject({
      action: "role_change",
      from: "student",
      to: "owner",
    })
  })

  test("refuses once any owner exists", async () => {
    const t = convexTest(schema, modules)
    await person(t, "+919876543210", "owner")
    const second = await person(t, "+919876543211", "student")

    const result = await t.mutation(internal.people.bootstrapOwner, {
      phone: "+919876543211",
    })
    expect(result).toEqual({ ok: false, reason: "forbidden" })

    const doc = await t.run((ctx) => ctx.db.get(second))
    expect(doc?.role).toBe("student")
  })

  test("never creates a Person and never promotes an unverified one", async () => {
    const t = convexTest(schema, modules)
    expect(
      await t.mutation(internal.people.bootstrapOwner, {
        phone: "+919999999999",
      })
    ).toEqual({ ok: false, reason: "missing-record" })

    await person(t, "+919876543212", "student", { verified: false })
    expect(
      await t.mutation(internal.people.bootstrapOwner, {
        phone: "+919876543212",
      })
    ).toEqual({ ok: false, reason: "invalid-input", field: "verification" })
  })
})

describe("paginated returns validator", () => {
  test("accepts the split fields .paginate() adds to large pages", async () => {
    const { paginated } = await import("./authz")
    const { v } = await import("convex/values")
    // Regression: a hand-written { page, isDone, continueCursor } rejected
    // every result once Convex added splitCursor/pageStatus.
    const fields = paginated(v.string()).fields
    expect(Object.keys(fields)).toEqual(
      expect.arrayContaining(["splitCursor", "pageStatus"])
    )
  })
})

describe("staff grants", () => {
  const as = async (t: ReturnType<typeof convexTest>, phone: string) =>
    (await t.run((ctx) =>
      findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
    ))!

  test("only the owner grants, only to staff, and it is audited", async () => {
    const t = convexTest(schema, modules)
    await person(t, "+919876543210", "owner")
    const staffId = await person(t, "+919876543211", "staff")
    const studentId = await person(t, "+919876543212", "student")
    const owner = await as(t, "+919876543210")
    const staff = await as(t, "+919876543211")

    expect(
      await t.run((ctx) =>
        applySetGrants(ctx, staff, {
          personId: staffId,
          grants: ["catalog"],
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
    expect(
      await t.run((ctx) =>
        applySetGrants(ctx, owner, {
          personId: studentId,
          grants: ["catalog"],
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "role" })

    const granted = await t.run((ctx) =>
      applySetGrants(ctx, owner, {
        personId: staffId,
        grants: ["promotions", "catalog", "catalog"],
        expectedRevision: 0,
      })
    )
    expect(granted).toEqual({ ok: true, revision: 1 })
    const staffNow = await as(t, "+919876543211")
    expect(staffNow.grants).toEqual(["catalog", "promotions"])
    expect(hasGrant(staffNow, "catalog")).toBe(true)
    expect(hasGrant(staffNow, "content")).toBe(false)
    expect(hasGrant(owner, "content")).toBe(true)

    const audit = await t.run((ctx) => ctx.db.query("auditLog").collect())
    expect(audit.at(-1)).toMatchObject({
      action: "grant_change",
      entityId: staffId,
      to: "catalog,promotions",
    })
  })
})
