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

  test("offers 'Not sure yet' as a real choice", () => {
    expect(enquiryCourses).toContain("Not sure yet")
  })
})
