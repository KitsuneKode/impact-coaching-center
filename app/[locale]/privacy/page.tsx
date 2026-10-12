import { setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("privacy")

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params
  return policyMetadata(doc, locale)
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PolicyPage document={doc} />
}
