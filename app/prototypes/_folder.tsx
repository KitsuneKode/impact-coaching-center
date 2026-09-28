import type { CSSProperties } from "react"

import type { Shelf } from "./_data"

type FolderData = Shelf["folders"][number]
export type FolderTones = {
  back: string
  front: string
  paper: string
  ink: string
  muted: string
}

/**
 * A free-material folder as an object: tab, back, papers and a front flap.
 * Hovering any `data-fd-hover` ancestor (or marking it `data-fd-open`) tips
 * the flap forward and lifts the papers. Empty folders hold no papers.
 * Needs `folderCss`.
 */
export function Folder({
  folder,
  tones,
  name = folder.name,
  count,
}: {
  folder: FolderData
  tones: FolderTones
  /** Overrides for another language. */
  name?: string
  count?: string
}) {
  const n = folder.items.length
  const style = {
    "--fd-back": tones.back,
    "--fd-front": tones.front,
    "--fd-paper": tones.paper,
    "--fd-ink": tones.ink,
    "--fd-muted": tones.muted,
  } as CSSProperties
  return (
    <span data-fd data-empty={n ? undefined : ""} style={style}>
      <span data-fd-tab aria-hidden />
      <span data-fd-back aria-hidden />
      {n > 0 && <span data-fd-paper="0" aria-hidden />}
      {n > 1 && <span data-fd-paper="1" aria-hidden />}
      <span data-fd-front>
        <span data-fd-name>{name}</span>
        <span data-fd-count>
          {count ??
            (n
              ? `${n} ${n === 1 ? "file" : "files"}, free`
              : "Nothing here yet")}
        </span>
      </span>
    </span>
  )
}

export const folderCss = `
[data-fd] { position: relative; display: block; aspect-ratio: 4 / 3; perspective: 900px; container-type: inline-size; }
[data-fd-tab] { position: absolute; left: 0; top: 0; width: 44%; height: 18%; background: var(--fd-back); border-radius: 10px 12px 0 0; clip-path: polygon(0 0, 84% 0, 100% 100%, 0 100%); }
[data-fd-back] { position: absolute; left: 0; right: 0; top: 13%; bottom: 0; background: var(--fd-back); border-radius: 0 14px 14px 14px; }
[data-fd-paper] { position: absolute; left: 8%; right: 8%; top: 20%; height: 62%; border-radius: 6px; background: var(--fd-paper);
  background-image: repeating-linear-gradient(to bottom, transparent 0 11px, rgba(0,0,0,0.07) 11px 12px); background-position: 0 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.12); transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1); }
[data-fd-paper="1"] { left: 14%; right: 5%; transform: rotate(3deg); }
[data-fd-front] { position: absolute; left: 0; right: 0; bottom: 0; top: 32%; display: flex; flex-direction: column; justify-content: flex-end;
  padding: 0 9cqi 8cqi; border-radius: 14px; background: var(--fd-front); color: var(--fd-ink); transform-origin: 50% 100%;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 -8px 18px -12px rgba(0,0,0,0.45); transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1); }
[data-fd-name] { font-weight: 600; font-size: clamp(12px, 7.2cqi, 18px); line-height: 1.15; letter-spacing: -0.01em; text-wrap: balance; }
[data-fd-count] { margin-top: 3cqi; font-size: clamp(11px, 5.4cqi, 13px); color: var(--fd-muted); }
[data-empty] [data-fd-front] { opacity: 0.85; }
@media (hover: hover) {
  [data-fd-hover]:hover [data-fd-front] { transform: rotateX(-16deg); }
  [data-fd-hover]:hover [data-fd-paper="0"] { transform: translateY(-18%); }
  [data-fd-hover]:hover [data-fd-paper="1"] { transform: translateY(-26%) rotate(6deg); }
}
[data-fd-hover]:focus-visible [data-fd-front], [data-fd-open] [data-fd-front] { transform: rotateX(-16deg); }
[data-fd-hover]:focus-visible [data-fd-paper="0"], [data-fd-open] [data-fd-paper="0"] { transform: translateY(-18%); }
[data-fd-hover]:focus-visible [data-fd-paper="1"], [data-fd-open] [data-fd-paper="1"] { transform: translateY(-26%) rotate(6deg); }
@media (prefers-reduced-motion: reduce) { [data-fd-front], [data-fd-paper] { transition: none; } }
`
