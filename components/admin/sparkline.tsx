/**
 * A two-week trend in 120 by 36 units: a line, a faint area under it and
 * the last day marked. Plain SVG, so the overview loads no chart library.
 */
export function Sparkline({
  values,
  label,
  className,
}: {
  values: readonly number[]
  /** What the line shows, for screen readers. */
  label: string
  className?: string
}) {
  const width = 120
  const height = 36
  const pad = 3
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0
  const points = values.map((value, i) => [
    pad + i * step,
    height - pad - (value / max) * (height - pad * 2),
  ])
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ")
  const area = `${line} L${pad + (values.length - 1) * step},${height} L${pad},${height} Z`
  const last = points.at(-1)

  return (
    <>
      <span className="sr-only">{label}</span>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
        className={className}
        preserveAspectRatio="none"
      >
        <path d={area} fill="currentColor" opacity={0.1} />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {last ? (
          <circle cx={last[0]} cy={last[1]} r={2.5} fill="currentColor" />
        ) : null}
      </svg>
    </>
  )
}
