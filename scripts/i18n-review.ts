/**
 * Writes docs/i18n/assamese-review.md: every English string beside its
 * Assamese draft, for ICT to check and correct. Re-run after editing either
 * messages file:  bun scripts/i18n-review.ts
 */
import { mkdir, writeFile } from "node:fs/promises"

import as from "../messages/as.json"
import en from "../messages/en.json"
import { faculty, faqs, included, joining, place, proof } from "../lib/brand"
import { exams, type Text } from "../lib/exams"

type Tree = { [key: string]: unknown }

function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string") out.set(path, value)
    else if (value && typeof value === "object")
      for (const [k, v] of flatten(value as Tree, path)) out.set(k, v)
  }
  return out
}

/** The English for the Content lists lives in lib/brand.ts, not en.json. */
const contentEnglish: Tree = {
  Content: {
    faqs: faqs.map((f) => ({ q: f.q, a: f.a })),
    included: included.map((i) => i.text),
    joining: joining.map((j) => ({ verb: j.verb, body: j.body })),
    proof: proof.map((p) => p.label),
    faculty: Object.fromEntries(faculty.map((f) => [f.slug, f.teaches])),
    place: place.spoken,
  },
}

/** Exam guides keep both languages side by side in lib/exams.ts. */
function examText(value: unknown, path: string, out: [string, Text][]) {
  if (!value || typeof value !== "object") return
  if ("en" in value && "as" in value) {
    out.push([path, value as Text])
    return
  }
  for (const [key, child] of Object.entries(value))
    examText(child, `${path}.${key}`, out)
}
const examPairs: [string, Text][] = []
for (const exam of exams) examText(exam, `lib/exams.${exam.slug}`, examPairs)

const english = new Map([
  ...flatten(en as Tree),
  ...flatten(contentEnglish),
  ...examPairs.map(([key, text]) => [key, text.en] as const),
])
const assamese = new Map([
  ...flatten(as as Tree),
  ...examPairs.map(([key, text]) => [key, text.as] as const),
])
const cell = (text: string) => text.replaceAll("|", "\\|").replaceAll("\n", " ")

const rows = [...english].map(([key, text]) => {
  const draft = assamese.get(key)
  const status = draft ? "Draft, to check" : "Missing, shows English"
  return `| \`${key}\` | ${cell(text)} | ${draft ? cell(draft) : ""} | ${status} |`
})
const missing = rows.filter((row) => row.endsWith("shows English |")).length

const doc = `# Assamese copy for ICT to review

Every English string on the public site beside the Assamese draft. Please
correct the Assamese column directly, or send corrections by key. Anything
marked missing shows in English until it is translated. Keys starting
\`lib/exams\` are the exam guides, checked against the official notices.

Names, prices, phone numbers, serials and the students' own quotes are not
translated. Digits stay Latin (1, 2, 3) to match ICT's posters.

${english.size} strings, ${english.size - missing} drafted, ${missing} missing.

| Key | English | Assamese | Status |
| --- | --- | --- | --- |
${rows.join("\n")}
`

await mkdir("docs/i18n", { recursive: true })
await writeFile("docs/i18n/assamese-review.md", doc)
console.log(
  `docs/i18n/assamese-review.md: ${english.size} strings, ${missing} missing`
)
