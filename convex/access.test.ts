import { test, expect } from "bun:test"
import { convexTest } from "convex-test"
import schema from "./schema"
import { requireAccess, requireRevision } from "./access"

test("staff can read but cannot mutate; revocation takes effect on the next operation", async () => {
  const t = convexTest(schema, {})
  const identity = {phoneNumber:"+919876543210",phoneNumberVerified:true}
  const id = await t.run(ctx=>ctx.db.insert("persons",{phone:identity.phoneNumber,name:"Staff",role:"staff",verifiedAt:1,source:"test"}))
  expect((await t.run(ctx=>requireAccess(ctx,identity))).id).toBe(id)
  await expect(t.run(ctx=>requireAccess(ctx,identity,true))).rejects.toThrow()
  await t.run(ctx=>ctx.db.patch(id,{role:"owner"}))
  expect((await t.run(ctx=>requireAccess(ctx,identity,true))).role).toBe("owner")
  await t.run(ctx=>ctx.db.patch(id,{role:"student"}))
  await expect(t.run(ctx=>requireAccess(ctx,identity))).rejects.toThrow()
})
test("writes require an exact integer revision",()=>{
  expect(()=>requireRevision(2,1)).toThrow()
  expect(()=>requireRevision(2,2.1)).toThrow()
  expect(()=>requireRevision(2,2)).not.toThrow()
})
