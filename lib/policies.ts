import { readFileSync } from "node:fs"
import { join } from "node:path"

import { alternatesFor, openGraphFor } from "./site"

/** Visitor-facing policy text, loaded from `content/policies/<slug>.md`. */
export type PolicySlug = "privacy" | "terms" | "shipping" | "refunds"

export const POLICY_SLUGS: readonly PolicySlug[] = [
  "privacy",
  "terms",
  "shipping",
  "refunds",
]

export type PolicyDocument = {
  slug: PolicySlug
  title: string
  description: string
  /** ISO date of the last wording change, shown to the visitor. */
  updated: string
  approved: boolean
  /** The Markdown body, markers still in it. */
  body: string
}

export type PolicyMarker = { kind: "proposed" | "fill"; text: string }

const MARKER = /\{\{\s*(proposed|fill)\s*:\s*([^{}]+?)\s*\}\}/g

/** Every marker left in a body, in reading order. */
export function policyMarkers(body: string): PolicyMarker[] {
  return [...body.matchAll(MARKER)].map((match) => ({
    kind: match[1] as PolicyMarker["kind"],
    text: match[2],
  }))
}

/** The body with each marker replaced by its own text, for checks on prose. */
export function withoutMarkers(body: string) {
  return body.replace(MARKER, "")
}

/**
 * The body with markers rewritten as links to `#proposed` / `#fill`, which the
 * renderer turns into labelled highlights.
 */
export function markersAsLinks(body: string) {
  return body.replace(
    MARKER,
    (_, kind: string, text: string) =>
      `[${text.replaceAll("[", "(").replaceAll("]", ")")}](#${kind})`
  )
}

/**
 * The small front-matter subset these files use: `key: value` lines between
 * `---` fences. A YAML parser would accept far more than the four keys this
 * needs, and silently accept a typo in one of them.
 */
export function parsePolicy(slug: PolicySlug, source: string): PolicyDocument {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source)
  if (!match) throw new Error(`${slug}.md has no front matter`)

  const fields = new Map<string, string>()
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const colon = line.indexOf(":")
    if (colon < 1) throw new Error(`${slug}.md: bad front matter "${line}"`)
    fields.set(line.slice(0, colon).trim(), line.slice(colon + 1).trim())
  }

  const known = new Set(["title", "description", "updated", "approved"])
  for (const key of fields.keys())
    if (!known.has(key))
      throw new Error(`${slug}.md: unknown front matter key "${key}"`)

  const title = fields.get("title")
  const description = fields.get("description")
  const updated = fields.get("updated")
  const approved = fields.get("approved")
  if (!title || !description)
    throw new Error(`${slug}.md needs a title and description`)
  if (!updated || !/^\d{4}-\d{2}-\d{2}$/.test(updated))
    throw new Error(`${slug}.md: updated must be YYYY-MM-DD`)
  if (approved !== "true" && approved !== "false")
    throw new Error(`${slug}.md: approved must be true or false`)

  return {
    slug,
    title,
    description,
    updated,
    approved: approved === "true",
    body: match[2].trim(),
  }
}

function load(slug: PolicySlug) {
  const path = join(process.cwd(), "content", "policies", `${slug}.md`)
  return parsePolicy(slug, readFileSync(path, "utf8"))
}

export const policies: readonly PolicyDocument[] = POLICY_SLUGS.map(load)

export const policyBySlug = (slug: string) =>
  policies.find((policy) => policy.slug === slug)

/** The document behind a policy route, or a build failure. */
export function requirePolicy(slug: PolicySlug): PolicyDocument {
  const doc = policyBySlug(slug)
  if (!doc) throw new Error(`No policy document declared for "${slug}"`)
  return doc
}

/** Metadata for one policy route. */
export function policyMetadata(doc: PolicyDocument, locale = "en") {
  return {
    title: doc.title,
    description: doc.description,
    alternates: alternatesFor(`/${doc.slug}`, locale),
    openGraph: openGraphFor(`/${doc.slug}`, doc.title, doc.description, locale),
    ...(doc.approved ? {} : { robots: { index: false, follow: true } }),
  }
}
