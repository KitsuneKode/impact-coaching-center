"use client"

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { Book3D, type BookTone } from "@/components/home/book-3d"
import { Link } from "@/i18n/navigation"
import {
  inLanguage,
  lowestPrice,
  type Language,
  type PublicBook,
  type PublicBundle,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

const TONES: readonly BookTone[] = ["amber", "paper", "ink"]
/** Pixels of drag that move the track by one volume. */
const STEP_PX = 70

/**
 * Where a volume sits for its distance from the one in front: the front
 * one big and facing the reader; the rest smaller up the diagonal behind
 * it (next) or down it (before), turned to their spines. rem, so the
 * track scales with the type; `tight` is a phone's shorter steps.
 */
function place(d: number, tight: boolean) {
  if (d === 0) return { x: 0, y: 0, scale: 1, opacity: 1 }
  const n = Math.abs(d) - 1
  const step = tight
    ? { x: 4.2, y: 1.6, first: 6.5 }
    : { x: 6.8, y: 2.6, first: 11 }
  const x = step.first + n * step.x
  const y = (tight ? 2.2 : 3.4) + n * step.y
  return {
    x: d > 0 ? x : -x,
    y: d > 0 ? -y : y,
    scale: Math.max(0.36, 0.6 - n * 0.05),
    opacity: Math.abs(d) > 5 ? 0 : 1,
  }
}

/**
 * Every book ICT prints as a track of volumes up a diagonal, after the
 * manga changelog on vibrant.design: one volume in front with its details
 * beside it, the others receding behind and before it. Drag, the arrows,
 * the arrow keys or a tap on a volume bring it to the front; the front
 * one opens its set. The page's own scroll is left alone.
 */
export function VolumeShelf({
  bundles,
  language,
  label,
}: {
  bundles: PublicBundle[]
  language: Language
  label: string
}) {
  const t = useTranslations("Shelf")
  const [at, setAt] = useState(0)
  const [dealt, setDealt] = useState(false)
  const [moved, setMoved] = useState(false)
  // A phone's shorter steps along the diagonal.
  const tight = useSyncExternalStore(
    (change) => {
      const narrow = matchMedia("(width < 40rem)")
      narrow.addEventListener("change", change)
      return () => narrow.removeEventListener("change", change)
    },
    () => matchMedia("(width < 40rem)").matches,
    () => false
  )
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; moved: boolean } | null>(null)

  // Each book once, with the first set it belongs to.
  const seen = new Set<string>()
  const volumes: { book: PublicBook; set: PublicBundle }[] = []
  for (const set of bundles)
    for (const book of set.books)
      if (!seen.has(book.slug)) {
        seen.add(book.slug)
        volumes.push({ book, set })
      }
  const shown = volumes.slice(0, 12)

  // The volumes deal out from the front one the first time it is seen.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setDealt(true)
        watcher.disconnect()
      },
      { threshold: 0.3 }
    )
    watcher.observe(el)
    return () => watcher.disconnect()
  }, [])

  if (shown.length < 3) return null
  const go = (next: number) => {
    setMoved(true)
    setAt(Math.max(0, Math.min(shown.length - 1, next)))
  }
  const front = shown[at]!
  const edition = (book: PublicBook) =>
    book.editions[language] ?? book.editions.en ?? book.editions.as
  const frontEdition = edition(front.book)
  const price = lowestPrice(front.set)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") go(at + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") go(at - 1)
    else if (event.key === "Home") go(0)
    else if (event.key === "End") go(shown.length - 1)
    else return
    event.preventDefault()
  }
  // A drag along the track moves it a volume per step, as it goes.
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    drag.current = { x: event.clientX, moved: false }
  }
  const onPointerMove = (event: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = event.clientX - d.x
    if (Math.abs(dx) < STEP_PX) return
    d.moved = true
    d.x = event.clientX
    // Dragging left pulls the next volume forward, as on a phone.
    setMoved(true)
    setAt((cur) =>
      Math.max(0, Math.min(shown.length - 1, cur + (dx < 0 ? 1 : -1)))
    )
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (d?.moved) stage.current?.setAttribute("data-dragged", "")
    requestAnimationFrame(() => stage.current?.removeAttribute("data-dragged"))
  }

  return (
    <section
      aria-label={label}
      className="container-page overflow-x-clip pbe-10"
    >
      <div
        data-track
        className="grid items-center gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
      >
        <div
          aria-live="polite"
          className="order-2 grid content-start gap-3 lg:order-1"
        >
          <p className="tnum text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {t("position", { n: at + 1, total: shown.length })}
          </p>
          <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {frontEdition?.title}
          </h2>
          {frontEdition?.subtitle ? (
            <p className="text-pretty text-muted-foreground">
              {frontEdition.subtitle}
            </p>
          ) : null}
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-border pbs-3 text-sm">
            <dt className="text-muted-foreground">{t("set")}</dt>
            <dd className="font-medium">
              {inLanguage(front.set.title, language)}
            </dd>
            {frontEdition?.pages ? (
              <>
                <dt className="text-muted-foreground">{t("pages")}</dt>
                <dd className="tnum font-medium">{frontEdition.pages}</dd>
              </>
            ) : null}
            {price !== null ? (
              <>
                <dt className="text-muted-foreground">{t("price")}</dt>
                <dd className="tnum font-medium">
                  {t("from", { price: formatPaise(price) })}
                </dd>
              </>
            ) : null}
          </dl>
          <div className="flex items-center gap-2 pbs-2">
            <Link
              href={`/books/${front.set.slug}`}
              data-press
              data-raise="primary"
              className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold text-primary-foreground"
            >
              {t("open")}
              <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
            </Link>
            <button
              type="button"
              onClick={() => go(at - 1)}
              onKeyDown={onKeyDown}
              disabled={at === 0}
              aria-label={t("previous")}
              data-track-arrow
              className="ms-auto grid size-11 place-items-center rounded-full"
            >
              <IconArrowLeft aria-hidden size={18} stroke={2} />
            </button>
            <button
              type="button"
              onClick={() => go(at + 1)}
              onKeyDown={onKeyDown}
              disabled={at === shown.length - 1}
              aria-label={t("next")}
              data-track-arrow
              className="grid size-11 place-items-center rounded-full"
            >
              <IconArrowRight aria-hidden size={18} stroke={2} />
            </button>
          </div>
        </div>

        {/* The track itself is for the pointer; the keyboard has the
            arrows beside the details (and arrow keys on them). */}
        <div
          ref={stage}
          data-track-stage
          data-dealt={dealt ? "" : undefined}
          data-moved={moved ? "" : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(event) => {
            if (stage.current?.hasAttribute("data-dragged")) {
              event.preventDefault()
              event.stopPropagation()
            }
          }}
          className="relative order-1 lg:order-2"
        >
          {shown.map(({ book, set }, i) => {
            const d = i - at
            const spot = dealt ? place(d, tight) : place(0, tight)
            const style = {
              translate: `${spot.x}rem ${spot.y}rem`,
              scale: spot.scale,
              opacity: dealt ? spot.opacity : d === 0 ? 1 : 0,
              zIndex: 50 - Math.abs(d),
              "--delay": `${Math.abs(d) * 45}ms`,
            } as CSSProperties
            const ed = edition(book)
            const art = (
              <Book3D
                title={ed?.title ?? ""}
                subtitle={ed?.subtitle}
                exam={book.exam}
                cover={ed?.cover}
                pages={ed?.pages}
                tone={TONES[i % TONES.length]}
              />
            )
            return d === 0 ? (
              <Link
                key={book.slug}
                href={`/books/${set.slug}`}
                tabIndex={-1}
                aria-hidden
                data-track-volume
                data-front
                data-book-open
                style={style}
                draggable={false}
              >
                {art}
              </Link>
            ) : (
              <button
                key={book.slug}
                type="button"
                tabIndex={-1}
                aria-hidden
                data-track-volume
                onClick={() => go(i)}
                style={style}
              >
                {art}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
