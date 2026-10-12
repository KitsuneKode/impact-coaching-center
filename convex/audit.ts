import type { Infer } from "convex/values"

import type { Viewer } from "./authz"
import type { MutationCtx } from "./_generated/server"
import type { AUDIT_ACTION, AUDIT_ENTITY } from "./schema"

/** Write the audit row for a privileged change, in the same transaction. */
export async function recordAudit(
  ctx: MutationCtx,
  actor: Pick<Viewer, "id"> | null,
  entry: {
    action: Infer<typeof AUDIT_ACTION>
    entity: Infer<typeof AUDIT_ENTITY>
    entityId?: string
    summary: string
    from?: string
    to?: string
  }
) {
  await ctx.db.insert("auditLog", { actorId: actor?.id, ...entry })
}
