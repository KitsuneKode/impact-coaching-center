/**
 * Meta's WhatsApp status webhook, reduced to what sign-in needs: which
 * numbers a message could not be delivered to because they are not on
 * WhatsApp. Meta does not bill an undelivered message, but the person never
 * gets their code, so the next attempt is refused with a clear reason.
 */

/** "Message undeliverable": the number is not on WhatsApp (or cannot receive). */
export const NOT_ON_WHATSAPP_CODES = new Set([131026])

type StatusPayload = {
  entry?: {
    changes?: {
      value?: {
        statuses?: {
          status?: string
          recipient_id?: string
          errors?: { code?: number }[]
        }[]
      }
    }[]
  }[]
}

/** Phones (E.164 with +) whose message failed with a not-on-WhatsApp code. */
export function undeliverableFrom(payload: unknown): {
  phones: string[]
  code: number
}[] {
  const out = new Map<number, string[]>()
  for (const entry of (payload as StatusPayload)?.entry ?? [])
    for (const change of entry.changes ?? [])
      for (const status of change.value?.statuses ?? []) {
        if (status.status !== "failed" || !status.recipient_id) continue
        const code = status.errors?.find((e) =>
          NOT_ON_WHATSAPP_CODES.has(e.code ?? 0)
        )?.code
        if (!code || !/^\d{8,15}$/.test(status.recipient_id)) continue
        out.set(code, [...(out.get(code) ?? []), `+${status.recipient_id}`])
      }
  return [...out].map(([code, phones]) => ({ code, phones }))
}
