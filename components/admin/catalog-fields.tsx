"use client"

import {
  IconArrowLeft,
  IconArrowRight,
  IconPhoto,
  IconPhotoPlus,
  IconTrash,
} from "@tabler/icons-react"
import { useMutation } from "convex/react"
import Image from "next/image"
import { useId, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { IMAGE_MAX_BYTES } from "@/lib/catalog"
import { cn } from "@/lib/utils"

/** An image held by a record: stored in Convex, plus something to show. */
export type StoredImage = { id: Id<"_storage">; url: string | null }

export const CATALOG_REFUSALS: Record<string, string> = {
  anonymous: "Your session has ended. Log in again; your changes are kept.",
  forbidden: "Only an owner can change books and resources.",
  "missing-record": "This record no longer exists.",
  "revision-conflict":
    "This was changed in another tab. Reload to see that version, then make your change again.",
}

/** Names from the server's invalid-input refusals, as the form labels them. */
export const FIELD_LABELS: Record<string, string> = {
  slug: "web address",
  title: "title",
  subtitle: "subtitle",
  exam: "exam",
  edition: "edition",
  pages: "pages",
  price: "price",
  description: "description",
  contents: "contents",
  cover: "cover",
  "sample pages": "sample pages",
  kind: "type",
}

/** Uploads one image to Convex storage and returns its id. */
export function useImageUpload() {
  const uploadUrl = useMutation(api.catalogAdmin.uploadUrl)
  return async (file: File): Promise<StoredImage | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name} is not an image.`)
      return null
    }
    if (file.size > IMAGE_MAX_BYTES) {
      toast.error(`${file.name} is over 8 MB. Export it smaller and try again.`)
      return null
    }
    try {
      const target = await uploadUrl({})
      if (!target.ok) {
        toast.error(CATALOG_REFUSALS[target.reason] ?? "Upload refused.")
        return null
      }
      const response = await fetch(target.url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">
      }
      return { id: storageId, url: URL.createObjectURL(file) }
    } catch {
      toast.error(
        `${file.name} did not upload. Check the connection and retry.`
      )
      return null
    }
  }
}

/**
 * Take back an image uploaded this session. A blob: URL means it was uploaded
 * here and no saved record points at it yet, so the file and the preview are
 * both safe to drop. Best-effort: a failure leaves an orphan, not an error.
 */
export function useReleaseUpload() {
  const discard = useMutation(api.catalogAdmin.discardUpload)
  return (image: StoredImage | null | undefined) => {
    if (!image?.url?.startsWith("blob:")) return
    URL.revokeObjectURL(image.url)
    void discard({ storageId: image.id }).catch(() => {})
  }
}

/** Natural order, so page-2 comes before page-10. */
const byName = (a: File, b: File) =>
  a.name.localeCompare(b.name, undefined, { numeric: true })

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src)
    return (
      <span className="grid size-full place-items-center bg-secondary text-muted-foreground">
        <IconPhoto stroke={1.5} className="size-5" aria-hidden />
      </span>
    )
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="160px"
      unoptimized={src.startsWith("blob:")}
      className="object-cover"
    />
  )
}

/** One image, such as a cover: upload, replace or remove. */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  onBusyChange,
}: {
  label: string
  hint: string
  value: StoredImage | null
  onChange: (next: StoredImage | null) => void
  onBusyChange: (busy: boolean) => void
}) {
  const upload = useImageUpload()
  const release = useReleaseUpload()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const id = useId()

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    onBusyChange(true)
    const stored = await upload(file)
    setBusy(false)
    onBusyChange(false)
    if (stored) {
      release(value)
      onChange(stored)
    }
  }

  return (
    <div className="grid gap-2">
      <span id={id} className="text-sm font-medium">
        {label}
      </span>
      <div className="flex items-start gap-4">
        <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-border">
          <Thumb src={value?.url ?? null} alt={value ? label : ""} />
          {busy ? (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <Spinner />
            </span>
          ) : null}
        </div>
        <div className="grid gap-2">
          <p className="text-xs text-muted-foreground">{hint}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              aria-describedby={id}
              onClick={() => input.current?.click()}
            >
              <IconPhotoPlus stroke={1.75} aria-hidden />
              {value ? "Replace" : "Upload"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => {
                  release(value)
                  onChange(null)
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        aria-labelledby={id}
        onChange={(event) => {
          void pick(event.target.files?.[0])
          event.target.value = ""
        }}
      />
    </div>
  )
}

/** Ordered page images: add several at once, reorder, remove. */
export function PageImagesField({
  label,
  hint,
  max,
  value,
  onChange,
  onBusyChange,
}: {
  label: string
  hint: string
  max: number
  value: StoredImage[]
  onChange: (next: StoredImage[]) => void
  onBusyChange: (busy: boolean) => void
}) {
  const upload = useImageUpload()
  const release = useReleaseUpload()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(0)
  const id = useId()
  const room = max - value.length

  async function pick(list: FileList | null) {
    const files = [...(list ?? [])].sort(byName)
    if (!files.length) return
    if (files.length > room)
      toast.error(`Only ${max} pages fit. The first ${room} were added.`)
    const chosen = files.slice(0, room)
    setPending(chosen.length)
    onBusyChange(true)
    const added: StoredImage[] = []
    for (const file of chosen) {
      const stored = await upload(file)
      if (stored) added.push(stored)
      setPending((n) => n - 1)
    }
    onBusyChange(false)
    onChange([...value, ...added])
  }

  const move = (from: number, to: number) => {
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span id={id} className="text-sm font-medium">
          {label}
        </span>
        <span className="tnum text-xs text-muted-foreground">
          {value.length} of {max}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {value.length || pending ? (
        <ol className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3">
          {value.map((image, i) => (
            <li key={image.id} className="grid gap-1.5">
              <div className="relative aspect-[1/1.414] overflow-hidden rounded-[2px] ring-1 ring-border">
                <Thumb src={image.url} alt={`Page ${i + 1}`} />
                <Badge
                  variant="solid"
                  className="absolute top-1.5 left-1.5 px-1.5 py-0.5"
                >
                  {i + 1}
                </Badge>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move page ${i + 1} earlier`}
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  <IconArrowLeft stroke={1.75} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove page ${i + 1}`}
                  onClick={() => {
                    release(image)
                    onChange(value.filter((_, j) => j !== i))
                  }}
                >
                  <IconTrash stroke={1.75} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move page ${i + 1} later`}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <IconArrowRight stroke={1.75} />
                </Button>
              </div>
            </li>
          ))}
          {Array.from({ length: pending }, (_, i) => (
            <li
              key={`pending-${i}`}
              className="grid aspect-[1/1.414] place-items-center rounded-[2px] bg-secondary ring-1 ring-border"
            >
              <Spinner />
            </li>
          ))}
        </ol>
      ) : null}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending > 0 || room <= 0}
          aria-describedby={id}
          onClick={() => input.current?.click()}
        >
          <IconPhotoPlus stroke={1.75} aria-hidden />
          Add pages
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-labelledby={id}
        onChange={(event) => {
          void pick(event.target.files)
          event.target.value = ""
        }}
      />
    </div>
  )
}

/** Published or draft, in words and weight rather than colour alone. */
export function PublishState({
  published,
  sample,
}: {
  published: boolean
  sample?: boolean
}) {
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      <Badge variant={published ? "solid" : "neutral"} className="gap-1.5">
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            published ? "bg-foreground" : "border border-muted-foreground"
          )}
        />
        {published ? "Published" : "Draft"}
      </Badge>
      {sample ? <Badge>Sample</Badge> : null}
    </span>
  )
}
