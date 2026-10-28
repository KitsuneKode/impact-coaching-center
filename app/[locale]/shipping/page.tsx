import { setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"

import { PolicyPage } from "@/components/marketing/policy-page"
import { policyMetadata, requirePolicy } from "@/lib/policies"

const doc = requirePolicy("shipping")

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/shipping">): Promise<Metadata> {
  const { locale } = await params
  return policyMetadata(doc, locale)
}

export default async function ShippingPage({
  params,
}: PageProps<"/[locale]/shipping">) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PolicyPage document={doc} />
}
