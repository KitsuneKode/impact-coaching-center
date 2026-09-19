import { describe, expect, test } from "bun:test"

import { enquiryCourses, parseLead } from "./leads"

const valid = {
  name: "Rituparna Das",
  phone: "98765 43210",
  course: enquiryCourses[0]!,
  timing: "Morning",
}

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
    const result = parseLead({ ...valid, course: "Astrophysics" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.course).toBeDefined()
  })

  test("rejects a timing outside the published list", () => {
    const result = parseLead({ ...valid, timing: "Whenever" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.timing).toBeDefined()
  })

  test("reports every invalid field at once", () => {
    const result = parseLead({ name: "R", phone: "1", course: "", timing: "" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "course",
        "name",
        "phone",
        "timing",
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

  test("offers 'Not sure yet' as a real choice", () => {
    expect(enquiryCourses).toContain("Not sure yet")
  })
})
