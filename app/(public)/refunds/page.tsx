import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("refunds")

export const metadata: Metadata = policyMetadata(doc)

export default function RefundsPage() {
  return <PolicyPage document={doc} />
}
