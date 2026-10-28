import { v } from "convex/values"

import { ORDER_TEMPLATES, whatsappTemplateRequest } from "../lib/order-messages"
import { chooseTransport, whatsappConfig } from "../lib/otp-transport"
import { internal } from "./_generated/api"
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server"
import { MESSAGE_TEMPLATE } from "./schema"
import type { Infer } from "convex/values"

/**
 * Order messages on WhatsApp, through an outbox (ADR-0005). A mutation that
 * changes an order queues the message in the same transaction; a scheduled
 * action sends it. A send that fails never undoes or blocks the order.
 */

const ATTEMPTS_MAX = 3
/** Back off 1, 5, then 30 minutes between tries. */
const RETRY_AFTER_MS = [60_000, 5 * 60_000, 30 * 60_000]

/**
 * Queue one message, once: a second call with the same key (a payment
 * confirmed by both the browser and the webhook) is ignored.
 */
export async function queueMessage(
  ctx: MutationCtx,
  message: {
    key: string
    to: string
    template: Infer<typeof MESSAGE_TEMPLATE>
    language: "en" | "as"
    params: string[]
  }
) {
  if (!/^\+\d{8,15}$/.test(message.to)) return
  const prior = await ctx.db
    .query("messages")
    .withIndex("by_key", (q) => q.eq("key", message.key))
    .first()
  if (prior) return
  const id = await ctx.db.insert("messages", {
    ...message,
    status: "queued",
    attempts: 0,
  })
  await ctx.scheduler.runAfter(0, internal.messages.deliver, { id })
}

export const forDelivery = internalQuery({
  args: { id: v.id("messages") },
  returns: v.union(
    v.null(),
    v.object({
      to: v.string(),
      template: MESSAGE_TEMPLATE,
      language: v.union(v.literal("en"), v.literal("as")),
      params: v.array(v.string()),
      status: v.string(),
      attempts: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id)
    if (!message) return null
    return {
      to: message.to,
      template: message.template,
      language: message.language,
      params: message.params,
      status: message.status,
      attempts: message.attempts,
    }
  },
})

export const recordAttempt = internalMutation({
  args: {
    id: v.id("messages"),
    sent: v.boolean(),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id)
    if (!message || message.status !== "queued") return null
    const attempts = message.attempts + 1
    if (args.sent) {
      await ctx.db.patch(args.id, {
        status: "sent",
        attempts,
        sentAt: Date.now(),
        error: undefined,
      })
      return null
    }
    const finished = attempts >= ATTEMPTS_MAX
    await ctx.db.patch(args.id, {
      status: finished ? "failed" : "queued",
      attempts,
      error: args.error?.slice(0, 200),
    })
    if (!finished)
      await ctx.scheduler.runAfter(
        RETRY_AFTER_MS[attempts - 1] ?? RETRY_AFTER_MS.at(-1)!,
        internal.messages.deliver,
        { id: args.id }
      )
    return null
  },
})

export const deliver = internalAction({
  args: { id: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(internal.messages.forDelivery, args)
    if (!message || message.status !== "queued") return null
    const template = ORDER_TEMPLATES[message.template]
    let error: string | undefined
    try {
      const transport = chooseTransport(
        process.env.OTP_TRANSPORT,
        process.env.CONVEX_SITE_URL
      )
      if (transport === "logger") {
        console.log(
          `[whatsapp] ${message.to} ${template.name}: ${message.params.join(" | ")}`
        )
      } else {
        /* Assamese templates only once Meta has approved them under a
           language code ICT sets; until then everyone gets English. */
        const assamese = process.env.WHATSAPP_ORDER_AS_LANGUAGE
        const { url, init } = whatsappTemplateRequest(whatsappConfig(), {
          to: message.to,
          template: template.name,
          language: message.language === "as" && assamese ? assamese : "en",
          params: message.params,
        })
        const response = await fetch(url, init)
        if (!response.ok) error = `WhatsApp answered ${response.status}`
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "send failed"
    }
    await ctx.runMutation(internal.messages.recordAttempt, {
      id: args.id,
      sent: !error,
      error,
    })
    return null
  },
})
