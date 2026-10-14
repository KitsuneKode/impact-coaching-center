/**
 * The 404 figure: a staff-room pigeonhole cabinet. Each pigeonhole holds a
 * real part of the site, papers and books in it; the one for the address
 * the visitor asked for is empty, with "404" on its label. A reading lamp
 * runs on a rail along the top and stops over whichever pigeonhole the
 * pointer is on.
 *
 * Built with the anatomy kit (scripts/figures/iso-kit.mjs, vendored).
 * Run: bun run scripts/figures/pigeonholes.mjs
 * Writes components/site/pigeonholes-art.ts.
 */
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import * as k from "./iso-kit.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, "../../components/site/pigeonholes-art.ts")

const WIDTH = 520
const HEIGHT = 470

/* ------------------------------------------------------------- world --- */

const COLS = 4
const ROWS = 3
const CW = 54 // a pigeonhole's inner width
const CH = 44 // its inner height
const T = 4 // divider thickness
const S = 6 // shelf thickness (its front carries the label holders)
const BACK_Y = -30
const BACK_T = 3
const FRONT = 30
const W = COLS * CW + (COLS + 1) * T
const X0 = -W / 2
const H = ROWS * CH + (ROWS + 1) * S
const CROWN_Z = H
const CROWN_H = 5
const TOP = CROWN_Z + CROWN_H

/* What each pigeonhole holds, left to right, top row first. The empty one
   is the address that was asked for. */
export const HOLES = [
  { href: "/courses", name: "Courses", fill: "folders" },
  { href: "/books", name: "Books", fill: "books" },
  { href: "/resources", name: "Free notes", fill: "papers" },
  { href: "/exams", name: "Exam guides", fill: "clipped" },
  { href: "/success-stories", name: "Results", fill: "medal" },
  { href: "/library", name: "Library", fill: "books" },
  { href: "/blog", name: "Blog", fill: "papers" },
  { href: "/contact", name: "Contact", fill: "letters" },
  { href: "/assist", name: "ASSIST scholarship", fill: "folders" },
  { href: "/exams/calendar", name: "Exam calendar", fill: "calendar" },
  { href: "/", name: "Home", fill: "letters" },
  { href: null, name: "This page", fill: "empty" },
]
const EMPTY = HOLES.findIndex((hole) => hole.fill === "empty")

const colX = (c) => X0 + T + c * (CW + T) // inner left edge
const rowZ = (r) => S + r * (CH + S) // inner floor, r = 0 at the bottom
const holeAt = (i) => {
  const row = ROWS - 1 - Math.floor(i / COLS)
  const col = i % COLS
  return { row, col, x: colX(col), z: rowZ(row) }
}

const PLINTH = {
  x: X0 - 8,
  y: BACK_Y - 4,
  w: W + 16,
  d: FRONT - BACK_Y + 10,
  r: 5,
}
const PLINTH_Z = -12
const CROWN = {
  x: X0 - 4,
  y: BACK_Y - 2,
  w: W + 8,
  d: FRONT - BACK_Y + 5,
  r: 3,
}
const RAIL_Y = FRONT - 9
const LAMP = { y: RAIL_Y, reach: FRONT + 20 }
const SHADE_Z = TOP + 5 // the shade's rim; the lens sits just under it
const PULL = 8 // how far a pigeonhole's contents slide out when it is lit

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, PLINTH_Z - 4, 0),
    ...k.boxCorners(CROWN, CROWN_Z, TOP + 34),
    [X0 + W / 2, LAMP.reach + 10, TOP + 30],
    [X0 + W / 2, LAMP.reach + 10, TOP - 12],
  ],
  WIDTH,
  HEIGHT,
  { pad: 10, azimuth: 62 }
)

const at = (point) => k.iso(point, P)
const Sd = (paths, style) => k.solidSvg(paths, style)
const L = (d, style) => k.lineSvg(d, style)
const D = (points, style) => k.dotsSvg(points, style)
const byDepth = (points) =>
  [...points].sort(
    (a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P)
  )

/* ---------------------------------------------------------------- base --- */

