"use client"

import { IconArrowRight, IconLock } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { convexConfigured } from "@/app/providers"
import { PageViewer } from "@/components/commerce/page-viewer"
import { PaperPage } from "@/components/commerce/paper-page"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import type { PreviewResource } from "@/lib/preview-catalogue"

function pagesOf(resource: PreviewResource) {
  return Array.from({ length: Math.min(resource.pages, 6) }, (_, i) => ({
    heading: i === 0 ? resource.title : undefined,
  }))
}

function OpenButton({
  resource,
  onOpen,
}: {
  resource: PreviewResource
  onOpen: () => void
}) {
  const router = useRouter()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const signedIn = !!viewer
  // Until we know, show neither state rather than flashing the wrong one.
  if (viewer === undefined)
    return (
      <Button variant="secondary" size="sm" disabled>
        Open
      </Button>
    )
  return (
    <Button
      variant={signedIn ? "primary" : "secondary"}
      size="sm"
      aria-label={
        signedIn ? `Open ${resource.title}` : `Verify to open ${resource.title}`
      }
      onClick={() =>
        signedIn
          ? onOpen()
          : router.push(
              `/login?next=${encodeURIComponent("/preview/resources")}`
            )
      }
    >
      {signedIn ? (
        <>
          Open
          <IconArrowRight stroke={1.75} data-nudge aria-hidden />
        </>
      ) : (
        <>
          <IconLock stroke={1.75} aria-hidden />
          Verify to open
        </>
      )}
    </Button>
  )
}

/** A free resource: a stacked-page thumbnail, what it is, and one action. */
export function ResourceCard({ resource }: { resource: PreviewResource }) {
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
            running={resource.kind}
            heading={resource.title}
            lines={9}
            compact
            className="relative translate-y-2 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:translate-y-0"
          />
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.6875rem] font-medium">
          {resource.kind}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="grid gap-1">
          <h2 className="font-medium text-balance">{resource.title}</h2>
          <p className="tnum text-sm text-muted-foreground">
            {resource.exam} · {resource.pages} pages · PDF
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{resource.description}</p>
        <div className="mt-auto pt-1">
          {convexConfigured ? (
            <OpenButton resource={resource} onOpen={() => setOpen(true)} />
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Open
            </Button>
          )}
        </div>
      </div>

      <PageViewer
        open={open}
        onOpenChange={setOpen}
        title={resource.title}
        note="A sample of the reader. ICT's PDF pages appear here, readable on any phone."
        pages={pagesOf(resource)}
      />
    </article>
  )
}
