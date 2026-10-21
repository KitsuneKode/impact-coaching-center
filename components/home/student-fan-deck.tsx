"use client"

import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"
import { type CSSProperties, useRef, useState } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { type StudentReview, thumb } from "@/lib/stories"

/**
 * The hand of cards. One card is "up": the middle one at rest, the one under
 * the mouse or keyboard focus, or the one last tapped. A tap on a card that
 * is not up raises it first (on a phone the others sit under it), a tap on
 * the card that is up plays it. Its name shows under the hand.
 */
export function StudentFanDeck({ reviews }: { reviews: StudentReview[] }) {
  const middle = Math.floor(reviews.length / 2)
  const [up, setUp] = useState<number | null>(null)
  const current = up ?? middle
  const touch = useRef(false)
  // Set between a press and its click, so the focus a press brings with it
  // does not count as choosing the card.
  const pressing = useRef(false)
  const shown = reviews[current]

  return (
    <>
      {/* Pointer tracking only; each card's button is what you press. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul
        data-fan
        className="mbs-10"
        onPointerLeave={(e) => e.pointerType === "mouse" && setUp(null)}
      >
        {reviews.map((review, n) => {
          const i = n - middle
          return (
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              key={review.id}
              data-fan-card
              data-up={up === n ? "" : undefined}
              style={
                {
                  "--i": i,
                  "--a": Math.abs(i),
                  "--z": 10 - Math.abs(i),
                } as CSSProperties
              }
              onPointerDown={(e) => {
                touch.current = e.pointerType !== "mouse"
                pressing.current = true
              }}
              onPointerEnter={(e) => e.pointerType === "mouse" && setUp(n)}
              onFocus={() => !pressing.current && setUp(n)}
              // A touch on a card that is not up raises it instead of playing.
              onClickCapture={(e) => {
                pressing.current = false
                if (!touch.current || n === current) return
                e.preventDefault()
                e.stopPropagation()
                setUp(n)
              }}
            >
              <VideoDialog
                id={review.id}
                title={review.name}
                subtitle={`${review.exam}, ${review.batch}`}
                vertical
                className="absolute inset-0"
              >
                <Image
                  src={thumb(review.id)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 600px, 440px"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span
                    aria-hidden
                    className="grid size-12 place-items-center rounded-full bg-white text-foreground shadow-lift"
                  >
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={18}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </VideoDialog>
            </li>
          )
        })}
      </ul>
      {/* The buttons carry the names for screen readers; this is for eyes. */}
      <p aria-hidden className="container-page mbs-6 text-center">
        <span key={shown?.id} data-fan-name className="block font-semibold">
          {shown?.name}
        </span>
        <span className="block text-sm text-muted-foreground">
          {shown ? `${shown.batch} · ${shown.exam}` : null}
        </span>
      </p>
    </>
  )
}