function plinth() {
  const out = [
    `<path class="iso-halo" d="${k.haloOf(PLINTH, PLINTH_Z - 4, 12, P)}"/>`,
  ]
  for (const [x, y] of byDepth(k.corners(PLINTH, 12))) {
    out.push(
      Sd(k.cylinder(x, y, 5.6, PLINTH_Z - 4, 1.4, P, 24), { tone: "lo" })
    )
    out.push(
      Sd(k.cylinder(x, y, 4.2, PLINTH_Z - 2.6, 2.6, P, 24), { tone: "mid" })
    )
  }
  out.push(
    Sd(k.slabOf(PLINTH, PLINTH_Z, -PLINTH_Z, P, 6, 1.2), {
      tone: "mid",
      inner: L(k.sideSeam(PLINTH, PLINTH_Z + 4, P, 6), { tone: "faint" }),
    })
  )
  // a brass maker's plate on the plinth front, two screws and three rules
  const plate = { x: -22, y: PLINTH.y + PLINTH.d, w: 44, d: 0.8, r: 0.4 }
  out.push(
    Sd(k.slabOf(plate, PLINTH_Z + 4, 5, P, 2), { tone: "lo", crease: "none" })
  )
  out.push(
    D(
      [
        at([plate.x + 3, plate.y + 0.8, PLINTH_Z + 6.5]),
        at([plate.x + plate.w - 3, plate.y + 0.8, PLINTH_Z + 6.5]),
      ],
      { size: 0.45 }
    )
  )
  for (const [n, len] of [
    [7.6, 30],
    [6.5, 22],
    [5.4, 26],
  ])
    out.push(
      L(
        k.segment(
          [plate.x + 7, plate.y + 0.8, PLINTH_Z + n],
          [plate.x + 7 + len, plate.y + 0.8, PLINTH_Z + n],
          P
        ),
        { tone: "lo", free: true }
      )
    )
  return out.join("")
}

function backPanel() {
  const plan = { x: X0, y: BACK_Y, w: W, d: BACK_T, r: 0.6 }
  return Sd(k.slabOf(plan, 0, H, P, 2), { tone: "lo" })
}

/* -------------------------------------------------------- the contents --- */

