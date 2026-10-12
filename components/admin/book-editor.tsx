"use client"

import { IconLock, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  CATALOG_REFUSALS,
  ImageField,
  PageImagesField,
  toStored,
  type StoredImage,
} from "@/components/admin/catalog-fields"
import { Button, ButtonLink } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  checkBook,
  LANGUAGES,
  pageCountDraft,
  SAMPLE_PAGES_MAX,
  slugify,
  type BookInput,
  type Language,
} from "@/lib/catalog"

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  as: "Assamese",
}

type EditionDraft = {
  title: string
  subtitle: string
  edition: string
  pages: string
  cover: StoredImage | null
  samplePages: StoredImage[]
}

type Draft = {
  slug: string
  exam: string
  descriptionEn: string
  descriptionAs: string
  contents: string
  editions: Record<Language, EditionDraft | null>
}

const EMPTY_EDITION: EditionDraft = {
  title: "",
  subtitle: "",
  edition: "",
  pages: "",
  cover: null,
  samplePages: [],
}

const EMPTY: Draft = {
  slug: "",
  exam: "",
  descriptionEn: "",
  descriptionAs: "",
  contents: "",
  editions: { en: { ...EMPTY_EDITION }, as: { ...EMPTY_EDITION } },
}

const snapshot = (draft: Draft) =>
  JSON.stringify(draft, (key, value) =>
    key === "url" ? undefined : (value as unknown)
  )

/** Create a book, or edit the one at `id`. */
export function BookEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const book = useQuery(api.catalogAdmin.adminBook, id ? { id } : "skip")

  if (allowed === undefined || (id && book === undefined))
    return (
      <Shell title="Book.">
        <ListSkeleton rows={6} />
      </Shell>
    )
  if (!allowed) return <CatalogOnly />
  if (id && !book)
    return (
      <Shell title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No book at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/books" size="md">
              Back to the shop
            </ButtonLink>
          }
        />
      </Shell>
    )

  if (!book) return <BookForm key="new" initial={EMPTY} />
  const edition = (language: Language): EditionDraft | null => {
    const e = book.editions[language]
    return e
      ? {
          title: e.title,
          subtitle: e.subtitle ?? "",
          edition: e.edition,
          pages: `${e.pages}`,
          cover: e.cover ? toStored(e.cover) : null,
          samplePages: e.samplePages.map(toStored),
        }
      : null
  }
  return (
    <BookForm
      key={book.id}
      id={book.id}
      revision={book.revision}
      initial={{
        slug: book.slug,
        exam: book.exam,
        descriptionEn: book.description?.en ?? "",
        descriptionAs: book.description?.as ?? "",
        contents: book.contents.join("\n"),
        editions: { en: edition("en"), as: edition("as") },
      }}
    />
  )
}

