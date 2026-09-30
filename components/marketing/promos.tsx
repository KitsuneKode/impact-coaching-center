"use client"

import {
  IconArrowRight,
  IconArrowsMinimize,
  IconBell,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconVolume,
  IconVolumeOff,
  IconX,
} from "@tabler/icons-react"
import { Menu } from "@base-ui/react/menu"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Image, { type ImageProps } from "next/image"
import Link from "next/link"
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Promotion kit: announcement bar, top banner, pop-up modal, nav dropdown,
 * bottom video banner and an offer card. Built on the shadcn Dialog,
 * DropdownMenu and Sonner already in the repo; only the look is ours, through
 * `--pm-*` variables and `promoCss`. Every surface has a `contained` mode so
 * the studio can preview it inside a frame.
 */

export type Campaign = {
  tag: string
  headline: string
  body: string
  cta: string
  href: string
  image: string | null
  imageAlt: string
  reels: { id: string; still: string; name: string; meta: string }[]
  coupon: string
  price: string | null
  was: string | null
  secondary: string
}

/** Portals land inside the themed page, so they inherit its colours. */
const Scope = createContext<{ current: HTMLElement | null } | null>(null)

export function PromoScope({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <Scope.Provider value={ref as { current: HTMLElement | null }}>
      <div ref={ref} data-pm-scope>
        {children}
      </div>
    </Scope.Provider>
  )
}

function useContainer() {
  return useContext(Scope) ?? undefined
}

/** An image that may be a remote https link an owner pasted: shown as-is, and skipped when blank. */
function Pic(props: ImageProps) {
  if (!props.src) return null
  const remote = /^https?:/.test(String(props.src))
  return <Image {...props} unoptimized={props.unoptimized ?? remote} />
}

/** The kit in the site's own look: every --pm variable read from the shadcn theme. */
export const SITE_PROMO_TOKENS = {
  "--pm-ink": "var(--foreground)",
  "--pm-muted": "var(--muted-foreground)",
  "--pm-line": "var(--border)",
  "--pm-line-hi": "color-mix(in oklab, var(--foreground) 28%, transparent)",
  "--pm-card": "var(--card)",
  "--pm-card-solid": "var(--card)",
  "--pm-shadow": "0 0 0 1px var(--border), 0 18px 36px -26px rgb(0 0 0 / 0.35)",
  "--pm-tile": "var(--secondary)",
  "--pm-tab": "var(--card)",
  "--pm-tab-on": "var(--secondary)",
  "--pm-hover": "var(--secondary)",
  "--pm-accent": "var(--primary)",
  "--pm-accent-ink": "var(--primary-foreground)",
  "--pm-btn": "var(--primary)",
  "--pm-btn-shadow": "none",
  "--pm-display": "var(--font-display, inherit)",
  "--pm-radius": "var(--radius-card)",
  "--pm-inner": "var(--radius-control)",
  "--pm-pill": "var(--radius-control)",
  "--pm-bar-radius": "var(--radius-control)",
  "--pm-scrim": "rgb(0 0 0 / 0.5)",
  "--pm-frame": "var(--background)",
  "--pm-icon-bg": "var(--card)",
} as CSSProperties

const spring = { type: "spring", duration: 0.3, bounce: 0 } as const
const ease = [0.23, 1, 0.32, 1] as const

/* ------------------------------------------------------------------ */
/*  Announcement bar                                                   */
/* ------------------------------------------------------------------ */

