"use client"

/**
 * A script that runs while the server HTML is parsed. React never runs
 * scripts it creates in the browser, and warns about each one, so when the
 * page is rendered in the browser instead (a 404, an error boundary) the tag
 * becomes an inert data block. Hydration keeps the server's tag as it is.
 */
export function InlineScript({ code }: { code: string }) {
  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: code }}
    />
  )
}
