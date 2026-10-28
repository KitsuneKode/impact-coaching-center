"use client"

import {
  IconArrowRight,
  IconPlayerPlayFilled,
  IconVolumeOff,
  IconX,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { ReelViewer } from "@/components/site/reel-viewer"

/** How long each clip plays in the small card before the next one. */
const CLIP_MS = 14_000
/** Not before the visitor has had this long with the page. */
const SETTLE_MS = 5_000
/** Or this long on the page without scrolling. */
const LATE_MS = 15_000

function embed(id: string) {
  const q = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
    disablekb: "1",
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`
}

/** Data saver or reduced motion: a still with a play button, no player. */
function wantsStill() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  return (
    Boolean(nav.connection?.saveData) ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/** Something else already holds the bottom corner of the screen. */
function cornerTaken() {
  return (
    document.querySelector("[data-language-prompt], [data-paper-books]") !==
    null
  )
}

/**
 * Students' videos in a small vertical card at the bottom right, as on
 * Instagram and Shorts: muted, looping, a new clip every fourteen seconds
 * (a hover holds it), and a tap opens it full size with sound. It comes in
 * a few seconds after the visitor starts scrolling (or after fifteen
 * seconds on the first screen), and once closed it
 * rests for the campaign's rest days.
 *
 * `contained` is the admin's preview: inside its frame and shown at once.
 */
export function FloatingReel({
  ids,
  title,
  cta,
  onShow,
  onPlay,
  onClose,
  contained = false,
}: {
  ids: readonly string[]
  title: string
  cta?: { label: string; href: string; onClick?: () => void }
  onShow?: () => void
  onPlay?: () => void
  onClose?: () => void
  contained?: boolean
}) {
  const t = useTranslations("Promos")
  const [shown, setShown] = useState(contained)
  const [leaving, setLeaving] = useState(false)
  // Server and first paint: the still, until the browser can say.
  const still = useSyncExternalStore(
    () => () => {},
    wantsStill,
    () => true
  )
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  const [viewer, setViewer] = useState<number | null>(null)
  const [loaded, setLoaded] = useState<string | null>(null)
  // The latest callback, read when the card comes in.
  const onShowRef = useRef(onShow)
  useEffect(() => {
    onShowRef.current = onShow
  })

  // Comes in once the visitor has settled in, never over the
  // language question or the books' own corner card.
  useEffect(() => {
    if (contained) return
    const started = performance.now()
    const timer = window.setInterval(() => {
      const waited = performance.now() - started
      if (waited < SETTLE_MS || cornerTaken()) return
      // A first scroll shows interest; a visitor who only reads the first
      // screen still sees it after a while.
      if (window.scrollY < window.innerHeight * 0.3 && waited < LATE_MS) return
      window.clearInterval(timer)
      setShown(true)
      onShowRef.current?.()
    }, 500)
    return () => window.clearInterval(timer)
  }, [contained])

  const running = shown && !still && !hold && viewer === null && ids.length > 1
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(
      () => setI((v) => (v + 1) % ids.length),
      CLIP_MS
    )
    return () => window.clearTimeout(timer)
  }, [running, i, ids.length])

  if (!ids.length || !shown) return null
  const id = ids[i]!

  // The parent forgets it once the exit has played (onAnimationEnd).
  const close = () => setLeaving(true)

  return (
    <>
      <aside
        aria-label={title}
        data-floating-reel={contained ? "contained" : ""}
        data-leaving={leaving ? "" : undefined}
        onAnimationEnd={(event) => {
          if (!leaving || event.target !== event.currentTarget) return
          setShown(false)
          onClose?.()
        }}
        onPointerEnter={() => setHold(true)}
        onPointerLeave={() => setHold(false)}
      >
        <div data-reel-media>
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="14rem"
            className="object-cover"
          />
          {still ? null : (
            /* Taller than the card, so YouTube's title bar sits off the
               top edge; it is decoration here, the tap opens the player. */
            <iframe
              key={id}
              src={embed(id)}
              title={`${title} (${i + 1})`}
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
              aria-hidden
              data-loaded={loaded === id ? "" : undefined}
              // The still stays over the player while it paints black and
              // shows its start-up controls, then the video takes over.
              onLoad={() => window.setTimeout(() => setLoaded(id), 3200)}
            />
          )}
          <span data-reel-shade aria-hidden />
          <button
            type="button"
            data-reel-hit
            aria-label={t("reelPlay", { n: i + 1, title })}
            onClick={() => {
              setViewer(i)
              onPlay?.()
            }}
          />
        </div>

        {ids.length > 1 ? (
          <ol data-reel-bars aria-hidden>
            {ids.map((videoId, k) => (
              <li key={videoId}>
                <span
                  key={k === i ? `${i}-${running}` : k}
                  data-done={k < i ? "" : undefined}
                  data-now={k === i && running ? "" : undefined}
                  style={{ animationDuration: `${CLIP_MS}ms` }}
                />
              </li>
            ))}
          </ol>
        ) : null}

        <span data-reel-badge aria-hidden>
          {still ? (
            <IconPlayerPlayFilled size={12} />
          ) : (
            <IconVolumeOff size={13} stroke={2} />
          )}
          {still ? t("reelWatch") : t("reelSound")}
        </span>
        {contained ? null : (
          <button
            type="button"
            data-reel-close
            aria-label={t("reelClose")}
            onClick={close}
          >
            <IconX aria-hidden size={15} stroke={2.25} />
          </button>
        )}

        {cta ? (
          <a
            href={cta.href || "#"}
            {...(cta.href.startsWith("http")
              ? { target: "_blank", rel: "noreferrer noopener" }
              : {})}
            onClick={cta.onClick}
            data-reel-cta
            data-press
          >
            <span className="truncate">{cta.label}</span>
            <IconArrowRight aria-hidden size={15} stroke={2.25} />
          </a>
        ) : null}
      </aside>
      <ReelViewer
        ids={ids}
        index={viewer}
        onIndexChange={(next) => {
          setViewer(next)
          setI(next)
        }}
        onClose={() => setViewer(null)}
        title={title}
        cta={cta}
      />
    </>
  )
}
