/** Admin areas the owner can open to staff. The owner has all of them. */
export const GRANTS = ["catalog", "promotions", "content"] as const
export type Grant = (typeof GRANTS)[number]

export const GRANT_LABELS: Record<Grant, string> = {
  catalog: "Shop, courses and resources",
  promotions: "Promotions",
  content: "Blog and exam calendar",
}

type Who = { role: "student" | "staff" | "owner"; grants: readonly Grant[] }

/** The one rule, shared by the server checks and the admin navigation. */
export function hasGrant(who: Who, grant: Grant): boolean {
  if (who.role === "owner") return true
  return who.role === "staff" && who.grants.includes(grant)
}