function contents(i) {
  const { x, z } = holeAt(i)
  const fill = HOLES[i].fill
  const inside = {
    x: x + 5,
    y: BACK_Y + BACK_T + 4,
    w: CW - 10,
    d: FRONT - BACK_Y - BACK_T - 10,
  }
  const out = []
  if (fill === "papers" || fill === "clipped") {
    // a stack of sheets, each a little askew
    for (let s = 0; s < 6; s++) {
      const plan = {
        x: inside.x + 2 + (s % 2) * 1.2,
        y: inside.y + 6 - (s % 3) * 0.8,
        w: inside.w - 6,
        d: inside.d - 12,
        r: 0.3,
      }
      out.push(
        Sd(k.slabOf(plan, z + s * 1.3, 1.3, P, 2), { tone: "hi", crease: "lo" })
      )
    }
    const top = z + 6 * 1.3
    const sheet = {
      x: inside.x + 3.2,
      y: inside.y + 6,
      w: inside.w - 6,
      d: inside.d - 12,
    }
    for (const [i2, frac] of [0.25, 0.42, 0.59, 0.76].entries())
      out.push(
        L(
          k.lineOnTop(
            [sheet.x + 4, sheet.y + sheet.d * frac],
            [sheet.x + sheet.w - 4 - i2 * 3, sheet.y + sheet.d * frac],
            top,
            P
          ),
          { tone: "faint", free: true }
        )
      )
    if (fill === "clipped") {
      const clip = {
        x: sheet.x + sheet.w / 2 - 5,
        y: sheet.y + sheet.d - 6,
        w: 10,
        d: 4,
        r: 1,
      }
      out.push(Sd(k.slabOf(clip, top, 1.6, P, 2, 0.3), { tone: "mid" }))
    }
  } else if (fill === "books") {
    const widths = [7, 5.5, 8, 6, 7.5]
    let bx = inside.x
    widths.forEach((w, b) => {
      const h = [34, 30, 38, 27, 33][b]
      const plan = { x: bx, y: inside.y + 2, w, d: inside.d - 6, r: 0.6 }
      out.push(
        Sd(k.slabOf(plan, z, h, P, 2, 0.3), {
          tone: b === 2 ? "hi" : "mid",
          crease: "lo",
        })
      )
      // a band across each spine
      out.push(
        L(
          k.segment(
            [bx, plan.y + plan.d, z + h - 6],
            [bx + w, plan.y + plan.d, z + h - 6],
            P
          ),
          { tone: "faint" }
        )
      )
      bx += w + 0.6
    })
  } else if (fill === "folders") {
    for (let f = 0; f < 4; f++) {
      const plan = {
        x: inside.x + 4 + f * 8,
        y: inside.y + 2,
        w: 2.2,
        d: inside.d - 6,
        r: 0.4,
      }
      out.push(
        Sd(k.slabOf(plan, z, 32 - (f % 2) * 4, P, 2), {
          tone: f % 2 ? "mid" : "hi",
          crease: "lo",
        })
      )
      const tab = { x: plan.x, y: plan.y + 6 + f * 7, w: 2.2, d: 8, r: 0.4 }
      out.push(
        Sd(k.slabOf(tab, z + 32 - (f % 2) * 4, 3, P, 2), {
          tone: "mid",
          crease: "none",
        })
      )
    }
  } else if (fill === "letters") {
    for (let e = 0; e < 4; e++) {
      const plan = {
        x: inside.x + 3 + (e % 2) * 3,
        y: inside.y + 10 - e * 1.5,
        w: inside.w - 12,
        d: 22,
        r: 0.4,
      }
      out.push(
        Sd(k.slabOf(plan, z + e * 1.6, 1.6, P, 2), { tone: "hi", crease: "lo" })
      )
    }
    const top = z + 4 * 1.6
    const env = { x: inside.x + 6, y: inside.y + 5.5, w: inside.w - 12, d: 22 }
    out.push(
      L(
        k.onTop(
          [
            [env.x, env.y + env.d],
            [env.x + env.w / 2, env.y + env.d / 2],
            [env.x + env.w, env.y + env.d],
          ],
          top,
          P
        ),
        { tone: "lo" }
      )
    )
  } else if (fill === "medal") {
    for (let s = 0; s < 3; s++) {
      const plan = {
        x: inside.x + 2,
        y: inside.y + 6 - s,
        w: inside.w - 6,
        d: inside.d - 12,
        r: 0.3,
      }
      out.push(
        Sd(k.slabOf(plan, z + s * 1.3, 1.3, P, 2), { tone: "hi", crease: "lo" })
      )
    }
    const cx = inside.x + inside.w / 2
    const cy = inside.y + inside.d / 2 - 2
    out.push(Sd(k.cylinder(cx, cy, 8, z + 3.9, 2, P, 40, 0.5), { tone: "mid" }))
    out.push(L(k.ring(cx, cy, 5.6, z + 5.9, P, 40), { tone: "lo" }))
    out.push(
      Sd(
        k.slabOf(
          { x: cx - 2.5, y: cy + 7.4, w: 5, d: 9, r: 0.5 },
          z + 3.9,
          0.8,
          P,
          2
        ),
        { tone: "lo", crease: "none" }
      )
    )
  } else if (fill === "calendar") {
    const base = {
      x: inside.x + 6,
      y: inside.y + 10,
      w: inside.w - 12,
      d: 14,
      r: 1,
    }
    out.push(Sd(k.slabOf(base, z, 4, P, 3, 0.4), { tone: "mid" }))
    const card = { x: base.x + 2, y: base.y + 5, w: base.w - 4, d: 2, r: 0.3 }
    out.push(Sd(k.slabOf(card, z + 4, 22, P, 2), { tone: "hi", crease: "lo" }))
    const faceY = card.y + card.d
    for (let g = 0; g < 4; g++) {
      const gx = card.x + 3 + g * ((card.w - 6) / 3)
      out.push(
        L(k.segment([gx, faceY, z + 23], [gx, faceY, z + 4], P), {
          tone: "faint",
        })
      )
    }
    out.push(
      D(
        [0, 1, 2, 3, 4].map((n) =>
          at([card.x + 4 + n * ((card.w - 8) / 4), faceY, z + 26])
        ),
        { size: 0.5 }
      )
    )
  }
  return out.join("")
}

/* ----------------------------------------------------------- the cabinet --- */

