/**
 * Render the generated client materials to PDF.
 *
 * The DOCX and PPTX are the source of truth; the PDFs under `pdf/` are what
 * actually gets emailed to ICT, and they drifted once already - they sat in
 * the repo still promising Clerk, stock counts and Resend email long after the
 * ADRs removed all three, because nothing in the repo produced them and
 * nobody knew how.
 *
 * This converts through LibreOffice, which is the only faithful option: the
 * DOCX carries its own layout, and a second, hand-rolled PDF layout engine
 * would produce a document that disagrees with the one ICT signs.
 *
 * LibreOffice is not a project dependency and is not installed by `bun
 * install`. When it is missing this exits non-zero and says so, rather than
 * leaving stale PDFs in place and reporting success.
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const out = path.join(process.cwd(), "docs", "proposals", "client-materials")
const pdfDir = path.join(out, "pdf")

const CANDIDATES = ["soffice", "libreoffice"]
const converter = CANDIDATES.find(
  (bin) => spawnSync("command", ["-v", bin], { shell: true }).status === 0
)

if (!converter) {
  console.error(
    [
      "No LibreOffice on PATH, so the PDFs cannot be regenerated here.",
      "",
      "  Install one of:  soffice  |  libreoffice",
      "    Debian/Ubuntu:  sudo apt install libreoffice-writer libreoffice-impress",
      "    Arch:           sudo pacman -S libreoffice-fresh",
      "    macOS:          brew install --cask libreoffice",
      "",
      "Until then the PDFs under docs/proposals/client-materials/pdf/ are",
      "whatever was last committed. Check them against the DOCX before",
      "sending anything to ICT - do not assume they match.",
    ].join("\n")
  )
  process.exit(1)
}

const sources = fs
  .readdirSync(out)
  .filter((f) => f.endsWith(".docx") || f.endsWith(".pptx"))

if (sources.length === 0) {
  console.error("No .docx or .pptx found. Run `bun run materials:docs` first.")
  process.exit(1)
}

fs.mkdirSync(pdfDir, { recursive: true })

let failed = 0
for (const file of sources) {
  const result = spawnSync(
    converter,
    [
      "--headless",
      "--convert-to",
      "pdf",
      "--outdir",
      pdfDir,
      path.join(out, file),
    ],
    { stdio: "inherit" }
  )
  if (result.status !== 0) {
    console.error(`  ! failed to convert ${file}`)
    failed++
    continue
  }
  console.log(`  converted ${file}`)
}

if (failed > 0) {
  console.error(`${failed} document(s) failed to convert; PDFs may be stale.`)
  process.exit(1)
}

console.log(`\n${sources.length} PDF(s) written to ${pdfDir}`)
