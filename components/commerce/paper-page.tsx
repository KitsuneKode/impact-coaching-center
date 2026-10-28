import { cn } from "@/lib/utils"

// Line lengths repeat in this rhythm so a page reads as set text.
const RHYTHM = [96, 88, 92, 70, 94, 90, 84, 60, 95, 89, 93, 76, 91, 55]

/**
 * A sheet of paper standing in for a page image. The grey lines are
 * deliberately not words: they show the layout without faking content.
 */
export function PaperPage({
  running,
  heading,
  number,
  lines = 14,
  compact = false,
  className,
}: {
  running: string
  heading?: string
  number?: number
  lines?: number
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex aspect-[1/1.414] flex-col bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_30px_-12px_rgb(0_0_0/0.25)] ring-1 ring-border",
        compact ? "gap-1.5 p-2.5" : "gap-3 p-[8%]",
        className
      )}
    >
      {compact ? null : (
        <div className="flex justify-between text-[0.625rem] tracking-[0.1em] text-muted-foreground uppercase">
          <span className="truncate">{running}</span>
          {number ? <span className="tnum">{number}</span> : null}
        </div>
      )}
      {heading ? (
        <p
          className={cn(
            "font-display leading-tight",
            compact ? "text-[0.5rem]" : "mbs-2 text-xl md:text-2xl"
          )}
        >
          {heading}
        </p>
      ) : null}
      <div className={cn("grid", compact ? "gap-1" : "mbs-1 gap-2")}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "block rounded-full bg-foreground/10",
              compact ? "h-[3px]" : "h-[7px]"
            )}
            style={{ width: `${RHYTHM[i % RHYTHM.length]}%` }}
          />
        ))}
      </div>
    </div>
  )
}
