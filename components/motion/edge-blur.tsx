import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur"

/**
 * Progressive blur at the top and bottom of the viewport, kobbe's quiet
 * signature: content softens as it slides under the floating nav or off the
 * bottom edge, so the eye rests on the middle of the screen.
 *
 * Fixed and pointer-events-none, so it never repaints with the scroll
 * container. The bottom band is desktop-only; on a phone it would sit on top
 * of the action bar. Few layers, because stacked backdrop filters are the one
 * thing here a mid-range Android phone can feel.
 */
export function EdgeBlur() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-20"
      >
        <ProgressiveBlur
          direction="top"
          blurLayers={5}
          blurIntensity={0.9}
          className="h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-transparent" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden h-16 md:block"
      >
        <ProgressiveBlur
          direction="bottom"
          blurLayers={5}
          blurIntensity={0.6}
          className="h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>
    </>
  )
}