function shelf(r) {
  const z = r * (CH + S)
  const plan = {
    x: X0,
    y: BACK_Y + BACK_T,
    w: W,
    d: FRONT - BACK_Y - BACK_T,
    r: 0.6,
  }
  const out = [Sd(k.slabOf(plan, z, S, P, 2, 0.4), { tone: "mid" })]
  // label holders on the shelf's front, one under each pigeonhole above it
  if (r < ROWS) {
    for (let c = 0; c < COLS; c++) {
      const i = (ROWS - 1 - r) * COLS + c
      const holder = {
        x: colX(c) + CW / 2 - 13,
        y: FRONT,
        w: 26,
        d: 0.9,
        r: 0.3,
      }
      out.push(
        `<g data-holder="${i}">${Sd(k.slabOf(holder, z + 0.8, S - 1.6, P, 2), { tone: "lo", crease: "none" })}</g>`
      )
      if (i === EMPTY) {
        out.push(
          k.faceTextSvg(
            k.sideMatrix(
              [holder.x + holder.w / 2, FRONT + 0.9],
              z + 1.3,
              P,
              "left"
            ),
            "404",
            { size: 3.4, tone: "hi", anchor: "middle" }
          )
        )
      } else {
        out.push(
          L(
            k.segment(
              [holder.x + 3, FRONT + 0.9, z + S / 2],
              [holder.x + holder.w - 3 - (c % 3) * 3, FRONT + 0.9, z + S / 2],
              P
            ),
            { tone: "mid", free: true }
          )
        )
      }
    }
  }
  return out.join("")
}

function divider(c, r) {
  // the full-height side panels are drawn as one piece each, from the bottom
  const plan = {
    x: X0 + c * (CW + T),
    y: BACK_Y + BACK_T,
    w: T,
    d: FRONT - BACK_Y - BACK_T,
    r: 0.5,
  }
  const z = rowZ(r)
  return Sd(k.slabOf(plan, z, CH, P, 2, 0.3), { tone: "mid" })
}

function crown() {
  const out = [
    Sd(k.slabOf(CROWN, CROWN_Z, CROWN_H, P, 4, 0.8), {
      tone: "mid",
      inner: L(k.sideSeam(CROWN, CROWN_Z + 1.6, P, 4), { tone: "faint" }),
    }),
  ]
  out.push(
    D(
      k.corners(CROWN, 5).map(([x, y]) => at([x, y, TOP])),
      { size: 0.45 }
    )
  )
  // ruler strip along the front edge, a major tick under each pigeonhole's centre
  const strip = { x: X0 + 2, y: FRONT - 3, w: W - 4, d: 4.4, r: 0.6 }
  out.push(Sd(k.slabOf(strip, TOP, 0.6, P, 2), { tone: "lo", crease: "none" }))
  const ticks = k.topTicks(
    strip.x + 2,
    strip.x + strip.w - 2,
    (CW + T) / 6,
    6,
    strip.y,
    TOP + 0.6,
    [1.6, 3],
    P
  )
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }))
  // an in-tray of papers at the back left, and a desk bell beside it
  const tray = { x: X0 + 14, y: BACK_Y + 3, w: 52, d: 34, r: 1.6 }
  out.push(Sd(k.slabOf(tray, TOP, 1.4, P, 3, 0.3), { tone: "lo" }))
  for (const wall of [
    { x: tray.x, y: tray.y, w: tray.w, d: 1.4, r: 0.4 },
    { x: tray.x, y: tray.y, w: 1.4, d: tray.d, r: 0.4 },
    { x: tray.x + tray.w - 1.4, y: tray.y, w: 1.4, d: tray.d, r: 0.4 },
  ])
    out.push(Sd(k.slabOf(wall, TOP + 1.4, 5, P, 2), { tone: "mid" }))
  for (let s2 = 0; s2 < 5; s2++) {
    const sheet = {
      x: tray.x + 4 + (s2 % 2),
      y: tray.y + 4 - (s2 % 3) * 0.6,
      w: tray.w - 9,
      d: tray.d - 9,
      r: 0.3,
    }
    out.push(
      Sd(k.slabOf(sheet, TOP + 1.4 + s2 * 1.1, 1.1, P, 2), {
        tone: "hi",
        crease: "lo",
      })
    )
  }
  out.push(
    Sd(
      k.slabOf(
        { x: tray.x, y: tray.y + tray.d - 1.4, w: tray.w, d: 1.4, r: 0.4 },
        TOP + 1.4,
        5,
        P,
        2
      ),
      { tone: "mid" }
    )
  )
  const bell = [X0 + 96, BACK_Y + 18]
  out.push(Sd(k.cylinder(bell[0], bell[1], 7, TOP, 1.6, P, 32), { tone: "lo" }))
  out.push(
    Sd(k.cylinder(bell[0], bell[1], 5.6, TOP + 1.6, 4.4, P, 32, 0.4), {
      tone: "hi",
      crease: "lo",
    })
  )
  out.push(
    Sd(k.cylinder(bell[0], bell[1], 1.2, TOP + 6, 1.6, P, 12), { tone: "mid" })
  )
  out.push(
    Sd(k.cylinder(bell[0], bell[1], 1.8, TOP + 7.6, 0.8, P, 14), {
      tone: "mid",
    })
  )
  // the rail the lamp runs on, with an end stop at each end
  const rail = { x: X0 + 6, y: RAIL_Y - 4, w: W - 12, d: 3, r: 0.8 }
  out.push(Sd(k.slabOf(rail, TOP, 3, P, 2, 0.3), { tone: "mid" }))
  for (const sx of [X0 + 2, X0 + W - 6])
    out.push(
      Sd(
        k.slabOf(
          { x: sx, y: RAIL_Y - 6, w: 4, d: 7, r: 0.8 },
          TOP,
          6,
          P,
          2,
          0.4
        ),
        { tone: "mid" }
      )
    )
  return out.join("")
}