export function AnnouncementBar({
  c,
  contained,
  onClose,
}: {
  c: Campaign
  contained?: boolean
  onClose?: () => void
}) {
  return (
    <div data-pm-bar data-contained={contained ? "" : undefined}>
      <span data-pm-tag>{c.tag}</span>
      <p>
        <strong>{c.headline}</strong> <span>{c.body}</span>
      </p>
      <Link href={c.href} data-pm-btn data-small>
        {c.cta}
      </Link>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={onClose}
          data-pm-icon
        >
          <IconX aria-hidden size={18} stroke={1.5} />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Top banner                                                         */
/* ------------------------------------------------------------------ */

export function TopBanner({
  c,
  onClose,
}: {
  c: Campaign
  onClose?: () => void
}) {
  return (
    <div data-pm-banner>
      {c.image && (
        <span data-pm-banner-img>
          <Pic
            src={c.image}
            alt={c.imageAlt}
            fill
            sizes="280px"
            className="object-cover"
          />
        </span>
      )}
      <div data-pm-banner-copy>
        <span data-pm-tag>{c.tag}</span>
        <h3>{c.headline}</h3>
        <p>{c.body}</p>
        <div data-pm-actions>
          <Link href={c.href} data-pm-btn>
            {c.cta}
            <IconArrowRight aria-hidden size={18} stroke={2} />
          </Link>
          <Link href={c.href} data-pm-btn data-quiet>
            {c.secondary}
          </Link>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={onClose}
          data-pm-icon
          data-corner
        >
          <IconX aria-hidden size={18} stroke={1.5} />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pop-up modal (shadcn Dialog)                                       */
/* ------------------------------------------------------------------ */

function ModalBody({ c, close }: { c: Campaign; close?: ReactNode }) {
  return (
    <>
      {c.image && (
        <span data-pm-modal-img>
          <Pic
            src={c.image}
            alt={c.imageAlt}
            fill
            sizes="440px"
            className="object-cover"
          />
        </span>
      )}
      <div data-pm-modal-copy>
        <span data-pm-tag>{c.tag}</span>
        <h3>{c.headline}</h3>
        <p>{c.body}</p>
        <div data-pm-actions>
          <Link href={c.href} data-pm-btn>
            {c.cta}
            <IconArrowRight aria-hidden size={18} stroke={2} />
          </Link>
          {close}
        </div>
      </div>
    </>
  )
}

/** The real thing: a focus-trapped dialog with Escape and scrim-click to close. */
export function PromoModal({
  c,
  open,
  onOpenChange,
}: {
  c: Campaign
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const container = useContainer()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal container={container}>
        <DialogOverlay className="bg-[var(--pm-scrim)]" />
        <DialogPrimitive.Popup data-pm-modal data-real>
          <DialogTitle className="sr-only">{c.headline}</DialogTitle>
          <DialogDescription className="sr-only">{c.body}</DialogDescription>
          <ModalBody
            c={c}
            close={
              <DialogClose data-pm-btn data-quiet>
                Not now
              </DialogClose>
            }
          />
          <DialogClose data-pm-icon data-corner aria-label="Close">
            <IconX aria-hidden size={18} stroke={1.5} />
          </DialogClose>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Nav dropdown (shadcn DropdownMenu)                                 */
/* ------------------------------------------------------------------ */

export function OffersMenu({
  c,
  items,
  defaultOpen,
}: {
  c: Campaign
  items: { label: string; note: string; href: string }[]
  defaultOpen?: boolean
}) {
  const container = useContainer()
  return (
    <DropdownMenu defaultOpen={defaultOpen} modal={false}>
      <DropdownMenuTrigger data-pm-nav-trigger>
        <IconBell aria-hidden size={16} stroke={1.5} />
        Offers
        <IconChevronDown aria-hidden size={14} stroke={1.75} data-chevron />
      </DropdownMenuTrigger>
      <DropdownMenuPortal container={container}>
        <Menu.Positioner sideOffset={10} align="end" className="z-[60]">
          <Menu.Popup data-pm-menu>
            <Link href={c.href} data-pm-menu-hero>
              {c.image && (
                <span data-pm-menu-img>
                  <Pic
                    src={c.image}
                    alt={c.imageAlt}
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </span>
              )}
              <span data-pm-tag>{c.tag}</span>
              <strong>{c.headline}</strong>
              <span data-pm-menu-note>{c.body}</span>
            </Link>
            <ul>
              {items.map((it) => (
                <li key={it.label}>
                  <Menu.Item render={<Link href={it.href} data-pm-menu-item />}>
                    <span>{it.label}</span>
                    <span data-pm-menu-note>{it.note}</span>
                  </Menu.Item>
                </li>
              ))}
            </ul>
          </Menu.Popup>
        </Menu.Positioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

/* ------------------------------------------------------------------ */
/*  Video reel: a bottom-right card that plays on its own              */
/* ------------------------------------------------------------------ */

const REEL_MS = 14_000

function embed(id: string, sound: boolean) {
  const q = new URLSearchParams({
    autoplay: "1",
    mute: sound ? "0" : "1",
    loop: "1",
    playlist: id,
    controls: sound ? "1" : "0",
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    disablekb: sound ? "0" : "1",
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`
}

/**
 * A small vertical reel that autoplays muted and loops, moves to the next
 * clip every fourteen seconds, and opens larger with sound on a tap. It waits
 * a few seconds before it appears, stays still for people who ask for less
 * motion or are saving data, and always has a close button.
 */
export function ReelCard({
  c,
  contained,
  onClose,
  delay = 0,
}: {
  c: Campaign
  contained?: boolean
  onClose?: () => void
  delay?: number
}) {
  const reels = c.reels
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const [hold, setHold] = useState(false)
  const [ready, setReady] = useState(delay === 0)
  const reduce = useReducedMotion()
  // People on data saver, or who ask for less motion, get a still with a play tap.
  const saveData = useSyncExternalStore(
    () => () => {},
    () =>
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData
      ),
    () => false
  )
  const still = Boolean(reduce) || saveData

  useEffect(() => {
    if (delay === 0) return
    const t = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const running = ready && !open && !hold && !still && reels.length > 1
  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setI((v) => (v + 1) % reels.length), REEL_MS)
    return () => clearTimeout(t)
  }, [running, i, reels.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  if (!reels.length) return null
  const r = reels[i]!
  const step = (d: number) => setI((v) => (v + d + reels.length) % reels.length)

  return (
    <AnimatePresence initial={false}>
      {ready && (
        <m.aside
          key="reel"
          aria-label="Video from ICT students"
          data-pm-reel
          data-open={open ? "" : undefined}
          data-contained={contained ? "" : undefined}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.4, ease },
          }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.16 } }}
          onPointerEnter={() => setHold(true)}
          onPointerLeave={() => setHold(false)}
        >
          <div data-pm-reel-media>
            <Pic
              src={r.still}
              alt=""
              fill
              sizes="340px"
              className="object-cover"
            />
            {!still && (
              <iframe
                key={`${r.id}-${open}`}
                src={embed(r.id, open)}
                title={`${r.name}, ${r.meta}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                inert={!open}
              />
            )}
            {!open && (
              <button
                type="button"
                data-pm-reel-hit
                aria-label={`Play ${r.name}'s video larger, with sound`}
                onClick={() => setOpen(true)}
              />
            )}
            <span data-pm-reel-shade aria-hidden />
          </div>

          <ol data-pm-reel-bars aria-hidden>
            {reels.map((x, k) => (
              <li key={x.id}>
                <span
                  data-done={k < i ? "" : undefined}
                  data-now={k === i && running ? "" : undefined}
                  style={{ animationPlayState: hold ? "paused" : "running" }}
                  key={k === i ? `${i}-${running}` : k}
                />
              </li>
            ))}
          </ol>

          <div data-pm-reel-top>
            <span data-pm-reel-badge>
              {open ? (
                <IconVolume aria-hidden size={14} stroke={2} />
              ) : (
                <IconVolumeOff aria-hidden size={14} stroke={2} />
              )}
              {open ? "Sound on" : "Tap for sound"}
            </span>
            {open && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                data-pm-icon
                data-onmedia
                aria-label="Make it small again"
              >
                <IconArrowsMinimize aria-hidden size={18} stroke={1.75} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                data-pm-icon
                data-onmedia
                aria-label="Close the video"
              >
                <IconX aria-hidden size={18} stroke={1.75} />
              </button>
            )}
          </div>

          <div data-pm-reel-foot>
            <p>
              <strong>{r.name}</strong>
              <span>{r.meta}</span>
            </p>
            <div data-pm-actions>
              {open && reels.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    data-pm-icon
                    data-onmedia
                    aria-label="Previous video"
                  >
                    <IconChevronLeft aria-hidden size={18} stroke={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    data-pm-icon
                    data-onmedia
                    aria-label="Next video"
                  >
                    <IconChevronRight aria-hidden size={18} stroke={2} />
                  </button>
                </>
              )}
              <Link href={c.href} data-pm-btn data-small>
                {c.cta}
              </Link>
            </div>
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Offer card with countdown and coupon                               */
/* ------------------------------------------------------------------ */

function useCountdown(endsAt: number | null) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [])
  if (now === null || endsAt === null) return null
  const left = Math.max(0, endsAt - now)
  return {
    d: Math.floor(left / 86_400_000),
    h: Math.floor((left % 86_400_000) / 3_600_000),
    min: Math.floor((left % 3_600_000) / 60_000),
  }
}

export function OfferCard({ c, endsAt }: { c: Campaign; endsAt: number }) {
  const left = useCountdown(endsAt)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduce = useReducedMotion()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.coupon)
    } catch {
      return
    }
    setCopied(true)
    toast(`${c.coupon} copied`)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }
  const icon = {
    initial: reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    transition: spring,
  }

  return (
    <div data-pm-offer>
      <span data-pm-tag>{c.tag}</span>
      <h3>{c.headline}</h3>
      <p>{c.body}</p>
      {c.price && (
        <p data-pm-price>
          <span>{c.price}</span>
          {c.was && <s>{c.was}</s>}
        </p>
      )}
      <dl data-pm-clock aria-label="Time left">
        {[
          ["Days", left?.d],
          ["Hrs", left?.h],
          ["Min", left?.min],
        ].map(([k, v]) => (
          <div key={k as string}>
            <dd>{v === undefined ? "--" : String(v).padStart(2, "0")}</dd>
            <dt>{k}</dt>
          </div>
        ))}
      </dl>
      <div data-pm-coupon>
        <code>{c.coupon}</code>
        <button type="button" onClick={copy} data-pm-btn data-quiet data-small>
          <span className="relative grid size-4 place-items-center">
            <AnimatePresence initial={false} mode="popLayout">
              {copied ? (
                <m.span key="ok" {...icon} className="absolute">
                  <IconCheck aria-hidden size={16} stroke={2} />
                </m.span>
              ) : (
                <m.span key="cp" {...icon} className="absolute">
                  <IconCopy aria-hidden size={16} stroke={1.5} />
                </m.span>
              )}
            </AnimatePresence>
          </span>
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <div data-pm-actions>
        <Link href={c.href} data-pm-btn>
          {c.cta}
        </Link>
        <Link href={c.href} data-pm-btn data-quiet>
          {c.secondary}
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Studio                                                             */
/* ------------------------------------------------------------------ */

export type Placement =
  | "bar"
  | "banner"
  | "modal"
  | "dropdown"
  | "reel"
  | "toast"

const placements: {
  id: Placement
  name: string
  where: string
  when: string
  cap: string
  dismiss: string
}[] = [
  {
    id: "bar",
    name: "Announcement bar",
    where: "Top of every page, above the header",
    when: "On load, while the campaign runs",
    cap: "Always on, one at a time",
    dismiss: "Hidden for 7 days after the close button",
  },
  {
    id: "banner",
    name: "Top banner",
    where: "Home page, above the hero",
    when: "On load",
    cap: "Once per visit",
    dismiss: "Hidden for 3 days after the close button",
  },
  {
    id: "modal",
    name: "Pop-up",
    where: "Home and course pages",
    when: "After 20 seconds or on exit intent",
    cap: "Once per visitor, then a 14 day rest",
    dismiss: "Escape, scrim or Not now",
  },
  {
    id: "dropdown",
    name: "Nav dropdown",
    where: "Header, beside the menu",
    when: "On click, never on its own",
    cap: "Always available",
    dismiss: "Click away or Escape",
  },
  {
    id: "reel",
    name: "Video reel",
    where: "Bottom right of every page, except checkout",
    when: "Four seconds after the page loads, muted and playing",
    cap: "Once per session, then a 7 day rest",
    dismiss: "Close button, or make it small again",
  },
  {
    id: "toast",
    name: "Toast",
    where: "Bottom right, on an action",
    when: "After a copy, save or submit",
    cap: "Never stacks more than one",
    dismiss: "Fades on its own after a few seconds",
  },
]

/**
 * A browser frame with the page in outline and one promotion placed where it
 * lives. Used by the studio, and by the admin editor as its live preview.
 */
export function PromoFrame({
  kind,
  c,
  menuItems,
  shown = { bar: true, banner: true, reel: true },
  onHide,
  panel,
}: {
  kind: Placement
  c: Campaign
  menuItems: { label: string; note: string; href: string }[]
  shown?: { bar: boolean; banner: boolean; reel: boolean }
  onHide?: (kind: "bar" | "banner" | "reel") => void
  /** Set when the frame is the panel of a tab list. */
  panel?: Placement
}) {
  const reduce = useReducedMotion()
  const pick = kind
  return (
    <div
      id={panel ? "pm-stage" : undefined}
      role={panel ? "tabpanel" : undefined}
      aria-labelledby={panel ? `pm-tab-${pick}` : undefined}
      data-pm-frame
    >
      <div data-pm-frame-top>
        <span />
        <span />
        <span />
        <b>impactcareertutorials.in</b>
      </div>
      <div
        data-pm-frame-page
        data-tall={pick === "dropdown" || pick === "reel" ? "" : undefined}
      >
        {pick === "bar" && shown.bar && (
          <AnnouncementBar
            c={c}
            contained
            onClose={onHide ? () => onHide("bar") : undefined}
          />
        )}
        <div data-pm-frame-nav>
          <span data-pm-frame-logo />
          <span data-pm-frame-links />
          {pick === "dropdown" && (
            <OffersMenu c={c} items={menuItems} defaultOpen key="dd" />
          )}
        </div>
        {pick === "banner" && shown.banner && (
          <div data-pm-frame-pad>
            <TopBanner
              c={c}
              onClose={onHide ? () => onHide("banner") : undefined}
            />
          </div>
        )}
        <div data-pm-frame-hero>
          <span />
          <span />
          <span />
        </div>
        {pick === "modal" && (
          <div data-pm-scrim data-contained>
            <div data-pm-modal>
              <ModalBody
                c={c}
                close={
                  <button type="button" data-pm-btn data-quiet>
                    Not now
                  </button>
                }
              />
            </div>
          </div>
        )}
        {pick === "reel" && shown.reel && (
          <ReelCard
            c={c}
            contained
            onClose={onHide ? () => onHide("reel") : undefined}
          />
        )}
        {pick === "toast" && (
          <m.div
            key="toast"
            data-pm-toast
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, ease },
            }}
          >
            <strong>{c.headline}</strong>
            {c.body && <span>{c.body}</span>}
            {c.cta && <Link href={c.href || "#"}>{c.cta}</Link>}
          </m.div>
        )}
      </div>
    </div>
  )
}

export function PromoStudio({
  c,
  menuItems,
}: {
  c: Campaign
  menuItems: { label: string; note: string; href: string }[]
}) {
  const [picked, setPick] = useState<Placement | null>(null)
  // A link like /promos#dock opens straight on that placement.
  const hash = useSyncExternalStore(
    (on) => {
      window.addEventListener("hashchange", on)
      return () => window.removeEventListener("hashchange", on)
    },
    () => window.location.hash.slice(1),
    () => ""
  )
  const pick: Placement =
    picked ?? placements.find((p) => p.id === hash)?.id ?? "bar"
  const [modal, setModal] = useState(false)
  const [live, setLive] = useState(false)
  const [shown, setShown] = useState({ bar: true, banner: true, reel: true })
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const spec = placements.find((p) => p.id === pick)!

  const onKey = (e: ReactKeyboardEvent, at: number) => {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (at + step + placements.length) % placements.length
    setPick(placements[next]!.id)
    refs.current[next]?.focus()
  }

  return (
    <div data-pm-studio>
      <div
        data-pm-studio-list
        role="tablist"
        aria-label="Placements"
        aria-orientation="vertical"
      >
        {placements.map((p, at) => (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[at] = el
            }}
            type="button"
            role="tab"
            id={`pm-tab-${p.id}`}
            aria-selected={p.id === pick}
            aria-controls="pm-stage"
            tabIndex={p.id === pick ? 0 : -1}
            data-on={p.id === pick ? "" : undefined}
            onClick={() => setPick(p.id)}
            onKeyDown={(e) => onKey(e, at)}
            data-pm-studio-tab
          >
            {p.name}
          </button>
        ))}
      </div>

      <div data-pm-studio-main>
        <PromoFrame
          panel={pick}
          kind={pick}
          c={c}
          menuItems={menuItems}
          shown={shown}
          onHide={(k) => setShown((s) => ({ ...s, [k]: false }))}
        />

        <div data-pm-studio-foot>
          <dl data-pm-spec>
            {[
              ["Where", spec.where],
              ["When", spec.when],
              ["How often", spec.cap],
              ["Closing", spec.dismiss],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div data-pm-actions>
            {pick === "modal" && (
              <button type="button" data-pm-btn onClick={() => setModal(true)}>
                Open the real pop-up
              </button>
            )}
            {pick === "toast" && (
              <button
                type="button"
                data-pm-btn
                onClick={() =>
                  toast(c.headline, { description: c.body || undefined })
                }
              >
                Fire the real toast
              </button>
            )}
            {(pick === "bar" || pick === "banner" || pick === "reel") && (
              <button
                type="button"
                data-pm-btn
                data-quiet
                onClick={() =>
                  setShown({ bar: true, banner: true, reel: true })
                }
              >
                Show it again
              </button>
            )}
            <button
              type="button"
              data-pm-btn
              data-quiet
              aria-pressed={live}
              onClick={() => setLive((v) => !v)}
            >
              {live ? "Hide the floating reel" : "Float it on this page"}
            </button>
          </div>
        </div>
      </div>

      <PromoModal c={c} open={modal} onOpenChange={setModal} />
      {live && <ReelCard c={c} delay={1500} onClose={() => setLive(false)} />}
    </div>
  )
}