function BookForm({
  id,
  initial,
  revision: loadedRevision = 0,
}: {
  id?: Id<"books">
  initial: Draft
  revision?: number
}) {
  const router = useRouter()
  const save = useMutation(api.catalogAdmin.saveBook)
  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(() => snapshot(initial))
  const [revision, setRevision] = useState(loadedRevision)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [error, setError] = useState<{
    field?: string
    message: string
  } | null>(null)
  const [uploading, setUploading] = useState(0)
  const [busy, setBusy] = useState(false)

  const dirty = snapshot(draft) !== saved
  const onBusyChange = (on: boolean) => setUploading((n) => n + (on ? 1 : -1))
  const setEdition = (language: Language, next: EditionDraft | null) =>
    setDraft((d) => {
      const editions = { ...d.editions, [language]: next }
      const english = language === "en" ? next?.title : undefined
      return {
        ...d,
        editions,
        ...(english !== undefined && !slugTouched
          ? { slug: slugify(english) }
          : {}),
      }
    })

  function fields(): BookInput {
    const editions: BookInput["editions"] = {}
    for (const language of LANGUAGES) {
      const e = draft.editions[language]
      if (!e) continue
      editions[language] = {
        title: e.title,
        subtitle: e.subtitle || undefined,
        edition: e.edition,
        pages: Number(e.pages),
      }
    }
    return {
      slug: draft.slug,
      exam: draft.exam,
      description: draft.descriptionEn
        ? { en: draft.descriptionEn, as: draft.descriptionAs || undefined }
        : undefined,
      contents: draft.contents.split("\n"),
      editions,
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    const checked = checkBook(fields())
    if (!checked.ok) {
      setError({ field: checked.field, message: messageFor(checked.field) })
      return
    }
    const images: Record<
      string,
      { cover?: Id<"_storage">; samplePages: Id<"_storage">[] }
    > = {}
    for (const language of LANGUAGES) {
      const e = draft.editions[language]
      if (e)
        images[language] = {
          cover: e.cover?.id,
          samplePages: e.samplePages.map((p) => p.id),
        }
    }

    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        fields: checked.value,
        images,
      })
      if (!result.ok) {
        setError(
          result.reason === "invalid-input" && result.field
            ? { field: result.field, message: messageFor(result.field) }
            : { message: CATALOG_REFUSALS[result.reason] ?? "Not saved." }
        )
        return
      }
      setRevision(result.revision)
      setSaved(snapshot(draft))
      toast.success("Saved")
      if (!id) router.replace(`/admin/books/${result.id}`)
    } catch {
      setError({
        message: "Could not reach the server. Your changes are still here.",
      })
    } finally {
      setBusy(false)
    }
  }

  const invalid = (field: string) => error?.field === field
  const title =
    initial.editions.en?.title || initial.editions.as?.title || "New book"

  return (
    <Shell title={`${title}.`}>
      <form onSubmit={onSave} noValidate className="grid gap-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <FieldGroup className="max-w-2xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={invalid("exam") || undefined}>
                <FieldLabel htmlFor="book-exam">Exam</FieldLabel>
                <Input
                  id="book-exam"
                  value={draft.exam}
                  onChange={(e) => setDraft({ ...draft, exam: e.target.value })}
                  aria-invalid={invalid("exam")}
                  autoComplete="off"
                />
                <FieldError>
                  {invalid("exam") ? error?.message : null}
                </FieldError>
              </Field>
              <Field
                data-invalid={
                  invalid("slug") || invalid("slug-taken") || undefined
                }
              >
                <FieldLabel htmlFor="book-slug">Short name</FieldLabel>
                <Input
                  id="book-slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setDraft({ ...draft, slug: e.target.value })
                  }}
                  aria-invalid={invalid("slug") || invalid("slug-taken")}
                  autoComplete="off"
                  spellCheck={false}
                />
                {invalid("slug") || invalid("slug-taken") ? (
                  <FieldError>{error?.message}</FieldError>
                ) : (
                  <FieldDescription>
                    Used inside the admin to tell books apart.
                  </FieldDescription>
                )}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="book-desc-en">
                Description, English
              </FieldLabel>
              <Textarea
                id="book-desc-en"
                rows={3}
                value={draft.descriptionEn}
                onChange={(e) =>
                  setDraft({ ...draft, descriptionEn: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="book-desc-as">
                Description, Assamese
              </FieldLabel>
              <Textarea
                id="book-desc-as"
                lang="as"
                rows={3}
                value={draft.descriptionAs}
                onChange={(e) =>
                  setDraft({ ...draft, descriptionAs: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="book-contents">Contents</FieldLabel>
              <Textarea
                id="book-contents"
                rows={5}
                value={draft.contents}
                onChange={(e) =>
                  setDraft({ ...draft, contents: e.target.value })
                }
              />
              <FieldDescription>One chapter per line.</FieldDescription>
            </Field>
          </FieldGroup>

          <aside className="grid content-start gap-4 rounded-card border border-border p-5 lg:sticky lg:top-6">
            <p className="text-sm text-muted-foreground">
              Books are sold inside sets. Add this book to a set to put it on
              the site.
            </p>
            <Button
              type="submit"
              size="md"
              disabled={busy || uploading > 0 || (!!id && !dirty)}
            >
              {busy ? <Spinner /> : null}
              {id ? (dirty ? "Save changes" : "Saved") : "Save book"}
            </Button>
            {error &&
            !error.field?.includes(".") &&
            !["exam", "slug", "slug-taken"].includes(error.field ?? "") ? (
              <FieldError>{error.message}</FieldError>
            ) : null}
          </aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {LANGUAGES.map((language) => (
            <EditionPanel
              key={language}
              language={language}
              value={draft.editions[language]}
              onChange={(next) => setEdition(language, next)}
              onBusyChange={onBusyChange}
              error={
                error?.field?.startsWith(`${language}.`) ? error.message : null
              }
            />
          ))}
        </div>
      </form>
    </Shell>
  )
}

function EditionPanel({
  language,
  value,
  onChange,
  onBusyChange,
  error,
}: {
  language: Language
  value: EditionDraft | null
  onChange: (next: EditionDraft | null) => void
  onBusyChange: (busy: boolean) => void
  error: string | null
}) {
  const name = LANGUAGE_NAMES[language]
  const prefix = `edition-${language}`
  const set = <K extends keyof EditionDraft>(key: K, next: EditionDraft[K]) =>
    value && onChange({ ...value, [key]: next })

  return (
    <section
      lang={language === "as" ? "as" : undefined}
      aria-labelledby={`${prefix}-heading`}
      className="grid content-start gap-6 rounded-card border border-border p-5"
    >
      <label className="flex items-center gap-3">
        <Checkbox
          checked={value !== null}
          onCheckedChange={(checked) =>
            onChange(checked ? { ...EMPTY_EDITION } : null)
          }
        />
        <span id={`${prefix}-heading`} className="font-medium">
          {name} edition
        </span>
      </label>
      {value ? (
        <>
          <Field>
            <FieldLabel htmlFor={`${prefix}-title`}>Title</FieldLabel>
            <Input
              id={`${prefix}-title`}
              value={value.title}
              onChange={(e) => set("title", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${prefix}-subtitle`}>Subtitle</FieldLabel>
            <Input
              id={`${prefix}-subtitle`}
              value={value.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${prefix}-edition`}>Edition</FieldLabel>
              <Input
                id={`${prefix}-edition`}
                value={value.edition}
                onChange={(e) => set("edition", e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}-pages`}>Pages</FieldLabel>
              <Input
                id={`${prefix}-pages`}
                inputMode="numeric"
                value={value.pages}
                onChange={(e) => set("pages", pageCountDraft(e.target.value))}
                autoComplete="off"
              />
            </Field>
          </div>
          {error ? <FieldError>{error}</FieldError> : null}
          <ImageField
            label="Cover"
            hint="A straight-on photo or the print file, portrait."
            value={value.cover}
            onChange={(next) => set("cover", next)}
            onBusyChange={onBusyChange}
          />
          <PageImagesField
            label="Sample pages"
            hint="A few pages in reading order, or import them from the PDF."
            max={SAMPLE_PAGES_MAX}
            value={value.samplePages}
            onChange={(next) => set("samplePages", next)}
            onBusyChange={onBusyChange}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {name} edition. Tick the box to add one.
        </p>
      )}
    </section>
  )
}

function messageFor(field: string) {
  const [language, part] = field.includes(".") ? field.split(".") : ["", field]
  const where = language
    ? `${LANGUAGE_NAMES[language as Language]} edition: `
    : ""
  switch (part) {
    case "slug-taken":
      return "Another book already uses this short name."
    case "slug":
      return "Lowercase letters, numbers and hyphens only."
    case "exam":
      return "Name the exam it is for."
    case "editions":
      return "Add at least one edition, English or Assamese."
    case "title":
      return `${where}give the book a title, up to 120 characters.`
    case "pages":
      return `${where}a whole number of pages.`
    case "images":
    case "samplePages":
      return `${where}images must be under 8 MB, twelve sample pages at most.`
    default:
      return `${where}check the ${part}.`
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

export function CatalogOnly() {
  return (
    <Shell title="No access.">
      <StatePanel
        icon={<IconLock stroke={1.75} />}
        title="Your account cannot edit the shop"
        description="The owner can give staff access from People."
        action={
          <ButtonLink href="/admin" size="md">
            Back to the overview
          </ButtonLink>
        }
      />
    </Shell>
  )
}
