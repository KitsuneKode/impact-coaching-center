import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("privacy")

export const metadata: Metadata = policyMetadata(doc)

export default function PrivacyPage() {
  return <PolicyPage document={doc} />
}
