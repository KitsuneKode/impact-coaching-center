import { describe, expect, test } from "bun:test"

import { FREE_FOLDERS, folderOf, groupByFolder } from "./free-folders"

describe("free folders", () => {
  test("current affairs go to one folder whatever the exam", () => {
    expect(folderOf({ kind: "Current affairs", exam: "APSC" })).toBe(
      "current-affairs"
    )
    expect(
      folderOf({ kind: "Current affairs", exam: "ADRE and Assam Police" })
    ).toBe("current-affairs")
  })

  test("papers and practice sets are mock tests for APSC and ADRE", () => {
    expect(folderOf({ kind: "Question paper", exam: "APSC" })).toBe("mock-apsc")
    expect(
      folderOf({ kind: "Practice set", exam: "ADRE and Assam Police" })
    ).toBe("mock-adre")
  })

  test("notes are study materials for their exam", () => {
    expect(folderOf({ kind: "Notes", exam: "APSC" })).toBe("study-apsc")
    expect(folderOf({ kind: "Notes", exam: "ADRE and Assam Police" })).toBe(
      "study-adre"
    )
  })

  test("everything for banking, SSC and railway shares one folder", () => {
    expect(folderOf({ kind: "Practice set", exam: "Bank, SSC, Railway" })).toBe(
      "study-banking"
    )
    expect(folderOf({ kind: "Notes", exam: "Bank, SSC, Railway" })).toBe(
      "study-banking"
    )
  })

  test("grouping keeps all six folders in order, empty ones too", () => {
    const groups = groupByFolder([{ kind: "Notes" as const, exam: "APSC" }])
    expect(groups.map((g) => g.id)).toEqual(FREE_FOLDERS.map((f) => f.id))
    expect(groups.find((g) => g.id === "study-apsc")!.items).toHaveLength(1)
    expect(groups.filter((g) => g.items.length === 0)).toHaveLength(5)
  })
})
