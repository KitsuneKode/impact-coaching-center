import type { CSSProperties, ReactNode } from "react"

/**
 * Fades and lifts its children as they scroll into view, in CSS alone: no
 * JavaScript, so content is never left hidden waiting for hydration, and
 * browsers without scroll-driven animations simply show it. Needs `revealCss`.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode
  className?: string
  /** stagger, expressed as seconds for familiarity; mapped onto the scroll range */
  delay?: number
  y?: number
}) {
  const style = {
    "--rv-start": `${Math.round(delay * 100)}%`,
    "--rv-y": `${y}px`,
  } as CSSProperties
  return (
    <div data-reveal className={className} style={style}>
      {children}
    </div>
  )
}

export const revealCss = `
@keyframes pr-reveal { from { opacity: 0; transform: translateY(var(--rv-y, 16px)); } }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-reveal] { animation: pr-reveal cubic-bezier(0.23, 1, 0.32, 1) both; animation-timeline: view();
      animation-range: entry var(--rv-start, 0%) entry calc(var(--rv-start, 0%) + 60%); }
  }
}
`
