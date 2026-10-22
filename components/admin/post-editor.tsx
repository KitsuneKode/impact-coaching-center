"use client"

import {
  IconArrowUpRight,
  IconBrandYoutube,
  IconLock,
  IconPhoto,
  IconSearch,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { refreshSite } from "@/app/admin/refresh-site"
import {
  PublishState,
  type StoredImage,
  useImageUpload,
} from "@/components/admin/catalog-fields"
import { Dropzone } from "@/components/admin/dropzone"
import { youTubeId } from "@/lib/article"
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
  excerptFrom,
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
  cover: StoredImage | null
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  language: "en",
  cover: null,
}

const LANGUAGE_ITEMS: { value: PostLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "as", label: "অসমীয়া (Assamese)" },
]

/** What a save compares against to know whether anything changed. */
const snapshot = (draft: Draft) =>
  JSON.stringify({ ...draft, cover: draft.cover?.id ?? null })

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
        cover: post.cover
          ? { id: post.cover, url: post.coverPicture?.url ?? null }
          : null,
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
  // A new post follows its title's script until a language is chosen.
  const [languageTouched, setLanguageTouched] = useState(Boolean(id))
  const [tab, setTab] = useState("write")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const upload = useImageUpload()
  const imageLink = useMutation(api.blogAdmin.imageLink)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoLink, setVideoLink] = useState("")

  /** Puts a block (a picture, a video) at the cursor, on lines of its own. */
  function insertBlock(text: string) {
    const area = bodyRef.current
    const at = area?.selectionStart ?? draft.body.length
    const before = draft.body.slice(0, at).replace(/\s*$/, "")
    const after = draft.body.slice(at).replace(/^\s*/, "")
    const next = `${before}${before ? "\n\n" : ""}${text}\n\n${after}`
    set("body", next)
    setTab("write")
    requestAnimationFrame(() => {
      const caret = (before ? before.length + 2 : 0) + text.length + 2
      area?.focus()
      area?.setSelectionRange(caret, caret)
    })
  }

  async function addImage(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const stored = await upload(file)
      if (!stored) return
      const link = await imageLink({ storageId: stored.id })
      if (!link.ok) {
        toast.error("That picture could not be added.")
        return
      }
      insertBlock(
        `![Describe the picture](${link.url} "Caption, or delete this")`
      )
    } finally {
      setUploading(false)
    }
  }

  async function setCover(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const stored = await upload(file)
      if (stored) set("cover", stored)
    } finally {
      setUploading(false)
    }
  }

  const dirty = snapshot(draft) !== saved
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === "title" && !slugTouched
        ? { slug: slugify(value as string) }
        : {}),
      ...(key === "title" && !languageTouched
        ? { language: ASSAMESE_SCRIPT.test(value as string) ? "as" : "en" }
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
        cover: draft.cover?.id,
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
      if (published) void refreshSite("blog")
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
      void refreshSite("blog")
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
              onValueChange={(next) => {
                if (!next) return
                setLanguageTouched(true)
                set("language", next as PostLanguage)
              }}
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
                {!draft.slug && draft.title.trim() && !slugify(draft.title)
                  ? "An Assamese title has no letters a web address can use: type a few English words, like apsc-prelims-tips."
                  : `/blog/${draft.slug || "…"}. Changing it breaks links already shared.`}
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
              placeholder={excerptFrom(draft.body)}
              onChange={(e) => set("excerpt", e.target.value)}
              aria-invalid={!!errors.excerpt}
            />
            {errors.excerpt ? (
              <FieldError>{errors.excerpt}</FieldError>
            ) : (
              <FieldDescription>
                The line under the title on /blog and in search results. Left
                empty, the post&apos;s first lines are used, as shown.{" "}
                {POST_EXCERPT_MAX} characters at most.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel>Cover picture</FieldLabel>
            {draft.cover?.url ? (
              <div className="grid gap-3 sm:grid-cols-[16rem_auto] sm:items-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.cover.url}
                  alt=""
                  className="aspect-video w-full rounded-control object-cover"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploading}
                    onClick={() => coverInput.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set("cover", null)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Dropzone
                accept="image/*"
                disabled={uploading}
                onFiles={(files) => void setCover(files[0])}
                title={uploading ? "Uploading…" : "Add a cover picture"}
                hint="Wide pictures work best (16:9). Shown on the post and in the blog list."
              />
            )}
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                void setCover(event.target.files?.[0])
                event.target.value = ""
              }}
            />
          </Field>
          <Field {...fieldProps("body")}>
            <FieldLabel id="post-body-label">Body</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => imageInput.current?.click()}
              >
                {uploading ? (
                  <Spinner />
                ) : (
                  <IconPhoto data-icon="inline-start" />
                )}
                Add picture
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-expanded={videoOpen}
                onClick={() => setVideoOpen((open) => !open)}
              >
                <IconBrandYoutube data-icon="inline-start" />
                Add video
              </Button>
              <input
                ref={imageInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  void addImage(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
            </div>
            {videoOpen ? (
              <div className="flex gap-2">
                <Input
                  aria-label="YouTube link"
                  placeholder="https://youtu.be/…"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (!youTubeId(videoLink.trim())) {
                      toast.error("That is not a YouTube link.")
                      return
                    }
                    insertBlock(`[Video title](${videoLink.trim()})`)
                    setVideoLink("")
                    setVideoOpen(false)
                  }}
                >
                  Add
                </Button>
              </div>
            ) : null}
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList aria-labelledby="post-body-label">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mbs-2">
                <Textarea
                  ref={bodyRef}
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
              <TabsContent value="preview" className="mbs-2">
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
                Markdown. ## and ### headings make the post&rsquo;s contents
                list. A picture or a YouTube link on its own line shows as a
                picture or a player. {POST_BODY_MAX.toLocaleString("en-IN")}{" "}
                characters at most.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <aside className="grid content-start gap-6 lg:sticky lg:inset-bs-6">
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

/** Bengali-Assamese letters: a title in them is an Assamese post. */
const ASSAMESE_SCRIPT = /[\u0980-\u09FF]/

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
