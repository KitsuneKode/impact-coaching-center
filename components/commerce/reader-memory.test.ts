import { beforeEach, describe, expect, test } from "bun:test"

import {
  documentId,
  rememberedNotes,
  rememberedPage,
  rememberNotes,
  rememberPage,
} from "./reader-memory"

/** A Map behind the Storage interface; `full` makes every write throw. */
function fakeStorage() {
  const map = new Map<string, string>()
  const store = {
    full: false,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (store.full) throw new DOMException("full", "QuotaExceededError")
      map.set(key, value)
    },
    removeItem: (key: string) => void map.delete(key),
    keys: () => [...map.keys()],
  }
  return store
}

let storage: ReturnType<typeof fakeStorage>
beforeEach(() => {
  storage = fakeStorage()
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  })
})

const bookmark = (pageIndex: number) => ({
  id: `ann_${pageIndex}`,
  kind: "bookmark" as const,
  pageIndex,
  createdAt: 1,
  updatedAt: 1,
})

describe("documentId", () => {
  test("a signed link keeps its identity when only the signature changes", () => {
    const a = documentId("https://r2.example/ict/abc?X-Amz-Signature=1")
    const b = documentId("https://r2.example/ict/abc?X-Amz-Signature=2")
    expect(a).toBe(b)
    expect(documentId("https://r2.example/ict/new?X-Amz-Signature=1")).not.toBe(
      a
    )
  })

  test("page images identify a document without a PDF", () => {
    expect(documentId(undefined, ["https://c/1", "https://c/2"])).toBe(
      documentId(undefined, ["https://c/1", "https://c/2"])
    )
  })
})

describe("remembered page", () => {
  test("reopens where the student stopped", () => {
    rememberPage("doc", 4)
    expect(rememberedPage("doc", 12)).toBe(4)
  })

  test("a finished read, or a shorter replacement, starts again", () => {
    rememberPage("doc", 11)
    expect(rememberedPage("doc", 12)).toBe(0)
    rememberPage("doc", 30)
    expect(rememberedPage("doc", 12)).toBe(0)
  })

  test("garbage in storage opens at the start", () => {
    storage.setItem("ict-reader:page:doc", "not json")
    expect(rememberedPage("doc", 12)).toBe(0)
    storage.setItem("ict-reader:page:doc", "-3")
    expect(rememberedPage("doc", 12)).toBe(0)
  })

  test("only the 40 most recent documents are kept", () => {
    for (let i = 0; i < 45; i++) {
      rememberPage(`doc${i}`, 2)
      rememberedPage(`doc${i}`, 12)
    }
    expect(rememberedPage("doc44", 12)).toBe(2)
    expect(storage.getItem("ict-reader:page:doc0")).toBeNull()
  })
})

describe("remembered notes", () => {
  test("round-trips and drops malformed entries", () => {
    expect(rememberNotes("doc", [bookmark(3)])).toBe(true)
    expect(rememberedNotes("doc")).toEqual([bookmark(3)])
    storage.setItem("ict-reader:notes:doc", JSON.stringify([{ nope: 1 }]))
    expect(rememberedNotes("doc")).toEqual([])
  })

  test("says so when the device refuses to keep them", () => {
    storage.full = true
    expect(rememberNotes("doc", [bookmark(1)])).toBe(false)
  })

  test("clearing every note removes the entry", () => {
    rememberNotes("doc", [bookmark(1)])
    rememberNotes("doc", [])
    expect(storage.getItem("ict-reader:notes:doc")).toBeNull()
  })
})
