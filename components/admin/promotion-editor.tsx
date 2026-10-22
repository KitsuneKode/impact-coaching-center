"use client"

import { IconCheck, IconLock, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"
import { toast } from "sonner"

import {
  ImageField,
  toStored,
  useReleaseUpload,
  type StoredImage,
} from "@/components/admin/catalog-fields"
import { refreshSite } from "@/app/admin/refresh-site"
import { readVideoRows, VideoRows } from "@/components/admin/video-rows"
import { PromoBanner, PromoCard, PromoReel } from "@/components/site/promos"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  CAMPAIGN_KIND_LABEL,
  CAMPAIGN_KINDS,
  CAMPAIGN_LIMITS,
  checkCampaign,
  istInputToMs,
  msToIstInput,
  type CampaignKind,
  type CampaignStatus,
} from "@/lib/campaigns"

const REFUSALS: Record<string, string> = {
  anonymous: "Your session has ended. Log in again; your changes are kept.",
  forbidden: "You do not have the promotions permission any more.",
  "missing-record": "This promotion no longer exists.",
  "revision-conflict":
    "This was changed in another tab. Reload to see that version, then make your change again.",
}

/** What the form calls each field the check or the server can name. */
const MESSAGES: Record<string, string> = {
  type: "Pick at least one place for it to show.",
  name: `Give it a name of up to ${CAMPAIGN_LIMITS.name} characters.`,
  label: `Keep the label to ${CAMPAIGN_LIMITS.tag} characters.`,
  headline: `Write a headline of up to ${CAMPAIGN_LIMITS.headline} characters.`,
  message: `Add a message of up to ${CAMPAIGN_LIMITS.body} characters. Banners and pop-ups need one.`,
  button: `Add button text of up to ${CAMPAIGN_LIMITS.cta} characters.`,
  link: "Use a link that starts with / or https://.",
  image: "Upload a JPG, PNG or WebP image under 8 MB.",
  code: "Use 3 to 24 capital letters, digits or dashes.",
  videos: `Add one to ${CAMPAIGN_LIMITS.reels} different YouTube videos for the reel.`,
  pages: `List up to ${CAMPAIGN_LIMITS.routes} pages, one per line, each starting with /.`,
  start: "That start date is not valid.",
  end: "The end must be after the start.",
  delay: `Use a whole number of seconds from 0 to ${CAMPAIGN_LIMITS.delayMax}.`,
  "rest days": `Use a whole number of days from 0 to ${CAMPAIGN_LIMITS.restMax}.`,
  priority: `Use a whole number from 0 to ${CAMPAIGN_LIMITS.priorityMax}.`,
  "Assamese label": `Keep the Assamese label to ${CAMPAIGN_LIMITS.tag} characters.`,
  "Assamese headline": `Write an Assamese headline of up to ${CAMPAIGN_LIMITS.headline} characters, or clear all the Assamese fields.`,
  "Assamese message": `Keep the Assamese message to ${CAMPAIGN_LIMITS.body} characters.`,
  "Assamese button": `Add Assamese button text of up to ${CAMPAIGN_LIMITS.cta} characters.`,
}

/** What each type does, said where the type is chosen. */
const KIND_HINT: Record<CampaignKind, string> = {
  bar: "A thin strip above the header on every matching page. Short: one line.",
  banner: "A blue band near the end of the page, with an optional image.",
  modal:
    "A pop-up that waits until someone has read the page, once per visit. Use sparingly.",
  reel: "A row of YouTube Shorts near the end of the page.",
}

/** What the place picker calls each type: where it sits on the page. */
const KIND_PLACE: Record<CampaignKind, string> = {
  bar: "Above the header",
  banner: "End of the page",
  modal: "After reading",
  reel: "End of the page",
}

type Draft = {
  name: string
  kinds: CampaignKind[]
  tag: string
  headline: string
  body: string
  cta: string
  asTag: string
  asHeadline: string
  asBody: string
  asCta: string
  href: string
  coupon: string
  videos: string[]
  routes: string
  startsAt: string
  endsAt: string
  delaySeconds: string
  restDays: string
  priority: string
}

