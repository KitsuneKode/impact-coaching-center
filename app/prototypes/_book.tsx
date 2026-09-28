import Image from "next/image"
import type { CSSProperties } from "react"

import type { Shelf } from "./_data"

type Book = Shelf["books"][number]
export type BookTones = Record<
  Book["tone"],
  { bg: string; ink: string; spine: string }
>

/** Half the book's thickness in px, from its page count. */
function halfDepth(pages: number) {
  return Math.round(Math.min(20, Math.max(9, 6 + pages / 24)))
}

/**
 * A book as a 3D object: cover, spine, page block and back. With a cover
 * photo the spine takes its colour from the cover's own edge (or a spine
 * image when the print file supplied one); without one the cover is typeset.
 * It rests turned to show the spine and swings toward the reader on hover.
 * `TurnBook` can spin it right round to the back. Needs `bookCss`.
 */
export function Book3D({
  book,
  tones,
  font,
}: {
  book: Book
  tones: BookTones
  /** CSS font-family for typeset text */
  font: string
}) {
  const t = tones[book.tone]
  const spine = book.spine ?? { bg: t.spine, ink: t.ink }
  const style = {
    "--bk-bg": t.bg,
    "--bk-ink": t.ink,
    "--bk-spine": spine.bg,
    "--bk-spine-ink": spine.ink,
    "--bk-font": font,
    "--bk-d": `${halfDepth(book.pages)}px`,
  } as CSSProperties
  return (
    <div data-bk style={style} aria-hidden>
      <div data-bk-inner>
        <div data-bk-spine>
          {book.spineUrl ? (
            <Image src={book.spineUrl} alt="" fill sizes="40px" />
          ) : (
            <span>{book.title}</span>
          )}
        </div>
        <div data-bk-pages />
        <div data-bk-back>
          {book.backUrl ? (
            <Image src={book.backUrl} alt="" fill sizes="320px" />
          ) : (
            <>
              <span data-bk-blurb>{book.description}</span>
              <span data-bk-foot>
                <Image
                  src="/brand/ict-mark.png"
                  alt=""
                  width={18}
                  height={18}
                />
                {book.price}
              </span>
            </>
          )}
        </div>
        <div data-bk-cover data-photo={book.coverUrl ? "" : undefined}>
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 320px, 45vw"
            />
          ) : (
            <>
              <span data-bk-exam>{book.exam}</span>
              <span data-bk-title>{book.title}</span>
              <span data-bk-sub>{book.subtitle}</span>
              <span data-bk-foot>
                <Image
                  src="/brand/ict-mark.png"
                  alt=""
                  width={18}
                  height={18}
                />
                Impact Career Tutorials
              </span>
            </>
          )}
        </div>
      </div>
      <div data-bk-shadow />
    </div>
  )
}

/** Shared geometry. The hover trigger is any ancestor with `data-bk-hover`. */
export const bookCss = `
@property --bk-rest { syntax: "<angle>"; inherits: false; initial-value: 28deg; }
[data-bk] { position: relative; perspective: 1400px; padding: 0 18px 18px; }
[data-bk-inner] { position: relative; aspect-ratio: 3 / 4; transform-style: preserve-3d;
  transform: rotateY(calc(var(--bk-rest) + var(--bk-turn, 0deg)));
  transition: --bk-rest 0.6s cubic-bezier(0.23, 1, 0.32, 1), translate 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
[data-bk-cover], [data-bk-back] { position: absolute; inset: 0; border-radius: 2px 7px 7px 2px; overflow: hidden; backface-visibility: hidden; }
[data-bk-cover] { transform: translateZ(var(--bk-d)); background: var(--bk-bg); color: var(--bk-ink);
  display: flex; flex-direction: column; padding: 14% 12% 10% 16%;
  box-shadow: inset 4px 0 0 rgba(0,0,0,0.08), inset 7px 0 0 rgba(255,255,255,0.12); }
/* Hinge crease and a soft sheen, over photo or typeset alike. */
[data-bk-cover]::after { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background: linear-gradient(90deg, rgba(0,0,0,0.22) 0, rgba(0,0,0,0.05) 2.5%, rgba(255,255,255,0.14) 3.5%, transparent 6%),
    linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.12) 34%, transparent 55%); }
[data-bk-cover][data-photo] { padding: 0; }
[data-bk-cover] img, [data-bk-back] img, [data-bk-spine] img { object-fit: cover; }
[data-bk-back] { transform: rotateY(180deg) translateZ(var(--bk-d)); background: var(--bk-spine); color: var(--bk-spine-ink);
  display: flex; flex-direction: column; padding: 16% 14% 12%; }
[data-bk-blurb] { font: 400 clamp(9px, 0.9vw, 12px)/1.5 var(--bk-font); opacity: 0.9; display: -webkit-box; -webkit-line-clamp: 9; -webkit-box-orient: vertical; overflow: hidden; }
[data-bk-back] [data-bk-foot] { margin-top: auto; font-size: 11px; font-weight: 600; }
[data-bk-spine] { position: absolute; top: 0; bottom: 0; left: calc(var(--bk-d) * -1); width: calc(var(--bk-d) * 2); transform: rotateY(-90deg);
  background: var(--bk-spine); color: var(--bk-spine-ink); display: grid; place-items: center; overflow: hidden;
  box-shadow: inset 2px 0 0 rgba(255,255,255,0.12), inset -2px 0 0 rgba(0,0,0,0.18); }
[data-bk-spine] span { writing-mode: vertical-rl; transform: rotate(180deg); font: 600 9px/1 var(--bk-font); letter-spacing: 0.04em; white-space: nowrap; opacity: 0.85; }
[data-bk-pages] { position: absolute; top: 3px; bottom: 3px; left: calc(100% - var(--bk-d)); width: calc(var(--bk-d) * 2 - 2px); transform: rotateY(90deg);
  background: repeating-linear-gradient(90deg, #F4F2EC 0 1px, #D9D5CB 1px 2px); }
[data-bk-exam] { position: relative; font: 500 10px/1.2 var(--bk-font); opacity: 0.75; }
[data-bk-title] { position: relative; margin-top: auto; font: 650 clamp(15px, 1.5vw, 21px)/1.05 var(--bk-font); letter-spacing: -0.02em; text-wrap: balance; }
[data-bk-sub] { position: relative; margin-top: 8px; font: 400 10px/1.35 var(--bk-font); opacity: 0.75; text-wrap: balance; }
[data-bk-foot] { position: relative; margin-top: 16%; display: flex; align-items: center; gap: 6px; font: 500 8.5px/1 var(--bk-font); opacity: 0.8; }
[data-bk-foot] img { border-radius: 4px; background: #fff; }
[data-bk-shadow] { position: absolute; left: 14%; right: 6%; bottom: 4px; height: 18px; border-radius: 50%; background: var(--bk-shadow, rgba(0,0,0,0.45)); filter: blur(12px); transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s; }
@media (hover: hover) {
  [data-bk-hover]:hover [data-bk-inner], [data-bk-hover]:focus-visible [data-bk-inner] { --bk-rest: 8deg; translate: 0 -8px; }
  [data-bk-hover]:hover [data-bk-shadow] { transform: scale(0.9); opacity: 0.7; }
}
[data-bk-turning] [data-bk-inner] { --bk-rest: 12deg; }
@media (prefers-reduced-motion: reduce) { [data-bk-inner] { transition: none; } }
`
