import type { ComponentProps, ReactNode } from "react"

import { cn } from "cn"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The state convention from docs/design-guide.md §6, as code.
 *
 * The guide defines nine states in a table, and a table cannot be imported.
 * Four surfaces implemented it independently and drifted: three near-identical
 * `Shell` functions, and the same panel class string -
 * `max-w-160 items-start rounded-card border border-border text-left` -
 * pasted into every branch of every admin page.
 *
 * That string is not decoration. `Empty` centres itself inside whatever box it
 * is given, so a page whose `h1` sits at the container's left edge ended up
 * with its panel floating in the middle of the viewport. Heading and content
 * shared no axis, which reads as unfinished rather than as a deliberate
 * centred layout - and it was the concrete thing behind "the admin screens
 * feel weird". It was fixed by hand in five places; this is so there is no
 * sixth.
 *
 * What is deliberately NOT abstracted is the copy. §6 insists that `empty` and
 * `no-match` use different words because they are different problems, so these
 * components own the shape and the caller owns every sentence.
 */

/**
 * A page that can always say what it is.
 *
 * The heading renders in every state, including while loading. A page that
 * cannot name itself until data arrives gives a screen reader nothing to
 * announce, and gives a sighted reader a blank rectangle. This was a real
 * defect on /admin/leads.
 *
 * `title` is a node rather than a string because these headings carry a
 * two-tone treatment - a foreground clause and a muted one - which the type
 * scale relies on.
 */
function PageShell({
  title,
  children,
  className,
  density = "editorial",
  ...props
}: Omit<ComponentProps<typeof Section>, "title"> & {
  title: ReactNode
  /**
   * How much room the heading gets.
   *
   * `editorial` clears the floating site header and gives a marketing page the
   * air its type scale was drawn for.
   *
   * `working` is for screens inside the admin shell, which already has its own
   * header naming the page in a breadcrumb. Repeating the marketing gap there
   * spends a third of the first screen restating something the chrome just
   * said, on a surface four people use for hours. Density is the point on a
   * working screen: more rows above the fold is the whole benefit.
   */
  density?: "editorial" | "working"
}) {
  const working = density === "working"
  const body = (
    <>
      <h1 className={working ? "type-display-sm" : "type-display"}>{title}</h1>
      <div className={working ? "mt-6" : "mt-10"}>{children}</div>
    </>
  )

  /*
   * A working screen fills its inset; an editorial one keeps the measure.
   *
   * `Section` normally wraps its children in `container-page`, which caps at
   * 76rem and centres - right for a marketing page, wrong inside the admin,
   * where the sidebar has already taken its width and the cap then leaves a
   * band of dead space down the right of every table. Bleeding and supplying
   * the gutters here lets a table use the room it was given while keeping the
   * left edge on the same axis as the heading.
   */
  return (
    <main>
      <Section
        size="sm"
        bleed={working}
        className={cn(working ? "pt-8 md:pt-10" : "pt-26 md:pt-30", className)}
        {...props}
      >
        {working ? <div className="w-full px-5 md:px-8">{body}</div> : body}
      </Section>
    </main>
  )
}

/**
 * The panel every non-result state renders into.
 *
 * Left-aligned by construction, so it shares the page heading's axis. Pass
 * `action` for the states that have a way out - forbidden offers log-in,
 * no-match offers clearing the filter - and omit it for the states that do
 * not, rather than inventing a button so the panel looks balanced.
 */
function StatePanel({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: Omit<ComponentProps<typeof Empty>, "title"> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <Empty
      className={cn(
        "max-w-160 items-start rounded-card border border-border text-left",
        className
      )}
      {...props}
    >
      <EmptyHeader className="max-w-none items-start">
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {action}
    </Empty>
  )
}

/**
 * A first-load skeleton in the shape of the answer.
 *
 * §6: never a bare spinner for a first load. A skeleton of rows teaches the
 * reader that rows are coming; a spinner teaches nothing, and the layout then
 * jumps when the real shape arrives.
 *
 * `aria-hidden` because it carries no information - the heading above it
 * already said what this page is, and announcing a row count that is about to
 * be wrong is worse than silence.
 */
function ListSkeleton({
  rows = 5,
  className,
  ...props
}: ComponentProps<"div"> & { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full rounded-control" />
      ))}
    </div>
  )
}

export { ListSkeleton, PageShell, StatePanel }
