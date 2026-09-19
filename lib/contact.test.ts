import { describe, expect, test } from "bun:test"

import { contact } from "./brand"
import { contactHref, type EnquiryIntent } from "./contact"

// Pinned literally, not re-derived from contact.whatsapp: deriving it would
// reproduce any bug in the implementation and move the test along with it.
const whatsappDigits = "918638061175"

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
  test("commas in a real exam name are percent-encoded", () => {
    // "Bank, SSC, Railway" is a real Track label; the type now rejects
    // invented ones, which is why this asserts on the genuine value.
    const href = contactHref({ kind: "track", exam: "Bank, SSC, Railway" })
    expect(href).toContain("%2C")
    expect(decodeURIComponent(href)).toContain("Bank, SSC, Railway")
  })

  test("slashes are percent-encoded, not left to split the URL path", () => {
    const href = contactHref({ kind: "course", courseName: "APSC / ADRE" })
    expect(href).toContain("%2F")
    expect(decodeURIComponent(href)).toContain("APSC / ADRE")
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

  test("spaces inside the supplied value encode as %20 rather than plus", () => {
    const href = contactHref({ kind: "course", courseName: "Victor 8 0" })
    // Asserting on the supplied value specifically: the fixed prefix already
    // contains spaces, so a bare toContain("%20") would pass regardless.
    expect(href).toContain("Victor%208%200")
    expect(href).not.toContain("Victor+8+0")
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
      kind: "whatsapp-handoff",
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
      kind: "whatsapp-handoff",
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
      kind: "whatsapp-handoff",
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
      { kind: "track-free-workshop", exam: "ADRE and Assam Police" },
      { kind: "course", courseName: "Lakhya 2027" },
      {
        kind: "whatsapp-handoff",
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
})

describe("contactHref exact copy", () => {
  // The wording is marketing copy and the whole point of this module owning
  // it. Pinned exactly, because the migration that created this module
  // rewrote eleven call sites by script: every other assertion here is
  // `toContain`, and would have stayed green through a mangled message.
  const base = `https://wa.me/${whatsappDigits}?text=`

  test("workshop", () => {
    expect(contactHref({ kind: "workshop" })).toBe(
      `${base}Hello%20ICT%2C%20I%20would%20like%20to%20try%20a%20free%20workshop%20before%20joining.%20Which%20courses%20have%20one%3F`
    )
  })

  test("track", () => {
    expect(contactHref({ kind: "track", exam: "APSC" })).toBe(
      `${base}Hello%20ICT%2C%20I%20want%20to%20join%20the%20APSC%20batch.%20Please%20share%20the%20next%20steps.`
    )
  })

  test("track free workshop", () => {
    expect(contactHref({ kind: "track-free-workshop", exam: "APSC" })).toBe(
      `${base}Hello%20ICT%2C%20I%20would%20like%20to%20try%20the%20free%20APSC%20workshop%20on%20the%20app.`
    )
  })

  test("course", () => {
    expect(contactHref({ kind: "course", courseName: "Lakhya 2027" })).toBe(
      `${base}Hello%20ICT%2C%20I%20want%20to%20enrol%20in%20Lakhya%202027.%20Please%20share%20the%20next%20steps.`
    )
  })

  test("whatsapp handoff", () => {
    expect(
      contactHref({
        kind: "whatsapp-handoff",
        name: "Rituparna Das",
        course: "APSC",
        timing: "Morning",
        phone: "+919876543210",
      })
    ).toBe(
      `${base}Hello%20ICT%2C%20I%20am%20Rituparna%20Das.%20I%20just%20enquired%20about%20APSC%2C%20morning%20batch.%20My%20number%20is%20%2B919876543210.`
    )
  })

  test("call", () => {
    expect(contactHref({ kind: "call" })).toBe("tel:+918638061175")
  })
})
