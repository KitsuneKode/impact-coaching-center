import { contact } from "./brand"

/**
 * Why someone is contacting ICT, rather than the URL that gets them there.
 *
 * Call sites used to build `wa.me` deep links themselves from five
 * near-identical helpers, so the message copy - which is marketing copy the
 * owner will want to change - lived in five places, and adding a single
 * analytics event or campaign parameter meant editing eleven files.
 *
 * Stating the intent instead means one module owns the wording, the encoding
 * and the choice of channel, and there is exactly one place for instrumentation
 * to attach later.
 */
export type EnquiryIntent =
  | { kind: "workshop" }
  | { kind: "track"; exam: string }
  | { kind: "track-free-workshop"; exam: string }
  | { kind: "course"; courseName: string }
  | {
      kind: "handoff"
      name: string
      course: string
      timing: string
      phone: string
    }
  | { kind: "call" }

function message(intent: EnquiryIntent): string {
  switch (intent.kind) {
    case "workshop":
      return "Hello ICT, I would like to try a free workshop before joining. Which courses have one?"
    case "track":
      return `Hello ICT, I want to join the ${intent.exam} batch. Please share the next steps.`
    case "track-free-workshop":
      return `Hello ICT, I would like to try the free ${intent.exam} workshop on the app.`
    case "course":
      return `Hello ICT, I want to enrol in ${intent.courseName}. Please share the next steps.`
    case "handoff":
      return `Hello ICT, I am ${intent.name}. I just enquired about ${intent.course}, ${intent.timing.toLowerCase()} batch. My number is ${intent.phone}.`
    case "call":
      // Unreachable: a call carries no message. Narrowing keeps the switch
      // exhaustive so a new intent kind is a compile error, not a silent gap.
      throw new Error("A call intent has no message.")
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
