import { contact, type Track } from "./brand"

/**
 * Why someone is contacting ICT, rather than the URL that gets them there.
 *
 * Call sites used to build `wa.me` deep links themselves from five
 * near-identical helpers, so the message copy - which is marketing copy the
 * owner will want to change - lived in five places, and a campaign parameter
 * or a channel change meant editing eleven files. Those are now one-file
 * edits, which is what this module buys.
 *
 * What it does not buy, despite the obvious assumption: this is a pure string
 * builder called during render, so it cannot fire a click event. Spec section
 * 17's `cta_clicked` and `whatsapp_handoff` need an onClick on the anchor, and
 * the anchors are still hand-written at each call site - five of which are
 * Server Components. Instrumentation needs a small client component owning the
 * element; adding it here would do nothing.
 */
export type EnquiryIntent =
  | { kind: "workshop" }
  | { kind: "track"; exam: Track["exam"] }
  | { kind: "track-free-workshop"; exam: Track["exam"] }
  | { kind: "course"; courseName: string }
  /**
   * The WhatsApp continuation after someone submits the enquiry form. Named
   * for spec section 17's `whatsapp_handoff` event, and deliberately not
   * "handoff" alone - CONTEXT.md reserves "Enrolment handoff" for sending a
   * Person to Classplus, which is the `course` intent below.
   *
   * Carries a name and a phone number. Spec section 17 prohibits both in
   * analytics events: instrumentation may send `intent.kind` and nothing
   * else. Never spread an intent into event properties.
   */
  | {
      kind: "whatsapp-handoff"
      name: string
      track: string
      timing: string
      phone: string
    }
  | { kind: "call" }

function message(intent: Exclude<EnquiryIntent, { kind: "call" }>): string {
  switch (intent.kind) {
    case "workshop":
      return "Hello ICT, I would like to try a free workshop before joining. Which courses have one?"
    case "track":
      return `Hello ICT, I want to join the ${intent.exam} batch. Please share the next steps.`
    case "track-free-workshop":
      return `Hello ICT, I would like to try the free ${intent.exam} workshop on the app.`
    case "course":
      return `Hello ICT, I want to enrol in ${intent.courseName}. Please share the next steps.`
    case "whatsapp-handoff":
      return `Hello ICT, I am ${intent.name}. I just enquired about ${intent.track}, ${intent.timing.toLowerCase()} batch. My number is ${intent.phone}.`
  }
}

/**
 * Where an intent sends someone.
 *
 * WhatsApp for anything that starts a conversation, `tel:` for a call. The
 * message is percent-encoded in full, so an exam name containing a slash, an
 * ampersand, a hash or a newline cannot escape the query value and truncate
 * or rewrite the URL.
 */
export function contactHref(intent: EnquiryIntent): string {
  if (intent.kind === "call") return `tel:${contact.phones[0]}`

  // wa.me wants bare digits; a leading + yields a broken link.
  const number = contact.whatsapp.replace(/\D/g, "")
  return `https://wa.me/${number}?text=${encodeURIComponent(message(intent))}`
}
