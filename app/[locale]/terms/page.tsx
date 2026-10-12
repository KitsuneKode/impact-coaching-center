import { setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("terms")

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params
  return policyMetadata(doc, locale)
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PolicyPage document={doc} />
}
