"use client"

import { IconArrowUpRight, IconLock, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { PublishState } from "@/components/admin/catalog-fields"
import { MarkdownBody } from "@/components/marketing/markdown-body"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  checkPost,
  POST_BODY_MAX,
  POST_EXCERPT_MAX,
  type PostLanguage,
} from "@/lib/blog"
import { slugify } from "@/lib/catalog"

type Draft = {
  title: string
  slug: string
  excerpt: string
  body: string
  language: PostLanguage
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  language: "en",
}

const LANGUAGE_ITEMS: { value: PostLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "as", label: "অসমীয়া (Assamese)" },
]

/** What a save compares against to know whether anything changed. */
const snapshot = (draft: Draft) => JSON.stringify(draft)

const REFUSALS: Record<string, string> = {
  anonymous: "Your session has ended. Log in again; your changes are kept.",
  forbidden: "Only an owner can write posts.",
  "missing-record": "This post no longer exists.",
  "revision-conflict":
    "This was changed in another tab. Reload to see that version, then make your change again.",
}

/** Owner-only: create a post, or edit the one at `id`. */
export function PostEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const post = useQuery(api.blogAdmin.get, id ? { id } : "skip")

  if (allowed === undefined || (id && post === undefined))
    return (
      <Shell title="Post.">
        <ListSkeleton rows={6} />
      </Shell>
    )
  if (!allowed) return <OwnerOnly />
  if (id && !post)
    return (
      <Shell title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No post at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/blog" size="md">
              All posts
            </ButtonLink>
          }
        />
      </Shell>
    )

  if (!post) return <PostForm key="new" initial={EMPTY} />
  return (
    <PostForm
      key={post.id}
      id={post.id}
      revision={post.revision}
      published={post.published}
      initial={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        language: post.language,
      }}
    />
  )
}

function PostForm({
  id,
  initial,
  revision: loadedRevision = 0,
  published = false,
}: {
  id?: Id<"posts">
  initial: Draft
  revision?: number
  published?: boolean
}) {
  const router = useRouter()
  const save = useMutation(api.blogAdmin.save)
  const setPublished = useMutation(api.blogAdmin.setPublished)

  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(() => snapshot(initial))
  const [revision, setRevision] = useState(loadedRevision)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [tab, setTab] = useState("write")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
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

    const checked = checkPost(draft)
    if (!checked.ok) {
      setErrors({ [checked.field]: messageFor(checked.field) })
      return
    }

    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        ...checked.value,
      })
      if (!result.ok) {
        if (result.reason === "invalid-input" && result.field) {
          setErrors({ [fieldOf(result.field)]: messageFor(result.field) })
        } else setFormError(REFUSALS[result.reason] ?? "Not saved.")
        return
      }
      setRevision(result.revision)
      setSaved(snapshot(draft))
      if (!id) {
        toast.success("Saved as a draft")
        router.replace(`/admin/blog/${result.id}`)
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
        setFormError(REFUSALS[result.reason] ?? "Not changed.")
        return
      }
      setRevision(result.revision)
      toast.success(published ? "Unpublished" : "Published on /blog")
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
    <Shell title={id ? `${initial.title}.` : "New post."}>
      <form
        onSubmit={onSave}
        noValidate
        className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <FieldGroup className="max-w-2xl">
          <Field {...fieldProps("title")}>
            <FieldLabel htmlFor="post-title">Title</FieldLabel>
            <Input
              id="post-title"
              lang={draft.language}
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors.title}
              autoComplete="off"
            />
            <FieldError>{errors.title}</FieldError>
          </Field>
          <Field {...fieldProps("language")}>
            <FieldLabel htmlFor="post-language">Written in</FieldLabel>
            <Select
              value={draft.language}
              onValueChange={(next) =>
                next && set("language", next as PostLanguage)
              }
              items={LANGUAGE_ITEMS}
            >
              <SelectTrigger id="post-language" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Both /blog and /as/blog list every post; each shows its own
              language first.
            </FieldDescription>
          </Field>
          <Field {...fieldProps("slug")}>
            <FieldLabel htmlFor="post-slug">Web address</FieldLabel>
            <Input
              id="post-slug"
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
                /blog/{draft.slug || "…"}. Changing it breaks links already
                shared.
              </FieldDescription>
            )}
          </Field>
          <Field {...fieldProps("excerpt")}>
            <FieldLabel htmlFor="post-excerpt">Excerpt</FieldLabel>
            <Textarea
              id="post-excerpt"
              lang={draft.language}
              rows={3}
              value={draft.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              aria-invalid={!!errors.excerpt}
            />
            {errors.excerpt ? (
              <FieldError>{errors.excerpt}</FieldError>
            ) : (
              <FieldDescription>
                The line under the title on /blog and in search results.{" "}
                {POST_EXCERPT_MAX} characters at most.
              </FieldDescription>
            )}
          </Field>
          <Field {...fieldProps("body")}>
            <FieldLabel id="post-body-label">Body</FieldLabel>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList aria-labelledby="post-body-label">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mt-2">
                <Textarea
                  aria-label="Post body, Markdown"
                  lang={draft.language}
                  rows={16}
                  value={draft.body}
                  onChange={(e) => set("body", e.target.value)}
                  aria-invalid={!!errors.body}
                  className="font-mono text-[0.8125rem] leading-relaxed"
                  spellCheck={false}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div
                  lang={draft.language}
                  className="min-h-40 rounded-control border border-border bg-card px-5 py-4"
                >
                  {draft.body.trim() ? (
                    <MarkdownBody>{draft.body}</MarkdownBody>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            {errors.body ? (
              <FieldError>{errors.body}</FieldError>
            ) : (
              <FieldDescription>
                Markdown - the same rendering the policy pages use.{" "}
                {POST_BODY_MAX.toLocaleString("en-IN")} characters at most.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <aside className="grid content-start gap-6 lg:sticky lg:top-6">
          <div className="grid gap-4 rounded-card border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Status</span>
              <PublishState published={published} />
            </div>
            <Button type="submit" size="md" disabled={busy || (!!id && !dirty)}>
              {busy ? <Spinner /> : null}
              {id ? (dirty ? "Save changes" : "Saved") : "Save as draft"}
            </Button>
            {id ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={busy || dirty}
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
                href={`/blog/${draft.slug}`}
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
      return "Another post already uses this address."
    case "slug":
      return "Lowercase letters, numbers and hyphens only."
    case "title":
      return "Give the post a title, up to 120 characters."
    case "excerpt":
      return `Keep the excerpt under ${POST_EXCERPT_MAX} characters.`
    case "body":
      return "The body is too long."
    case "language":
      return "Pick English or Assamese."
    default:
      return `Check the ${field}.`
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
        title="Only an owner can write posts"
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
