"use client"

import { useEffect, useId, useRef, useState } from "react"

const H = 168
const PAD = { top: 12, right: 8, bottom: 22, left: 28 }

/** "Tue 21 Oct" for the day `back` days before today, in India. */
function dayLabel(asOf: number, back: number, withWeekday = true) {
  return new Date(asOf - back * 86_400_000).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    ...(withWeekday ? { weekday: "short" } : {}),
  })
}

/** A round step for the y axis: 1, 2, 5, 10, 20... */
function niceMax(max: number) {
  if (max <= 4) return 4
  const step = 10 ** Math.floor(Math.log10(max))
  for (const m of [1, 2, 5, 10]) if (m * step >= max) return m * step
  return max
}

/**
 * Enquiries per day for the last thirty days: one line in the primary blue,
 * a faint area under it, two quiet gridlines. Hover or the arrow keys put a
 * crosshair on a day with its count; a table carries the same numbers for
 * screen readers.
 */
export function EnquiryTrend({
  daily,
  asOf,
}: {
  daily: number[]
  asOf: number
}) {
  const id = useId()
  const [at, setAt] = useState<number | null>(null)
  // Drawn at its real width, so the axis text stays 11px however wide.
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const sized = new ResizeObserver(([entry]) => {
      if (entry) setW(Math.max(240, Math.round(entry.contentRect.width)))
    })
    sized.observe(el)
    return () => sized.disconnect()
  }, [])
  const n = daily.length
  const top = niceMax(Math.max(...daily, 1))
  const x = (i: number) =>
    PAD.left + (i / Math.max(1, n - 1)) * (W - PAD.left - PAD.right)
  const y = (v: number) => PAD.top + (1 - v / top) * (H - PAD.top - PAD.bottom)
  const line = daily
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join("")
  const area = `${line}L${x(n - 1).toFixed(1)} ${y(0)}L${x(0).toFixed(1)} ${y(0)}Z`
  const total = daily.reduce((a, b) => a + b, 0)

  const pick = (clientX: number, box: DOMRect) => {
    const ratio = ((clientX - box.left) / box.width) * W
    const i = Math.round(
      ((ratio - PAD.left) / (W - PAD.left - PAD.right)) * (n - 1)
    )
    setAt(Math.min(n - 1, Math.max(0, i)))
  }

  return (
    <figure className="grid gap-2">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">Enquiries per day</span>
        <span className="tnum text-xs text-muted-foreground" aria-live="polite">
          {at === null
            ? `${total} in 30 days`
            : `${dayLabel(asOf, n - 1 - at)} · ${daily[at]} ${daily[at] === 1 ? "enquiry" : "enquiries"}`}
        </span>
      </figcaption>
      {/* Pointer anywhere over the chart puts the crosshair on a day; a
          native range input over it carries the keyboard and the reading. */}
      <div
        ref={box}
        className="relative rounded-control has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40"
        onPointerMove={(e) =>
          pick(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onPointerLeave={() => setAt(null)}
      >
        <input
          type="range"
          min={0}
          max={n - 1}
          step={1}
          value={at ?? n - 1}
          onChange={(e) => setAt(Number(e.target.value))}
          onFocus={() => setAt((cur) => cur ?? n - 1)}
          onBlur={() => setAt(null)}
          aria-label="Enquiries per day, last 30 days"
          aria-valuetext={`${dayLabel(asOf, n - 1 - (at ?? n - 1))}, ${daily[at ?? n - 1]} enquiries`}
          className="absolute inset-0 z-1 size-full cursor-crosshair opacity-0"
        />
        <svg
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden
          className="block h-auto w-full overflow-visible"
        >
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0.16" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, top / 2, top].map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--border)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD.left - 8}
                y={y(v) + 4}
                textAnchor="end"
                className="tnum fill-muted-foreground text-[11px]"
              >
                {v}
              </text>
            </g>
          ))}
          {[n - 1, Math.floor((n - 1) / 2), 0].map((back) => (
            <text
              key={back}
              x={x(n - 1 - back)}
              y={H - 4}
              textAnchor={
                back === n - 1 ? "start" : back === 0 ? "end" : "middle"
              }
              className="fill-muted-foreground text-[11px]"
            >
              {back === 0 ? "Today" : dayLabel(asOf, back, false)}
            </text>
          ))}
          <path d={area} fill={`url(#${id}-fill)`} />
          <path
            d={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {at !== null ? (
            <g>
              <line
                x1={x(at)}
                x2={x(at)}
                y1={PAD.top}
                y2={y(0)}
                stroke="var(--foreground)"
                strokeOpacity={0.25}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={x(at)}
                cy={y(daily[at]!)}
                r={4.5}
                fill="var(--primary)"
                stroke="var(--card)"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ) : null}
        </svg>
      </div>
      <table className="sr-only">
        <caption>Enquiries per day, last 30 days</caption>
        <tbody>
          {daily.map((v, i) => (
            <tr key={i}>
              <th scope="row">{dayLabel(asOf, n - 1 - i)}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
