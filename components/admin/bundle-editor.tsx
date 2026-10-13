"use client"

import {
  IconArrowDown,
  IconArrowUp,
  IconArrowUpRight,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { refreshSite } from "@/app/admin/refresh-site"
import { CatalogOnly, LANGUAGE_NAMES } from "@/components/admin/book-editor"
import {
  CATALOG_REFUSALS,
  ImageField,
  PublishState,
  toStored,
  type StoredImage,
} from "@/components/admin/catalog-fields"
import { BookCover } from "@/components/commerce/book-cover"
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
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  BUNDLE_BOOKS_MAX,
  checkBundle,
  LANGUAGES,
  rupeeDraft,
  rupeesToPaise,
  slugify,
  type BundleInput,
  type Language,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

type VariantDraft = { price: string; compare: string; available: boolean }

type Draft = {
  slug: string
  exam: string
  titleEn: string
  titleAs: string
  taglineEn: string
  taglineAs: string
  descriptionEn: string
  descriptionAs: string
  sortOrder: string
  cover: StoredImage | null
  bookIds: Id<"books">[]
  variants: Record<Language, VariantDraft>
}

const EMPTY: Draft = {
  slug: "",
  exam: "",
  titleEn: "",
  titleAs: "",
  taglineEn: "",
  taglineAs: "",
  descriptionEn: "",
  descriptionAs: "",
  sortOrder: "1",
  cover: null,
  bookIds: [],
  variants: {
    en: { price: "", compare: "", available: true },
    as: { price: "", compare: "", available: true },
  },
}

const snapshot = (draft: Draft) =>
  JSON.stringify({ ...draft, cover: draft.cover?.id ?? null })

const rupees = (paise?: number) => (paise === undefined ? "" : `${paise / 100}`)

/** Create a set, or edit the one at `id`. */
export function BundleEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const bundle = useQuery(api.catalogAdmin.adminBundle, id ? { id } : "skip")

  if (allowed === undefined || (id && bundle === undefined))
    return (
      <PageShell density="working" title="Set.">
        <ListSkeleton rows={6} />
      </PageShell>
    )
  if (!allowed) return <CatalogOnly />
  if (id && !bundle)
    return (
      <PageShell density="working" title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No set at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/books" size="md">
              Back to the shop
            </ButtonLink>
          }
        />
      </PageShell>
    )
  if (!bundle) return <BundleForm key="new" initial={EMPTY} />

  const variant = (language: Language): VariantDraft => ({
    price: rupees(bundle.variants[language].pricePaise),
    compare: rupees(bundle.variants[language].comparePaise),
    available: bundle.variants[language].available,
  })
  return (
    <BundleForm
      key={bundle.id}
      id={bundle.id}
      revision={bundle.revision}
      published={bundle.published}
      soldCount={bundle.soldCount}
      initial={{
        slug: bundle.slug,
        exam: bundle.exam,
        titleEn: bundle.title.en,
        titleAs: bundle.title.as ?? "",
        taglineEn: bundle.tagline?.en ?? "",
        taglineAs: bundle.tagline?.as ?? "",
        descriptionEn: bundle.description.en,
        descriptionAs: bundle.description.as ?? "",
        sortOrder: `${bundle.sortOrder}`,
        cover: bundle.cover ? toStored(bundle.cover) : null,
        bookIds: bundle.bookIds,
        variants: { en: variant("en"), as: variant("as") },
      }}
    />
  )
}

