import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("shipping")

export const metadata: Metadata = policyMetadata(doc)

export default function ShippingPage() {
  return <PolicyPage document={doc} />
}
