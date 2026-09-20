import { readFileSync } from "node:fs"

import { expect, test } from "bun:test"

// AGENTS.md: "Do not use transition-all." Oxlint cannot see inside class
// strings, so this is the only thing enforcing the rule. Add a directory here
// when one starts holding components.
const DIRECTORIES = ["app", "components"]

test("no component uses transition-all", () => {
  const offenders: string[] = []
  for (const dir of DIRECTORIES) {
    for (const file of new Bun.Glob("**/*.tsx").scanSync({ cwd: dir })) {
      const text = readFileSync(`${dir}/${file}`, "utf8")
      if (/\btransition-all\b/.test(text)) offenders.push(`${dir}/${file}`)
    }
  }
  expect(offenders).toEqual([])
})

test("the scan actually reads files, so the guard is not vacuous", () => {
  // A broken glob or cwd would make the test above pass on an empty set.
  let seen = 0
  for (const dir of DIRECTORIES)
    for (const _ of new Bun.Glob("**/*.tsx").scanSync({ cwd: dir })) seen++
  expect(seen).toBeGreaterThan(10)
})
