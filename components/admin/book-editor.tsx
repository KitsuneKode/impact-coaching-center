"use client"

import { IconArrowUpRight, IconLock, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  CATALOG_REFUSALS,
  FIELD_LABELS,
  ImageField,
  PageImagesField,
  PublishState,
  type StoredImage,
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
  BOOK_TONES,
  checkBook,
  rupeesToPaise,
  SAMPLE_PAGES_MAX,
  slugify,
  type BookTone,
} from "@/lib/catalog"

const TONE_LABELS: Record<BookTone, string> = {
  primary: "Ink",
  highlight: "Amber",
  muted: "Paper",
}
const TONE_ITEMS = BOOK_TONES.map((value) => ({
  value,
  label: TONE_LABELS[value],
}))

type Draft = {
  title: string
  slug: string
  subtitle: string
  exam: string
  edition: string
  pages: string
  price: string
  tone: BookTone
  description: string
  contents: string
  cover: StoredImage | null
  samplePages: StoredImage[]
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  subtitle: "",
  exam: "",
  edition: "",
  pages: "",
  price: "",
  tone: "primary",
  description: "",
  contents: "",
  cover: null,
  samplePages: [],
}

/** What a save compares against to know whether anything changed. */
const snapshot = (draft: Draft) =>
  JSON.stringify({
    ...draft,
    cover: draft.cover?.id ?? null,
    samplePages: draft.samplePages.map((p) => p.id),
  })

/** Owner-only: create a book, or edit the one at `id`. */
export function BookEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const book = useQuery(api.catalogAdmin.adminBook, id ? { id } : "skip")

  if (allowed === undefined || (id && book === undefined))
    return (
      <Shell title="Book.">
        <ListSkeleton rows={6} />
      </Shell>
    )
  if (!allowed) return <OwnerOnly />
  if (id && !book)
    return (
      <Shell title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No book at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/books" size="md">
              All books
            </ButtonLink>
          }
        />
      </Shell>
    )

  if (!book) return <BookForm key="new" initial={EMPTY} />
  return (
    <BookForm
      key={book.id}
      id={book.id}
      revision={book.revision}
      published={book.published}
      initial={{
        title: book.title,
        slug: book.slug,
        subtitle: book.subtitle,
        exam: book.exam,
        edition: book.edition,
        pages: `${book.pages}`,
        price: `${book.pricePaise / 100}`,
        tone: book.tone,
        description: book.description,
        contents: book.contents.join("\n"),
        cover: book.cover,
        samplePages: book.samplePages,
      }}
    />
  )
}

