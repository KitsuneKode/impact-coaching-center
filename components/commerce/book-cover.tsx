import { cn } from "@/lib/utils"

const tones = {
  primary: "bg-primary text-primary-foreground",
  highlight: "bg-highlight text-foreground",
  muted: "bg-secondary text-foreground",
} as const

/**
 * A typographic cover, used until a book has a real cover photo.
 * The spine shade and inner rule make it read as a book, not a card.
 */
export function BookCover({
  title,
  subtitle,
  tone,
  className,
}: {
  title: string
  subtitle?: string
  tone: keyof typeof tones
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[6px_10px_10px_6px] p-5 pl-7 shadow-frame",
        tones[tone],
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent"
      />
      <span className="text-[0.6875rem] font-medium tracking-[0.12em] uppercase opacity-70">
        Impact Career Tutorials
      </span>
      <div className="grid gap-2">
        <span className="h-px w-8 bg-current opacity-40" aria-hidden />
        <p className="font-display text-xl leading-tight text-balance">
          {title}
        </p>
        {subtitle ? (
          <p className="text-xs leading-snug opacity-75">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
