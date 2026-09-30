import type { ReactNode, SVGProps } from "react"

/**
 * Isometric models from boxes. A box is x, y, z, width (along x), depth
 * (along y) and height; it is projected at 30 degrees and drawn as three
 * faces with one ink line, the way line-drawn isometric sets are.
 */

export type Tone = "pearl" | "paper" | "sapphire" | "bronze" | "ink" | "sky"
const tones: Record<Tone, [top: string, front: string, side: string]> = {
  pearl: ["#FFFFFF", "#EDEAE1", "#DAD5C8"],
  paper: ["#FFFFFF", "#F2F0EA", "#E4E1D8"],
  sapphire: ["#4C80CD", "#174A92", "#003478"],
  bronze: ["#FEC396", "#E3A97D", "#C99065"],
  ink: ["#2A3550", "#0B1433", "#000624"],
  sky: ["#DBE9FE", "#B6D3FE", "#8AB9FF"],
}

const C = Math.cos(Math.PI / 6)
export const U = 10

export function pt(x: number, y: number, z: number): [number, number] {
  return [
    Math.round((x - y) * C * U * 100) / 100,
    Math.round(((x + y) * 0.5 - z) * U * 100) / 100,
  ]
}
const poly = (pts: [number, number, number][]) =>
  pts.map((p) => pt(...p).join(",")).join(" ")

export type BoxSpec = {
  x: number
  y: number
  z: number
  w: number
  d: number
  h: number
  tone?: Tone
}

export function Box({ x, y, z, w, d, h, tone = "pearl" }: BoxSpec) {
  const [top, front, side] = tones[tone]
  const t = z + h
  return (
    <g>
      <polygon
        fill={front}
        points={poly([
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, t],
          [x, y + d, t],
        ])}
      />
      <polygon
        fill={side}
        points={poly([
          [x + w, y, z],
          [x + w, y + d, z],
          [x + w, y + d, t],
          [x + w, y, t],
        ])}
      />
      <polygon
        fill={top}
        points={poly([
          [x, y, t],
          [x + w, y, t],
          [x + w, y + d, t],
          [x, y + d, t],
        ])}
      />
    </g>
  )
}

/** A flat shape on a box's top, for screens, pages and marks. */
export function Decal({
  x,
  y,
  z,
  w,
  d,
  fill,
}: {
  x: number
  y: number
  z: number
  w: number
  d: number
  fill: string
}) {
  return (
    <polygon
      fill={fill}
      points={poly([
        [x, y, z],
        [x + w, y, z],
        [x + w, y + d, z],
        [x, y + d, z],
      ])}
    />
  )
}

/** A soft elliptical shadow under a floating piece. */
export function Shade({
  x,
  y,
  w,
  d,
}: {
  x: number
  y: number
  w: number
  d: number
}) {
  const [cx, cy] = pt(x + w / 2, y + d / 2, 0)
  return (
    <ellipse
      data-iso-shade
      cx={cx}
      cy={cy}
      rx={((w + d) / 2) * C * U * 0.95}
      ry={((w + d) / 4) * U * 0.95}
      fill="currentColor"
      opacity={0.12}
    />
  )
}

/** The drawing: every face shares one ink line. */
export function Iso({
  children,
  viewBox,
  ...rest
}: {
  children: ReactNode
  viewBox: string
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={viewBox}
      stroke="currentColor"
      color="var(--dm-ink, #000624)"
      strokeWidth={1.15}
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  The models                                                         */
/* ------------------------------------------------------------------ */

export function Plinth({ x, y, s = 10 }: { x: number; y: number; s?: number }) {
  return <Box x={x} y={y} z={0} w={s} d={s} h={1.1} tone="paper" />
}

export function Classroom({ x = 0, y = 0 }: { x?: number; y?: number }) {
  const desks: BoxSpec[] = []
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 2; c++)
      desks.push({
        x: x + 1.3 + c * 3.8,
        y: y + 3.2 + r * 2.2,
        z: 1.1,
        w: 2.9,
        d: 1.1,
        h: 1.1,
        tone: "pearl",
      })
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box
        x={x + 1.4}
        y={y + 0.6}
        z={1.1}
        w={7.2}
        d={0.45}
        h={3.6}
        tone="ink"
      />
      <Decal x={x + 2} y={y + 1.06} z={4.2} w={6} d={0.01} fill="#174A92" />
      <Box
        x={x + 3.6}
        y={y + 1.6}
        z={1.1}
        w={2.8}
        d={1.1}
        h={1.3}
        tone="bronze"
      />
      {desks.map((b, i) => (
        <Box key={i} {...b} />
      ))}
    </g>
  )
}

export function Library({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box
        x={x + 0.8}
        y={y + 0.8}
        z={1.1}
        w={1.4}
        d={8.2}
        h={5.6}
        tone="pearl"
      />
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          x={x + 2.2}
          y={y + 1.2 + i * 1.9}
          z={1.1 + (i % 2) * 0.2}
          w={0.5}
          d={1.3}
          h={2.2 - (i % 3) * 0.3}
          tone={i % 2 ? "bronze" : "sapphire"}
        />
      ))}
      <Box
        x={x + 4.6}
        y={y + 3.4}
        z={1.1}
        w={4}
        d={3.4}
        h={1.5}
        tone="bronze"
      />
      <Box
        x={x + 5.2}
        y={y + 3.9}
        z={2.6}
        w={1.8}
        d={1.2}
        h={0.35}
        tone="sapphire"
      />
      <Box
        x={x + 5.4}
        y={y + 4.1}
        z={2.95}
        w={1.5}
        d={1}
        h={0.3}
        tone="paper"
      />
    </g>
  )
}