function BundleForm({
  id,
  initial,
  revision: loadedRevision = 0,
  published = false,
  soldCount = 0,
}: {
  id?: Id<"bundles">
  initial: Draft
  revision?: number
  published?: boolean
  soldCount?: number
}) {
  const router = useRouter()
  const books = useQuery(api.catalogAdmin.adminBooks)
  const save = useMutation(api.catalogAdmin.saveBundle)
  const setPublished = useMutation(api.catalogAdmin.setBundlePublished)
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
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === "titleEn" && !slugTouched
        ? { slug: slugify(value as string) }
        : {}),
    }))
  const setVariant = (language: Language, next: Partial<VariantDraft>) =>
    setDraft((d) => ({
      ...d,
      variants: {
        ...d.variants,
        [language]: { ...d.variants[language], ...next },
      },
    }))

  function fields(): BundleInput {
    const variant = (language: Language) => {
      const v = draft.variants[language]
      const compare = v.compare ? rupeesToPaise(v.compare) : null
      return {
        pricePaise: rupeesToPaise(v.price) ?? -1,
        comparePaise: v.compare ? (compare ?? -1) : undefined,
        available: v.available,
      }
    }
    const localised = (en: string, as: string) => ({
      en,
      as: as || undefined,
    })
    return {
      slug: draft.slug,
      exam: draft.exam,
      title: localised(draft.titleEn, draft.titleAs),
      tagline: draft.taglineEn
        ? localised(draft.taglineEn, draft.taglineAs)
        : undefined,
      description: localised(draft.descriptionEn, draft.descriptionAs),
      variants: { en: variant("en"), as: variant("as") },
      sortOrder: Number(draft.sortOrder) || 0,
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    const checked = checkBundle(fields())
    if (!checked.ok) {
      setError({ field: checked.field, message: messageFor(checked.field) })
      return
    }
    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        fields: checked.value,
        bookIds: draft.bookIds,
        cover: draft.cover?.id,
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
      void refreshSite("catalog")
      if (!id) router.replace(`/admin/bundles/${result.id}`)
    } catch {
      setError({
        message: "Could not reach the server. Your changes are still here.",
      })
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
        setError({
          field: result.reason === "invalid-input" ? result.field : undefined,
          message:
            result.reason === "invalid-input" && result.field === "books"
              ? "Add at least one book before publishing."
              : (CATALOG_REFUSALS[result.reason] ?? "Not changed."),
        })
        return
      }
      setRevision(result.revision)
      toast.success(published ? "Unpublished" : "Published on /books")
      void refreshSite("catalog")
    } catch {
      setError({ message: "Could not reach the server. Try again." })
    } finally {
      setBusy(false)
    }
  }

  const invalid = (field: string) => error?.field === field
  const inSet = new Set(draft.bookIds)
  const byId = new Map(books?.rows.map((b) => [b.id, b]))

  return (
    <PageShell
      density="working"
      title={
        <span className="text-foreground">
          {id ? `${initial.titleEn}.` : "New set."}
        </span>
      }
    >
      <form
        onSubmit={onSave}
        noValidate
        className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <FieldGroup className="max-w-2xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={invalid("title") || undefined}>
              <FieldLabel htmlFor="set-title-en">Name, English</FieldLabel>
              <Input
                id="set-title-en"
                value={draft.titleEn}
                onChange={(e) => set("titleEn", e.target.value)}
                aria-invalid={invalid("title")}
                autoComplete="off"
              />
              <FieldError>
                {invalid("title") ? error?.message : null}
              </FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="set-title-as">Name, Assamese</FieldLabel>
              <Input
                id="set-title-as"
                lang="as"
                value={draft.titleAs}
                onChange={(e) => set("titleAs", e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="set-tagline-en">
                One line, English
              </FieldLabel>
              <Input
                id="set-tagline-en"
                value={draft.taglineEn}
                onChange={(e) => set("taglineEn", e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="set-tagline-as">
                One line, Assamese
              </FieldLabel>
              <Input
                id="set-tagline-as"
                lang="as"
                value={draft.taglineAs}
                onChange={(e) => set("taglineAs", e.target.value)}
                autoComplete="off"
              />
            </Field>
          </div>
          <Field
            data-invalid={invalid("slug") || invalid("slug-taken") || undefined}
          >
            <FieldLabel htmlFor="set-slug">Web address</FieldLabel>
            <Input
              id="set-slug"
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true)
                set("slug", e.target.value)
              }}
              aria-invalid={invalid("slug") || invalid("slug-taken")}
              autoComplete="off"
              spellCheck={false}
            />
            {invalid("slug") || invalid("slug-taken") ? (
              <FieldError>{error?.message}</FieldError>
            ) : (
              <FieldDescription>
                /books/{draft.slug || "…"}. Changing it breaks links already
                shared.
              </FieldDescription>
            )}
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={invalid("exam") || undefined}>
              <FieldLabel htmlFor="set-exam">Exam</FieldLabel>
              <Input
                id="set-exam"
                value={draft.exam}
                onChange={(e) => set("exam", e.target.value)}
                aria-invalid={invalid("exam")}
                autoComplete="off"
              />
              <FieldError>{invalid("exam") ? error?.message : null}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="set-order">Position on the shelf</FieldLabel>
              <Input
                id="set-order"
                inputMode="numeric"
                value={draft.sortOrder}
                onChange={(e) =>
                  set(
                    "sortOrder",
                    e.target.value.replace(/\D/g, "").slice(0, 3)
                  )
                }
                autoComplete="off"
              />
              <FieldDescription>1 shows first.</FieldDescription>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="set-desc-en">Description, English</FieldLabel>
            <Textarea
              id="set-desc-en"
              rows={4}
              value={draft.descriptionEn}
              onChange={(e) => set("descriptionEn", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="set-desc-as">Description, Assamese</FieldLabel>
            <Textarea
              id="set-desc-as"
              lang="as"
              rows={4}
              value={draft.descriptionAs}
              onChange={(e) => set("descriptionAs", e.target.value)}
            />
          </Field>

          <fieldset className="grid gap-4">
            <legend className="text-sm font-medium">Price per language</legend>
            {LANGUAGES.map((language) => {
              const v = draft.variants[language]
              const name = LANGUAGE_NAMES[language]
              return (
                <div
                  key={language}
                  className="grid gap-4 rounded-card border border-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <Field
                    data-invalid={invalid(`${language}.price`) || undefined}
                  >
                    <FieldLabel htmlFor={`set-${language}-price`}>
                      {name} set (₹)
                    </FieldLabel>
                    <Input
                      id={`set-${language}-price`}
                      inputMode="decimal"
                      value={v.price}
                      onChange={(e) =>
                        setVariant(language, {
                          price: rupeeDraft(e.target.value),
                        })
                      }
                      aria-invalid={invalid(`${language}.price`)}
                    />
                  </Field>
                  <Field
                    data-invalid={
                      invalid(`${language}.comparePrice`) || undefined
                    }
                  >
                    <FieldLabel htmlFor={`set-${language}-compare`}>
                      Struck-out price (₹)
                    </FieldLabel>
                    <Input
                      id={`set-${language}-compare`}
                      inputMode="decimal"
                      value={v.compare}
                      onChange={(e) =>
                        setVariant(language, {
                          compare: rupeeDraft(e.target.value),
                        })
                      }
                      aria-invalid={invalid(`${language}.comparePrice`)}
                    />
                  </Field>
                  <div className="flex h-10 items-center gap-2.5 text-sm">
                    <Switch
                      id={`set-${language}-available`}
                      checked={v.available}
                      onCheckedChange={(next) =>
                        setVariant(language, { available: next })
                      }
                    />
                    <label htmlFor={`set-${language}-available`}>
                      Available
                    </label>
                  </div>
                  {error?.field?.startsWith(`${language}.`) ? (
                    <FieldError className="sm:col-span-3">
                      {error.message}
                    </FieldError>
                  ) : null}
                </div>
              )
            })}
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">
              Books in the set, in shelf order
            </legend>
            {invalid("books") ? (
              <FieldError>{error?.message}</FieldError>
            ) : null}
            <ol className="grid gap-2">
              {draft.bookIds.map((bookId, i) => {
                const book = byId.get(bookId)
                return (
                  <li
                    key={bookId}
                    className="flex items-center gap-3 rounded-card border border-border p-2.5"
                  >
                    <span className="w-8 shrink-0">
                      <BookCover
                        title={book?.titles.en ?? ""}
                        cover={book?.cover}
                        size="sm"
                      />
                    </span>
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">
                        {book?.titles.en ?? book?.titles.as ?? "…"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {book?.titles.as}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...draft.bookIds]
                        ;[next[i - 1], next[i]] = [next[i]!, next[i - 1]!]
                        set("bookIds", next)
                      }}
                    >
                      <IconArrowUp stroke={1.75} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={i === draft.bookIds.length - 1}
                      onClick={() => {
                        const next = [...draft.bookIds]
                        ;[next[i + 1], next[i]] = [next[i]!, next[i + 1]!]
                        set("bookIds", next)
                      }}
                    >
                      <IconArrowDown stroke={1.75} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${book?.titles.en ?? "book"}`}
                      onClick={() =>
                        set(
                          "bookIds",
                          draft.bookIds.filter((b) => b !== bookId)
                        )
                      }
                    >
                      <IconX stroke={1.75} />
                    </Button>
                  </li>
                )
              })}
            </ol>
            {books && draft.bookIds.length < BUNDLE_BOOKS_MAX ? (
              <div className="flex flex-wrap gap-2">
                {books.rows
                  .filter((book) => !inSet.has(book.id))
                  .map((book) => (
                    <Button
                      key={book.id}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        set("bookIds", [...draft.bookIds, book.id])
                      }
                    >
                      <IconPlus stroke={1.75} aria-hidden />
                      {book.titles.en ?? book.titles.as}
                    </Button>
                  ))}
                <ButtonLink href="/admin/books/new" variant="ghost" size="sm">
                  New book
                </ButtonLink>
              </div>
            ) : null}
          </fieldset>
        </FieldGroup>

        <aside className="grid content-start gap-6 lg:sticky lg:top-6">
          <div className="grid gap-4 rounded-card border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Status</span>
              <PublishState published={published} />
            </div>
            {id ? (
              <p className="tnum text-sm text-muted-foreground">
                {soldCount} sold
              </p>
            ) : null}
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
            {error && !error.field ? (
              <FieldError>{error.message}</FieldError>
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
            label="Set photo"
            hint="The books together, shot from above or the front. Optional: the book covers are used without it."
            value={draft.cover}
            onChange={(next) => set("cover", next)}
            onBusyChange={(on) => setUploading((n) => n + (on ? 1 : -1))}
          />
          {draft.variants.en.price ? (
            <p className="tnum text-xs text-muted-foreground">
              English {formatPaise(rupeesToPaise(draft.variants.en.price) ?? 0)}
              {draft.variants.as.price
                ? ` · Assamese ${formatPaise(rupeesToPaise(draft.variants.as.price) ?? 0)}`
                : ""}
            </p>
          ) : null}
        </aside>
      </form>
    </PageShell>
  )
}

function messageFor(field: string) {
  const [language, part] = field.includes(".") ? field.split(".") : ["", field]
  const name = language ? LANGUAGE_NAMES[language as Language] : ""
  switch (part) {
    case "slug-taken":
      return "Another set already uses this address."
    case "slug":
      return "Lowercase letters, numbers and hyphens only."
    case "title":
      return "Give the set an English name, up to 120 characters."
    case "exam":
      return "Name the exam it is for."
    case "price":
      return `${name} price in rupees, like 899.`
    case "comparePrice":
      return `${name} struck-out price must be higher than the price.`
    case "books":
      return "Pick up to twelve different books."
    case "cover":
      return "The photo must be an image under 8 MB."
    default:
      return `Check the ${part}.`
  }
}