const EMPTY: Draft = {
  name: "",
  kinds: ["bar"],
  tag: "",
  headline: "",
  body: "",
  cta: "",
  asTag: "",
  asHeadline: "",
  asBody: "",
  asCta: "",
  href: "",
  coupon: "",
  videos: [],
  routes: "",
  startsAt: "",
  endsAt: "",
  delaySeconds: "0",
  restDays: "7",
  priority: "10",
}

const snapshot = (draft: Draft, image: StoredImage | null) =>
  JSON.stringify([draft, image?.id ?? null])

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

/** Shown to staff without the promotions permission. */
export function NoPromotions() {
  return (
    <Shell title="Promotions.">
      <StatePanel
        icon={<IconLock stroke={1.75} />}
        title="You do not have the promotions permission"
        description="The owner can give it to you under People."
        action={
          <ButtonLink href="/admin" size="md">
            Back to the overview
          </ButtonLink>
        }
      />
    </Shell>
  )
}

/** Create a promotion, or edit the one at `id`. */
export function PromotionEditor({ id }: { id?: string }) {
  const allowed = useQuery(api.campaigns.canEditCampaigns)
  const all = useQuery(api.campaigns.adminCampaigns)

  if (allowed === undefined || all === undefined)
    return (
      <Shell title="Promotion.">
        <ListSkeleton rows={6} />
      </Shell>
    )
  if (!allowed) return <NoPromotions />

  const campaign = id ? all.rows.find((c) => c.id === id) : undefined
  if (id && !campaign)
    return (
      <Shell title="Not found.">
        <StatePanel
          icon={<IconSearch stroke={1.75} />}
          title="No promotion at this address"
          description="It may have been mistyped, or the link is old."
          action={
            <ButtonLink href="/admin/promotions" size="md">
              All promotions
            </ButtonLink>
          }
        />
      </Shell>
    )

  if (!campaign) return <PromotionForm key="new" initial={EMPTY} image={null} />
  return (
    <PromotionForm
      key={campaign.id + campaign.revision}
      id={campaign.id}
      revision={campaign.revision}
      status={campaign.status}
      image={campaign.image ? toStored(campaign.image) : null}
      initial={{
        name: campaign.name,
        kinds: campaign.kinds,
        tag: campaign.tag,
        headline: campaign.headline,
        body: campaign.body,
        cta: campaign.cta,
        asTag: campaign.as?.tag ?? "",
        asHeadline: campaign.as?.headline ?? "",
        asBody: campaign.as?.body ?? "",
        asCta: campaign.as?.cta ?? "",
        href: campaign.href,
        coupon: campaign.coupon,
        videos: campaign.reelIds.map((v) => `https://youtu.be/${v}`),
        routes: campaign.routes.join("\n"),
        startsAt: msToIstInput(campaign.startsAt),
        endsAt: msToIstInput(campaign.endsAt),
        delaySeconds: `${campaign.delaySeconds}`,
        restDays: `${campaign.restDays}`,
        priority: `${campaign.priority}`,
      }}
    />
  )
}

