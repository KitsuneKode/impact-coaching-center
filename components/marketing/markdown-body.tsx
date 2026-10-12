import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

/**
 * The prose skin the policy pages render with (they add marker links on
 * top). Blog posts use Typeset instead, through MarkdownBody below.
 */
export const proseComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-12 text-lg font-medium text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-base font-medium text-foreground first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground marker:text-foreground/40">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted-foreground marker:text-foreground/40">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 border-foreground/20 pl-4">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-card border border-border">
      <table className="w-full min-w-120 text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-muted/50 px-4 py-3 font-medium text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-4 py-3 align-top text-muted-foreground">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
    >
      {children}
    </a>
  ),
}

/**
 * Long-form Markdown (blog posts and their editor preview), styled by
 * Typeset: plain elements inside one container, no classes on the content.
 */
export function MarkdownBody({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div className={cn("typeset typeset-docs max-w-[37em]", className)}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml>
        {children}
      </Markdown>
    </div>
  )
}
