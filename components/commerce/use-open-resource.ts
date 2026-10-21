"use client"

import { useMutation } from "convex/react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import type { ViewerPage } from "@/components/commerce/page-viewer"
import { useStalled } from "@/components/ui/use-stalled"
import { api } from "@/convex/_generated/api"
import { track } from "@/lib/analytics"
import { useViewer } from "@/hooks/use-viewer"

const noop = () => () => {}

export type OpenedResource = {
  title: string
  pages: ViewerPage[]
  /** A signed link to the whole PDF, read page by page in the reader. */
  pdfUrl?: string
  pageCount: number
  placeholder: boolean
}

/** Where log-in sends the visitor back to: free notes, in their language, with the reader open. */
export const returnTo = (slug: string, locale: string) =>
  `/login?next=${encodeURIComponent(`${locale === "en" ? "" : `/${locale}`}/resources?open=${slug}`)}`

/**
 * Opening a free resource: signed-in visitors get its pages, everyone else is
 * sent to log in and comes back with it open. `signedIn` is undefined until
 * the session is known, so callers can avoid flashing the wrong action.
 */
export function useOpenResource() {
  const t = useTranslations("Shop")
  const locale = useLocale()
  const router = useRouter()
  const viewer = useViewer()
  const openResource = useMutation(api.catalog.openResource)
  const [busy, setBusy] = useState<string | null>(null)
  const [opened, setOpened] = useState<OpenedResource | null>(null)
  // The session may already be cached on the client (the header asks for it
  // too), so wait for hydration before trusting it, as the server cannot.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

  async function open(slug: string) {
    if (!viewer) {
      router.push(returnTo(slug, locale))
      return
    }
    setBusy(slug)
    try {
      const result = await openResource({ slug })
      if (result.ok) {
        track({ name: "resource_opened", slug })
        const placeholder = result.pages.length === 0 && !result.pdfUrl
        setOpened({
          title: result.title,
          pdfUrl: result.pdfUrl,
          pageCount: result.pageCount,
          placeholder,
          pages: placeholder
            ? Array.from({ length: result.pageCount }, (_, i) => ({
                heading: i === 0 ? result.title : undefined,
              }))
            : result.pages.map((page) => ({ src: page.url })),
        })
      } else if (result.reason === "anonymous") {
        router.push(returnTo(slug, locale))
      } else {
        toast.error(t("gone"))
      }
    } catch {
      toast.error(t("openFailed"))
    } finally {
      setBusy(null)
    }
  }

  // If the session check never answers (the backend unreachable), stop
  // waiting and offer the log-in after a few seconds rather than a dead button.
  const stalled = useStalled(hydrated && viewer === undefined, 3000)
  return {
    signedIn: !hydrated
      ? undefined
      : viewer === undefined
        ? stalled
          ? false
          : undefined
        : !!viewer,
    busy,
    open,
    opened,
    close: () => setOpened(null),
  }
}
