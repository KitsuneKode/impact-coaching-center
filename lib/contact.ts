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
  /** After the course finder: the answers and the course it suggested. */
  | { kind: "finder"; answers: string[]; courseName?: string }
  /** Asking to hear when the next ASSIST scholarship test is announced. */
  | { kind: "assist" }
  /** Asking to hear when new exam dates are notified. */
  | { kind: "dates" }
  /** Site search found nothing for what they typed. */
  | { kind: "search"; query: string }
  /** A question the FAQ did not answer. */
  | { kind: "question" }
  /** A seat in the study library, with the plan they looked at, if any. */
  | { kind: "library"; plan?: string }
  /** Ordering book sets while online payment is off. */
  | { kind: "books"; sets: string[] }
  | { kind: "call" }

function message(intent: Exclude<EnquiryIntent, { kind: "call" }>): string {
  switch (intent.kind) {
    case "question":
      return "Hello ICT, I have a question that is not on your website: "
    case "workshop":
      return "Hello ICT, I would like to try a free workshop before joining. Which courses have one?"
    case "track":
      return `Hello ICT, I want to join the ${intent.exam} batch. Please share the next steps.`
    case "track-free-workshop":
      return `Hello ICT, I would like to try the free ${intent.exam} workshop on the app.`
    case "course":
      return `Hello ICT, I want to enrol in ${intent.courseName}. Please share the next steps.`
    case "finder":
      return `Hello ICT, I used the course finder on your website (${intent.answers.join(", ")}).${intent.courseName ? ` It suggested ${intent.courseName}.` : ""} Could you tell me more?`
    case "assist":
      return "Hello ICT, please tell me when the next ASSIST scholarship test is announced."
    case "dates":
      return "Hello ICT, please message me when new exam dates are announced."
    case "search":
      return `Hello ICT, I looked on your website for “${intent.query.slice(0, 80)}” and could not find it. Can you help?`
    case "library":
      return `Hello ICT, I would like a seat in the study library${intent.plan ? ` (${intent.plan})` : ""}. Is one free, and when can I come and see the room?`
    case "books":
      return `Hello ICT, I would like to order: ${intent.sets.join("; ")}. Please tell me the total and how to pay.`
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
