"use client"

import {
  IconArrowLeft,
  IconArrowRight,
  IconFileImport,
  IconFileTypePdf,
  IconPhoto,
  IconPhotoPlus,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react"
import { useUploadFile } from "@convex-dev/r2/react"
import { useMutation, useQuery } from "convex/react"
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

/** A record's image as the admin queries return it. */
export const toStored = (image: {
  id: Id<"_storage">
  picture: { url: string }
}): StoredImage => ({ id: image.id, url: image.picture.url })

/**
 * Width, height and a few-hundred-byte placeholder, measured in the browser
 * so public pages can reserve space and blur in. Null if it cannot decode.
 */
async function measure(file: File) {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = 16 / Math.max(bitmap.width, bitmap.height)
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return { ...size, blurDataUrl: canvas.toDataURL("image/webp", 0.6) }
  } catch {
    return null
  }
}

export const CATALOG_REFUSALS: Record<string, string> = {
  anonymous: "Your session has ended. Log in again; your changes are kept.",
  forbidden:
    "Your account cannot change the catalogue. Ask the owner for access.",
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
  const recordImage = useMutation(api.images.recordImage)
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
      const size = await measure(file)
      // Best effort: a missing size only costs the placeholder, not the image.
      if (size) void recordImage({ storageId, ...size }).catch(() => {})
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
  const pdfInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(0)
  const [rendering, setRendering] = useState(false)
  const id = useId()
  const room = max - value.length

  async function uploadFiles(files: File[]) {
    setPending(files.length)
    onBusyChange(true)
    const added: StoredImage[] = []
    for (const file of files) {
      const stored = await upload(file)
      if (stored) added.push(stored)
      setPending((n) => n - 1)
    }
    onBusyChange(false)
    onChange([...value, ...added])
  }

  async function pick(list: FileList | null) {
    const files = [...(list ?? [])].sort(byName)
    if (!files.length) return
    if (files.length > room)
      toast.error(`Only ${max} pages fit. The first ${room} were added.`)
    await uploadFiles(files.slice(0, room))
  }

  /** A PDF becomes page images in the browser; only the images are stored. */
  async function pickPdf(file: File | undefined) {
    if (!file) return
    if (file.type !== "application/pdf") {
      toast.error(`${file.name} is not a PDF.`)
      return
    }
    setRendering(true)
    onBusyChange(true)
    try {
      const { renderPdfPages } = await import("@/lib/pdf-pages")
      const pages = await renderPdfPages(file, room)
      if (!pages.length) {
        toast.error("That PDF has no pages.")
        return
      }
      setRendering(false)
      toast.success(
        `${pages.length} page${pages.length === 1 ? "" : "s"} rendered - uploading.`
      )
      await uploadFiles(pages)
      return
    } catch {
      toast.error(
        "Could not read that PDF. Export the pages as images instead."
      )
    } finally {
      setRendering(false)
      onBusyChange(false)
    }
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending > 0 || rendering || room <= 0}
          aria-describedby={id}
          onClick={() => input.current?.click()}
        >
          <IconPhotoPlus stroke={1.75} aria-hidden />
          Add pages
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending > 0 || rendering || room <= 0}
          onClick={() => pdfInput.current?.click()}
        >
          {rendering ? (
            <Spinner />
          ) : (
            <IconFileImport stroke={1.75} aria-hidden />
          )}
          {rendering ? "Reading PDF…" : "Import PDF"}
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
      <input
        ref={pdfInput}
        type="file"
        accept="application/pdf"
        hidden
        aria-label="Import pages from a PDF"
        onChange={(event) => {
          void pickPdf(event.target.files?.[0])
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

/** A PDF in R2, as the editors hold it. */
export type StoredPdf = {
  key: string
  pages: number
  bytes: number
  name: string
}

const megabytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`

/**
 * The document itself, kept whole in R2 and read in the page-curl reader a
 * few pages at a time. Shown only when R2 is configured; otherwise the page
 * images field below does the job by rasterising the PDF in the browser.
 */
export function PdfField({
  value,
  onChange,
  onBusyChange,
}: {
  value: StoredPdf | null
  onChange: (next: StoredPdf | null) => void
  onBusyChange: (busy: boolean) => void
}) {
  const ready = useQuery(api.files.r2Ready)
  const upload = useUploadFile(api.files)
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const id = useId()

  if (ready === false)
    return (
      <p className="rounded-control bg-secondary px-4 py-3 text-sm text-muted-foreground">
        Document storage (R2) is not set up here, so PDFs are turned into page
        images below instead.
      </p>
    )

  async function pick(file: File | undefined) {
    if (!file) return
    if (file.type !== "application/pdf") {
      toast.error(`${file.name} is not a PDF.`)
      return
    }
    if (file.size > PDF_UPLOAD_MAX_BYTES) {
      toast.error(`${file.name} is over 60 MB. Compress it and try again.`)
      return
    }
    onBusyChange(true)
    setProgress(0)
    try {
      const { pdfPageCount } = await import("@/lib/pdf-pages")
      const pages = await pdfPageCount(file)
      const key = await upload(file, {
        onProgress: ({ loaded, total }) =>
          setProgress(total ? Math.round((loaded / total) * 100) : null),
      })
      onChange({ key, pages, bytes: file.size, name: file.name })
      toast.success(`${file.name} uploaded`)
    } catch {
      toast.error(
        `${file.name} did not upload. Check the connection and retry.`
      )
    } finally {
      setProgress(null)
      onBusyChange(false)
    }
  }

  return (
    <div className="grid gap-2">
      <span id={id} className="text-sm font-medium">
        PDF
      </span>
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-control border border-border bg-card p-3">
          <IconFileTypePdf
            stroke={1.5}
            className="size-8 text-destructive"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="tnum text-xs text-muted-foreground">
              {value.pages} pages · {megabytes(value.bytes)}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={progress !== null}
            aria-describedby={id}
            onClick={() => input.current?.click()}
          >
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={progress !== null}
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="justify-self-start"
          disabled={progress !== null || ready === undefined}
          aria-describedby={id}
          onClick={() => input.current?.click()}
        >
          <IconUpload stroke={1.75} aria-hidden />
          Upload PDF
        </Button>
      )}
      {progress !== null ? (
        <div className="grid gap-1" aria-live="polite">
          <div className="h-1.5 overflow-clip rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="tnum text-xs text-muted-foreground">
            Uploading… {progress}%
          </span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Up to 60 MB. Students read it in the page-turning reader, a few pages
          at a time, so long books open fast.
        </p>
      )}
      <input
        ref={input}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(event) => {
          void pick(event.target.files?.[0])
          event.target.value = ""
        }}
      />
    </div>
  )
}

/** The same cap the server checks (convex/files.ts). */
const PDF_UPLOAD_MAX_BYTES = 60 * 1024 * 1024
