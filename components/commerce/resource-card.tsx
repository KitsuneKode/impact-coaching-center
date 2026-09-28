"use client"

import { useLocale, useTranslations } from "next-intl"

import { IconArrowRight, IconLock } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { convexConfigured } from "@/app/providers"
import { PageViewer, type ViewerPage } from "@/components/commerce/page-viewer"
import { PaperPage } from "@/components/commerce/paper-page"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { useContent } from "@/i18n/content"
import { track } from "@/lib/analytics"
import type { Resource } from "@/lib/catalog"

type Opened = { title: string; pages: ViewerPage[]; placeholder: boolean }

/** Where log-in sends the visitor back to: this list, in their language, with the reader open. */
const returnTo = (slug: string, locale: string) =>
  `/login?next=${encodeURIComponent(`${locale === "en" ? "" : `/${locale}`}/resources?open=${slug}`)}`

function OpenButton({
  resource,
  autoOpen,
  onOpened,
}: {
  resource: Resource
  autoOpen: boolean
  onOpened: (opened: Opened) => void
}) {
  const t = useTranslations("Shop")
  const locale = useLocale()
  const router = useRouter()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const openResource = useMutation(api.catalog.openResource)
  const [busy, setBusy] = useState(false)
  const signedIn = !!viewer

  async function open() {
    setBusy(true)
    try {
      const result = await openResource({ slug: resource.slug })
      if (result.ok) {
        track({ name: "resource_opened", slug: resource.slug })
        const placeholder = result.pageUrls.length === 0
        onOpened({
          title: result.title,
          placeholder,
          pages: placeholder
            ? Array.from({ length: result.pages }, (_, i) => ({
                heading: i === 0 ? result.title : undefined,
              }))
            : result.pageUrls.map((src) => ({ src })),
        })
      } else if (result.reason === "anonymous") {
        router.push(returnTo(resource.slug, locale))
      } else {
        toast.error(t("gone"))
      }
    } catch {
      toast.error(t("openFailed"))
    } finally {
      setBusy(false)
    }
  }

  // Back from log-in with ?open=<slug>: open it once, then tidy the URL.
  const opened = useRef(false)
  useEffect(() => {
    if (!autoOpen || !signedIn || opened.current) return
    opened.current = true
    router.replace(locale === "en" ? "/resources" : `/${locale}/resources`, {
      scroll: false,
    })
    void open()
  })

  // Until we know, show neither state rather than flashing the wrong one.
  if (viewer === undefined)
    return (
      <Button variant="secondary" size="sm" disabled>
        {t("open")}
      </Button>
    )
  return (
    <Button
      variant={signedIn ? "primary" : "secondary"}
      size="sm"
      disabled={busy}
      aria-label={
        signedIn
          ? t("openTitle", { title: resource.title })
          : t("loginToOpenTitle", { title: resource.title })
      }
      onClick={() =>
        signedIn ? open() : router.push(returnTo(resource.slug, locale))
      }
    >
      {busy ? (
        <>
          <Spinner />
          {t("opening")}
        </>
      ) : signedIn ? (
        <>
          {t("open")}
          <IconArrowRight stroke={1.75} data-nudge aria-hidden />
        </>
      ) : (
        <>
          <IconLock stroke={1.75} aria-hidden />
          {t("loginToOpen")}
        </>
      )}
    </Button>
  )
}

/** A free resource: a stacked-page thumbnail, what it is, and one action. */
export function ResourceCard({
  resource,
  autoOpen = false,
}: {
  resource: Resource
  autoOpen?: boolean
}) {
  const { phrase } = useContent()
  const t = useTranslations("Shop")
  const [opened, setOpened] = useState<Opened | null>(null)
  const [open, setOpen] = useState(false)
  return (
    <article className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-card border border-border bg-card">
      <div className="relative grid place-items-center bg-surface px-10 pt-8 pb-0">
        {/* two sheets behind the first, so it reads as a document */}
        <div className="relative w-[58%]">
          <span
            aria-hidden
            className="absolute inset-0 translate-x-2 -translate-y-1 rotate-[3deg] bg-card ring-1 ring-border"
          />
          <span
            aria-hidden
            className="absolute inset-0 translate-x-1 rotate-[1.5deg] bg-card ring-1 ring-border"
          />
          <PaperPage
            running={phrase(resource.kind)}
            heading={resource.title}
            lines={9}
            compact
            className="relative translate-y-2 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:translate-y-0"
          />
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.6875rem] font-medium">
          {phrase(resource.kind)}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="grid gap-1">
          <h2 className="font-medium text-balance">{resource.title}</h2>
          <p className="tnum text-sm text-muted-foreground">
            {phrase(resource.exam)} · {t("pages", { count: resource.pages })}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{resource.description}</p>
        <div className="mt-auto pt-1">
          {convexConfigured ? (
            <OpenButton
              resource={resource}
              autoOpen={autoOpen}
              onOpened={(next) => {
                setOpened(next)
                setOpen(true)
              }}
            />
          ) : (
            <Button size="sm" variant="secondary" disabled>
              {t("open")}
            </Button>
          )}
        </div>
      </div>

      {opened ? (
        <PageViewer
          open={open}
          onOpenChange={setOpen}
          title={opened.title}
          note={
            opened.placeholder
              ? t("placeholderPages")
              : t("pageCount", { count: opened.pages.length })
          }
          pages={opened.pages}
        />
      ) : null}
    </article>
  )
}