export function Phone({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box x={x + 2.4} y={y + 1.3} z={1.1} w={5} d={7.6} h={0.6} tone="ink" />
      <Decal x={x + 2.9} y={y + 1.9} z={1.72} w={4} d={6.2} fill="#174A92" />
      <Decal x={x + 3.4} y={y + 2.5} z={1.73} w={3} d={2.2} fill="#8AB9FF" />
      <Box
        x={x + 3.6}
        y={y + 5.4}
        z={1.72}
        w={2.6}
        d={0.5}
        h={0.14}
        tone="bronze"
      />
      <Box
        x={x + 3.6}
        y={y + 6.4}
        z={1.72}
        w={1.8}
        d={0.5}
        h={0.14}
        tone="paper"
      />
    </g>
  )
}

export function MockHall({ x = 0, y = 0 }: { x?: number; y?: number }) {
  const desks: BoxSpec[] = []
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      desks.push({
        x: x + 1 + c * 2.9,
        y: y + 1 + r * 2.9,
        z: 1.1,
        w: 1.8,
        d: 1.8,
        h: 1,
        tone: "pearl",
      })
  return (
    <g>
      <Plinth x={x} y={y} />
      {desks.map((b, i) => (
        <g key={i}>
          <Box {...b} />
          <Decal
            x={b.x + 0.35}
            y={b.y + 0.35}
            z={2.12}
            w={1.1}
            d={1.1}
            fill={i === 4 ? "#FEC396" : "#DBE9FE"}
          />
        </g>
      ))}
    </g>
  )
}

export function Books({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box
        x={x + 1.6}
        y={y + 2.2}
        z={1.1}
        w={6.4}
        d={4.6}
        h={1.1}
        tone="sapphire"
      />
      <Box
        x={x + 1.9}
        y={y + 2.5}
        z={2.2}
        w={5.8}
        d={4.2}
        h={0.9}
        tone="bronze"
      />
      <Box
        x={x + 1.7}
        y={y + 2.3}
        z={3.1}
        w={6.1}
        d={4.4}
        h={0.8}
        tone="paper"
      />
      <Decal x={x + 2.3} y={y + 2.9} z={3.92} w={2.4} d={3.2} fill="#174A92" />
    </g>
  )
}

export function Podium({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box
        x={x + 0.9}
        y={y + 3.4}
        z={1.1}
        w={2.7}
        d={3.2}
        h={1.8}
        tone="pearl"
      />
      <Box
        x={x + 3.6}
        y={y + 3.4}
        z={1.1}
        w={2.7}
        d={3.2}
        h={3.4}
        tone="bronze"
      />
      <Box
        x={x + 6.3}
        y={y + 3.4}
        z={1.1}
        w={2.7}
        d={3.2}
        h={1.2}
        tone="pearl"
      />
      <Box
        x={x + 4.3}
        y={y + 4.1}
        z={4.5}
        w={1.3}
        d={1.3}
        h={1.6}
        tone="sapphire"
      />
    </g>
  )
}

export function Pillars({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box x={x + 1} y={y + 1.4} z={1.1} w={8} d={7} h={0.7} tone="pearl" />
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          x={x + 1.6 + i * 1.95}
          y={y + 6.2}
          z={1.8}
          w={0.8}
          d={0.8}
          h={4}
          tone="paper"
        />
      ))}
      <Box x={x + 1.6} y={y + 1.8} z={1.8} w={6.8} d={4.2} h={4} tone="pearl" />
      <Box x={x + 1} y={y + 1.4} z={5.8} w={8} d={7} h={0.9} tone="sapphire" />
      <Box
        x={x + 3.6}
        y={y + 3.6}
        z={6.7}
        w={2.8}
        d={2.8}
        h={1.2}
        tone="bronze"
      />
    </g>
  )
}

export function Flag({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box x={x + 2} y={y + 2} z={1.1} w={6} d={6} h={0.8} tone="pearl" />
      <Box x={x + 4.6} y={y + 4.6} z={1.9} w={0.5} d={0.5} h={8} tone="ink" />
      <Box
        x={x + 5.1}
        y={y + 4.7}
        z={7.2}
        w={3.4}
        d={0.2}
        h={2.4}
        tone="bronze"
      />
      <Box
        x={x + 2.6}
        y={y + 6.4}
        z={1.9}
        w={1.4}
        d={1}
        h={1.4}
        tone="sapphire"
      />
    </g>
  )
}

export function Vault({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g>
      <Plinth x={x} y={y} />
      <Box
        x={x + 1.4}
        y={y + 1.4}
        z={1.1}
        w={4.6}
        d={4.6}
        h={4.6}
        tone="sapphire"
      />
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          x={x + 6.4}
          y={y + 5.2}
          z={1.1 + i * 0.7}
          w={2.4}
          d={3.2}
          h={0.7}
          tone={i === 2 ? "bronze" : "paper"}
        />
      ))}
    </g>
  )
}

/** Projected bounds of a 10-unit island, for sizing a viewBox. */
export function islandBox(pad = 6, lift = 12) {
  const [l] = pt(0, 10, 0)
  const [r] = pt(10, 0, 0)
  const [, top] = pt(0, 0, lift)
  const [, bottom] = pt(10, 10, 0)
  return `${l - pad} ${top - pad} ${r - l + pad * 2} ${bottom - top + pad * 2}`
}
