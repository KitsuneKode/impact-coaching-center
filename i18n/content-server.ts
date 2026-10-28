import { getTranslations } from "next-intl/server"

import { buildContent } from "./content"

/** `useContent` for async server components, which cannot call hooks. */
export async function contentFor(locale: string) {
  return buildContent(await getTranslations({ locale, namespace: "Content" }))
}
