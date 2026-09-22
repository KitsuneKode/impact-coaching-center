import { paginationOptsValidator, type PaginationOptions } from "convex/server"
import { v } from "convex/values"
import { authComponent } from "./auth"
import { readAccess, type DomainIdentity } from "./access"
import { query, type QueryCtx } from "./_generated/server"

export const leadStatus = v.union(v.literal("new"), v.literal("contacted"), v.literal("interested"), v.literal("enrolled"), v.literal("lost"))
type LeadStatus = "new" | "contacted" | "interested" | "enrolled" | "lost"
export const staffFromIdentity = readAccess

export async function readInbox(ctx: Pick<QueryCtx, "db">, identity: DomainIdentity,
  options: {status: LeadStatus; paginationOpts: PaginationOptions} = {status:"new",paginationOpts:{numItems:25,cursor:null}}) {
  const staff = await readAccess(ctx, identity)
  if (!staff) return { authorized: false as const, leads: [], page: [], isDone: true, continueCursor: "" }
  const result = await ctx.db.query("persons").withIndex("by_leadStatus", q => q.eq("leadStatus", options.status)).order("desc")
    .paginate({...options.paginationOpts, numItems: Math.min(50, Math.max(1, Math.floor(options.paginationOpts.numItems))), maximumRowsRead: 100, maximumBytesRead: 250_000})
  const page = result.page.map(person => ({id:person._id,name:person.name,phone:person.phone,leadStatus:person.leadStatus,interestTrack:person.interestTrack,lastEnquiryAt:person.lastEnquiryAt,verifiedAt:person.verifiedAt}))
  return {...result, authorized: true as const, page, leads:page}
}
export const inbox = query({args:{status:leadStatus,paginationOpts:paginationOptsValidator},handler:async(ctx,args)=>readInbox(ctx,await authComponent.safeGetAuthUser(ctx),args)})
export const canSeeInbox = query({args:{},handler:async(ctx)=>(await readAccess(ctx,await authComponent.safeGetAuthUser(ctx)))!==null})