function BookForm({
  id,
  initial,
  revision: loadedRevision = 0,
  published = false,
}: {
  id?: Id<"books">
  initial: Draft
  revision?: number
  published?: boolean
}) {
  const router = useRouter()
  const save = useMutation(api.catalogAdmin.saveBook)
  const setPublished = useMutation(api.catalogAdmin.setBookPublished)

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
  const onBusyChange = (on: boolean) => setUploading((n) => n + (on ? 1 : -1))

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setFormError(null)

    const pricePaise = rupeesToPaise(draft.price)
    const fields = {
      slug: draft.slug,
      title: draft.title,
      subtitle: draft.subtitle,
      exam: draft.exam,
      edition: draft.edition,
      pages: Number(draft.pages),
      pricePaise: pricePaise ?? -1,
      tone: draft.tone,
      description: draft.description,
      contents: draft.contents.split("\n"),
    }
    const checked = checkBook(fields)
    if (!checked.ok) {
      setErrors({ [checked.field]: messageFor(checked.field) })
      return
    }

    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        fields: checked.value,
        cover: draft.cover?.id ?? null,
        samplePages: draft.samplePages.map((p) => p.id),
      })
      if (!result.ok) {
        if (result.reason === "invalid-input" && result.field) {
          const key = fieldOf(result.field)
          if (key === "cover" || key === "sample pages")
            setFormError(messageFor(key))
          else setErrors({ [key]: messageFor(result.field) })
        } else setFormError(CATALOG_REFUSALS[result.reason] ?? "Not saved.")
        return
      }
      setRevision(result.revision)
      setSaved(snapshot(draft))
      if (!id) {
        toast.success("Saved as a draft")
        router.replace(`/admin/books/${result.id}`)
      } else toast.success("Saved")
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
      toast.success(published ? "Unpublished" : "Published on /books")
    } catch {
      setFormError("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const fieldProps = (name: string) => ({
    "data-invalid": errors[name] ? true : undefined,
  })

  return (
    <Shell title={id ? `${initial.title}.` : "New book."}>
      <form
        onSubmit={onSave}
        noValidate
        className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <FieldGroup className="max-w-2xl">
          <Field {...fieldProps("title")}>
            <FieldLabel htmlFor="book-title">Title</FieldLabel>
            <Input
              id="book-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors.title}
              autoComplete="off"
            />
            <FieldError>{errors.title}</FieldError>
          </Field>
          <Field {...fieldProps("slug")}>
            <FieldLabel htmlFor="book-slug">Web address</FieldLabel>
            <Input
              id="book-slug"
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
                /books/{draft.slug || "…"}. Changing it breaks links already
                shared.
              </FieldDescription>
            )}
          </Field>
          <Field {...fieldProps("subtitle")}>
            <FieldLabel htmlFor="book-subtitle">Subtitle</FieldLabel>
            <Input
              id="book-subtitle"
              value={draft.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              aria-invalid={!!errors.subtitle}
              autoComplete="off"
            />
            <FieldError>{errors.subtitle}</FieldError>
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field {...fieldProps("exam")}>
              <FieldLabel htmlFor="book-exam">Exam</FieldLabel>
              <Input
                id="book-exam"
                value={draft.exam}
                onChange={(e) => set("exam", e.target.value)}
                aria-invalid={!!errors.exam}
                autoComplete="off"
              />
              {errors.exam ? (
                <FieldError>{errors.exam}</FieldError>
              ) : (
                <FieldDescription>
                  Books filter by this on /books.
                </FieldDescription>
              )}
            </Field>
            <Field {...fieldProps("edition")}>
              <FieldLabel htmlFor="book-edition">Edition</FieldLabel>
              <Input
                id="book-edition"
                value={draft.edition}
                onChange={(e) => set("edition", e.target.value)}
                aria-invalid={!!errors.edition}
                autoComplete="off"
              />
              <FieldError>{errors.edition}</FieldError>
            </Field>
            <Field {...fieldProps("price")}>
              <FieldLabel htmlFor="book-price">Price (₹)</FieldLabel>
              <Input
                id="book-price"
                inputMode="decimal"
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
                aria-invalid={!!errors.price}
                autoComplete="off"
              />
              <FieldError>{errors.price}</FieldError>
            </Field>
            <Field {...fieldProps("pages")}>
              <FieldLabel htmlFor="book-pages">Pages</FieldLabel>
              <Input
                id="book-pages"
                inputMode="numeric"
                value={draft.pages}
                onChange={(e) => set("pages", e.target.value)}
                aria-invalid={!!errors.pages}
                autoComplete="off"
              />
              <FieldError>{errors.pages}</FieldError>
            </Field>
          </div>
          <Field {...fieldProps("description")}>
            <FieldLabel htmlFor="book-description">Description</FieldLabel>
            <Textarea
              id="book-description"
              rows={5}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!errors.description}
            />
            <FieldError>{errors.description}</FieldError>
          </Field>
          <Field {...fieldProps("contents")}>
            <FieldLabel htmlFor="book-contents">Contents</FieldLabel>
            <Textarea
              id="book-contents"
              rows={6}
              value={draft.contents}
              onChange={(e) => set("contents", e.target.value)}
              aria-invalid={!!errors.contents}
            />
            {errors.contents ? (
              <FieldError>{errors.contents}</FieldError>
            ) : (
              <FieldDescription>One chapter per line.</FieldDescription>
            )}
          </Field>
          <PageImagesField
            label="Sample pages"
            hint="Photos or scans of a few pages, in reading order. Files are sorted by name as they are added."
            max={SAMPLE_PAGES_MAX}
            value={draft.samplePages}
            onChange={(next) => set("samplePages", next)}
            onBusyChange={onBusyChange}
          />
        </FieldGroup>

        <aside className="grid content-start gap-6 lg:sticky lg:top-6">
          <div className="grid gap-4 rounded-card border border-border p-5">
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
                href={`/books/${draft.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                View on the site
                <IconArrowUpRight
                  stroke={1.75}
                  className="size-4"
                  aria-hidden
                />
              </Link>
            ) : null}
          </div>

          <ImageField
            label="Cover"
            hint="A straight-on photo or the print file, portrait. Without one, a typeset cover is shown."
            value={draft.cover}
            onChange={(next) => set("cover", next)}
            onBusyChange={onBusyChange}
          />
          <Field>
            <FieldLabel htmlFor="book-tone">Typeset cover colour</FieldLabel>
            <Select
              value={draft.tone}
              onValueChange={(next) => next && set("tone", next as BookTone)}
              items={TONE_ITEMS}
            >
              <SelectTrigger id="book-tone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </aside>
      </form>
    </Shell>
  )
}

/** The server's field names, mapped onto this form's inputs. */
function fieldOf(field: string) {
  return field === "slug-taken" ? "slug" : field
}

function messageFor(field: string) {
  switch (field) {
    case "slug-taken":
      return "Another book already uses this address."
    case "slug":
      return "Lowercase letters, numbers and hyphens only."
    case "title":
      return "Give the book a title, up to 120 characters."
    case "exam":
      return "Name the exam it is for."
    case "pages":
      return "A whole number of pages."
    case "price":
      return "A price in rupees, like 349."
    case "cover":
      return "The cover must be an image under 8 MB."
    case "sample pages":
      return "Sample pages must be images under 8 MB, twelve at most."
    default:
      return `Check the ${FIELD_LABELS[field] ?? field}.`
  }
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">{title}</span>}
    >
      {children}
    </PageShell>
  )
}

export function OwnerOnly() {
  return (
    <Shell title="Owner only.">
      <StatePanel
        icon={<IconLock stroke={1.75} />}
        title="Only an owner can edit books and resources"
        description="If you are the owner, log in with your own number."
        action={
          <ButtonLink href="/admin" size="md">
            Back to the overview
          </ButtonLink>
        }
      />
    </Shell>
  )
}
