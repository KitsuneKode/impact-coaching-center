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

/** The state convention from docs/design-guide.md §6, as code. */

/** A page that can always say what it is. */
function PageShell({
  title,
  children,
  className,
  density = "editorial",
  ...props
}: Omit<ComponentProps<typeof Section>, "title"> & {
  title: ReactNode
  /** How much room the heading gets. */
  density?: "editorial" | "working"
}) {
  const working = density === "working"
  const body = (
    <>
      <h1 className={working ? "type-display-sm" : "type-display"}>{title}</h1>
      <div className={working ? "mt-6" : "mt-10"}>{children}</div>
    </>
  )

  /* A working screen fills its inset; an editorial one keeps the measure.
     Working screens live in the admin, whose sidebar inset is already the
     page's <main>, so they must not open a second one. */
  const Root = working ? "div" : "main"
  return (
    <Root>
      <Section
        size="sm"
        bleed={working}
        className={cn(working ? "pt-8 md:pt-10" : "pt-26 md:pt-30", className)}
        {...props}
      >
        {working ? <div className="w-full px-5 md:px-8">{body}</div> : body}
      </Section>
    </Root>
  )
}

/** The panel every non-result state renders into. */
function StatePanel({
  icon,
  title,
  description,
  action,
  className,
  children,
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
      {/*
        Children used to ride in on `...props` and then get replaced by the
        header, so a button passed as a child never rendered. `action` is the
        named slot; children are kept for callers that pass the button inline.
      */}
      {action}
      {children}
    </Empty>
  )
}

/** A first-load skeleton in the shape of the answer. */
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
