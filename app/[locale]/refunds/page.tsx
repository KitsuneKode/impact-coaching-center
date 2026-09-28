import { setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("refunds")

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/refunds">): Promise<Metadata> {
  const { locale } = await params
  return policyMetadata(doc, locale)
}

export default async function RefundsPage({
  params,
}: PageProps<"/[locale]/refunds">) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PolicyPage document={doc} />
}
