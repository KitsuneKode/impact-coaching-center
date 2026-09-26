"use client"

import { IconFileText, IconLock } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { convexConfigured } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import type { PreviewResource } from "@/lib/preview-catalogue"

function OpenButton({ resource }: { resource: PreviewResource }) {
  const router = useRouter()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const signedIn = !!viewer

  return (
    <Button
      variant={signedIn ? "primary" : "secondary"}
      size="sm"
      onClick={() => {
        if (!signedIn) {
          router.push(`/login?next=${encodeURIComponent("/preview/resources")}`)
          return
        }
        toast(`${resource.title}`, {
          description:
            "The reader opens here once ICT uploads the PDF. See it working in the Kitsu-Lab demo.",
        })
      }}
    >
      {signedIn ? (
        "Open"
      ) : (
        <>
          <IconLock stroke={1.75} />
          Verify to open
        </>
      )}
    </Button>
  )
}

/** A free resource: what it is, how long, and one action to open it. */
export function ResourceCard({ resource }: { resource: PreviewResource }) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-content-center rounded-control bg-secondary">
          <IconFileText stroke={1.5} className="size-5" aria-hidden />
        </span>
        <div className="grid gap-0.5">
          <h3 className="font-medium text-balance">{resource.title}</h3>
          <p className="text-sm text-muted-foreground">
            {resource.kind} · {resource.exam} · {resource.pages} pages
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{resource.description}</p>
      <div className="mt-auto">
        {convexConfigured ? (
          <OpenButton resource={resource} />
        ) : (
          <Button size="sm" variant="secondary" disabled>
            Open
          </Button>
        )}
      </div>
    </article>
  )
}
