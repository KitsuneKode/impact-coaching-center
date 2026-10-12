import { afterEach, describe, expect, test } from "bun:test"

import { defaultTheme, themeInitScript, themeStorageKey } from "./theme"

const previousDocument = globalThis.document
const previousStorage = globalThis.localStorage

afterEach(() => {
  globalThis.document = previousDocument
  globalThis.localStorage = previousStorage
})

function run(stored: string | null, fail = false) {
  const attrs: Record<string, string> = {}
  const style: { colorScheme?: string } = {}
  globalThis.document = {
    documentElement: {
      setAttribute(name: string, value: string) {
        attrs[name] = value
      },
      style,
    },
  } as unknown as Document
  globalThis.localStorage = {
    getItem(key: string) {
      if (fail) throw new Error("blocked")
      if (key !== themeStorageKey) return null
      return stored
    },
    setItem() {},
    removeItem() {},
    clear() {},
    key() {
      return null
    },
    length: 0,
  }
  new Function(themeInitScript())()
  return { attrs, style }
}

describe("themeInitScript", () => {
  test("writes a stored theme onto the document element", () => {
    const { attrs, style } = run("light")
    expect(attrs["data-theme"]).toBe("light")
    expect(style.colorScheme).toBe("light")
  })

  test("falls back when nothing is stored", () => {
    expect(run(null).attrs["data-theme"]).toBe(defaultTheme)
  })

  test("sets colorScheme only for the light and dark names", () => {
    expect(run("dark").style.colorScheme).toBe("dark")
  })

  test("leaves the page alone when storage throws", () => {
    expect(run(null, true).attrs["data-theme"]).toBeUndefined()
  })
})
