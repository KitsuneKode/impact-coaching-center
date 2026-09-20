import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyBySlug, policyMetadata } from "@/lib/policies"

const doc = policyBySlug("shipping")!

export const metadata: Metadata = policyMetadata(doc)

export default function ShippingPage() {
  // The document is declared in lib/policies.ts; if it is ever removed, fail
  // as a 404 rather than rendering an empty page.
  if (!doc) notFound()
  return <PolicyPage document={doc} />
}