/* The lamp, built over x = 0 and moved along the rail with translateAlong. */
function lamp() {
  const out = []
  const car = { x: -9, y: RAIL_Y - 7, w: 18, d: 9, r: 1.6 }
  out.push(
    `<path class="iso-halo" d="${k.haloOf(k.insetPlan(car, 1), TOP + 3, 0.1, P)}" style="filter:blur(3px)"/>`
  )
  out.push(Sd(k.slabOf(car, TOP + 3, 5, P, 3, 0.5), { tone: "mid" }))
  out.push(
    D(
      [-6, 6].map((x) => at([x, car.y + car.d - 1.6, TOP + 8])),
      { size: 0.4 }
    )
  )
  // thumb screw on the carriage's front face
  out.push(
    Sd(k.cylinder(car.x + car.w + 1.8, RAIL_Y - 2.5, 1.8, TOP + 4, 3, P, 16), {
      tone: "mid",
    })
  )
  // post, knuckle and arm out over the front edge
  out.push(
    Sd(k.cylinder(0, RAIL_Y - 2.5, 2, TOP + 8, 18, P, 20), {
      tone: "mid",
      crease: "none",
    })
  )
  out.push(L(k.sideArc(0, RAIL_Y - 2.5, 2, TOP + 15, P, 12), { tone: "faint" }))
  out.push(
    Sd(k.cylinder(0, RAIL_Y - 2.5, 3.2, TOP + 26, 4, P, 24), { tone: "mid" })
  )
  out.push(
    L(k.knurl(0, RAIL_Y - 2.5, 3.2, TOP + 26, TOP + 30, 22, P), { tone: "lo" })
  )
  const arm = { x: -2, y: RAIL_Y - 1, w: 4, d: LAMP.reach - RAIL_Y - 4, r: 1.6 }
  out.push(Sd(k.slabOf(arm, TOP + 27, 3, P, 2, 0.3), { tone: "mid" }))
  // the shade hangs on a short stem just above the crown's front edge, so it
  // never covers a pigeonhole; the lens underneath is lit
  const hx = 0
  const hy = LAMP.reach
  out.push(Sd(k.cylinder(hx, hy, 2.4, TOP + 26, 3, P, 16), { tone: "mid" }))
  out.push(
    Sd(k.cylinder(hx, hy, 1.2, TOP + 17, 9, P, 12), {
      tone: "mid",
      crease: "none",
    })
  )
  out.push(Sd(k.cylinder(hx, hy, 3, TOP + 15, 2, P, 18), { tone: "mid" }))
  out.push(
    Sd(k.cylinder(hx, hy, 9, SHADE_Z, 10, P, 44, 0.6), {
      tone: "hi",
      crease: "lo",
      inner: L(k.sideArc(hx, hy, 9, SHADE_Z + 4, P, 30), { tone: "faint" }),
    })
  )
  out.push(
    L(k.knurl(hx, hy, 9, SHADE_Z + 6.8, SHADE_Z + 10, 40, P, 0.3), {
      tone: "lo",
    })
  )
  out.push(
    `<g data-part="lens">${Sd(k.cylinder(hx, hy, 7, SHADE_Z - 1.4, 1.4, P, 40), { tone: "hi", lit: true })}</g>`
  )
  return out.join("")
}

/* ---------------------------------------------------------- the opening --- */

/* Each pigeonhole's opening on the front plane: where the pointer finds it,
   and the outline that lights when it is the one under the lamp. */
