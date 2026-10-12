import { contact, type Track } from "./brand"

/** Why someone is contacting ICT, rather than the URL that gets them there. */
export type EnquiryIntent =
  | { kind: "workshop" }
  | { kind: "track"; exam: Track["exam"] }
  | { kind: "track-free-workshop"; exam: Track["exam"] }
  | { kind: "course"; courseName: string }
  /** The WhatsApp continuation after someone submits the enquiry form. */
  | {
      kind: "whatsapp-handoff"
      name: string
      track: string
      timing: string
      phone: string
    }
  /** Asking to hear when the next ASSIST scholarship test is announced. */
  | { kind: "assist" }
  /** Asking to hear when new exam dates are notified. */
  | { kind: "dates" }
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
    case "assist":
      return "Hello ICT, please tell me when the next ASSIST scholarship test is announced."
    case "dates":
      return "Hello ICT, please message me when new exam dates are announced."
    case "whatsapp-handoff":
      return `Hello ICT, I am ${intent.name}. I just enquired about ${intent.track}, ${intent.timing.toLowerCase()} batch. My number is ${intent.phone}.`
  }
}

/** Where an intent sends someone. */
export function contactHref(intent: EnquiryIntent): string {
  if (intent.kind === "call") return `tel:${contact.phones[0]}`

  // wa.me wants bare digits; a leading + yields a broken link.
  const number = contact.whatsapp.replace(/\D/g, "")
  return `https://wa.me/${number}?text=${encodeURIComponent(message(intent))}`
}
