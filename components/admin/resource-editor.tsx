"use client"

import { IconArrowUpRight, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { refreshSite } from "@/app/admin/refresh-site"
import { CatalogOnly } from "@/components/admin/book-editor"
import {
  CATALOG_REFUSALS,
  FIELD_LABELS,
  PageImagesField,
  PublishState,
  toStored,
  PdfField,
  type StoredImage,
  type StoredPdf,
} from "@/components/admin/catalog-fields"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  checkResource,
  RESOURCE_KINDS,
  RESOURCE_PAGES_MAX,
  slugify,
  type ResourceKind,
} from "@/lib/catalog"

const KIND_ITEMS = RESOURCE_KINDS.map((value) => ({ value, label: value }))

type Draft = {
  title: string
  slug: string
  exam: string
  kind: ResourceKind
  description: string
  pageImages: StoredImage[]
  pdf: StoredPdf | null
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  exam: "",
  kind: "Notes",
  description: "",
  pageImages: [],
  pdf: null,
}

const snapshot = (draft: Draft) =>
  JSON.stringify({ ...draft, pageImages: draft.pageImages.map((p) => p.id) })

/** Owner-only: create a resource, or edit the one at `id`. */
export function ResourceEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const resource = useQuery(
    api.catalogAdmin.adminResource,
    id ? { id } : "skip"
  )

  if (allowed === undefined || (id && resource === undefined))
    return (
      <Shell title="Resource.">
        <ListSkeleton rows={6} />
      </Shell>
    )
  if (!allowed) return <CatalogOnly />
  if (id && !resource)
    return (
      <Shell title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No resource at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/resources" size="md">
              All resources
            </ButtonLink>
          }
        />
      </Shell>
    )

  if (!resource) return <ResourceForm key="new" initial={EMPTY} />
  return (
    <ResourceForm
      key={resource.id}
      id={resource.id}
      revision={resource.revision}
      published={resource.published}
      initial={{
        title: resource.title,
        slug: resource.slug,
        exam: resource.exam,
        kind: resource.kind,
        description: resource.description,
        pageImages: resource.pageImages.map(toStored),
        pdf: resource.pdf ?? null,
      }}
    />
  )
}