function openingOf(i, inset = 0) {
  const { x, z } = holeAt(i)
  const pts = [
    [x + inset, FRONT, z + inset],
    [x + CW - inset, FRONT, z + inset],
    [x + CW - inset, FRONT, z + CH - inset],
    [x + inset, FRONT, z + CH - inset],
  ].map(at)
  return `M${pts.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join("L")}Z`
}

/* Where the lamp's beam lands: the top edge of the opening, left then right. */
const beamFoot = (i) => {
  const { x, z } = holeAt(i)
  return [at([x + 2, FRONT, z + CH - 2]), at([x + CW - 2, FRONT, z + CH - 2])]
}

/* The lens rim's leftmost and rightmost points on screen, lamp at x = 0. */
const lensRim = (() => {
  const ring = k
    .circleRing(0, LAMP.reach, 7, 72)
    .map(([x, y]) => at([x, y, SHADE_Z - 1.4]))
  const byX = [...ring].sort((a, b) => a[0] - b[0])
  return [byX[0], byX[byX.length - 1]]
})()

/* ------------------------------------------------------------- assemble --- */

const body = [plinth(), backPanel()]
// back to front: bottom row first, then the shelf above it, each row left to
// right with the divider that stands in front of each pigeonhole
body.push(shelf(0))
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c <= COLS; c++) {
    if (c === 0) body.push(divider(0, r))
    if (c < COLS) {
      const i = (ROWS - 1 - r) * COLS + c
      body.push(`<g data-hole="${i}">${contents(i)}</g>`)
      body.push(divider(c + 1, r))
    }
  }
  body.push(shelf(r + 1))
}
body.push(crown())
const restX = holeAt(EMPTY).x + CW / 2
// the beam is drawn by the page, between the cabinet and the lamp
body.push(`<path data-beam d=""/>`)
body.push(
  `<g data-part="lamp" transform="${k.translateAlong(P, [restX, 0, 0])}">${lamp()}</g>`
)
body.push(
  `<g data-part="openings">${HOLES.map(
    (hole, i) =>
      `<path data-ring="${i}" d="${openingOf(i, 1.4)}"/><path data-opening="${i}" d="${openingOf(i)}" fill="transparent" stroke="none"/>`
  ).join("")}</g>`
)

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  standalone: "light",
  label:
    "A staff-room pigeonhole cabinet. Each pigeonhole holds a part of the site: courses, books, free notes, results and more, with papers and books inside. The one labelled 404, for the address you asked for, is empty. A reading lamp runs on a rail along the top.",
  body,
})

const unit = k.axisVector(P, [1, 0, 0])
const centres = HOLES.map((_, i) => holeAt(i).x + CW / 2)

writeFileSync(
  OUT,
  `/* GENERATED by scripts/figures/pigeonholes.mjs; edit that and re-run it. */

/** The cabinet as a standalone light-theme SVG (anatomy kit styles inlined). */
export const PIGEONHOLES_SVG = ${JSON.stringify(svg)}

/** Screen units one world unit along x moves the lamp. */
export const LAMP_UNIT: readonly [number, number] = ${JSON.stringify(unit.map((n) => Math.round(n * 1e4) / 1e4))}

/** The lamp's world x over each pigeonhole's centre, and where it rests. */
export const HOLE_X: readonly number[] = ${JSON.stringify(centres.map((n) => Math.round(n * 100) / 100))}
export const LAMP_REST = ${restX}

/** Screen offset of a pigeonhole's contents when they slide out. */
export const PULL: readonly [number, number] = ${JSON.stringify(k.axisVector(P, [0, PULL, 0]).map((n) => Math.round(n * 100) / 100))}

/** The lens rim's outer points with the lamp at x = 0, and where the beam
    lands on each pigeonhole (top edge, left then right). */
export const LENS_RIM = ${JSON.stringify(lensRim.map((p) => p.map((n) => Math.round(n * 10) / 10)))} as const
export const BEAM_FOOT = ${JSON.stringify(HOLES.map((_, i) => beamFoot(i).map((p) => p.map((n) => Math.round(n * 10) / 10))))} as const

/** What each pigeonhole holds; the empty one is the missing page. */
export const HOLES = ${JSON.stringify(HOLES.map(({ href, name }) => ({ href, name })))} as const
export const EMPTY_HOLE = ${EMPTY}
`
)
console.log(`wrote ${OUT} (${Math.round(svg.length / 1024)} KB of SVG)`)
