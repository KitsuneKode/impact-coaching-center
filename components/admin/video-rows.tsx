"use client"

import {
  IconArrowDown,
  IconArrowUp,
  IconBrandYoutube,
  IconPlus,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useRef, type ClipboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { youtubeId } from "@/lib/campaigns"

/** Each row's video, or what is wrong with it; blank rows are skipped. */
export function readVideoRows(rows: readonly string[]) {
  const ids: string[] = []
  const problems: (string | null)[] = rows.map((row) => {
    if (!row.trim()) return null
    const id = youtubeId(row)
    if (!id) return "Not a YouTube link"
    if (ids.includes(id)) return "Already in the list"
    ids.push(id)
    return null
  })
  return { ids, problems }
}

/**
 * The reel's videos, a row each: paste a link and its picture appears;
 * move it up or down, take it out, add another. Pasting several links into
 * one row spreads them over new rows.
 */
export function VideoRows({
  rows,
  onChange,
  max,
  invalid,
}: {
  rows: readonly string[]
  onChange: (rows: string[]) => void
  max: number
  invalid?: boolean
}) {
  const { problems } = readVideoRows(rows)
  const list = useRef<HTMLOListElement>(null)
  // Where focus goes after a row is added or moved, so the keyboard keeps
  // its place. Read after the next render, when the row exists.
  const focus = useRef<{ row: number; on: string } | null>(null)
  useEffect(() => {
    if (!focus.current) return
    const { row, on } = focus.current
    focus.current = null
    list.current
      ?.querySelector<HTMLElement>(`[data-row="${row}"] [data-focus="${on}"]`)
      ?.focus()
  })
  const setFocus = (next: { row: number; on: string }) => {
    focus.current = next
  }

  const put = (i: number, value: string) =>
    onChange(rows.map((row, k) => (k === i ? value : row)))
  const move = (i: number, by: -1 | 1) => {
    const next = [...rows]
    const [row] = next.splice(i, 1)
    next.splice(i + by, 0, row!)
    onChange(next)
    // At either end that button is disabled, so focus takes the other.
    const to = i + by
    const edge = to === 0 || to === rows.length - 1
    setFocus({ row: to, on: by < 0 !== edge ? "up" : "down" })
  }
  const remove = (i: number) => {
    const next = rows.filter((_, k) => k !== i)
    onChange(next)
    if (next.length) setFocus({ row: Math.min(i, next.length - 1), on: "link" })
  }
  const add = () => {
    onChange([...rows, ""])
    setFocus({ row: rows.length, on: "link" })
  }
  const onPaste = (i: number, event: ClipboardEvent<HTMLInputElement>) => {
    const links = event.clipboardData
      .getData("text")
      .split(/\s+/)
      .filter(Boolean)
    if (links.length < 2) return
    event.preventDefault()
    const next = [...rows]
    next.splice(i, 1, ...links)
    onChange(next.slice(0, Math.max(max, rows.length)))
  }

  const filled = rows.filter((row) => row.trim()).length

  return (
    <div className="grid gap-3">
      {rows.length ? (
        <ol ref={list} className="grid gap-2">
          {rows.map((row, i) => {
            const id = problems[i] ? null : youtubeId(row)
            const problem = problems[i]
            return (
              <li
                // Rows have no identity beyond their place; focus is
                // carried by index above.
                key={i}
                data-row={i}
                className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-control bg-secondary/55 p-2 pe-1.5"
              >
                <span className="relative grid aspect-[9/16] w-12 place-items-center overflow-clip rounded-[8px] bg-foreground/[0.07] text-muted-foreground">
                  {id ? (
                    // A plain img: the admin preview needs no resizing.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                      alt=""
                      className="absolute inset-0 size-full object-cover outline-1 -outline-offset-1 outline-black/10"
                    />
                  ) : (
                    <IconBrandYoutube aria-hidden size={18} stroke={1.75} />
                  )}
                </span>
                <span className="grid min-w-0 gap-1">
                  <label
                    htmlFor={`p-video-${i}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Video {i + 1}
                  </label>
                  <Input
                    id={`p-video-${i}`}
                    data-focus="link"
                    value={row}
                    onChange={(e) => put(i, e.target.value)}
                    onPaste={(e) => onPaste(i, e)}
                    aria-invalid={!!problem || (invalid && !row.trim())}
                    aria-describedby={
                      problem ? `p-video-${i}-error` : undefined
                    }
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://youtube.com/shorts/…"
                  />
                  {problem ? (
                    <span
                      id={`p-video-${i}-error`}
                      className="text-xs text-destructive"
                    >
                      {problem}
                    </span>
                  ) : null}
                </span>
                <span className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    data-focus="up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={`Move video ${i + 1} up`}
                  >
                    <IconArrowUp aria-hidden stroke={2} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    data-focus="down"
                    disabled={i === rows.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Move video ${i + 1} down`}
                  >
                    <IconArrowDown aria-hidden stroke={2} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(i)}
                    aria-label={`Remove video ${i + 1}`}
                  >
                    <IconX aria-hidden stroke={2} />
                  </Button>
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={add}
          disabled={rows.length >= max}
        >
          <IconPlus aria-hidden stroke={2} />
          {rows.length ? "Add another video" : "Add a video"}
        </Button>
        <span className="tnum text-sm text-muted-foreground">
          {filled} of {max}
        </span>
      </div>
    </div>
  )
}