function ResourceForm({
  id,
  initial,
  revision: loadedRevision = 0,
  published = false,
}: {
  id?: Id<"resources">
  initial: Draft
  revision?: number
  published?: boolean
}) {
  const router = useRouter()
  const save = useMutation(api.catalogAdmin.saveResource)
  const setPublished = useMutation(api.catalogAdmin.setResourcePublished)

  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(() => snapshot(initial))
  const [revision, setRevision] = useState(loadedRevision)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(0)
  const [busy, setBusy] = useState(false)

  const dirty = snapshot(draft) !== saved
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === "title" && !slugTouched
        ? { slug: slugify(value as string) }
        : {}),
    }))

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setFormError(null)
    const checked = checkResource({
      slug: draft.slug,
      title: draft.title,
      exam: draft.exam,
      kind: draft.kind,
      description: draft.description,
    })
    if (!checked.ok) {
      setErrors({ [checked.field]: messageFor(checked.field) })
      return
    }

    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        fields: checked.value,
        pageImages: draft.pageImages.map((p) => p.id),
        pdf: draft.pdf,
      })
      if (!result.ok) {
        if (result.reason === "invalid-input" && result.field)
          setErrors({
            [result.field === "slug-taken" ? "slug" : result.field]: messageFor(
              result.field
            ),
          })
        else setFormError(CATALOG_REFUSALS[result.reason] ?? "Not saved.")
        return
      }
      setRevision(result.revision)
      setSaved(snapshot(draft))
      if (!id) {
        toast.success("Saved as a draft")
        router.replace(`/admin/resources/${result.id}`)
      } else toast.success("Saved")
      if (published) void refreshSite("catalog")
    } catch {
      setFormError("Could not reach the server. Your changes are still here.")
    } finally {
      setBusy(false)
    }
  }

  async function onPublish() {
    if (!id) return
    setBusy(true)
    try {
      const result = await setPublished({
        id,
        published: !published,
        expectedRevision: revision,
      })
      if (!result.ok) {
        setFormError(CATALOG_REFUSALS[result.reason] ?? "Not changed.")
        return
      }
      setRevision(result.revision)
      toast.success(published ? "Unpublished" : "Published on /resources")
      void refreshSite("catalog")
    } catch {
      setFormError("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const invalid = (name: string) => (errors[name] ? true : undefined)

  return (
    <Shell title={id ? `${initial.title}.` : "New resource."}>
      <form
        onSubmit={onSave}
        noValidate
        className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <FieldGroup className="max-w-2xl">
          <Field data-invalid={invalid("title")}>
            <FieldLabel htmlFor="resource-title">Title</FieldLabel>
            <Input
              id="resource-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors.title}
              autoComplete="off"
            />
            <FieldError>{errors.title}</FieldError>
          </Field>
          <Field data-invalid={invalid("slug")}>
            <FieldLabel htmlFor="resource-slug">Web address</FieldLabel>
            <Input
              id="resource-slug"
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true)
                set("slug", e.target.value)
              }}
              aria-invalid={!!errors.slug}
              autoComplete="off"
              spellCheck={false}
            />
            {errors.slug ? (
              <FieldError>{errors.slug}</FieldError>
            ) : (
              <FieldDescription>
                Direct link: /resources?open={draft.slug || "your-title"}
              </FieldDescription>
            )}
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={invalid("exam")}>
              <FieldLabel htmlFor="resource-exam">Exam</FieldLabel>
              <Input
                id="resource-exam"
                value={draft.exam}
                onChange={(e) => set("exam", e.target.value)}
                aria-invalid={!!errors.exam}
                autoComplete="off"
              />
              <FieldError>{errors.exam}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="resource-kind">Type</FieldLabel>
              <Select
                value={draft.kind}
                onValueChange={(next) =>
                  next && set("kind", next as ResourceKind)
                }
                items={KIND_ITEMS}
              >
                <SelectTrigger id="resource-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field data-invalid={invalid("description")}>
            <FieldLabel htmlFor="resource-description">Description</FieldLabel>
            <Textarea
              id="resource-description"
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!errors.description}
            />
            {errors.description ? (
              <FieldError>{errors.description}</FieldError>
            ) : (
              <FieldDescription>
                One or two lines on the card. Up to 600 characters.
              </FieldDescription>
            )}
          </Field>
          <div data-invalid={invalid("pdf")} className="grid gap-2">
            <PdfField
              value={draft.pdf}
              onChange={(next) => set("pdf", next)}
              onBusyChange={(on) => setUploading((n) => n + (on ? 1 : -1))}
            />
            <FieldError>{errors.pdf}</FieldError>
          </div>
          <div data-invalid={invalid("pages")} className="grid gap-2">
            <PageImagesField
              label={
                draft.pdf ? "Page images (not needed with a PDF)" : "Pages"
              }
              hint="Every page as an image, in reading order. Export the PDF as images (one per page) and add them all at once; they are sorted by file name."
              max={RESOURCE_PAGES_MAX}
              value={draft.pageImages}
              onChange={(next) => set("pageImages", next)}
              onBusyChange={(on) => setUploading((n) => n + (on ? 1 : -1))}
            />
            <FieldError>{errors.pages}</FieldError>
          </div>
        </FieldGroup>

        <aside className="grid content-start gap-4 rounded-card border border-border p-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Status</span>
            <PublishState published={published} />
          </div>
          <Button
            type="submit"
            size="md"
            disabled={busy || uploading > 0 || (!!id && !dirty)}
          >
            {busy ? <Spinner /> : null}
            {id ? (dirty ? "Save changes" : "Saved") : "Save as draft"}
          </Button>
          {id ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={busy || dirty || uploading > 0}
              onClick={onPublish}
            >
              {published ? "Unpublish" : "Publish"}
            </Button>
          ) : null}
          {formError ? (
            <FieldError>{formError}</FieldError>
          ) : id && dirty ? (
            <p className="text-xs text-muted-foreground">
              Save your changes before publishing.
            </p>
          ) : null}
          {id && published && !dirty ? (
            <Link
              href={`/resources?open=${draft.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
            >
              View on the site
              <IconArrowUpRight stroke={1.75} className="size-4" aria-hidden />
            </Link>
          ) : null}
        </aside>
      </form>
    </Shell>
  )
}

function messageFor(field: string) {
  switch (field) {
    case "slug-taken":
      return "Another resource already uses this address."
    case "slug":
      return "Lowercase letters, numbers and hyphens only."
    case "title":
      return "Give it a title, up to 120 characters."
    case "exam":
      return "Name the exam it is for."
    case "pages":
      return "Add a PDF or the page images before publishing; images must be under 8 MB."
    case "pdf":
      return "That PDF did not finish uploading, or is not a PDF under 60 MB. Upload it again."
    default:
      return `Check the ${FIELD_LABELS[field] ?? field}.`
  }
}

function Shell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">{title}</span>}
    >
      {children}
    </PageShell>
  )
}
