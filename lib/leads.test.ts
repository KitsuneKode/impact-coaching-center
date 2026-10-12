import { describe, expect, test } from "bun:test"

import { enquiryTracks, nationalMobileDraft, parseLead } from "./leads"

const valid = {
  name: "Rituparna Das",
  phone: "98765 43210",
  track: enquiryTracks[0]!,
  timing: "Morning",
}

describe("nationalMobileDraft", () => {
  test("keeps ten digits and drops an eleventh", () => {
    expect(nationalMobileDraft("98765432109")).toBe("9876543210")
  })

  test("strips letters and separators", () => {
    expect(nationalMobileDraft("98765 43210abc")).toBe("9876543210")
  })

  test("unwraps a pasted country code instead of keeping 91", () => {
    expect(nationalMobileDraft("+91 98765 43210")).toBe("9876543210")
    expect(nationalMobileDraft("919876543210")).toBe("9876543210")
  })

  test("unwraps a trunk zero", () => {
    expect(nationalMobileDraft("09876543210")).toBe("9876543210")
  })

  test("does not treat a ten-digit number starting with 91 as a country code", () => {
    expect(nationalMobileDraft("9198765432")).toBe("9198765432")
  })

  test("cuts a long digit run from the front, not the tail", () => {
    expect(nationalMobileDraft("123456789876543210")).toBe("1234567898")
  })
})

describe("parseLead", () => {
  test("normalises a spaced mobile number to E.164", () => {
    const result = parseLead(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(String(result.lead.phone)).toBe("+919876543210")
  })

  test("accepts a number already carrying the country code", () => {
    const result = parseLead({ ...valid, phone: "+91 98765 43210" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(String(result.lead.phone)).toBe("+919876543210")
  })

  test("rejects a mobile number that is too short", () => {
    const result = parseLead({ ...valid, phone: "98765" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.phone).toBeDefined()
  })

  test("rejects an Indian landline prefix", () => {
    const result = parseLead({ ...valid, phone: "1234567890" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.phone).toBeDefined()
  })

  test("rejects a course outside the published list", () => {
    const result = parseLead({ ...valid, track: "Astrophysics" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.track).toBeDefined()
  })

  test("rejects a timing outside the published list", () => {
    const result = parseLead({ ...valid, timing: "Whenever" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.timing).toBeDefined()
  })

  test("reports every invalid field at once", () => {
    const result = parseLead({ name: "R", phone: "1", track: "", timing: "" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "name",
        "phone",
        "timing",
        "track",
      ])
    }
  })

  test("trims a padded name", () => {
    const result = parseLead({ ...valid, name: "  Rituparna Das  " })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.lead.name).toBe("Rituparna Das")
  })

  test("defaults the source to the website", () => {
    const result = parseLead(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.lead.source).toBe("website")
  })

  test("rejects a number with an extension rather than rewriting it", () => {
    // Taking the last ten digits turned this into +916543210123, a real but
    // entirely different mobile number - and this string is the natural key
    // for a Person and the destination of a verification code.
    const result = parseLead({ ...valid, phone: "9876543210 ext 123" })
    expect(result.ok).toBe(false)
  })

  test("rejects a US number instead of making it Indian", () => {
    const result = parseLead({ ...valid, phone: "+1 650 700 1234" })
    expect(result.ok).toBe(false)
  })

  test("rejects a UK number instead of making it Indian", () => {
    const result = parseLead({ ...valid, phone: "+44 7700 900123" })
    expect(result.ok).toBe(false)
  })

  test("rejects a long digit run rather than taking its tail", () => {
    const result = parseLead({ ...valid, phone: "123456789876543210" })
    expect(result.ok).toBe(false)
  })

  test("rejects letters padding a valid number", () => {
    const result = parseLead({ ...valid, phone: "abc9876543210" })
    expect(result.ok).toBe(false)
  })

  test("accepts a leading zero", () => {
    const result = parseLead({ ...valid, phone: "09876543210" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(String(result.lead.phone)).toBe("+919876543210")
  })

  test("accepts a country code without the plus", () => {
    const result = parseLead({ ...valid, phone: "919876543210" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(String(result.lead.phone)).toBe("+919876543210")
  })

  test("accepts brackets, dots and dashes", () => {
    const result = parseLead({ ...valid, phone: "(98765)-432.10" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(String(result.lead.phone)).toBe("+919876543210")
  })

  test("rejects a one-character name but accepts two", () => {
    expect(parseLead({ ...valid, name: "R" }).ok).toBe(false)
    expect(parseLead({ ...valid, name: "Ra" }).ok).toBe(true)
  })

  test("accepts an 80-character name and rejects 81", () => {
    expect(parseLead({ ...valid, name: "a".repeat(80) }).ok).toBe(true)
    expect(parseLead({ ...valid, name: "a".repeat(81) }).ok).toBe(false)
  })

  test("a whitespace-only name is empty, not a name", () => {
    expect(parseLead({ ...valid, name: "   " }).ok).toBe(false)
  })

  test("missing keys are treated as empty rather than throwing", () => {
    const result = parseLead({})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "name",
        "phone",
        "timing",
        "track",
      ])
    }
  })

  test("rejects the lowest invalid mobile prefix and accepts the lowest valid one", () => {
    expect(parseLead({ ...valid, phone: "5876543210" }).ok).toBe(false)
    expect(parseLead({ ...valid, phone: "6876543210" }).ok).toBe(true)
  })

  test("rejects nine and eleven digits, accepts exactly ten", () => {
    expect(parseLead({ ...valid, phone: "987654321" }).ok).toBe(false)
    expect(parseLead({ ...valid, phone: "98765432101" }).ok).toBe(false)
    expect(parseLead({ ...valid, phone: "9876543210" }).ok).toBe(true)
  })

  test("an explicit source is kept instead of defaulting", () => {
    const result = parseLead({ ...valid, source: "promotion" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.lead.source).toBe("promotion")
  })

  test("an empty source falls back to the website", () => {
    const result = parseLead({ ...valid, source: "" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.lead.source).toBe("website")
  })

  test("a course with surrounding whitespace still matches the list", () => {
    const result = parseLead({ ...valid, track: `  ${enquiryTracks[0]!}  ` })
    expect(result.ok).toBe(true)
  })

  test("offers 'Not sure yet' as a real choice", () => {
    expect(enquiryTracks).toContain("Not sure yet")
  })
})
