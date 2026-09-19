import { describe, expect, test } from "bun:test"

import { contact } from "./brand"
import { contactHref, type EnquiryIntent } from "./contact"

const whatsappDigits = contact.whatsapp.replace("+", "")

describe("contactHref", () => {
  test("a workshop enquiry opens WhatsApp to ICT's number", () => {
    const href = contactHref({ kind: "workshop" })
    expect(href.startsWith(`https://wa.me/${whatsappDigits}?text=`)).toBe(true)
  })

  test("the WhatsApp number carries no plus", () => {
    // wa.me rejects a leading +; it wants bare digits.
    const href = contactHref({ kind: "workshop" })
    expect(href).not.toContain("+")
  })

  test("a call uses tel: and the first published phone", () => {
    expect(contactHref({ kind: "call" })).toBe(`tel:${contact.phones[0]}`)
  })

  test("a track enquiry names the exam", () => {
    const href = contactHref({ kind: "track", exam: "APSC" })
    expect(decodeURIComponent(href)).toContain("APSC")
  })

  test("a free-workshop enquiry differs from a join enquiry", () => {
    const join = contactHref({ kind: "track", exam: "APSC" })
    const free = contactHref({ kind: "track-free-workshop", exam: "APSC" })
    expect(join).not.toBe(free)
  })

  test("a course enquiry names the course", () => {
    const href = contactHref({ kind: "course", courseName: "Lakhya 2027" })
    expect(decodeURIComponent(href)).toContain("Lakhya 2027")
  })
})

describe("contactHref message encoding", () => {
  test("slashes in an exam name are percent-encoded, not left to split the URL", () => {
    const href = contactHref({
      kind: "track",
      exam: "Banking / SSC / Railway",
    })
    expect(href).toContain("%2F")
    expect(decodeURIComponent(href)).toContain("Banking / SSC / Railway")
  })

  test("an ampersand cannot start a second query parameter", () => {
    const href = contactHref({
      kind: "course",
      courseName: "Maths & Reasoning",
    })
    // Exactly one "&" would mean a smuggled parameter; there should be none.
    expect(href.split("&").length).toBe(1)
    expect(decodeURIComponent(href)).toContain("Maths & Reasoning")
  })

  test("a question mark cannot start a second query string", () => {
    const href = contactHref({ kind: "course", courseName: "What now?" })
    expect(href.split("?").length).toBe(2)
    expect(decodeURIComponent(href)).toContain("What now?")
  })

  test("a hash cannot truncate the message into a fragment", () => {
    const href = contactHref({ kind: "course", courseName: "Batch #4" })
    expect(href).not.toContain("#")
    expect(decodeURIComponent(href)).toContain("Batch #4")
  })

  test("spaces encode as %20 rather than plus", () => {
    const href = contactHref({ kind: "course", courseName: "Victor 8 0" })
    expect(href).toContain("%20")
  })

  test("a newline in a name cannot break the message", () => {
    const href = contactHref({ kind: "course", courseName: "Line\nBreak" })
    expect(href).not.toContain("\n")
    expect(decodeURIComponent(href)).toContain("Line\nBreak")
  })

  test("non-Latin script survives a round trip", () => {
    // ICT's audience is Assamese; the owner may name a course in the script.
    const courseName = "অসম পুলিচ"
    const href = contactHref({ kind: "course", courseName })
    expect(decodeURIComponent(href)).toContain(courseName)
  })

  test("a handoff carries the submitted enquiry", () => {
    const href = contactHref({
      kind: "handoff",
      name: "Rituparna Das",
      course: "APSC",
      timing: "Morning",
      phone: "+919876543210",
    })
    const text = decodeURIComponent(href)
    expect(text).toContain("Rituparna Das")
    expect(text).toContain("APSC")
    expect(text).toContain("morning batch")
    expect(text).toContain("+919876543210")
  })

  test("a handoff name containing an ampersand cannot smuggle a parameter", () => {
    const href = contactHref({
      kind: "handoff",
      name: "A & B",
      course: "APSC",
      timing: "Morning",
      phone: "+919876543210",
    })
    expect(href.split("&").length).toBe(1)
  })

  test("the plus in a handoff phone number is encoded, not dropped", () => {
    // encodeURIComponent turns + into %2B; a raw + in a query value decodes
    // to a space, which would mangle the number the staff member reads.
    const href = contactHref({
      kind: "handoff",
      name: "Test",
      course: "APSC",
      timing: "Morning",
      phone: "+919876543210",
    })
    expect(href).toContain("%2B919876543210")
    expect(decodeURIComponent(href)).toContain("+919876543210")
  })

  test("every href is a parseable absolute URL", () => {
    const intents: EnquiryIntent[] = [
      { kind: "workshop" },
      { kind: "call" },
      { kind: "track", exam: "APSC" },
      { kind: "track-free-workshop", exam: "ADRE" },
      { kind: "course", courseName: "Lakhya 2027" },
      {
        kind: "handoff",
        name: "Test",
        course: "APSC",
        timing: "Evening",
        phone: "+919876543210",
      },
    ]
    for (const intent of intents) {
      expect(() => new URL(contactHref(intent))).not.toThrow()
    }
  })

  test("the same intent always produces the same href", () => {
    const intent: EnquiryIntent = { kind: "course", courseName: "Diamond 3.0" }
    expect(contactHref(intent)).toBe(contactHref(intent))
  })
})