function PromotionForm({
  id,
  initial,
  image: initialImage,
  revision: loaded = 0,
  status = "draft",
}: {
  id?: Id<"campaigns">
  initial: Draft
  image: StoredImage | null
  revision?: number
  status?: CampaignStatus
}) {
  const router = useRouter()
  const save = useMutation(api.campaigns.saveCampaign)
  const setStatus = useMutation(api.campaigns.setCampaignStatus)
  const release = useReleaseUpload()
  const [draft, setDraft] = useState(initial)
  const [image, setImage] = useState(initialImage)
  const [saved, setSaved] = useState(() => snapshot(initial, initialImage))
  const [revision, setRevision] = useState(loaded)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const dirty = snapshot(draft, image) !== saved
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))
  const bad = (name: string) => ({
    "data-invalid": errors[name] ? true : undefined,
  })
  const has = (kind: CampaignKind) => draft.kinds.includes(kind)
  const toggle = (kind: CampaignKind) =>
    set(
      "kinds",
      has(kind) ? draft.kinds.filter((k) => k !== kind) : [...draft.kinds, kind]
    )
  const videos = readVideoRows(has("reel") ? draft.videos : [])
  const withImage = has("banner") || has("modal")

  async function onSave(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    setFormError(null)
    const problem = videos.problems.findIndex(Boolean)
    if (problem >= 0) {
      setErrors({
        videos: `Video ${problem + 1}: ${videos.problems[problem]}.`,
      })
      return
    }
    const checked = checkCampaign({
      name: draft.name,
      kinds: draft.kinds,
      tag: draft.tag,
      headline: draft.headline,
      body: draft.body,
      cta: draft.cta,
      as: {
        tag: draft.asTag,
        headline: draft.asHeadline,
        body: draft.asBody,
        cta: draft.asCta,
      },
      href: draft.href,
      coupon: draft.coupon.toUpperCase(),
      reelIds: videos.ids,
      routes: draft.routes.split(/\r?\n/),
      startsAt: istInputToMs(draft.startsAt),
      endsAt: istInputToMs(draft.endsAt),
      delaySeconds: Number(draft.delaySeconds),
      restDays: Number(draft.restDays),
      priority: Number(draft.priority),
    })
    if (!checked.ok) {
      setErrors({
        [checked.field]: MESSAGES[checked.field] ?? "Check this field.",
      })
      return
    }

    setBusy(true)
    try {
      const result = await save({
        ...(id ? { id, expectedRevision: revision } : {}),
        fields: checked.value,
        ...(withImage && image ? { image: image.id } : {}),
      })
      if (!result.ok) {
        if (result.reason === "invalid-input" && result.field)
          setErrors({
            [result.field]: MESSAGES[result.field] ?? "Check this field.",
          })
        else setFormError(REFUSALS[result.reason] ?? "Not saved.")
        return
      }
      setRevision(result.revision)
      setSaved(snapshot(draft, image))
      if (!id) {
        toast.success("Saved as a draft")
        void refreshSite("campaigns")
        router.replace(`/admin/promotions/${result.id}`)
      } else {
        toast.success("Saved")
        void refreshSite("campaigns")
      }
    } catch {
      setFormError("Could not reach the server. Your changes are still here.")
    } finally {
      setBusy(false)
    }
  }

  async function onSwitch(next: "live" | "paused") {
    if (!id) return
    setBusy(true)
    try {
      const result = await setStatus({
        id,
        status: next,
        expectedRevision: revision,
      })
      if (!result.ok) {
        setFormError(REFUSALS[result.reason] ?? "Not changed.")
        return
      }
      setRevision(result.revision)
      toast.success(next === "live" ? "Live on the site" : "Paused")
      void refreshSite("campaigns")
    } catch {
      setFormError("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const preview = {
    kind: draft.kinds[0] ?? "bar",
    tag: draft.tag.trim(),
    headline: draft.headline.trim() || "Your headline goes here.",
    body: draft.body.trim(),
    cta: draft.cta.trim(),
    href: "#",
    coupon: draft.coupon.trim().toUpperCase(),
    reelIds: videos.ids,
    image: withImage && image?.url ? { url: image.url } : null,
  }

  return (
    <Shell title={id ? `${initial.name}.` : "New promotion."}>
      <form
        onSubmit={onSave}
        noValidate
        className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_28rem]"
      >
        <FieldGroup className="max-w-2xl">
          <FieldSet data-invalid={!!errors.type || undefined}>
            <FieldLegend variant="label">Show it as</FieldLegend>
            <FieldDescription>
              Pick one or several. They share the words below; each shows them
              its own way.
            </FieldDescription>
            <div className="grid gap-2 sm:grid-cols-2">
              {CAMPAIGN_KINDS.map((k) => (
                <label
                  key={k}
                  className="group relative grid cursor-pointer content-start gap-1 rounded-[16px] bg-card p-4 pe-12 shadow-[0_0_0_1px_var(--border)] transition-[box-shadow,background-color] duration-150 has-[:checked]:bg-primary/[0.04] has-[:checked]:shadow-[0_0_0_2px_var(--primary)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                >
                  <input
                    id={`p-kind-${k}`}
                    type="checkbox"
                    name="kinds"
                    value={k}
                    checked={has(k)}
                    onChange={() => toggle(k)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className="absolute end-4 top-4 grid size-5 place-items-center rounded-full text-transparent shadow-[0_0_0_1.5px_var(--border)] group-has-[:checked]:bg-primary group-has-[:checked]:text-primary-foreground group-has-[:checked]:shadow-none"
                  >
                    <IconCheck size={13} stroke={3} />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {KIND_PLACE[k]}
                  </span>
                  <span className="font-medium">{CAMPAIGN_KIND_LABEL[k]}</span>
                  <span className="text-sm text-pretty text-muted-foreground">
                    {KIND_HINT[k]}
                  </span>
                </label>
              ))}
            </div>
            <FieldError>{errors.type}</FieldError>
          </FieldSet>

          <Field {...bad("name")}>
            <FieldLabel htmlFor="p-name">Name</FieldLabel>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
              autoComplete="off"
            />
            {errors.name ? (
              <FieldError>{errors.name}</FieldError>
            ) : (
              <FieldDescription>Only the admin sees this.</FieldDescription>
            )}
          </Field>

          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Field {...bad("headline")}>
              <FieldLabel htmlFor="p-headline">Headline</FieldLabel>
              <Input
                id="p-headline"
                value={draft.headline}
                onChange={(e) => set("headline", e.target.value)}
                aria-invalid={!!errors.headline}
                autoComplete="off"
              />
              <FieldError>{errors.headline}</FieldError>
            </Field>
            <Field {...bad("label")}>
              <FieldLabel htmlFor="p-tag">Label</FieldLabel>
              <Input
                id="p-tag"
                value={draft.tag}
                onChange={(e) => set("tag", e.target.value)}
                aria-invalid={!!errors.label}
                autoComplete="off"
                placeholder="New batch"
              />
              <FieldError>{errors.label}</FieldError>
            </Field>
          </div>

          <Field {...bad("message")}>
            <FieldLabel htmlFor="p-body">Message</FieldLabel>
            <Textarea
              id="p-body"
              value={draft.body}
              onChange={(e) => set("body", e.target.value)}
              aria-invalid={!!errors.message}
              rows={3}
            />
            {errors.message ? (
              <FieldError>{errors.message}</FieldError>
            ) : (
              <FieldDescription>
                {draft.body.length} of {CAMPAIGN_LIMITS.body}.
              </FieldDescription>
            )}
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field {...bad("button")}>
              <FieldLabel htmlFor="p-cta">Button text</FieldLabel>
              <Input
                id="p-cta"
                value={draft.cta}
                onChange={(e) => set("cta", e.target.value)}
                aria-invalid={!!errors.button}
                autoComplete="off"
              />
              <FieldError>{errors.button}</FieldError>
            </Field>
            <Field {...bad("link")}>
              <FieldLabel htmlFor="p-href">Button link</FieldLabel>
              <Input
                id="p-href"
                value={draft.href}
                onChange={(e) => set("href", e.target.value)}
                aria-invalid={!!errors.link}
                autoComplete="off"
                spellCheck={false}
                placeholder="/courses/victor-9-0"
              />
              {errors.link ? (
                <FieldError>{errors.link}</FieldError>
              ) : (
                <FieldDescription>
                  A page on the site, like /contact, or an https link.
                </FieldDescription>
              )}
            </Field>
          </div>

          <details
            className="group rounded-card border border-border p-4"
            open={Boolean(draft.asHeadline) || undefined}
          >
            <summary className="cursor-pointer text-sm font-medium">
              Assamese wording (optional)
            </summary>
            <p className="mbs-2 text-sm text-muted-foreground">
              Shown on the Assamese pages. Leave it empty and they show the
              English.
            </p>
            <div lang="as-IN" className="mbs-4 grid gap-6">
              <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <Field {...bad("Assamese headline")}>
                  <FieldLabel htmlFor="p-as-headline">Headline</FieldLabel>
                  <Input
                    id="p-as-headline"
                    value={draft.asHeadline}
                    onChange={(e) => set("asHeadline", e.target.value)}
                    aria-invalid={!!errors["Assamese headline"]}
                    autoComplete="off"
                  />
                  <FieldError>{errors["Assamese headline"]}</FieldError>
                </Field>
                <Field {...bad("Assamese label")}>
                  <FieldLabel htmlFor="p-as-tag">Label</FieldLabel>
                  <Input
                    id="p-as-tag"
                    value={draft.asTag}
                    onChange={(e) => set("asTag", e.target.value)}
                    aria-invalid={!!errors["Assamese label"]}
                    autoComplete="off"
                  />
                  <FieldError>{errors["Assamese label"]}</FieldError>
                </Field>
              </div>
              <Field {...bad("Assamese message")}>
                <FieldLabel htmlFor="p-as-body">Message</FieldLabel>
                <Textarea
                  id="p-as-body"
                  value={draft.asBody}
                  onChange={(e) => set("asBody", e.target.value)}
                  aria-invalid={!!errors["Assamese message"]}
                  rows={3}
                />
                <FieldError>{errors["Assamese message"]}</FieldError>
              </Field>
              <Field {...bad("Assamese button")} className="sm:max-w-sm">
                <FieldLabel htmlFor="p-as-cta">Button text</FieldLabel>
                <Input
                  id="p-as-cta"
                  value={draft.asCta}
                  onChange={(e) => set("asCta", e.target.value)}
                  aria-invalid={!!errors["Assamese button"]}
                  autoComplete="off"
                />
                <FieldError>{errors["Assamese button"]}</FieldError>
              </Field>
            </div>
          </details>

          {withImage ? (
            <Field {...bad("image")}>
              <ImageField
                label="Image (optional)"
                hint="Landscape works best: 16 by 9, under 8 MB."
                value={image}
                onChange={setImage}
                onBusyChange={setUploading}
              />
              <FieldError>{errors.image}</FieldError>
            </Field>
          ) : null}

          {has("reel") ? (
            <FieldSet data-invalid={!!errors.videos || undefined}>
              <FieldLegend variant="label">Videos for the reel</FieldLegend>
              <FieldDescription>
                Paste a YouTube link: Shorts, watch and youtu.be links all work.
                The reel plays them in this order.
              </FieldDescription>
              <VideoRows
                rows={draft.videos}
                onChange={(rows) => set("videos", rows)}
                max={CAMPAIGN_LIMITS.reels}
                invalid={!!errors.videos}
              />
              <FieldError>{errors.videos}</FieldError>
            </FieldSet>
          ) : null}

          <Field {...bad("code")}>
            <FieldLabel htmlFor="p-coupon">Code (optional)</FieldLabel>
            <Input
              id="p-coupon"
              value={draft.coupon}
              onChange={(e) => set("coupon", e.target.value.toUpperCase())}
              aria-invalid={!!errors.code}
              autoComplete="off"
              spellCheck={false}
              className="max-w-xs uppercase"
            />
            {errors.code ? (
              <FieldError>{errors.code}</FieldError>
            ) : (
              <FieldDescription>
                Shown with a copy button. ClassPlus applies it, not this site.
              </FieldDescription>
            )}
          </Field>

          <PagesPicker
            value={draft.routes}
            onChange={(routes) => set("routes", routes)}
            error={errors.pages}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Field {...bad("start")}>
              <FieldLabel htmlFor="p-start">Starts (India time)</FieldLabel>
              <Input
                id="p-start"
                type="datetime-local"
                value={draft.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                aria-invalid={!!errors.start}
              />
              <FieldError>{errors.start}</FieldError>
            </Field>
            <Field {...bad("end")}>
              <FieldLabel htmlFor="p-end">Ends (India time)</FieldLabel>
              <Input
                id="p-end"
                type="datetime-local"
                value={draft.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
                aria-invalid={!!errors.end}
              />
              <FieldError>{errors.end}</FieldError>
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field {...bad("delay")} hidden={!has("modal")}>
              <FieldLabel htmlFor="p-delay">Pop-up waits (seconds)</FieldLabel>
              <Input
                id="p-delay"
                inputMode="numeric"
                value={draft.delaySeconds}
                onChange={(e) => set("delaySeconds", e.target.value)}
                aria-invalid={!!errors.delay}
              />
              {errors.delay ? (
                <FieldError>{errors.delay}</FieldError>
              ) : (
                <FieldDescription>
                  At least this long on the page first. Pop-ups only.
                </FieldDescription>
              )}
            </Field>
            <Field {...bad("rest days")}>
              <FieldLabel htmlFor="p-rest">
                Hidden after closing (days)
              </FieldLabel>
              <Input
                id="p-rest"
                inputMode="numeric"
                value={draft.restDays}
                onChange={(e) => set("restDays", e.target.value)}
                aria-invalid={!!errors["rest days"]}
              />
              {errors["rest days"] ? (
                <FieldError>{errors["rest days"]}</FieldError>
              ) : (
                <FieldDescription>
                  Before the same visitor sees it again.
                </FieldDescription>
              )}
            </Field>
            <Field {...bad("priority")}>
              <FieldLabel htmlFor="p-priority">Priority</FieldLabel>
              <Input
                id="p-priority"
                inputMode="numeric"
                value={draft.priority}
                onChange={(e) => set("priority", e.target.value)}
                aria-invalid={!!errors.priority}
              />
              {errors.priority ? (
                <FieldError>{errors.priority}</FieldError>
              ) : (
                <FieldDescription>
                  When two compete, the higher shows.
                </FieldDescription>
              )}
            </Field>
          </div>

          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={busy || uploading || (!!id && !dirty)}
            >
              {id ? "Save changes" : "Save as a draft"}
            </Button>
            {id ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={busy || dirty}
                onClick={() => onSwitch(status === "live" ? "paused" : "live")}
              >
                {status === "live" ? "Pause" : "Go live"}
              </Button>
            ) : null}
            <ButtonLink
              href="/admin/promotions"
              variant="ghost"
              size="lg"
              onClick={() => {
                // An image uploaded here and never saved is not kept.
                if (image?.id !== initialImage?.id) release(image)
              }}
            >
              All promotions
            </ButtonLink>
            {id && dirty ? (
              <span className="text-sm text-muted-foreground">
                Save before switching it on.
              </span>
            ) : null}
          </div>
        </FieldGroup>

        <aside
          aria-label="Preview"
          className="xl:sticky xl:inset-bs-20 xl:self-start"
        >
          <p className="mbe-3 text-sm font-medium">Preview</p>
          <div className="grid gap-5">
            {draft.kinds.length === 0 ? (
              <p className="rounded-2xl p-6 text-sm text-muted-foreground ring-1 ring-border">
                Pick where it shows to see it here.
              </p>
            ) : null}
            {CAMPAIGN_KINDS.filter(has).map((kind) => (
              <figure key={kind} className="grid gap-2">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  {CAMPAIGN_KIND_LABEL[kind]}
                </figcaption>
                <div
                  data-promo-preview
                  className="overflow-clip rounded-2xl bg-background ring-1 ring-border"
                >
                  {kind === "bar" ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-foreground ps-4 pe-4 pbs-3 pbe-3 text-sm text-white">
                      {preview.tag ? (
                        <span className="font-semibold text-highlight">
                          {preview.tag}
                        </span>
                      ) : null}
                      <span className="font-semibold">{preview.headline}</span>
                      {preview.cta ? (
                        <span className="ms-auto text-highlight">
                          {preview.cta}
                        </span>
                      ) : null}
                    </div>
                  ) : kind === "modal" ? (
                    <div className="grid place-items-center bg-[color-mix(in_oklch,var(--foreground)_55%,transparent)] p-6">
                      <PromoCard
                        promo={{ ...preview, kind }}
                        close={(label) => (
                          <span className="inline-flex h-12 items-center rounded-full px-5 font-semibold">
                            {label}
                          </span>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="pbs-6">
                      {kind === "banner" ? (
                        <PromoBanner promo={{ ...preview, kind }} />
                      ) : (
                        <PromoReel promo={{ ...preview, kind }} />
                      )}
                    </div>
                  )}
                </div>
              </figure>
            ))}
          </div>
          <p className="mbs-3 text-sm text-muted-foreground">
            The same pieces the site uses. On a phone they stack.
          </p>
        </aside>
      </form>
    </Shell>
  )
}

/** The site's sections, as an editor thinks of them. Each covers its sub-pages. */
const SECTIONS = [
  ["/", "Home page"],
  ["/courses", "Courses"],
  ["/books", "Books"],
  ["/resources", "Free notes"],
  ["/exams", "Exam guides"],
  ["/success-stories", "Results"],
  ["/teachers", "Teachers"],
  ["/library", "Library"],
  ["/blog", "Blog"],
  ["/contact", "Contact"],
  ["/assist", "ASSIST"],
] as const
const SECTION_PATHS = new Set<string>(SECTIONS.map(([path]) => path))

/** "Courses, Books" for the list; single pages stay as their address. */
export function pagesLabel(routes: readonly string[]) {
  if (routes.length === 0) return "Every page"
  const names = new Map<string, string>(SECTIONS)
  return routes.map((route) => names.get(route) ?? route).join(", ")
}

/**
 * Where a promotion shows: tick sections, or none for every page. Single
 * pages (a course, a post) go in "Other pages". Edits the same one-path-per-
 * line text the form saves, so nothing about saving changes.
 */
function PagesPicker({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (routes: string) => void
  error?: string
}) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const ticked = new Set(lines.filter((line) => SECTION_PATHS.has(line)))
  const others = lines.filter((line) => !SECTION_PATHS.has(line))
  const write = (sections: Set<string>, extra: string[]) =>
    onChange(
      [
        ...SECTIONS.map(([path]) => path).filter((p) => sections.has(p)),
        ...extra,
      ].join("\n")
    )

  return (
    <FieldSet data-invalid={!!error || undefined}>
      <FieldLegend variant="label">Where it shows</FieldLegend>
      <FieldDescription>
        {lines.length === 0
          ? "Every page. Tick sections to narrow it down."
          : "Only the ticked sections, and every page inside them."}
      </FieldDescription>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {SECTIONS.map(([path, label]) => (
          <Field key={path} orientation="horizontal">
            <Checkbox
              id={`p-route-${path}`}
              checked={ticked.has(path)}
              onCheckedChange={(checked) => {
                const next = new Set(ticked)
                if (checked) next.add(path)
                else next.delete(path)
                write(next, others)
              }}
            />
            <FieldLabel htmlFor={`p-route-${path}`} className="font-normal">
              {label}
            </FieldLabel>
          </Field>
        ))}
      </div>
      <Field>
        <FieldLabel htmlFor="p-routes-other">Other pages (optional)</FieldLabel>
        <Input
          id="p-routes-other"
          value={others.join(" ")}
          onChange={(event) =>
            write(ticked, event.target.value.split(/[\s,]+/).filter(Boolean))
          }
          spellCheck={false}
          placeholder="/courses/lakhya-2027"
          aria-invalid={!!error}
        />
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <FieldDescription>
            Single pages, by their address after the domain. Separate with
            spaces.
          </FieldDescription>
        )}
      </Field>
    </FieldSet>
  )
}
