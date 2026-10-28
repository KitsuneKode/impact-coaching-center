import type { CSSProperties } from "react"

/* Which seats are taken, in the order they fill: a fixed pattern, so the
   server and the browser agree and the picture is the same every visit. */
const ROWS = 6
const COLS = 10
const FILL_ORDER = [
  12, 47, 3, 33, 58, 21, 40, 8, 26, 51, 15, 36, 1, 44, 29, 55, 18, 6, 39, 24,
  49, 10, 31, 57, 14, 42, 27, 4, 53, 35,
]

/**
 * The reading room from above: rows of seats around tables, filling with
 * amber one by one as the day goes on. Decorative; the caption says what it is.
 * Reduced motion shows the room already busy. Styles in app/pulse.css.
 */
export function SeatMap({ label }: { label: string }) {
  const taken = new Map(FILL_ORDER.map((seat, order) => [seat, order]))
  return (
    <figure>
      <figcaption className="sr-only">{label}</figcaption>
      <div data-seat-map aria-hidden>
        {Array.from({ length: ROWS * COLS }, (_, seat) => {
          const order = taken.get(seat)
          return (
            <span
              key={seat}
              data-seat
              data-taken={order === undefined ? undefined : ""}
              style={
                order === undefined
                  ? undefined
                  : ({ "--order": order } as CSSProperties)
              }
            />
          )
        })}
      </div>
    </figure>
  )
}
